import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { ORDERS_URL } from "../cabinet/types";

interface Summary {
  total_orders: number;
  unique_contacts: number;
  unique_phones: number;
  today: number;
  last_week: number;
  last_month: number;
  conversion: number;
}

interface FuelStat { fuel: string; count: number }
interface DayStat { date: string; count: number }
interface TopClient {
  client: string;
  count: number;
  last_order: string | null;
  phone: string;
  org: string;
}

interface AnalyticsData {
  summary: Summary;
  by_status: Record<string, number>;
  by_source: Record<string, number>;
  by_fuel: FuelStat[];
  by_day: DayStat[];
  top_clients: TopClient[];
}

interface Props {
  token: string;
}

export default function AdminAnalytics({ token }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ORDERS_URL}?action=analytics`, {
        headers: { "X-Admin-Token": token },
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return;
      }
      setData(json);
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  if (loading) {
    return (
      <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
        <Icon name="Loader" size={22} className="animate-spin mx-auto mb-2" />
        <span className="font-ibm text-sm">Считаем аналитику...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
        <Icon name="AlertCircle" size={20} className="text-red-500 mx-auto mb-2" />
        <p className="font-ibm text-sm text-red-700">{error || "Нет данных"}</p>
      </div>
    );
  }

  const s = data.summary;
  const maxDay = Math.max(1, ...data.by_day.map(d => d.count));
  const maxFuel = Math.max(1, ...data.by_fuel.map(f => f.count));

  const cards = [
    { icon: "Layers", label: "Всего заявок", val: s.total_orders, color: "text-[hsl(var(--navy))]", bg: "bg-blue-50" },
    { icon: "Users", label: "Уникальных клиентов", val: s.unique_contacts, color: "text-purple-600", bg: "bg-purple-50" },
    { icon: "Phone", label: "Уникальных телефонов", val: s.unique_phones, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: "TrendingUp", label: "Конверсия (готово)", val: `${s.conversion}%`, color: "text-amber-600", bg: "bg-amber-50" },
    { icon: "Calendar", label: "Сегодня", val: s.today, color: "text-rose-600", bg: "bg-rose-50" },
    { icon: "CalendarDays", label: "За неделю", val: s.last_week, color: "text-cyan-600", bg: "bg-cyan-50" },
    { icon: "CalendarRange", label: "За 30 дней", val: s.last_month, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Сводные карточки */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
            <Icon name={c.icon} size={16} className={`${c.color} mb-2`} />
            <div className="font-golos font-black text-2xl text-[hsl(var(--navy))]">{c.val}</div>
            <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wider leading-tight">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Динамика по дням */}
        <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Динамика за 30 дней</h3>
            <Icon name="LineChart" size={16} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          {data.by_day.length === 0 ? (
            <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] text-center py-8">Нет заявок за период</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {data.by_day.map(d => (
                <div key={d.date} className="flex-1 group relative flex flex-col items-center justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-[hsl(var(--ocean))] to-[hsl(var(--sky))] rounded-t hover:opacity-80 transition-opacity"
                    style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                  />
                  <div className="absolute -top-8 bg-[hsl(var(--navy))] text-white text-[10px] font-ibm px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                    {d.date}: {d.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Топ топлива */}
        <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Виды топлива</h3>
            <Icon name="Fuel" size={16} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          {data.by_fuel.length === 0 ? (
            <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] text-center py-8">Нет данных</p>
          ) : (
            <div className="space-y-2.5">
              {data.by_fuel.map(f => (
                <div key={f.fuel}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ibm text-xs text-[hsl(var(--navy))] truncate pr-2">{f.fuel}</span>
                    <span className="font-golos font-bold text-xs text-[hsl(var(--ocean))]">{f.count}</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(var(--ocean))] to-[hsl(var(--sky))] rounded-full"
                      style={{ width: `${(f.count / maxFuel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Источники + Статусы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-5">
          <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3 flex items-center gap-2">
            <Icon name="GitBranch" size={15} /> Источники заявок
          </h3>
          <div className="space-y-2">
            {Object.entries(data.by_source).map(([src, n]) => (
              <div key={src} className="flex items-center justify-between bg-[hsl(var(--muted)/0.4)] rounded-lg px-3 py-2">
                <span className="font-ibm text-xs text-[hsl(var(--navy))]">
                  {src === "chat" ? "💬 Чат" : src === "form" ? "📝 Форма" : src === "demo" ? "🧪 Демо" : src}
                </span>
                <span className="font-golos font-bold text-sm text-[hsl(var(--ocean))]">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-5">
          <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3 flex items-center gap-2">
            <Icon name="ListChecks" size={15} /> По статусам
          </h3>
          <div className="space-y-2">
            {Object.entries(data.by_status).map(([st, n]) => {
              const label = st === "pending" ? "Обработка" : st === "active" ? "В пути" : st === "done" ? "Готово" : st;
              const color = st === "pending" ? "text-amber-600" : st === "active" ? "text-blue-600" : "text-emerald-600";
              return (
                <div key={st} className="flex items-center justify-between bg-[hsl(var(--muted)/0.4)] rounded-lg px-3 py-2">
                  <span className={`font-ibm text-xs font-semibold ${color}`}>{label}</span>
                  <span className="font-golos font-bold text-sm text-[hsl(var(--navy))]">{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Топ клиентов */}
      <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-5">
        <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3 flex items-center gap-2">
          <Icon name="Crown" size={15} className="text-amber-500" /> Топ-10 клиентов
        </h3>
        {data.top_clients.length === 0 ? (
          <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] text-center py-6">Пока нет клиентов</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-ibm text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))]">
                  <th className="py-2">#</th>
                  <th className="py-2">Клиент</th>
                  <th className="py-2">Организация</th>
                  <th className="py-2">Телефон</th>
                  <th className="py-2 text-right">Заявок</th>
                  <th className="py-2">Последняя</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {data.top_clients.map((c, i) => (
                  <tr key={i} className="hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="py-2.5 font-golos font-bold text-[hsl(var(--muted-foreground))]">{i + 1}</td>
                    <td className="py-2.5 font-ibm font-semibold text-[hsl(var(--navy))]">{c.client}</td>
                    <td className="py-2.5 font-ibm text-xs text-[hsl(var(--muted-foreground))]">{c.org || "—"}</td>
                    <td className="py-2.5 font-ibm text-xs text-[hsl(var(--muted-foreground))]">{c.phone || "—"}</td>
                    <td className="py-2.5 font-golos font-bold text-[hsl(var(--ocean))] text-right">{c.count}</td>
                    <td className="py-2.5 font-ibm text-xs text-[hsl(var(--muted-foreground))]">
                      {c.last_order ? new Date(c.last_order).toLocaleDateString("ru-RU") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
