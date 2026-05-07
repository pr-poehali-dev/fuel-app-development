import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { ORDERS_URL } from "../cabinet/types";

interface Client {
  key: string;
  name: string;
  org: string;
  phone: string;
  contact: string;
  orders_count: number;
  last_order: string | null;
  first_order: string | null;
  completed: number;
  pending: number;
  active: number;
}

interface Props { token: string }

export default function AdminClients({ token }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ORDERS_URL}?action=clients`, {
        headers: { "X-Admin-Token": token },
      });
      const json = await res.json();
      setClients(json.clients || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? clients.filter(c =>
      [c.name, c.org, c.phone, c.contact].some(v => (v || "").toLowerCase().includes(q))
    )
    : clients;

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="px-5 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-sm">
            База клиентов ({filtered.length})
          </h2>
          <div className="flex items-center gap-2 bg-[hsl(var(--muted))] rounded-lg px-3 py-1.5 flex-1 max-w-xs">
            <Icon name="Search" size={14} className="text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Имя, телефон, организация..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs font-ibm"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <Icon name="Loader" size={20} className="animate-spin mx-auto mb-2" />
            <span className="font-ibm text-sm">Загружаем...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <Icon name="UserX" size={26} className="mx-auto mb-2" />
            <p className="font-ibm text-sm">{q ? "Никого не нашли" : "Клиентов пока нет"}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted)/0.4)]">
                <tr className="text-left font-ibm text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  <th className="py-3 px-4">Имя</th>
                  <th className="py-3 px-4">Организация</th>
                  <th className="py-3 px-4">Телефон</th>
                  <th className="py-3 px-4">Контакт</th>
                  <th className="py-3 px-4 text-center">Всего</th>
                  <th className="py-3 px-4 text-center">Готово</th>
                  <th className="py-3 px-4 text-center">В работе</th>
                  <th className="py-3 px-4">Последняя</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.map(c => (
                  <tr key={c.key} className="hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="py-2.5 px-4 font-ibm font-semibold text-[hsl(var(--navy))]">{c.name || "—"}</td>
                    <td className="py-2.5 px-4 font-ibm text-xs text-[hsl(var(--muted-foreground))]">{c.org || "—"}</td>
                    <td className="py-2.5 px-4 font-ibm text-xs">{c.phone || "—"}</td>
                    <td className="py-2.5 px-4 font-ibm text-xs text-[hsl(var(--muted-foreground))]">{c.contact || "—"}</td>
                    <td className="py-2.5 px-4 text-center font-golos font-bold text-[hsl(var(--ocean))]">{c.orders_count}</td>
                    <td className="py-2.5 px-4 text-center font-golos font-semibold text-emerald-600">{c.completed}</td>
                    <td className="py-2.5 px-4 text-center font-golos font-semibold text-amber-600">{c.pending + c.active}</td>
                    <td className="py-2.5 px-4 font-ibm text-xs text-[hsl(var(--muted-foreground))]">
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
