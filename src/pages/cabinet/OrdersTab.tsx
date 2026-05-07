import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ORDERS_URL, Order, STATUS_LABEL, STATUS_ICON, STATUS_COLOR, formatDate, UserData } from "./types";
import { isDemoMode, getDemoOrders, createDemoOrder, updateDemoOrder, nextStatus, resetDemo } from "./demoOrders";

interface OrdersTabProps {
  user: UserData;
  selectedOrder: string | null;
  setSelectedOrder: (id: string | null) => void;
}

export default function OrdersTab({ user, selectedOrder, setSelectedOrder }: OrdersTabProps) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const demo = isDemoMode();

  const reload = () => {
    if (demo) {
      setOrders(getDemoOrders());
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ action: "my", contact: user.contact || "" });
    fetch(`${ORDERS_URL}?${params}`, { headers: { "X-Auth-Token": user.token || "" } })
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [user.token, user.contact, demo]);

  const handleCreateDemo = () => {
    const samples = [
      { fuel_type: "Дизельное топливо Евро-5", volume: "1 500 л", address: "СПб, Невский 100" },
      { fuel_type: "Печное топливо", volume: "3 000 л", address: "Всеволожск, ул. Плоткина 12" },
      { fuel_type: "Мазут М-100", volume: "10 т", address: "Кронштадт, Флотская 1" },
      { fuel_type: "Бензин АИ-95", volume: "800 л", address: "Колпино, Заводской пр. 5" },
    ];
    const sample = samples[Math.floor(Math.random() * samples.length)];
    createDemoOrder(sample);
    reload();
  };

  const handleAdvanceStatus = (id: string, current: string) => {
    const next = nextStatus(current);
    updateDemoOrder(id, next);
    reload();
  };

  const handleResetDemo = () => {
    if (!window.confirm("Сбросить все демо-заявки?")) return;
    resetDemo();
    reload();
  };

  const total = orders.length;
  const active = orders.filter(o => o.status === "active").length;
  const done = orders.filter(o => o.status === "done").length;

  return (
    <div className="animate-fade-in">

      {/* Демо-плашка управления */}
      {demo && (
        <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon name="FlaskConical" size={20} className="text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-golos font-bold text-amber-900 text-sm">🧪 Демо-режим</div>
              <p className="font-ibm text-xs text-amber-800/80 leading-relaxed mt-0.5">
                Тестируйте полный цикл заявки. Все данные хранятся локально и сбросятся при следующем входе.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCreateDemo}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-golos font-semibold px-3 py-2 rounded-lg transition-colors">
              <Icon name="Plus" size={13} />
              Создать демо-заявку
            </button>
            <button onClick={() => navigate("/map")}
              className="flex items-center gap-1.5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 text-xs font-golos font-semibold px-3 py-2 rounded-lg transition-colors">
              <Icon name="Map" size={13} />
              Открыть карту
            </button>
            {orders.length > 0 && (
              <button onClick={handleResetDemo}
                className="flex items-center gap-1.5 bg-white hover:bg-red-50 border border-red-300 text-red-700 text-xs font-golos font-semibold px-3 py-2 rounded-lg transition-colors ml-auto">
                <Icon name="RotateCcw" size={13} />
                Сбросить
              </button>
            )}
          </div>
        </div>
      )}

      {/* Компактная сводка строкой */}
      <div className="flex items-center justify-between mb-5 bg-[hsl(var(--muted)/0.6)] rounded-xl px-5 py-3">
        <div className="flex items-center gap-6">
          <div>
            <div className="font-golos font-bold text-[hsl(var(--navy))] text-lg leading-none">{total}</div>
            <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wider">всего</div>
          </div>
          <div className="w-px h-8 bg-[hsl(var(--border))]" />
          <div>
            <div className="font-golos font-bold text-blue-600 text-lg leading-none">{active}</div>
            <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wider">в&nbsp;пути</div>
          </div>
          <div className="w-px h-8 bg-[hsl(var(--border))]" />
          <div>
            <div className="font-golos font-bold text-emerald-600 text-lg leading-none">{done}</div>
            <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wider">готово</div>
          </div>
        </div>
        <button
          onClick={() => demo ? handleCreateDemo() : navigate("/chat")}
          className="flex items-center gap-1.5 bg-[hsl(var(--navy))] text-white text-sm font-ibm font-medium px-4 py-2 rounded-lg hover:bg-[hsl(var(--navy)/0.9)] transition-colors">
          <Icon name="Plus" size={15} />
          Новая
        </button>
      </div>

      {/* Загрузка */}
      {loading && (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))] font-ibm text-sm">
          <Icon name="Loader" size={22} className="animate-spin mx-auto mb-3" />
          Загружаем заявки...
        </div>
      )}

      {/* Пусто */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-12 px-6 bg-[hsl(var(--muted)/0.4)] rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
            <Icon name="Inbox" size={26} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="font-golos font-bold text-[hsl(var(--navy))] mb-1">Пока нет заявок</h3>
          <p className="font-ibm text-sm text-[hsl(var(--muted-foreground))] mb-4 max-w-xs mx-auto">
            Оставьте первую заявку — Денис подберёт топливо и оформит доставку
          </p>
          <button
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy)/0.9)] text-white text-sm font-ibm font-medium px-5 py-2.5 rounded-lg transition-colors">
            <Icon name="MessageCircle" size={15} />
            Открыть чат с Денисом
          </button>
        </div>
      )}

      {/* Список */}
      {!loading && orders.length > 0 && (
        <div className="space-y-2">
          {orders.map((order, i) => {
            const statusKey = order.status in STATUS_LABEL ? order.status : "pending";
            const isSelected = selectedOrder === order.id;
            const sc = STATUS_COLOR[statusKey];
            return (
              <div
                key={order.id}
                className="animate-fade-in bg-white border border-[hsl(var(--border))] rounded-xl overflow-hidden hover:border-[hsl(var(--ocean)/0.3)] transition-colors"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <button
                  onClick={() => setSelectedOrder(isSelected ? null : order.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${sc.bg} ${sc.text}`}>
                    <Icon name={STATUS_ICON[statusKey]} size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-golos font-bold text-[hsl(var(--navy))] text-sm">{order.fuel_type || "Топливо"}</span>
                      {order.volume && (<>
                        <span className="text-[hsl(var(--muted-foreground))] text-xs font-ibm">·</span>
                        <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{order.volume}</span>
                      </>)}
                    </div>
                    <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] truncate mb-1.5">
                      {order.address || "Адрес не указан"}
                    </div>
                    {/* Прогресс-бар */}
                    <div className="h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          statusKey === "done" ? "bg-emerald-500 w-full" :
                          statusKey === "active" ? "bg-blue-500 w-2/3" :
                          "bg-amber-500 w-1/4"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{formatDate(order.created_at)}</div>
                      <div className={`font-golos text-[10px] mt-0.5 font-semibold ${sc.text}`}>{STATUS_LABEL[statusKey]}</div>
                    </div>
                    <Icon name={isSelected ? "ChevronUp" : "ChevronDown"} size={16} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                </button>

                {isSelected && (
                  <div className="px-5 pb-4 pt-1 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] animate-fade-in">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-3 text-sm">
                      <div>
                        <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Номер</div>
                        <div className="font-golos font-semibold text-[hsl(var(--navy))]">{order.order_number}</div>
                      </div>
                      <div>
                        <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Стоимость</div>
                        <div className="font-golos font-semibold text-[hsl(var(--navy))]">{order.price || "уточняется"}</div>
                      </div>
                      <div>
                        <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Водитель</div>
                        <div className="font-golos font-semibold text-[hsl(var(--navy))]">{order.driver || "—"}</div>
                      </div>
                      <div>
                        <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Транспорт</div>
                        <div className="font-golos font-semibold text-[hsl(var(--navy))] text-xs">{order.vehicle || "—"}</div>
                      </div>
                      {order.desired_date && (
                        <div>
                          <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Желаемая дата</div>
                          <div className="font-golos font-semibold text-[hsl(var(--navy))]">{order.desired_date}</div>
                        </div>
                      )}
                      {order.phone && (
                        <div>
                          <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Контакт</div>
                          <div className="font-golos font-semibold text-[hsl(var(--navy))] text-xs">{order.phone}</div>
                        </div>
                      )}
                    </div>
                    {order.comment && (
                      <div className="mt-3 bg-white rounded-lg p-3">
                        <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Комментарий</div>
                        <div className="font-ibm text-xs text-[hsl(var(--navy))]">{order.comment}</div>
                      </div>
                    )}
                    {order.status === "active" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/map"); }}
                        className="mt-4 w-full bg-[hsl(var(--ocean))] hover:bg-[hsl(var(--ocean)/0.9)] text-white py-2.5 rounded-lg text-sm font-ibm font-medium flex items-center justify-center gap-2 transition-colors">
                        <Icon name="Navigation" size={15} />
                        Отследить на карте
                      </button>
                    )}
                    {/* Демо-кнопка: продвинуть статус */}
                    {demo && order.status !== "done" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(order.id, order.status); }}
                        className="mt-2 w-full bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 py-2 rounded-lg text-xs font-golos font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Icon name="FastForward" size={13} />
                        🧪 Симуляция: {order.status === "pending" ? "Принять в работу" : "Завершить доставку"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}