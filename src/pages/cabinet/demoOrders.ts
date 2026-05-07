import { Order } from "./types";

const KEY = "sined_demo_orders";

export function isDemoMode(): boolean {
  return localStorage.getItem("sined_demo_mode") === "1";
}

export function getDemoOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Order[];
  } catch { return []; }
}

export function saveDemoOrders(orders: Order[]): void {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function createDemoOrder(data: Partial<Order>): Order {
  const orders = getDemoOrders();
  const num = String(orders.length + 1).padStart(3, "0");
  const order: Order = {
    id: "demo_" + Date.now(),
    order_number: `ЗК-2026-${num}`,
    contact: "demo@sined.local",
    name: data.name || "Демо-клиент",
    org: data.org || "ООО «Тест-Клиент»",
    phone: data.phone || "+7 921 555-12-34",
    fuel_type: data.fuel_type || "Дизельное топливо Евро-5",
    volume: data.volume || "1 500 л",
    address: data.address || "СПб, Невский проспект, 100",
    desired_date: data.desired_date || "Завтра до 18:00",
    comment: data.comment || "Тестовая заявка для демонстрации",
    status: data.status || "pending",
    driver: data.driver || "",
    vehicle: data.vehicle || "",
    price: data.price || "",
    source: "demo",
    created_at: new Date().toISOString(),
  };
  orders.unshift(order);
  saveDemoOrders(orders);
  return order;
}

export function updateDemoOrder(id: string, patch: Partial<Order>): void {
  const orders = getDemoOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return;
  orders[idx] = { ...orders[idx], ...patch };
  saveDemoOrders(orders);
}

export function resetDemo(): void {
  localStorage.removeItem(KEY);
}

export function nextStatus(current: string): { status: string; driver?: string; vehicle?: string; price?: string } {
  if (current === "pending") {
    return {
      status: "active",
      driver: "Петров Николай",
      vehicle: "КамАЗ 5325 · В456ЕК78",
      price: "уточнена менеджером",
    };
  }
  if (current === "active") {
    return { status: "done" };
  }
  return { status: "pending" };
}
