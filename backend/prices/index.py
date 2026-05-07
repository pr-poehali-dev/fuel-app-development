"""
Получение актуальных цен на топливо из Telegram-канала СИНЕД.
Парсит последнее сообщение канала через Telegram Bot API.
Кешируется на 1 час.
"""
import os
import json
import urllib.request
import re
from datetime import datetime, timezone

_cache = {"data": None, "ts": 0}
CACHE_TTL = 3600  # 1 час


def fetch_channel_messages(bot_token: str, channel: str) -> list:
    channel_id = f"@{channel}" if not channel.startswith("@") else channel
    url = f"https://api.telegram.org/bot{bot_token}/getUpdates?limit=1&allowed_updates=channel_post"
    # Используем forwardFromChat через getChat + getChatHistory
    # Для публичного канала — используем просто getMessages через web preview
    url2 = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    # Читаем последние посты через forwardMessage trick
    fwd_url = (
        f"https://api.telegram.org/bot{bot_token}/forwardMessage?"
        f"chat_id={channel_id}&from_chat_id={channel_id}&message_id=9999999"
    )

    # Надёжный способ — читать последние сообщения через getHistory
    history_url = f"https://api.telegram.org/bot{bot_token}/getChatHistory?chat_id={channel_id}&limit=5"

    # Правильный способ для публичных каналов — читать через parseMode
    # Используем updates с channel_post
    updates_url = f"https://api.telegram.org/bot{bot_token}/getUpdates?limit=10&timeout=0"
    try:
        req = urllib.request.Request(updates_url)
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            posts = []
            for upd in data.get("result", []):
                if "channel_post" in upd:
                    posts.append(upd["channel_post"])
            return posts
    except Exception:
        return []


def parse_prices_from_text(text: str) -> list:
    """Парсит цены из текста сообщения Telegram."""
    fuels = []
    lines = text.strip().split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Ищем строки с ценой: "Дизельное Евро 5 — 68 500 руб/т" или "ДТ: 68.50 руб/л"
        price_match = re.search(r'(\d[\d\s]*[\d])\s*(руб|₽|р\.?)', line, re.IGNORECASE)
        if price_match:
            name_part = line[:price_match.start()].strip().rstrip("—:-")
            price_str = price_match.group(1).replace(" ", "")
            unit_raw = line[price_match.end():].strip()
            unit = ""
            if "/т" in line or "т." in line:
                unit = "руб/т"
            elif "/л" in line or "л." in line:
                unit = "руб/л"
            else:
                unit = "руб/т"
            if name_part:
                fuels.append({
                    "name": name_part.strip(),
                    "price": price_str,
                    "unit": unit,
                })
    return fuels


DEFAULT_PRICES = [
    {"name": "Дизельное топливо Евро 5", "tag": "ДТ-Е5", "price": None, "unit": "руб/т"},
    {"name": "Мазут М-100", "tag": "М-100", "price": None, "unit": "руб/т"},
    {"name": "Судовое топливо", "tag": "СТ", "price": None, "unit": "руб/т"},
    {"name": "Печное топливо", "tag": "ПТ", "price": None, "unit": "руб/л"},
    {"name": "Бензин АИ-92", "tag": "АИ-92", "price": None, "unit": "руб/л"},
    {"name": "Бензин АИ-95", "tag": "АИ-95", "price": None, "unit": "руб/л"},
]


def handler(event: dict, context) -> dict:
    """Возвращает актуальные цены на топливо из Telegram-канала."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    now_ts = datetime.now(timezone.utc).timestamp()
    global _cache

    if _cache["data"] and (now_ts - _cache["ts"]) < CACHE_TTL:
        return {"statusCode": 200, "headers": cors, "body": json.dumps(_cache["data"], ensure_ascii=False)}

    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    channel = os.environ.get("TELEGRAM_PRICES_CHANNEL", "")

    prices_from_tg = []
    raw_text = ""
    updated_at = datetime.now().strftime("%d.%m.%Y %H:%M")

    if bot_token and channel:
        posts = fetch_channel_messages(bot_token, channel)
        if posts:
            latest = posts[-1]
            raw_text = latest.get("text", "")
            prices_from_tg = parse_prices_from_text(raw_text)
            updated_at = datetime.fromtimestamp(latest.get("date", now_ts)).strftime("%d.%m.%Y %H:%M")

    # Мержим с дефолтным списком
    result_prices = []
    for default in DEFAULT_PRICES:
        matched = None
        for tg in prices_from_tg:
            if any(kw.lower() in tg["name"].lower() for kw in default["name"].lower().split()):
                matched = tg
                break
        if matched:
            result_prices.append({
                "name": default["name"],
                "tag": default["tag"],
                "price": matched["price"],
                "unit": matched["unit"],
                "updated_at": updated_at,
            })
        else:
            result_prices.append({
                "name": default["name"],
                "tag": default["tag"],
                "price": None,
                "unit": default["unit"],
                "updated_at": updated_at,
            })

    result = {
        "prices": result_prices,
        "updated_at": updated_at,
        "raw_text": raw_text,
        "source": "telegram" if prices_from_tg else "default",
    }

    _cache = {"data": result, "ts": now_ts}

    return {"statusCode": 200, "headers": cors, "body": json.dumps(result, ensure_ascii=False)}
