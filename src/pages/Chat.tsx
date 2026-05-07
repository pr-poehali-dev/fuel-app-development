import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const CHAT_URL = "https://functions.poehali.dev/8e486deb-ba0d-4a3b-9f18-e922f277aedb";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

function getTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const WELCOME: Message = {
  id: 0,
  role: "assistant",
  content: `Здравствуйте! Меня зовут Денис, я — ИИ-помощник компании СИНЕД. 

Помогу вам оставить заявку на топливо или отвечу на любые вопросы: какое топливо выбрать, как хранить, сколько нужно на сезон — спрашивайте!

Как вас зовут или как называется ваша организация?`,
  time: getTime(),
};

const quickSuggestions = [
  "Хочу заказать дизельное топливо",
  "Какое топливо для котельной?",
  "Сколько нужно на 3 месяца?",
  "Узнать цену",
];

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || loading) return;

    setInput("");
    setError(null);

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: msgText,
      time: getTime(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error("Ошибка сервера");
      const data = await res.json();

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply || "Извините, не удалось получить ответ.",
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16">
        <div className="flex-1 flex max-w-5xl w-full mx-auto flex-col h-[calc(100vh-4rem)]">

          {/* Header */}
          <div className="bg-white border-b border-[hsl(var(--border))] px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/")} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] transition-colors mr-1">
                <Icon name="ArrowLeft" size={18} />
              </button>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow flex-shrink-0">
                <img
                  src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg"
                  alt="Денис"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-golos font-bold text-[hsl(var(--navy))] text-base">Денис — помощник СИНЕД</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                  <span className="text-[hsl(var(--muted-foreground))] text-xs font-ibm">ИИ-консультант • онлайн</span>
                </div>
              </div>
            </div>
            <button onClick={() => navigate("/cabinet")}
              className="hidden sm:flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--ocean))] hover:bg-[hsl(var(--ocean))] hover:text-white rounded-xl px-4 py-2 text-sm font-ibm font-medium transition-all">
              <Icon name="ClipboardList" size={15} />
              История заявок
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 bg-[hsl(var(--background))]">

            {showSuggestions && (
              <div className="animate-fade-in">
                <div className="mb-3 text-xs font-ibm text-[hsl(var(--muted-foreground))] text-center">Быстрые вопросы:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickSuggestions.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="text-sm font-ibm px-4 py-2 rounded-2xl bg-white border border-[hsl(var(--ocean)/0.25)] text-[hsl(var(--ocean))] hover:bg-[hsl(var(--ocean))] hover:text-white hover:border-transparent transition-all shadow-sm">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2.5 flex-shrink-0 mt-1 shadow border border-[hsl(var(--border))]">
                    <img
                      src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg"
                      alt="Денис"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[78%]`}>
                  <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</div>
                  </div>
                  <span className="text-[10px] font-ibm text-[hsl(var(--muted-foreground))] px-1">{msg.time}</span>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center ml-2.5 flex-shrink-0 mt-1">
                    <Icon name="User" size={14} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow border border-[hsl(var(--border))]">
                  <img
                    src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg"
                    alt="Денис"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="chat-bubble-ai flex items-center gap-1.5 py-3.5 px-4">
                  <span className="typing-dot w-2 h-2 rounded-full bg-[hsl(var(--ocean))] inline-block" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-[hsl(var(--ocean))] inline-block" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-[hsl(var(--ocean))] inline-block" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-ibm animate-fade-in">
                <Icon name="AlertCircle" size={16} />
                {error}
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <Icon name="X" size={14} />
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-[hsl(var(--border))] p-4 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.06)]">
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-[hsl(var(--muted))] rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:ring-2 focus-within:ring-[hsl(var(--ocean)/0.3)] transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Напишите сообщение... (Enter — отправить)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm font-ibm text-[hsl(var(--foreground))] outline-none resize-none placeholder:text-[hsl(var(--muted-foreground))] max-h-32 leading-relaxed"
                  style={{ minHeight: "24px" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "24px";
                    el.style.height = Math.min(el.scrollHeight, 128) + "px";
                  }}
                />
              </div>
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-12 h-12 rounded-2xl bg-[hsl(var(--ocean))] text-white flex items-center justify-center hover:bg-[hsl(199_85%_26%)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-md">
                <Icon name="Send" size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[10px] font-ibm text-[hsl(var(--muted-foreground))]">
                Нажимая «Отправить», вы соглашаетесь с обработкой ПД согласно ФЗ-152
              </p>
              <a href="tel:+78121234567" className="text-[10px] font-ibm text-[hsl(var(--ocean))] hover:underline flex items-center gap-1">
                <Icon name="Phone" size={10} />
                +7 (812) 123-45-67
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}