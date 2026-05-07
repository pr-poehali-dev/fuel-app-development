"""
Отправка заявки менеджерам СИНЕД: на почту sinedooo@mail.ru и в Telegram.
Вызывается из чата с ИИ Денисом после сбора всех данных заявки.
"""
import os
import json
import urllib.request
import urllib.parse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


def send_telegram(bot_token: str, chat_id: str, text: str) -> bool:
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception:
        return False


def send_email(subject: str, body: str) -> bool:
    smtp_host = os.environ.get("SMTP_HOST", "smtp.mail.ru")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER", "sinedooo@mail.ru")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    to_email = "sinedooo@mail.ru"

    if not smtp_pass:
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg.attach(MIMEText(body, "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())
        return True
    except Exception:
        return False


def handler(event: dict, context) -> dict:
    """Отправка новой заявки менеджерам на почту и в Telegram."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = json.loads(event.get("body") or "{}")
    order = body.get("order", {})
    conversation = body.get("conversation", "")

    now = datetime.now().strftime("%d.%m.%Y %H:%M")

    name = order.get("name", "Не указано")
    phone = order.get("phone", "Не указан")
    fuel = order.get("fuelType", "Не указано")
    volume = order.get("volume", "Не указан")
    address = order.get("address", "Не указан")
    date_req = order.get("date", "Не указана")
    comment = order.get("comment", "")

    tg_text = (
        f"🔵 <b>НОВАЯ ЗАЯВКА СИНЕД</b>\n"
        f"📅 {now}\n\n"
        f"👤 <b>Клиент:</b> {name}\n"
        f"📞 <b>Телефон:</b> {phone}\n"
        f"⛽ <b>Топливо:</b> {fuel}\n"
        f"📦 <b>Объём:</b> {volume}\n"
        f"📍 <b>Адрес:</b> {address}\n"
        f"📅 <b>Дата:</b> {date_req}\n"
        + (f"💬 <b>Комментарий:</b> {comment}\n" if comment else "")
        + f"\n⚠️ Свяжитесь с клиентом для подтверждения цены!"
    )

    email_html = f"""
    <html><body style="font-family:Arial,sans-serif;color:#1a3d7c;max-width:600px;margin:0 auto">
    <div style="background:#1a3d7c;padding:20px;border-radius:12px 12px 0 0">
      <h2 style="color:white;margin:0">🔵 Новая заявка СИНЕД</h2>
      <p style="color:#93c5fd;margin:4px 0 0">{now}</p>
    </div>
    <div style="background:#f0f7ff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #bfdbfe">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;font-weight:bold;width:140px">Клиент</td><td style="padding:8px 0;border-bottom:1px solid #dbeafe">{name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;font-weight:bold">Телефон</td><td style="padding:8px 0;border-bottom:1px solid #dbeafe">{phone}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;font-weight:bold">Топливо</td><td style="padding:8px 0;border-bottom:1px solid #dbeafe">{fuel}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;font-weight:bold">Объём</td><td style="padding:8px 0;border-bottom:1px solid #dbeafe">{volume}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;font-weight:bold">Адрес доставки</td><td style="padding:8px 0;border-bottom:1px solid #dbeafe">{address}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;font-weight:bold">Желаемая дата</td><td style="padding:8px 0;border-bottom:1px solid #dbeafe">{date_req}</td></tr>
        {"<tr><td style='padding:8px 0;font-weight:bold'>Комментарий</td><td style='padding:8px 0'>" + comment + "</td></tr>" if comment else ""}
      </table>
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-top:16px">
        ⚠️ <strong>Свяжитесь с клиентом для подтверждения финальной цены!</strong>
      </div>
    </div>
    </body></html>
    """

    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")

    tg_sent = False
    email_sent = False

    if bot_token and chat_id:
        tg_sent = send_telegram(bot_token, chat_id, tg_text)

    email_sent = send_email(f"Новая заявка от {name} — СИНЕД", email_html)

    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({
            "success": True,
            "tg_sent": tg_sent,
            "email_sent": email_sent,
        }),
    }
