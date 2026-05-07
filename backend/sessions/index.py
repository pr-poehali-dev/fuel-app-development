"""
Управление сессиями чата для админки СИНЕД.
Хранит сессии и сообщения в PostgreSQL, уведомляет менеджеров в Telegram
о новых посетителях чата.
"""
import os
import json
import urllib.request
import psycopg2
from datetime import datetime, timezone, timedelta

MSK = timezone(timedelta(hours=3))


def now_msk() -> datetime:
    return datetime.now(MSK)


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def esc(value: str) -> str:
    """Экранирует строку для подстановки в SQL-запрос."""
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def send_telegram(bot_token: str, chat_id: str, text: str) -> bool:
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode()
            print(f"[Sessions Telegram ERROR {e.code}] {err_body[:500]}")
        except Exception:
            pass
        return False
    except Exception as ex:
        print(f"[Sessions Telegram ERROR] {type(ex).__name__}: {ex}")
        return False


def route_start(body: dict, schema: str) -> dict:
    """POST /start — создать или обновить сессию, уведомить в Telegram если новая."""
    session_id = body.get("session_id", "")
    page_source = body.get("page_source", "")

    if not session_id:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "session_id is required"}),
        }

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Проверяем существование сессии
        cur.execute(
            f"SELECT id, notified FROM {schema}.chat_sessions "
            f"WHERE session_id = {esc(session_id)}"
        )
        row = cur.fetchone()
        created = False

        if row is None:
            # Создаём новую сессию
            cur.execute(
                f"INSERT INTO {schema}.chat_sessions "
                f"(session_id, started_at, last_active, status, page_source, notified) "
                f"VALUES ("
                f"  {esc(session_id)}, "
                f"  NOW(), "
                f"  NOW(), "
                f"  'active', "
                f"  {esc(page_source)}, "
                f"  false"
                f")"
            )
            conn.commit()
            created = True
            notified = False
        else:
            notified = bool(row[1])
            # Обновляем last_active
            cur.execute(
                f"UPDATE {schema}.chat_sessions "
                f"SET last_active = NOW() "
                f"WHERE session_id = {esc(session_id)}"
            )
            conn.commit()

        # Уведомление в Telegram если ещё не уведомляли
        if not notified:
            bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
            chat_id = os.environ.get("TELEGRAM_GROUP_ID") or os.environ.get("TELEGRAM_CHAT_ID", "")
            short_id = session_id[:8] if len(session_id) >= 8 else session_id
            page_label = page_source if page_source else "/"
            now_str = now_msk().strftime("%d.%m.%Y %H:%M (МСК)")
            tg_text = (
                f"🟢 <b>Новое взаимодействие на сайте</b>\n"
                f"<i>Клиент открыл чат с Денисом</i>\n\n"
                f"📄 <b>Страница:</b> {page_label}\n"
                f"🕒 <b>Время:</b> {now_str}\n"
                f"🆔 <b>Сессия:</b> <code>{short_id}</code>\n\n"
                f"💬 Ждём, пока клиент оставит заявку..."
            )
            if bot_token and chat_id:
                sent = send_telegram(bot_token, chat_id, tg_text)
                if sent:
                    cur.execute(
                        f"UPDATE {schema}.chat_sessions "
                        f"SET notified = true "
                        f"WHERE session_id = {esc(session_id)}"
                    )
                    conn.commit()

        cur.close()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"session_id": session_id, "created": created}),
    }


def route_message(body: dict, schema: str) -> dict:
    """POST /message — сохранить сообщение и обновить last_active сессии."""
    session_id = body.get("session_id", "")
    role = body.get("role", "")
    content = body.get("content", "")
    client_name = body.get("client_name")
    client_phone = body.get("client_phone")

    if not session_id or not role or not content:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "session_id, role and content are required"}),
        }

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Вставляем сообщение
        cur.execute(
            f"INSERT INTO {schema}.chat_messages (session_id, role, content, created_at) "
            f"VALUES ({esc(session_id)}, {esc(role)}, {esc(content)}, NOW())"
        )

        # Обновляем last_active и при наличии client_name — поле в сессии
        if client_name:
            cur.execute(
                f"UPDATE {schema}.chat_sessions "
                f"SET last_active = NOW(), client_name = {esc(client_name)} "
                f"WHERE session_id = {esc(session_id)}"
            )
        else:
            cur.execute(
                f"UPDATE {schema}.chat_sessions "
                f"SET last_active = NOW() "
                f"WHERE session_id = {esc(session_id)}"
            )

        # Обновляем client_phone если передан
        if client_phone:
            cur.execute(
                f"UPDATE {schema}.chat_sessions "
                f"SET client_phone = {esc(client_phone)} "
                f"WHERE session_id = {esc(session_id)}"
            )

        conn.commit()
        cur.close()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"ok": True}),
    }


def route_sessions(schema: str) -> dict:
    """GET /sessions — список активных сессий для админки (последние 50)."""
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT s.session_id, s.started_at, s.last_active, s.status, "
            f"       s.client_name, s.client_phone, s.client_org, s.notified, "
            f"       COUNT(m.id) AS msg_count "
            f"FROM {schema}.chat_sessions s "
            f"LEFT JOIN {schema}.chat_messages m ON m.session_id = s.session_id "
            f"GROUP BY s.id, s.session_id, s.started_at, s.last_active, s.status, "
            f"         s.client_name, s.client_phone, s.client_org, s.notified "
            f"ORDER BY s.last_active DESC "
            f"LIMIT 50"
        )
        rows = cur.fetchall()
        cols = [
            "session_id", "started_at", "last_active", "status",
            "client_name", "client_phone", "client_org", "notified", "msg_count",
        ]
        result = []
        for row in rows:
            item = {}
            for i, col in enumerate(cols):
                val = row[i]
                if isinstance(val, datetime):
                    val = val.isoformat()
                item[col] = val
            result.append(item)
        cur.close()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(result, ensure_ascii=False),
    }


def route_session(session_id: str, schema: str) -> dict:
    """GET /session?id=XXX — история сообщений одной сессии и данные сессии."""
    if not session_id:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "id param is required"}),
        }

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Данные сессии
        cur.execute(
            f"SELECT session_id, started_at, last_active, status, "
            f"       client_name, client_phone, client_org, page_source, manager_id, notified "
            f"FROM {schema}.chat_sessions "
            f"WHERE session_id = {esc(session_id)}"
        )
        sess_row = cur.fetchone()
        if sess_row is None:
            cur.close()
            return {
                "statusCode": 404,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Session not found"}),
            }

        sess_cols = [
            "session_id", "started_at", "last_active", "status",
            "client_name", "client_phone", "client_org", "page_source", "manager_id", "notified",
        ]
        session_data = {}
        for i, col in enumerate(sess_cols):
            val = sess_row[i]
            if isinstance(val, datetime):
                val = val.isoformat()
            session_data[col] = val

        # Сообщения сессии
        cur.execute(
            f"SELECT id, role, content, created_at "
            f"FROM {schema}.chat_messages "
            f"WHERE session_id = {esc(session_id)} "
            f"ORDER BY created_at ASC"
        )
        msg_rows = cur.fetchall()
        msg_cols = ["id", "role", "content", "created_at"]
        messages = []
        for row in msg_rows:
            item = {}
            for i, col in enumerate(msg_cols):
                val = row[i]
                if isinstance(val, datetime):
                    val = val.isoformat()
                item[col] = val
            messages.append(item)

        cur.close()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"session": session_data, "messages": messages}, ensure_ascii=False),
    }


def route_session_status(body: dict, schema: str) -> dict:
    """POST /session/status — обновить статус сессии."""
    session_id = body.get("session_id", "")
    status = body.get("status", "")

    if not session_id or not status:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "session_id and status are required"}),
        }

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {schema}.chat_sessions "
            f"SET status = {esc(status)} "
            f"WHERE session_id = {esc(session_id)}"
        )
        conn.commit()
        cur.close()
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"ok": True}),
    }


def handler(event: dict, context) -> dict:
    """
    Управление сессиями чата СИНЕД.
    Маршруты:
      POST /start          — создать или обновить сессию, уведомить в Telegram
      POST /message        — сохранить сообщение чата
      GET  /sessions       — список сессий для админки (последние 50)
      GET  /session?id=XXX — история и данные одной сессии
      POST /session/status — обновить статус сессии
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/").rstrip("/")

    # Нормализуем путь: убираем префикс функции (/sessions)
    # path может быть "/sessions/start", "/start", "/" и т.д.
    for prefix in ("/sessions", ""):
        if path.startswith(prefix):
            path = path[len(prefix):]
            break
    if not path:
        path = "/"

    try:
        if method == "POST":
            body = json.loads(event.get("body") or "{}")

            if path in ("/start", "/"):
                return route_start(body, schema)

            if path == "/message":
                return route_message(body, schema)

            if path == "/session/status":
                return route_session_status(body, schema)

            return {
                "statusCode": 404,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Not found"}),
            }

        if method == "GET":
            qs = event.get("queryStringParameters") or {}

            if path in ("/sessions", "/"):
                return route_sessions(schema)

            if path == "/session":
                return route_session(qs.get("id", ""), schema)

            return {
                "statusCode": 404,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Not found"}),
            }

        return {
            "statusCode": 405,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Method not allowed"}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)}),
        }