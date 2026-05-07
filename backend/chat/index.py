"""
ИИ-чат СИНЕД: обработка сообщений через OpenAI GPT-4o-mini.
Собирает данные заявки, консультирует по топливу для СЗ региона.
"""
import os
import json
from openai import OpenAI

SYSTEM_PROMPT = """Тебя зовут Денис. Ты — вежливый и профессиональный ИИ-помощник топливной компании СИНЕД.
Всегда представляйся как Денис, если тебя спрашивают как тебя зовут.
Компания работает в Санкт-Петербурге и Ленинградской области (Северо-Западный регион).
Клиенты: котельные (промышленные и частные), транспортные компании, водный транспорт (суда, яхты), железнодорожный транспорт.
Виды топлива: дизельное топливо (ДТ), мазут М-100, судовое топливо, печное топливо, бензин АИ-92/95, биодизель В100.

Твои задачи:
1. Отвечать на ЛЮБЫЕ вопросы связанные с топливом, котельными, хранением, расходом, подбором — даже самые простые.
2. Помогать оформить заявку, последовательно собирая: имя/организацию, телефон, вид топлива, объём, адрес доставки, желаемую дату, комментарии.
3. Консультировать по выбору топлива (например: для двухэтажного дома с котельной — ДТ или печное, расход, хранение).
4. Быть дружелюбным, чётким, не навязчивым.

Важные правила:
- НЕ называй конкретные цены — только «цена уточняется у менеджера».
- Обязательно упоминай, что финальную цену подтвердит менеджер в течение 30 минут.
- При сборе заявки — после получения всех данных выведи итоговую сводку и попроси подтверждение.
- Всегда соблюдай ФЗ-152: не запрашивай лишних персональных данных.
- Отвечай на русском языке.
- Если вопрос совсем не по теме — кратко ответь и мягко верни к теме топлива/заявки.
- Контакты: телефон +7 (812) 123-45-67, email info@sined.ru.
"""

def handler(event: dict, context) -> dict:
    """Обработка сообщения чата через OpenAI."""
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    messages = body.get("messages", [])
    
    if not messages:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "No messages provided"})}

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"statusCode": 500, "headers": cors_headers, "body": json.dumps({"error": "API key not configured"})}

    client = OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )

    chat_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=chat_messages,
        max_tokens=800,
        temperature=0.7,
    )

    reply = response.choices[0].message.content

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"reply": reply}, ensure_ascii=False),
    }