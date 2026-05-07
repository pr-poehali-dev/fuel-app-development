/**
 * Система внутренних токенов СИНЕТ.
 *
 * Хранится в localStorage в виде цепочки записей (как простой блокчейн):
 * каждая операция содержит hash от предыдущей записи.
 * Это позволяет админке детектировать ручную правку localStorage пользователем.
 *
 * Тратить токены НЕЛЬЗЯ из UI — только копить.
 * Списание происходит только при подтверждённом заказе (админом со стороны бэкенда).
 *
 * Демо-режим: токены копятся локально. После регистрации синхронизируются с бэком.
 */

const KEY = "sined_tokens_ledger_v1";
const SALT = "SINED-LEDGER-2025"; // соль для цепочки

export type TokenOpType =
  | "earn_order"        // начисление за заказ
  | "earn_referral"     // начисление от партнёрской программы
  | "earn_game"         // начисление за игру
  | "earn_bonus"        // прочие бонусы
  | "spend_wheel"       // трата на повторную прокрутку рулетки
  | "spend_discount";   // трата как скидка на топливо (только через бэк)

export interface LedgerEntry {
  id: string;          // уникальный id записи
  ts: number;          // timestamp
  type: TokenOpType;
  amount: number;      // положительное при earn, отрицательное при spend
  reason: string;      // комментарий
  prevHash: string;    // хеш предыдущей записи
  hash: string;        // хеш этой записи
}

/** Простой 32-bit string hash (не криптостойкий, но достаточно для детекции правки) */
function hashStr(s: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 16777619);
    h2 = Math.imul(h2 ^ ch, 2246822507);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return ((h2 >>> 0).toString(16) + (h1 >>> 0).toString(16)).padStart(16, "0");
}

function entryHash(e: Omit<LedgerEntry, "hash">): string {
  return hashStr(SALT + "|" + e.id + "|" + e.ts + "|" + e.type + "|" + e.amount + "|" + e.reason + "|" + e.prevHash);
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getLedger(): LedgerEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLedger(entries: LedgerEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

/**
 * Проверка целостности цепочки.
 * Возвращает { ok: true } если всё чисто
 * или { ok: false, brokenAt: index } если запись была изменена.
 */
export function verifyLedger(): { ok: boolean; brokenAt?: number } {
  const ledger = getLedger();
  let prevHash = "GENESIS";
  for (let i = 0; i < ledger.length; i++) {
    const e = ledger[i];
    if (e.prevHash !== prevHash) return { ok: false, brokenAt: i };
    const expected = entryHash({
      id: e.id, ts: e.ts, type: e.type, amount: e.amount, reason: e.reason, prevHash: e.prevHash,
    });
    if (e.hash !== expected) return { ok: false, brokenAt: i };
    prevHash = e.hash;
  }
  return { ok: true };
}

/**
 * Добавить запись о начислении.
 * Тратить нельзя — функция игнорирует попытки spend без подтверждённого ордера.
 */
export function addTokens(amount: number, reason: string, type: TokenOpType = "earn_bonus"): LedgerEntry | null {
  if (amount <= 0) return null;
  if (!type.startsWith("earn_")) return null; // тратить из UI запрещено

  const ledger = getLedger();
  const prevHash = ledger.length > 0 ? ledger[ledger.length - 1].hash : "GENESIS";
  const partial = {
    id: genId(),
    ts: Date.now(),
    type,
    amount,
    reason,
    prevHash,
  };
  const entry: LedgerEntry = { ...partial, hash: entryHash(partial) };
  ledger.push(entry);
  saveLedger(ledger);
  window.dispatchEvent(new CustomEvent("sined-tokens-update"));
  return entry;
}

/** Получить текущий баланс */
export function getBalance(): number {
  const v = verifyLedger();
  if (!v.ok) return 0; // подозрение на накрутку — считаем 0
  return getLedger().reduce((sum, e) => sum + e.amount, 0);
}

/** Может ли пользователь потратить N токенов прямо сейчас (для UI рулетки) */
export function canSpend(n: number): boolean {
  return getBalance() >= n;
}

/**
 * Локальная "трата" на повторное вращение рулетки.
 * Это технически spend, но в демо-режиме разрешён ТОЛЬКО для рулетки.
 * При синхронизации с бэком админ увидит и проверит.
 */
export function spendForWheel(amount: number): boolean {
  if (amount <= 0) return false;
  if (getBalance() < amount) return false;

  const ledger = getLedger();
  const prevHash = ledger.length > 0 ? ledger[ledger.length - 1].hash : "GENESIS";
  const partial = {
    id: genId(),
    ts: Date.now(),
    type: "spend_wheel" as TokenOpType,
    amount: -amount,
    reason: "Повторное вращение рулетки",
    prevHash,
  };
  const entry: LedgerEntry = { ...partial, hash: entryHash(partial) };
  ledger.push(entry);
  saveLedger(ledger);
  window.dispatchEvent(new CustomEvent("sined-tokens-update"));
  return true;
}

/** Сброс (только для демо-режима) */
export function resetTokens() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("sined-tokens-update"));
}

export const TOKEN_RULES = {
  perOrderRubles: 100,        // 1 токен за каждые 100 ₽ заказа
  refRewardPercent: 3,        // 3% бонусом партнёру
  vipThreshold: 5,            // c 5-го клиента → VIP
  vipRefRewardPercent: 5,
  newClientDiscountPercent: 5,// скидка на 1-й заказ другу
  wheelExtraSpinCost: 50,     // повторное вращение = 50 токенов
  tokenToRubleRate: 1,        // 1 токен = 1 ₽ скидки
};
