import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const mockOrders = [
  {
    id: "ЗК-2024-001",
    date: "05.05.2024",
    fuel: "Дизельное топливо (ДТ)",
    volume: "3 000 л",
    address: "пр. Обуховской Обороны, 80",
    status: "done" as const,
    statusLabel: "Доставлено",
    driver: "Иванов А.В.",
    vehicle: "МАЗ 5337 · А123ВС78",
    price: "уточнялась у менеджера",
  },
  {
    id: "ЗК-2024-002",
    date: "07.05.2024",
    fuel: "Печное топливо",
    volume: "1 500 л",
    address: "Всеволожск, ул. Плоткина, 12",
    status: "active" as const,
    statusLabel: "В пути",
    driver: "Петров Н.С.",
    vehicle: "КамАЗ 5325 · В456ЕК78",
    price: "уточняется",
  },
  {
    id: "ЗК-2024-003",
    date: "07.05.2024",
    fuel: "Мазут М-100",
    volume: "10 т",
    address: "Кронштадт, ул. Флотская, 1",
    status: "pending" as const,
    statusLabel: "Обработка",
    driver: "—",
    vehicle: "—",
    price: "уточняется",
  },
];

const statusConfig = {
  done: { icon: "CheckCircle", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Доставлено" },
  active: { icon: "Truck", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "В пути" },
  pending: { icon: "Clock", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Обработка" },
};

const mockUser = {
  name: "ООО Котельная Северная",
  phone: "+7 (812) 555-12-34",
  email: "kotelnaya@example.ru",
  address: "СПб, пр. Лесной, 55",
  segment: "Котельные",
};

export default function Cabinet() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const selected = mockOrders.find((o) => o.id === selectedOrder);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center shadow-md">
              <Icon name="Building2" size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-golos font-black text-[hsl(var(--navy))] text-2xl">{mockUser.name}</h1>
              <span className="fuel-tag text-xs">{mockUser.segment}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[hsl(var(--muted))] p-1 rounded-xl mb-6 w-fit">
          {[["orders", "ClipboardList", "Мои заявки"], ["profile", "User", "Профиль"]].map(([tab, icon, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as "orders" | "profile")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-ibm font-medium transition-all duration-150
                ${activeTab === tab ? "bg-white text-[hsl(var(--navy))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--navy))]"}`}>
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === "orders" && (
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
                              <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">уточняется менеджером</div>
                            </div>
                          </div>
                          {order.status === "active" && (
                            <button onClick={() => navigate("/map")}
                              className="mt-3 w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-sm">
                              <Icon name="MapPin" size={16} />
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
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="animate-fade-in max-w-xl">
            <div className="card-glass p-6 space-y-4">
              <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-4">Данные организации</h2>
              {[
                { label: "Название / ФИО", val: mockUser.name, icon: "Building2" },
                { label: "Телефон", val: mockUser.phone, icon: "Phone" },
                { label: "Email", val: mockUser.email, icon: "Mail" },
                { label: "Адрес", val: mockUser.address, icon: "MapPin" },
                { label: "Сегмент", val: mockUser.segment, icon: "Layers" },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3 py-3 border-b border-[hsl(var(--border))] last:border-0">
                  <Icon name={f.icon} size={16} className="text-[hsl(var(--ocean))] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{f.label}</div>
                    <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm mt-0.5">{f.val}</div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 rounded-xl border border-[hsl(var(--ocean)/0.3)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ice))] transition-colors mt-2">
                Редактировать данные
              </button>
            </div>

            <div className="card-glass p-6 mt-4">
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] mb-4">Связаться с менеджером</h3>
              <div className="grid grid-cols-2 gap-3">
                {[["TG", "Telegram", "https://t.me/toplivospb"], ["WA", "WhatsApp", "https://wa.me/78121234567"], ["ВК", "ВКонтакте", "https://vk.com/dizelnoetoplivo_spb"], ["✉", "Email", "mailto:sinedooo@mail.ru"]].map(([s, name, href]) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-[hsl(var(--ocean))] hover:text-white rounded-xl px-3 py-2.5 text-[hsl(var(--ocean))] text-sm font-ibm transition-all group">
                    <span className="font-golos font-bold text-xs group-hover:text-white">{s}</span>
                    {name}
                  </a>
                ))}
              </div>
              <a href="tel:+78121234567"
                className="mt-3 flex items-center justify-center gap-2 w-full btn-primary py-3 text-sm">
                <Icon name="Phone" size={16} />
                +7 (812) 123-45-67
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}