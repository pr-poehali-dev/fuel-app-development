import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { ORDERS_URL, Order, STATUS_LABEL, STATUS_ICON, STATUS_COLOR, formatDate } from "./cabinet/types";

interface Stats { total: number; pending: number; active: number; done: number }

export default function AdminOrders() {
  const [token, setToken] = useState<string>(() => localStorage.getItem("sined_admin_token") || "");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, active: 0, done: 0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Order>>({});

  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(`${ORDERS_URL}?action=admin-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.error) { setLoginError(data.error); return; }
      localStorage.setItem("sined_admin_token", data.token);
      setToken(data.token);
    } catch { setLoginError("Ошибка соединения"); }
    finally { setLoginLoading(false); }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ORDERS_URL}?action=all`, {
        headers: { "X-Admin-Token": token },
      });
      const data = await res.json();
      if (data.error) {
        if (res.status === 403) {
          localStorage.removeItem("sined_admin_token");
          setToken("");
        }
        return;
      }
      setOrders(data.orders || []);
      setStats(data.stats || { total: 0, pending: 0, active: 0, done: 0 });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) loadOrders();
  }, [token]);

  const updateOrder = async (id: string) => {
    try {
      await fetch(`${ORDERS_URL}?action=update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ id, ...editForm }),
      });
      setEditingId(null);
      setEditForm({});
      loadOrders();
    } catch {/* noop */}
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[hsl(var(--navy))] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--navy))] flex items-center justify-center mx-auto mb-4">
            <Icon name="Shield" size={26} className="text-[hsl(var(--sky))]" />
          </div>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-xl text-center mb-1">Админ-панель СИНЕД</h1>
          <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] text-center mb-6">Введите пароль для входа</p>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] mb-3" />

          {loginError && (
            <p className="text-red-500 text-xs font-ibm mb-3 flex items-center gap-1">
              <Icon name="AlertCircle" size={13} />{loginError}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={!password.trim() || loginLoading}
            className="w-full bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy)/0.9)] text-white py-3 rounded-xl text-sm font-golos font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loginLoading ? <><Icon name="Loader" size={16} className="animate-spin" /> Проверяем...</> : "Войти"}
          </button>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="bg-[hsl(var(--navy))] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Shield" size={20} className="text-[hsl(var(--sky))]" />
            <div>
              <div className="font-golos font-black text-base">Админ-панель СИНЕД</div>
              <div className="font-ibm text-[11px] text-white/60">Управление заявками</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadOrders} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Обновить">
              <Icon name="RefreshCw" size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => { localStorage.removeItem("sined_admin_token"); setToken(""); }}
              className="flex items-center gap-1.5 text-sm font-ibm text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
              <Icon name="LogOut" size={14} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { key: "all", label: "Всего", val: stats.total, icon: "Layers", color: "text-[hsl(var(--navy))]" },
            { key: "pending", label: "Обработка", val: stats.pending, icon: "Clock", color: "text-amber-600" },
            { key: "active", label: "В пути", val: stats.active, icon: "Truck", color: "text-blue-600" },
            { key: "done", label: "Готово", val: stats.done, icon: "CheckCircle", color: "text-emerald-600" },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`bg-white rounded-xl p-4 text-left border-2 transition-all
                ${filter === s.key ? "border-[hsl(var(--ocean))]" : "border-transparent hover:border-[hsl(var(--border))]"}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon name={s.icon} size={18} className={s.color} />
                <span className="font-golos font-black text-2xl text-[hsl(var(--navy))]">{s.val}</span>
              </div>
              <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <div className="px-5 py-3 border-b border-[hsl(var(--border))]">
            <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-sm">
              Заявки {filter !== "all" && `· ${STATUS_LABEL[filter] || filter}`} ({filtered.length})
            </h2>
          </div>

          {loading && (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              <Icon name="Loader" size={20} className="animate-spin mx-auto mb-2" />
              <span className="font-ibm text-sm">Загружаем...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              <Icon name="Inbox" size={26} className="mx-auto mb-2" />
              <p className="font-ibm text-sm">Заявок нет</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="divide-y divide-[hsl(var(--border))]">
              {filtered.map(order => {
                const statusKey = order.status in STATUS_LABEL ? order.status : "pending";
                const sc = STATUS_COLOR[statusKey];
                const isEditing = editingId === order.id;
                return (
                  <div key={order.id} className="px-5 py-4 hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${sc.bg} ${sc.text}`}>
                        <Icon name={STATUS_ICON[statusKey]} size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-golos font-bold text-[hsl(var(--navy))] text-sm">{order.order_number}</span>
                          <span className={`text-[10px] font-golos font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                            {STATUS_LABEL[statusKey]}
                          </span>
                          <span className="font-ibm text-[11px] text-[hsl(var(--muted-foreground))]">
                            {formatDate(order.created_at)}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-ibm">
                          <div>
                            <span className="text-[hsl(var(--muted-foreground))]">Клиент: </span>
                            <span className="text-[hsl(var(--navy))] font-medium">{order.name || order.org || "—"}</span>
                          </div>
                          <div>
                            <span className="text-[hsl(var(--muted-foreground))]">Телефон: </span>
                            <a href={`tel:${order.phone}`} className="text-[hsl(var(--ocean))] hover:underline">{order.phone || "—"}</a>
                          </div>
                          <div>
                            <span className="text-[hsl(var(--muted-foreground))]">Топливо: </span>
                            <span className="text-[hsl(var(--navy))] font-medium">{order.fuel_type || "—"} {order.volume && `· ${order.volume}`}</span>
                          </div>
                          <div>
                            <span className="text-[hsl(var(--muted-foreground))]">Дата: </span>
                            <span className="text-[hsl(var(--navy))]">{order.desired_date || "—"}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[hsl(var(--muted-foreground))]">Адрес: </span>
                            <span className="text-[hsl(var(--navy))]">{order.address || "—"}</span>
                          </div>
                          {order.comment && (
                            <div className="sm:col-span-2">
                              <span className="text-[hsl(var(--muted-foreground))]">Комментарий: </span>
                              <span className="text-[hsl(var(--navy))]">{order.comment}</span>
                            </div>
                          )}
                        </div>

                        {isEditing && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <select
                              defaultValue={order.status}
                              onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                              className="bg-[hsl(var(--muted))] rounded-lg px-3 py-2 text-xs font-ibm outline-none">
                              <option value="pending">Обработка</option>
                              <option value="active">В пути</option>
                              <option value="done">Доставлено</option>
                            </select>
                            <input
                              placeholder="Цена"
                              defaultValue={order.price || ""}
                              onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                              className="bg-[hsl(var(--muted))] rounded-lg px-3 py-2 text-xs font-ibm outline-none" />
                            <input
                              placeholder="Водитель"
                              defaultValue={order.driver || ""}
                              onChange={e => setEditForm(f => ({ ...f, driver: e.target.value }))}
                              className="bg-[hsl(var(--muted))] rounded-lg px-3 py-2 text-xs font-ibm outline-none" />
                            <input
                              placeholder="Транспорт"
                              defaultValue={order.vehicle || ""}
                              onChange={e => setEditForm(f => ({ ...f, vehicle: e.target.value }))}
                              className="bg-[hsl(var(--muted))] rounded-lg px-3 py-2 text-xs font-ibm outline-none" />
                            <button
                              onClick={() => updateOrder(order.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-ibm font-medium px-3 py-2 rounded-lg">
                              Сохранить
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditForm({}); }}
                              className="bg-[hsl(var(--muted))] text-[hsl(var(--navy))] text-xs font-ibm font-medium px-3 py-2 rounded-lg">
                              Отмена
                            </button>
                          </div>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {order.phone && (
                            <a
                              href={`https://t.me/+${order.phone.replace(/[^\d]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2AABEE] hover:bg-sky-50 p-2 rounded-lg transition-colors"
                              title="Написать в Telegram">
                              <Icon name="Send" size={15} />
                            </a>
                          )}
                          {order.phone && (
                            <a
                              href={`https://wa.me/${order.phone.replace(/[^\d]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                              title="Написать в WhatsApp">
                              <Icon name="MessageCircle" size={15} />
                            </a>
                          )}
                          {order.phone && (
                            <a
                              href={`tel:${order.phone}`}
                              className="text-[hsl(var(--navy))] hover:bg-[hsl(var(--muted))] p-2 rounded-lg transition-colors"
                              title="Позвонить">
                              <Icon name="Phone" size={15} />
                            </a>
                          )}
                          <button
                            onClick={() => { setEditingId(order.id); setEditForm({}); }}
                            className="text-[hsl(var(--ocean))] hover:bg-[hsl(var(--ice))] p-2 rounded-lg transition-colors"
                            title="Изменить">
                            <Icon name="Pencil" size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}