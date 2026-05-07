import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const SESSIONS_URL = "https://functions.poehali.dev/826f5bd1-4498-4271-9580-5a9d7c7a379d";
const ADMIN_PASS = "sined2025";

interface Session {
  session_id: string;
  started_at: string;
  last_active: string;
  status: string;
  client_name: string | null;
  client_phone: string | null;
  client_org: string | null;
  notified: boolean;
  page_source: string | null;
  msg_count: number;
}

interface ChatMessage {
  role: string;
  content: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} д назад`;
}

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Session | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "new">("all");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = () => {
    fetch(SESSIONS_URL + "/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authed) return;
    fetchSessions();
    const iv = setInterval(fetchSessions, 15000);
    return () => clearInterval(iv);
  }, [authed]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  const openChat = (sid: string) => {
    setSelectedId(sid);
    setChatLoading(true);
    fetch(`${SESSIONS_URL}/session?id=${sid}`)
      .then((r) => r.json())
      .then((d) => {
        setChatMsgs(d.messages || []);
        setChatSession(d.session || null);
      })
      .catch(() => {})
      .finally(() => setChatLoading(false));
  };

  const closeSession = (sid: string) => {
    fetch(SESSIONS_URL + "/session/status", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid, status: "closed" }),
    }).then(() => fetchSessions());
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[hsl(var(--navy))] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white">
              <img src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg" alt="СИНЕД" className="w-full h-full object-cover" />
            </div>
            <span className="font-golos font-black text-white text-2xl">СИНЕД</span>
          </div>
          <div className="card-glass p-8">
            <h2 className="font-golos font-black text-[hsl(var(--navy))] text-xl mb-2 text-center">Панель менеджера</h2>
            <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm text-center mb-6">Введите пароль для входа</p>
            <input
              type="password" value={passInput}
              onChange={(e) => { setPassInput(e.target.value); setPassError(false); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (passInput === ADMIN_PASS) { sessionStorage.setItem("admin_auth", "1"); setAuthed(true); }
                  else setPassError(true);
                }
              }}
              placeholder="Пароль"
              className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] mb-3"
            />
            {passError && <p className="text-red-500 text-xs font-ibm mb-3 text-center">Неверный пароль</p>}
            <button
              onClick={() => {
                if (passInput === ADMIN_PASS) { sessionStorage.setItem("admin_auth", "1"); setAuthed(true); }
                else setPassError(true);
              }}
              className="w-full btn-primary py-3">
              Войти
            </button>
          </div>
          <button onClick={() => navigate("/")} className="mt-4 w-full text-center text-[hsl(var(--sky)/0.6)] hover:text-white text-sm font-ibm transition-colors">
            ← На сайт
          </button>
        </div>
      </div>
    );
  }

  const filtered = sessions.filter((s) => {
    if (filter === "active") return s.status === "active";
    if (filter === "new") return !s.client_name && s.msg_count > 0;
    return true;
  });

  const newCount = sessions.filter((s) => s.status === "active" && s.msg_count > 0).length;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      {/* Header */}
      <header className="bg-[hsl(var(--navy))] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex-shrink-0">
            <img src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg" alt="СИНЕД" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-golos font-bold text-white text-sm">Панель менеджера</span>
            <span className="font-ibm text-[hsl(var(--sky)/0.6)] text-xs ml-2">СИНЕД</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/")} className="text-[hsl(var(--sky)/0.6)] hover:text-white text-xs font-ibm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
            На сайт
          </button>
          <button onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }}
            className="text-[hsl(var(--sky)/0.6)] hover:text-white text-xs font-ibm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
            Выйти
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — список сессий */}
        <div className={`${selectedId ? "hidden sm:flex" : "flex"} flex-col w-full sm:w-80 lg:w-96 border-r border-[hsl(var(--border))] bg-white`}>
          {/* Filters */}
          <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Чаты посетителей</h2>
              <div className="flex items-center gap-1.5">
                {newCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-golos font-bold px-1.5 py-0.5 rounded-full">{newCount}</span>
                )}
                <button onClick={fetchSessions} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] transition-colors p-1 rounded">
                  <Icon name="RefreshCw" size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-1 bg-[hsl(var(--muted))] p-0.5 rounded-lg">
              {([["all","Все"],["active","Активные"],["new","Без имени"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`flex-1 text-[10px] font-ibm font-medium py-1.5 rounded-md transition-all
                    ${filter === val ? "bg-white text-[hsl(var(--navy))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-[hsl(var(--muted-foreground))] text-sm font-ibm">
                <Icon name="Loader" size={16} className="animate-spin mr-2" /> Загрузка...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-[hsl(var(--muted-foreground))] text-sm font-ibm">
                <Icon name="MessageSquare" size={24} className="mb-2 opacity-30" />
                Нет чатов
              </div>
            ) : (
              filtered.map((s) => (
                <button key={s.session_id} onClick={() => openChat(s.session_id)}
                  className={`w-full text-left px-4 py-3 border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--ice))] transition-colors
                    ${selectedId === s.session_id ? "bg-[hsl(var(--ice))] border-l-2 border-l-[hsl(var(--ocean))]" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${s.status === "active" ? "bg-emerald-500 animate-pulse-dot" : "bg-gray-300"}`} />
                      <div className="min-w-0">
                        <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm truncate">
                          {s.client_name || s.client_org || <span className="text-[hsl(var(--muted-foreground))] font-normal italic">Анонимный</span>}
                        </div>
                        {s.client_phone && (
                          <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{s.client_phone}</div>
                        )}
                        <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
                          {s.page_source || "/"} • {s.msg_count} сообщ.
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-ibm text-[hsl(var(--muted-foreground))] flex-shrink-0 text-right">
                      <div>{timeAgo(s.last_active)}</div>
                      {s.status === "closed" && <div className="text-gray-400 mt-0.5">закрыт</div>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat view */}
        <div className={`${selectedId ? "flex" : "hidden sm:flex"} flex-1 flex-col bg-[hsl(var(--background))]`}>
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))]">
              <Icon name="MessageSquare" size={40} className="mb-3 opacity-20" />
              <p className="font-golos font-bold text-lg text-[hsl(var(--navy)/0.4)]">Выберите чат</p>
              <p className="font-ibm text-sm mt-1">Нажмите на сессию слева</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-[hsl(var(--border))] px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedId(null)} className="sm:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] mr-1">
                    <Icon name="ArrowLeft" size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center shadow">
                    <Icon name="User" size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">
                      {chatSession?.client_name || chatSession?.client_org || "Анонимный посетитель"}
                    </div>
                    <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">
                      {chatSession?.client_phone && <span className="mr-2">{chatSession.client_phone}</span>}
                      {chatSession?.page_source && <span>Страница: {chatSession.page_source}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chatSession?.status !== "closed" && (
                    <button onClick={() => closeSession(selectedId)}
                      className="text-xs font-ibm px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-red-300 hover:text-red-600 transition-colors">
                      Закрыть чат
                    </button>
                  )}
                  <button onClick={() => openChat(selectedId)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] p-1.5 rounded-lg hover:bg-[hsl(var(--ice))] transition-colors">
                    <Icon name="RefreshCw" size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                {chatLoading ? (
                  <div className="flex justify-center py-12">
                    <Icon name="Loader" size={20} className="animate-spin text-[hsl(var(--ocean))]" />
                  </div>
                ) : chatMsgs.length === 0 ? (
                  <div className="text-center text-[hsl(var(--muted-foreground))] text-sm font-ibm py-12">
                    Нет сообщений
                  </div>
                ) : (
                  chatMsgs.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1 shadow">
                          <img src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg" alt="Денис" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                        </div>
                        <span className="text-[10px] font-ibm text-[hsl(var(--muted-foreground))] px-1">
                          {msg.role === "user" ? "Клиент" : "Денис"} • {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                          <Icon name="User" size={12} className="text-[hsl(var(--muted-foreground))]" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Info footer */}
              <div className="bg-white border-t border-[hsl(var(--border))] px-4 py-3">
                <div className="flex items-center justify-between text-xs font-ibm text-[hsl(var(--muted-foreground))]">
                  <span>Сессия: {selectedId.slice(0, 16)}...</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${chatSession?.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {chatSession?.status === "active" ? "Активен" : "Закрыт"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
