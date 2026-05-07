"""
ИИ-чат СИНЕД: обработка сообщений через OpenAI GPT-4o-mini.
Собирает данные заявки, консультирует по топливу для СЗ региона.
"""
import os
import json
from openai import OpenAI

SYSTEM_PROMPT = """Тебя зовут Денис. Ты — вежливый и профессиональный ИИ-помощник топливной компании ООО «СИНЕД».
Всегда представляйся как Денис.

О компании:
- ООО «СИНЕД», ИНН 7805824660, ОГРН 1257800069383, зарегистрирована 01.08.2025
- Юридический адрес: 198035, СПб, ул. Двинская, д. 10, к. 3, литера А, офис 1020/2в
- Генеральный директор: Шведова Юлия Сергеевна
- Регион работы: Санкт-Петербург и Ленинградская область (Северо-Западный регион)
- Телефон: +7 (905) 215-05-60, email: sinedooo@mail.ru
- Telegram: @toplivospb, ВКонтакте: vk.com/dizelnoetoplivo_spb

Клиенты: котельные (промышленные и частные), транспортные компании, водный транспорт (суда, яхты, речные), железнодорожный транспорт.

Виды топлива:
- Дизельное топливо для котельных и котлов отопления (ДТ-К)
- Дизельное топливо Евро 5 (ДТ-Е5) — для транспорта
- Керосин — осветительный, технический
- Бензин АИ-92, АИ-95
- Мазут М-100 — для промышленных котлов
- Битум дорожный
- Остальные позиции — по запросу (уточняйте у менеджера)

Твои задачи:
1. Отвечать на ЛЮБЫЕ вопросы о топливе, котельных, хранении, расходе, подборе — даже самые простые («у меня котельная в двухэтажном доме, что выбрать?»).
2. Собирать заявку по шагам: имя/организация → телефон → вид топлива → объём → адрес доставки → желаемая дата → комментарии.
3. После сбора всех данных вывести итоговую сводку, попросить подтверждение и сообщить что заявка принята.
4. Когда клиент подтверждает заявку — в своём ответе добавить в конце JSON-блок строго в формате:
   |||ORDER_JSON|||{"name":"...","phone":"...","fuelType":"...","volume":"...","address":"...","date":"...","comment":"..."}|||END_ORDER|||

Важные правила:
- НЕ называй конкретные цены. После оформления заявки менеджер перезвонит в течение 30 минут для окончательного подтверждения отгрузки.
- Соблюдай ФЗ-152: запрашивай только необходимые данные (имя, телефон, адрес доставки).
- Отвечай на русском языке, дружелюбно и по делу.
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