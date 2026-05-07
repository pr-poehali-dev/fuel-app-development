import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { mockOrders, statusConfig } from "./types";

interface OrdersTabProps {
  selectedOrder: string | null;
  setSelectedOrder: (id: string | null) => void;
}

export default function OrdersTab({ selectedOrder, setSelectedOrder }: OrdersTabProps) {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего заявок", val: "3", icon: "FileText", color: "text-[hsl(var(--ocean))]" },
          { label: "В работе", val: "1", icon: "Truck", color: "text-blue-600" },
          { label: "Выполнено", val: "1", icon: "CheckCircle", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="card-glass p-4 text-center">
            <Icon name={s.icon} size={22} className={`${s.color} mx-auto mb-2`} />
            <div className="font-golos font-black text-[hsl(var(--navy))] text-2xl">{s.val}</div>
            <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* New order button */}
      <button onClick={() => navigate("/chat")}
        className="w-full mb-4 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-[hsl(var(--ocean)/0.4)] text-[hsl(var(--ocean))] hover:bg-[hsl(var(--ice))] transition-colors font-ibm font-medium text-sm">
        <Icon name="Plus" size={18} />
        Новая заявка
      </button>

      {/* Orders list */}
      <div className="space-y-3">
        {mockOrders.map((order, i) => {
          const sc = statusConfig[order.status];
          const isSelected = selectedOrder === order.id;
          return (
            <div key={order.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
              <div
                onClick={() => setSelectedOrder(isSelected ? null : order.id)}
                className={`card-glass p-5 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${isSelected ? "border-[hsl(var(--ocean)/0.4)]" : "border-transparent"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-golos font-bold text-[hsl(var(--navy))] text-sm">{order.id}</span>
                      <span className={`status-badge ${order.status === "done" ? "status-done" : order.status === "active" ? "status-active" : "status-pending"}`}>
                        <Icon name={sc.icon} size={11} />
                        {sc.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">
                        <span className="text-[hsl(var(--navy))] font-medium">{order.fuel}</span>
                      </div>
                      <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">
                        Объём: <span className="text-[hsl(var(--navy))] font-medium">{order.volume}</span>
                      </div>
                      <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] truncate col-span-2">
                        <Icon name="MapPin" size={11} className="inline mr-1" />
                        {order.address}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{order.date}</div>
                    {order.status === "active" && (
                      <button onClick={(e) => { e.stopPropagation(); navigate("/map"); }}
                        className="mt-2 flex items-center gap-1 text-xs font-ibm text-[hsl(var(--ocean))] hover:underline">
                        <Icon name="Navigation" size={12} />
                        На карте
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] animate-fade-in">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-[hsl(var(--muted))] rounded-xl p-3">
                        <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1">Водитель</div>
                        <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">{order.driver}</div>
                        <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{order.vehicle}</div>
                      </div>
                      <div className="bg-[hsl(var(--muted))] rounded-xl p-3">
                        <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1">Стоимость</div>
                        <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">{order.price}</div>
                      </div>
                    </div>
                    {order.status === "active" && (
                      <button onClick={(e) => { e.stopPropagation(); navigate("/map"); }}
                        className="mt-3 w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                        <Icon name="Map" size={15} />
                        Отследить на карте
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
