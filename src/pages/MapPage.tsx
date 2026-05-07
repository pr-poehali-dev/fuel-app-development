import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const DRIVER = {
  name: "Петров Николай",
  vehicle: "КамАЗ 5325",
  plate: "В456ЕК78",
  phone: "+7 (921) 555-99-11",
  order: "ЗК-2024-002",
  fuel: "Печное топливо, 1 500 л",
  eta: "~35 мин",
  destination: "Всеволожск, ул. Плоткина, 12",
  progress: 68,
};

const waypoints = [
  { label: "Отправление", loc: "Склад СИНЕД, СПб", done: true },
  { label: "Контрольная точка", loc: "КАД, выезд на Всеволожск", done: true },
  { label: "Пункт назначения", loc: "Всеволожск, ул. Плоткина, 12", done: false },
];

export default function MapPage() {
  const navigate = useNavigate();
  const [truckPos, setTruckPos] = useState({ x: 52, y: 55 });
  const [pingAnim, setPingAnim] = useState(true);

  // Simulate truck movement
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPos((p) => ({
        x: Math.max(30, Math.min(70, p.x + (Math.random() - 0.48) * 1.2)),
        y: Math.max(30, Math.min(70, p.y + (Math.random() - 0.52) * 1.0)),
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate("/cabinet")} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div className="section-badge">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              Отслеживание доставки
            </div>
          </div>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-3xl">
            Заявка {DRIVER.order}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--navy))] animate-fade-in">
              {/* Map grid background */}
              <div className="absolute inset-0 map-grid opacity-30" />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--navy)/0.2)] to-transparent" />

              {/* SVG route */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Road */}
                <path
                  d={`M 20 75 Q 35 65 45 55 Q 55 45 65 35 Q 72 28 80 25`}
                  stroke="hsl(200 80% 60%)"
                  strokeWidth="0.6"
                  strokeDasharray="2 1"
                  fill="none"
                  opacity="0.5"
                />
                {/* Completed route */}
                <path
                  d={`M 20 75 Q 35 65 ${truckPos.x} ${truckPos.y}`}
                  stroke="hsl(172 60% 35%)"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0.9"
                />
              </svg>

              {/* Start point */}
              <div className="absolute" style={{ left: "18%", top: "72%", transform: "translate(-50%,-50%)" }}>
                <div className="w-4 h-4 rounded-full bg-[hsl(var(--teal))] border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* End point */}
              <div className="absolute" style={{ left: "80%", top: "24%", transform: "translate(-50%,-100%)" }}>
                <div className="bg-white rounded-lg px-2 py-1 shadow-lg text-[10px] font-ibm font-semibold text-[hsl(var(--navy))] whitespace-nowrap mb-1">
                  Пункт назначения
                </div>
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg mx-auto" />
              </div>

              {/* Truck */}
              <div
                className="absolute transition-all duration-[2400ms] ease-in-out"
                style={{
                  left: `${truckPos.x}%`,
                  top: `${truckPos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Ping */}
                <div className="absolute inset-0 w-10 h-10 rounded-full bg-[hsl(var(--ocean)/0.3)] -translate-x-1 -translate-y-1 animate-ping" />
                <div className="relative w-8 h-8 bg-[hsl(var(--ocean))] rounded-xl shadow-xl flex items-center justify-center border-2 border-white">
                  <Icon name="Truck" size={16} className="text-white" />
                </div>
              </div>

              {/* Map label */}
              <div className="absolute top-3 left-3 bg-[hsl(var(--navy)/0.8)] backdrop-blur-sm text-white rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                  <span className="font-golos font-bold text-xs">GPS активен</span>
                </div>
                <div className="font-ibm text-[10px] text-[hsl(var(--sky)/0.7)] mt-0.5">Обновлено: только что</div>
              </div>

              {/* ETA badge */}
              <div className="absolute bottom-3 right-3 bg-white rounded-xl shadow-lg px-4 py-2 text-right">
                <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">До прибытия</div>
                <div className="font-golos font-black text-[hsl(var(--ocean))] text-xl">{DRIVER.eta}</div>
              </div>
            </div>

            {/* Route waypoints */}
            <div className="card-glass mt-4 p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-4">Маршрут</h3>
              <div className="space-y-3">
                {waypoints.map((wp, i) => (
                  <div key={wp.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${wp.done ? "bg-[hsl(var(--ocean))]" : "bg-[hsl(var(--muted))] border-2 border-[hsl(var(--border))]"}`}>
                        {wp.done ? <Icon name="Check" size={10} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--muted-foreground))]" />}
                      </div>
                      {i < waypoints.length - 1 && (
                        <div className={`w-px flex-1 h-6 mt-1 ${wp.done ? "bg-[hsl(var(--ocean)/0.3)]" : "bg-[hsl(var(--border))]"}`} />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className={`font-golos font-semibold text-sm ${wp.done ? "text-[hsl(var(--navy))]" : "text-[hsl(var(--muted-foreground))]"}`}>{wp.label}</div>
                      <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{wp.loc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {/* Driver card */}
            <div className="card-glass p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center">
                  <Icon name="User" size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-golos font-bold text-[hsl(var(--navy))]">{DRIVER.name}</div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Водитель</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Транспорт", val: DRIVER.vehicle, icon: "Truck" },
                  { label: "Гос. номер", val: DRIVER.plate, icon: "CreditCard" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 py-2 border-b border-[hsl(var(--border))] last:border-0">
                    <Icon name={f.icon} size={14} className="text-[hsl(var(--ocean))]" />
                    <div>
                      <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))]">{f.label}</div>
                      <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm">{f.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a href={`tel:${DRIVER.phone}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ocean))] hover:text-white transition-all">
                <Icon name="Phone" size={15} />
                Позвонить водителю
              </a>
            </div>

            {/* Order info */}
            <div className="card-glass p-5">
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3">Детали заказа</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Топливо</div>
                  <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm">{DRIVER.fuel}</div>
                </div>
                <div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Адрес доставки</div>
                  <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm">{DRIVER.destination}</div>
                </div>
                {/* Progress */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Прогресс маршрута</span>
                    <span className="font-golos font-bold text-[hsl(var(--ocean))] text-xs">{DRIVER.progress}%</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(var(--ocean))] to-[hsl(var(--teal))] rounded-full transition-all duration-500"
                      style={{ width: `${DRIVER.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick contact */}
            <div className="card-glass p-5">
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3">Поддержка СИНЕД</h3>
              <div className="space-y-2">
                <a href="tel:+78121234567"
                  className="flex items-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(var(--navy))] text-white text-sm font-ibm font-medium hover:bg-[hsl(var(--ocean))] transition-colors justify-center">
                  <Icon name="Phone" size={15} />
                  +7 (812) 123-45-67
                </a>
                <a href="https://t.me/sined_fuel" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ocean))] hover:text-white transition-all justify-center">
                  Написать в Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
