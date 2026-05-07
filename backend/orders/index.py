"""
Заявки СИНЕД: создание заявок из чата, чтение клиентом и админом.
POST /         - создать заявку (из чата)
GET  /my       - заявки пользователя (по X-Auth-Token)
GET  /all      - все заявки (только для админа, X-Admin-Token)
PATCH /:id    - обновить статус/водителя/цену (админ)
"""
import os
import json
import base64
from datetime import datetime, timezone
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def schema():
    return os.environ.get("MAIN_DB_SCHEMA", "public")


def esc(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def serial(o):
    if isinstance(o, datetime):
        return o.isoformat()
    return str(o)


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, X-Admin-Token",
    "Content-Type": "application/json",
}


def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, default=serial, ensure_ascii=False)}


def err(msg, code=400):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def gen_order_number(cur, s):
    year = datetime.now().year
    cur.execute(f"SELECT COUNT(*) FROM {s}.orders WHERE order_number LIKE 'ЗК-{year}-%'")
    n = cur.fetchone()[0] + 1
    return f"ЗК-{year}-{str(n).zfill(3)}"


def parse_token(token: str):
    if not token:
        return None
    try:
        decoded = base64.b64decode(token.encode()).decode()
        user_id, _ = decoded.split(":", 1)
        return user_id
    except Exception:
        return None


def row_to_dict(row, cols):
    return dict(zip(cols, row))


ORDER_COLS = ["id", "order_number", "user_id", "contact", "name", "org", "phone",
              "fuel_type", "volume", "address", "desired_date", "comment", "status",
              "driver", "vehicle", "price", "source", "session_id", "created_at", "updated_at"]


def route_create(body):
    s = schema()
    conn = get_conn()
    cur = conn.cursor()

    user_id = body.get("user_id")
    contact = body.get("contact", "")
    name = body.get("name", "")
    org = body.get("org", "")
    phone = body.get("phone", "")
    fuel_type = body.get("fuelType") or body.get("fuel_type", "")
    volume = body.get("volume", "")
    address = body.get("address", "")
    desired_date = body.get("date") or body.get("desired_date", "")
    comment = body.get("comment", "")
    session_id = body.get("session_id", "")
    source = body.get("source", "chat")

    order_number = gen_order_number(cur, s)

    cur.execute(
        f"INSERT INTO {s}.orders "
        f"(order_number, user_id, contact, name, org, phone, fuel_type, volume, address, desired_date, comment, source, session_id) "
        f"VALUES ({esc(order_number)}, {esc(user_id)}, {esc(contact)}, {esc(name)}, {esc(org)}, {esc(phone)}, "
        f"{esc(fuel_type)}, {esc(volume)}, {esc(address)}, {esc(desired_date)}, {esc(comment)}, {esc(source)}, {esc(session_id)}) "
        f"RETURNING " + ", ".join(ORDER_COLS)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return ok({"order": row_to_dict(row, ORDER_COLS)})


def route_my(event):
    token = event.get("headers", {}).get("X-Auth-Token", "")
    user_id = parse_token(token)
    contact = event.get("queryStringParameters", {}).get("contact", "") if event.get("queryStringParameters") else ""

    if not user_id and not contact:
        return err("Не авторизован", 401)

    s = schema()
    conn = get_conn()
    cur = conn.cursor()

    cols = ", ".join(ORDER_COLS)
    if user_id:
        cur.execute(f"SELECT {cols} FROM {s}.orders WHERE user_id = '{user_id}' OR contact = {esc(contact)} ORDER BY created_at DESC")
    else:
        cur.execute(f"SELECT {cols} FROM {s}.orders WHERE contact = {esc(contact)} ORDER BY created_at DESC")

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return ok({"orders": [row_to_dict(r, ORDER_COLS) for r in rows]})


def is_admin(event):
    admin_token = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_token:
        return False
    sent = event.get("headers", {}).get("X-Admin-Token", "")
    return sent == admin_token


def route_all(event):
    if not is_admin(event):
        return err("Нет доступа", 403)

    s = schema()
    conn = get_conn()
    cur = conn.cursor()
    cols = ", ".join(ORDER_COLS)
    cur.execute(f"SELECT {cols} FROM {s}.orders ORDER BY created_at DESC LIMIT 500")
    rows = cur.fetchall()

    cur.execute(f"SELECT COUNT(*) FROM {s}.orders")
    total = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {s}.orders WHERE status = 'pending'")
    pending = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {s}.orders WHERE status = 'active'")
    active = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {s}.orders WHERE status = 'done'")
    done = cur.fetchone()[0]

    cur.close()
    conn.close()

    return ok({
        "orders": [row_to_dict(r, ORDER_COLS) for r in rows],
        "stats": {"total": total, "pending": pending, "active": active, "done": done},
    })


def route_update(event, order_id, body):
    if not is_admin(event):
        return err("Нет доступа", 403)

    s = schema()
    conn = get_conn()
    cur = conn.cursor()

    fields = []
    for key in ["status", "driver", "vehicle", "price", "comment"]:
        if key in body:
            fields.append(f"{key} = {esc(body[key])}")
    if not fields:
        return err("Нет полей для обновления")

    fields.append("updated_at = NOW()")
    cur.execute(f"UPDATE {s}.orders SET {', '.join(fields)} WHERE id = {esc(order_id)} "
                f"RETURNING " + ", ".join(ORDER_COLS))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return err("Не найдено", 404)
    return ok({"order": row_to_dict(row, ORDER_COLS)})


def route_admin_login(body):
    pwd = body.get("password", "")
    correct = os.environ.get("ADMIN_PASSWORD", "")
    if not correct:
        return err("Админ не настроен", 500)
    if pwd != correct:
        return err("Неверный пароль", 401)
    return ok({"token": correct})


def handler(event, context):
    """Заявки: создание из чата, просмотр клиентом и админом."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    if method == "POST" and action == "admin-login":
        return route_admin_login(body)
    if method == "POST" and action == "create":
        return route_create(body)
    if method == "GET" and action == "my":
        return route_my(event)
    if method == "GET" and action == "all":
        return route_all(event)
    if method == "POST" and action == "update":
        oid = body.get("id", "")
        return route_update(event, oid, body)
    if method == "GET" and not action:
        return ok({"status": "ok", "service": "СИНЕД Orders"})

    return err("Not found", 404)