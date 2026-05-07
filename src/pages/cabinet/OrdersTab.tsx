import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { mockOrders, statusConfig } from "./types";

interface OrdersTabProps {
  selectedOrder: string | null;
  setSelectedOrder: (id: string | null) => void;
}

export default function OrdersTab({ selectedOrder, setSelectedOrder }: OrdersTabProps) {
  const navigate = useNavigate();

  const total = mockOrders.length;
  const active = mockOrders.filter(o => o.status === "active").length;
  const done = mockOrders.filter(o => o.status === "done").length;

  return (
    <div className="animate-fade-in">

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
          onClick={() => navigate("/chat")}
          className="flex items-center gap-1.5 bg-[hsl(var(--navy))] text-white text-sm font-ibm font-medium px-4 py-2 rounded-lg hover:bg-[hsl(var(--navy)/0.9)] transition-colors">
          <Icon name="Plus" size={15} />
          Новая
        </button>
      </div>

      {/* Лаконичный список */}
      <div className="space-y-2">
        {mockOrders.map((order, i) => {
          const sc = statusConfig[order.status];
          const isSelected = selectedOrder === order.id;
          return (
            <div
              key={order.id}
              className="animate-fade-in bg-white border border-[hsl(var(--border))] rounded-xl overflow-hidden hover:border-[hsl(var(--ocean)/0.3)] transition-colors"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <button
                onClick={() => setSelectedOrder(isSelected ? null : order.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left">
                {/* Иконка статуса */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  order.status === "done" ? "bg-emerald-50 text-emerald-600" :
                  order.status === "active" ? "bg-blue-50 text-blue-600" :
                  "bg-amber-50 text-amber-600"
                }`}>
                  <Icon name={sc.icon} size={16} />
                </div>

                {/* Основная инфа */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-golos font-bold text-[hsl(var(--navy))] text-sm">{order.fuel}</span>
                    <span className="text-[hsl(var(--muted-foreground))] text-xs font-ibm">·</span>
                    <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{order.volume}</span>
                  </div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {order.address}
                  </div>
                </div>

                {/* Дата + стрелка */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{order.date}</div>
                    <div className={`font-golos text-[10px] mt-0.5 font-semibold ${
                      order.status === "done" ? "text-emerald-600" :
                      order.status === "active" ? "text-blue-600" :
                      "text-amber-600"
                    }`}>{sc.label}</div>
                  </div>
                  <Icon
                    name={isSelected ? "ChevronUp" : "ChevronDown"}
                    size={16}
                    className="text-[hsl(var(--muted-foreground))]" />
                </div>
              </button>

              {/* Раскрытые детали */}
              {isSelected && (
                <div className="px-5 pb-4 pt-1 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] animate-fade-in">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-3 text-sm">
                    <div>
                      <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Номер</div>
                      <div className="font-golos font-semibold text-[hsl(var(--navy))]">{order.id}</div>
                    </div>
                    <div>
                      <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Стоимость</div>
                      <div className="font-golos font-semibold text-[hsl(var(--navy))]">{order.price}</div>
                    </div>
                    <div>
                      <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Водитель</div>
                      <div className="font-golos font-semibold text-[hsl(var(--navy))]">{order.driver}</div>
                    </div>
                    <div>
                      <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Транспорт</div>
                      <div className="font-golos font-semibold text-[hsl(var(--navy))] text-xs">{order.vehicle}</div>
                    </div>
                  </div>
                  {order.status === "active" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate("/map"); }}
                      className="mt-4 w-full bg-[hsl(var(--ocean))] hover:bg-[hsl(var(--ocean)/0.9)] text-white py-2.5 rounded-lg text-sm font-ibm font-medium flex items-center justify-center gap-2 transition-colors">
                      <Icon name="Navigation" size={15} />
                      Отследить на карте
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
