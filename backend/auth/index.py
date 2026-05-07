"""
Авторизация пользователей СИНЕД через коды подтверждения.
Поддерживает: Email, SMS (через Telegram-бот), Telegram username, телефон.
Коды живут 10 минут, 6 цифр.
"""
import os
import json
import random
import string
import smtplib
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def schema():
    return os.environ.get("MAIN_DB_SCHEMA", "public")


def esc(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, default=serial, ensure_ascii=False)}


def err(msg, code=400):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def gen_code():
    return "".join(random.choices(string.digits, k=6))


def send_email_code(to_email: str, code: str) -> bool:
    smtp_host = "smtp.mail.ru"
    smtp_port = 465
    smtp_user = os.environ.get("SMTP_USER", "sinedooo@mail.ru")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    if not smtp_pass:
        return False
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Код входа СИНЕД: {code}"
    msg["From"] = smtp_user
    msg["To"] = to_email
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;background:#f0f7ff;border-radius:16px;padding:32px;text-align:center">
      <div style="background:#1a3d7c;border-radius:12px;padding:16px;margin-bottom:24px">
        <span style="color:white;font-size:20px;font-weight:900;letter-spacing:2px">СИНЕД</span>
      </div>
      <h2 style="color:#1a3d7c;margin:0 0 8px">Код для входа</h2>
      <p style="color:#666;font-size:14px;margin:0 0 24px">Введите этот код на сайте</p>
      <div style="background:white;border:2px solid #1a7ac8;border-radius:12px;padding:20px;margin-bottom:24px">
        <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1a3d7c">{code}</span>
      </div>
      <p style="color:#999;font-size:12px">Код действителен 10 минут. Если вы не запрашивали код — проигнорируйте это письмо.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html", "utf-8"))
    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())
        return True
    except Exception:
        return False


def send_telegram_code(tg_username: str, code: str) -> bool:
    """Отправляет код через Telegram-бот. Пользователь должен сначала написать боту /start."""
    bot_token = os.environ.get("TELEGRAM_AUTH_BOT_TOKEN", "")
    if not bot_token:
        return False
    # Пробуем найти chat_id по username через getUpdates
    try:
        url = f"https://api.telegram.org/bot{bot_token}/getUpdates?limit=100"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read().decode())
        chat_id = None
        uname = tg_username.lstrip("@").lower()
        for upd in data.get("result", []):
            msg = upd.get("message", {})
            frm = msg.get("from", {})
            if str(frm.get("username", "")).lower() == uname:
                chat_id = frm.get("id")
                break
        if not chat_id:
            return False
        text = f"🔐 Ваш код входа на сайт СИНЕД:\n\n*{code}*\n\nКод действителен 10 минут."
        send_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        send_data = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}).encode()
        req2 = urllib.request.Request(send_url, data=send_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req2, timeout=8) as r2:
            return r2.status == 200
    except Exception:
        return False


def route_send_code(body: dict) -> dict:
    """Отправить код подтверждения на email или telegram."""
    method = body.get("method", "")
    contact = body.get("contact", "").strip()
    if not method or not contact:
        return err("method и contact обязательны")

    code = gen_code()
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    s = schema()
    conn = get_conn()
    cur = conn.cursor()

    # Сохраняем код
    cur.execute(
        f"INSERT INTO {s}.auth_codes (contact, method, code, expires_at) "
        f"VALUES ({esc(contact)}, {esc(method)}, {esc(code)}, {esc(expires_at)})"
    )
    conn.commit()

    sent = False
    info = ""

    if method == "email":
        sent = send_email_code(contact, code)
        info = f"Код отправлен на {contact}"
    elif method == "tg":
        sent = send_telegram_code(contact, code)
        if not sent:
            info = "Напишите нашему боту /start, затем повторите. Или бот не настроен."
        else:
            info = f"Код отправлен в Telegram @{contact.lstrip('@')}"
    elif method == "phone":
        # Телефон — пока через Telegram-бота, если пользователь привязан
        info = "Для входа по телефону напишите боту @sinedauthbot команду /start"
        sent = False
    else:
        info = "Метод не поддерживается"

    cur.close()
    conn.close()

    return ok({"sent": sent, "info": info, "method": method,
               "debug_code": code if os.environ.get("DEBUG_AUTH") == "1" else None})


def route_verify_code(body: dict) -> dict:
    """Проверить код и создать/обновить пользователя."""
    method = body.get("method", "")
    contact = body.get("contact", "").strip()
    code = body.get("code", "").strip()
    name = body.get("name", "").strip()
    org = body.get("org", "").strip()

    if not method or not contact or not code:
        return err("method, contact, code обязательны")

    s = schema()
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()

    # Проверяем код
    cur.execute(
        f"SELECT id FROM {s}.auth_codes "
        f"WHERE contact = {esc(contact)} AND code = {esc(code)} "
        f"AND used = FALSE AND expires_at > {esc(now)} "
        f"ORDER BY created_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return err("Неверный или истёкший код", 401)

    code_id = row[0]
    cur.execute(f"UPDATE {s}.auth_codes SET used = TRUE WHERE id = '{code_id}'")

    # Ищем или создаём пользователя
    field_map = {"email": "email", "tg": "tg_username", "phone": "phone", "vk": "vk_id", "max": "max_id"}
    field = field_map.get(method, "phone")
    cur.execute(f"SELECT id, name, org FROM {s}.users WHERE {field} = {esc(contact)}")
    user_row = cur.fetchone()

    if user_row:
        user_id, user_name, user_org = user_row
        cur.execute(f"UPDATE {s}.users SET last_login = NOW() WHERE id = '{user_id}'")
        if name and not user_name:
            cur.execute(f"UPDATE {s}.users SET name = {esc(name)} WHERE id = '{user_id}'")
        if org and not user_org:
            cur.execute(f"UPDATE {s}.users SET org = {esc(org)} WHERE id = '{user_id}'")
    else:
        cur.execute(
            f"INSERT INTO {s}.users (method, {field}, name, org, last_login) "
            f"VALUES ({esc(method)}, {esc(contact)}, {esc(name or None)}, {esc(org or None)}, NOW()) "
            f"RETURNING id"
        )
        user_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    # Простой токен сессии (UUID пользователя + timestamp base64-like)
    import base64
    token_raw = f"{user_id}:{int(datetime.now().timestamp())}"
    token = base64.b64encode(token_raw.encode()).decode()

    return ok({
        "token": token,
        "user_id": str(user_id),
        "contact": contact,
        "method": method,
        "name": name,
        "org": org,
    })


def route_me(event: dict) -> dict:
    """Проверить токен и вернуть данные пользователя."""
    auth = event.get("headers", {}).get("X-Auth-Token", "")
    if not auth:
        return err("Нет токена", 401)
    try:
        import base64
        decoded = base64.b64decode(auth.encode()).decode()
        user_id, _ = decoded.split(":", 1)
    except Exception:
        return err("Неверный токен", 401)

    s = schema()
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, name, org, phone, email, tg_username, method, created_at, last_login "
        f"FROM {s}.users WHERE id = '{user_id}'"
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return err("Пользователь не найден", 404)

    cols = ["id", "name", "org", "phone", "email", "tg_username", "method", "created_at", "last_login"]
    user = dict(zip(cols, row))
    return ok({"user": user})


def handler(event: dict, context) -> dict:
    """
    Авторизация пользователей: отправка кода, проверка кода, получение данных.
    POST /send  — отправить код (method, contact)
    POST /verify — проверить код (method, contact, code, name?, org?)
    GET  /me    — получить данные пользователя по токену
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/").rstrip("/") or "/"
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    if method == "POST" and path.endswith("/send"):
        return route_send_code(body)
    if method == "POST" and path.endswith("/verify"):
        return route_verify_code(body)
    if method == "GET" and path.endswith("/me"):
        return route_me(event)
    if method == "GET" and path in ("/", ""):
        return ok({"status": "ok", "service": "СИНЕД Auth"})

    return err("Not found", 404)
