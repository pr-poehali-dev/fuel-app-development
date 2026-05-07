import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const VKIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
  </svg>
);

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
  name: "Ваша организация",
  phone: "+7 (905) 215-05-60",
  email: "sinedooo@mail.ru",
  address: "198035, СПб, ул. Двинская, д. 10",
  segment: "Клиент СИНЕД",
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
                <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-[hsl(29_89%_52%/0.08)] hover:border-[hsl(29_89%_52%/0.4)] rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all group">
                  <TelegramIcon />
                  Telegram
                </a>
                <a href="https://wa.me/79052150560" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-emerald-50 hover:border-emerald-300 rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all">
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a href="https://vk.com/dizelnoetoplivo_spb" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-blue-50 hover:border-blue-300 rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all">
                  <VKIcon />
                  ВКонтакте
                </a>
                <a href="mailto:sinedooo@mail.ru"
                  className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all">
                  <Icon name="Mail" size={16} className="flex-shrink-0 text-orange-500" />
                  Email
                </a>
              </div>
              <a href="tel:+79052150560"
                className="mt-3 flex items-center justify-center gap-2 w-full btn-primary py-3 text-sm">
                <Icon name="Phone" size={16} />
                +7 (905) 215-05-60
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}