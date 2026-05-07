"""
Тестовое сообщение в Telegram-группу СИНЕД.
Проверяет связку TELEGRAM_BOT_TOKEN + TELEGRAM_GROUP_ID (или TELEGRAM_CHAT_ID).
"""
import os
import json
import urllib.request
from datetime import datetime


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def tg_request(bot_token: str, method: str, payload: dict) -> dict:
    url = f"https://api.telegram.org/bot{bot_token}/{method}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode()
            return {"status": resp.status, "body": json.loads(body)}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "body": json.loads(e.read().decode() or "{}")}
    except Exception as e:
        return {"status": 0, "error": str(e)}


def handler(event: dict, context) -> dict:
    """Тест связи с ботом и отправка пробных сообщений."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    group_id = os.environ.get("TELEGRAM_GROUP_ID", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")

    target = group_id or chat_id

    result = {
        "bot_token_set": bool(bot_token),
        "group_id_set": bool(group_id),
        "chat_id_set": bool(chat_id),
        "target": target if target else None,
        "target_type": "group" if group_id else ("personal" if chat_id else "none"),
    }

    if not bot_token:
        result["error"] = "TELEGRAM_BOT_TOKEN не задан"
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    # 1. Проверяем валидность токена через getMe
    me = tg_request(bot_token, "getMe", {})
    result["getMe"] = me
    if me.get("status") != 200 or not me.get("body", {}).get("ok"):
        result["error"] = "Токен бота недействителен или бот недоступен"
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    bot_info = me["body"]["result"]
    result["bot"] = {"username": bot_info.get("username"), "id": bot_info.get("id"), "name": bot_info.get("first_name")}

    if not target:
        result["error"] = "Ни TELEGRAM_GROUP_ID, ни TELEGRAM_CHAT_ID не заданы"
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    now_str = datetime.now().strftime("%d.%m.%Y %H:%M:%S")

    # 2. Тестовое сообщение №1 — связь работает
    msg1 = (
        f"✅ <b>Тест связи с ботом — пройден</b>\n\n"
        f"🤖 Бот: @{bot_info.get('username')}\n"
        f"🕒 Время: {now_str}\n\n"
        f"<i>Это сообщение отправлено для проверки связи. Если вы видите его — настройка прошла успешно!</i>"
    )
    send1 = tg_request(bot_token, "sendMessage", {
        "chat_id": target,
        "text": msg1,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    })
    result["send_test_1"] = send1

    # 3. Тестовое сообщение №2 — пример уведомления о посетителе
    msg2 = (
        f"🟢 <b>Новое взаимодействие на сайте</b>\n"
        f"<i>Клиент открыл чат с Денисом</i>\n\n"
        f"📄 <b>Страница:</b> /chat\n"
        f"🕒 <b>Время:</b> {now_str}\n"
        f"🆔 <b>Сессия:</b> <code>test1234</code>\n\n"
        f"💬 <i>Это пример уведомления — реальные будут приходить так же</i>"
    )
    send2 = tg_request(bot_token, "sendMessage", {
        "chat_id": target,
        "text": msg2,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    })
    result["send_test_2"] = send2

    # 4. Тестовое сообщение №3 — пример заявки с кнопками
    test_phone = "+7 999 123-45-67"
    digits = "".join(c for c in test_phone if c.isdigit())
    msg3 = (
        f"🔵 <b>НОВАЯ ЗАЯВКА СИНЕД</b> <i>(пример)</i>\n"
        f"📅 {now_str}\n\n"
        f"👤 <b>Клиент:</b> Иванов Иван\n"
        f"📞 <b>Телефон:</b> {test_phone}\n"
        f"⛽ <b>Топливо:</b> ДТ Евро-5\n"
        f"📦 <b>Объём:</b> 1 000 л\n"
        f"📍 <b>Адрес:</b> СПб, Невский 100\n"
        f"📅 <b>Дата:</b> Завтра\n\n"
        f"⚠️ <i>Это тестовая заявка. Реальные приходят так же.</i>"
    )
    send3 = tg_request(bot_token, "sendMessage", {
        "chat_id": target,
        "text": msg3,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
        "reply_markup": {
            "inline_keyboard": [
                [
                    {"text": "📱 Позвонить", "url": f"tel:+{digits}"},
                    {"text": "💬 WhatsApp", "url": f"https://wa.me/{digits}"},
                ],
                [
                    {"text": "✈️ Telegram", "url": f"https://t.me/+{digits}"},
                ],
            ]
        },
    })
    result["send_test_3"] = send3

    success_count = sum(1 for s in [send1, send2, send3] if s.get("status") == 200)
    result["summary"] = f"Отправлено {success_count} из 3 сообщений"
    result["success"] = success_count == 3

    return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}
