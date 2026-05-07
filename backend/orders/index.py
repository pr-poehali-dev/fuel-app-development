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


def route_analytics(event):
    """Аналитика по заявкам и клиентам для админа."""
    if not is_admin(event):
        return err("Нет доступа", 403)

    s = schema()
    conn = get_conn()
    cur = conn.cursor()

    # Общая сводка
    cur.execute(f"SELECT COUNT(*), COUNT(DISTINCT contact), COUNT(DISTINCT phone) FROM {s}.orders")
    total, unique_contacts, unique_phones = cur.fetchone()

    # По статусам
    cur.execute(f"SELECT status, COUNT(*) FROM {s}.orders GROUP BY status")
    by_status = {r[0] or "unknown": r[1] for r in cur.fetchall()}

    # По источнику
    cur.execute(f"SELECT COALESCE(source, 'unknown'), COUNT(*) FROM {s}.orders GROUP BY source")
    by_source = {r[0]: r[1] for r in cur.fetchall()}

    # Топ типов топлива
    cur.execute(f"SELECT COALESCE(NULLIF(fuel_type, ''), 'не указано'), COUNT(*) "
                f"FROM {s}.orders GROUP BY fuel_type ORDER BY COUNT(*) DESC LIMIT 10")
    by_fuel = [{"fuel": r[0], "count": r[1]} for r in cur.fetchall()]

    # Динамика за последние 30 дней (по дням)
    cur.execute(
        f"SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS day, COUNT(*) "
        f"FROM {s}.orders WHERE created_at >= NOW() - INTERVAL '30 days' "
        f"GROUP BY day ORDER BY day"
    )
    by_day = [{"date": r[0], "count": r[1]} for r in cur.fetchall()]

    # Топ-10 клиентов по количеству заявок
    cur.execute(
        f"SELECT COALESCE(NULLIF(name, ''), NULLIF(org, ''), NULLIF(phone, ''), NULLIF(contact, ''), 'Без имени') AS client, "
        f"COUNT(*) AS cnt, MAX(created_at) AS last_order, "
        f"COALESCE(MAX(NULLIF(phone, '')), '') AS phone, "
        f"COALESCE(MAX(NULLIF(org, '')), '') AS org "
        f"FROM {s}.orders "
        f"GROUP BY client ORDER BY cnt DESC LIMIT 10"
    )
    top_clients = [
        {"client": r[0], "count": r[1], "last_order": r[2].isoformat() if r[2] else None,
         "phone": r[3], "org": r[4]}
        for r in cur.fetchall()
    ]

    # Заявки за периоды
    cur.execute(f"SELECT COUNT(*) FROM {s}.orders WHERE created_at >= NOW() - INTERVAL '7 days'")
    last_week = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {s}.orders WHERE created_at >= NOW() - INTERVAL '30 days'")
    last_month = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {s}.orders WHERE DATE(created_at) = CURRENT_DATE")
    today = cur.fetchone()[0]

    # Средняя конверсия (done / total)
    completed = by_status.get("done", 0)
    conversion = round(completed * 100.0 / total, 1) if total else 0

    cur.close()
    conn.close()

    return ok({
        "summary": {
            "total_orders": total,
            "unique_contacts": unique_contacts,
            "unique_phones": unique_phones,
            "today": today,
            "last_week": last_week,
            "last_month": last_month,
            "conversion": conversion,
        },
        "by_status": by_status,
        "by_source": by_source,
        "by_fuel": by_fuel,
        "by_day": by_day,
        "top_clients": top_clients,
    })


def route_clients(event):
    """База клиентов: агрегат по уникальным телефонам/контактам."""
    if not is_admin(event):
        return err("Нет доступа", 403)

    s = schema()
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        f"SELECT "
        f"COALESCE(NULLIF(phone, ''), NULLIF(contact, ''), 'unknown') AS key, "
        f"MAX(NULLIF(name, '')) AS name, "
        f"MAX(NULLIF(org, '')) AS org, "
        f"MAX(NULLIF(phone, '')) AS phone, "
        f"MAX(NULLIF(contact, '')) AS contact, "
        f"COUNT(*) AS orders_count, "
        f"MAX(created_at) AS last_order, "
        f"MIN(created_at) AS first_order, "
        f"SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed, "
        f"SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, "
        f"SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active "
        f"FROM {s}.orders "
        f"GROUP BY key "
        f"ORDER BY orders_count DESC, last_order DESC "
        f"LIMIT 1000"
    )
    rows = cur.fetchall()
    clients = [
        {
            "key": r[0], "name": r[1] or "", "org": r[2] or "", "phone": r[3] or "",
            "contact": r[4] or "", "orders_count": r[5],
            "last_order": r[6].isoformat() if r[6] else None,
            "first_order": r[7].isoformat() if r[7] else None,
            "completed": r[8], "pending": r[9], "active": r[10],
        }
        for r in rows
    ]
    cur.close()
    conn.close()
    return ok({"clients": clients, "total": len(clients)})


def route_export(event):
    """Выгрузка всех заявок в CSV для админа."""
    if not is_admin(event):
        return err("Нет доступа", 403)

    s = schema()
    conn = get_conn()
    cur = conn.cursor()
    cols = ", ".join(ORDER_COLS)
    cur.execute(f"SELECT {cols} FROM {s}.orders ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    headers = ["Номер", "Дата", "Имя", "Организация", "Телефон", "Email/контакт",
               "Топливо", "Объём", "Адрес", "Желаемая дата", "Статус", "Водитель",
               "Авто", "Цена", "Источник", "Комментарий"]

    def csv_escape(v):
        if v is None:
            return ""
        text = str(v).replace('"', '""')
        return f'"{text}"'

    lines = [";".join(csv_escape(h) for h in headers)]
    for r in rows:
        d = row_to_dict(r, ORDER_COLS)
        created = d.get("created_at")
        created_str = created.strftime("%Y-%m-%d %H:%M") if isinstance(created, datetime) else str(created or "")
        lines.append(";".join(csv_escape(v) for v in [
            d.get("order_number", ""), created_str, d.get("name", ""), d.get("org", ""),
            d.get("phone", ""), d.get("contact", ""), d.get("fuel_type", ""),
            d.get("volume", ""), d.get("address", ""), d.get("desired_date", ""),
            d.get("status", ""), d.get("driver", ""), d.get("vehicle", ""),
            d.get("price", ""), d.get("source", ""), d.get("comment", ""),
        ]))

    csv_text = "\ufeff" + "\n".join(lines)
    filename = f"sined_orders_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"

    return {
        "statusCode": 200,
        "headers": {
            **CORS,
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
        "body": csv_text,
    }


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
    if method == "GET" and action == "analytics":
        return route_analytics(event)
    if method == "GET" and action == "clients":
        return route_clients(event)
    if method == "GET" and action == "export":
        return route_export(event)
    if method == "POST" and action == "update":
        oid = body.get("id", "")
        return route_update(event, oid, body)
    if method == "GET" and not action:
        return ok({"status": "ok", "service": "СИНЕД Orders"})

    return err("Not found", 404)