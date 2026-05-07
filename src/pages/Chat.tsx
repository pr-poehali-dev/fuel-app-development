import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
}

interface OrderData {
  name?: string;
  phone?: string;
  address?: string;
  fuelType?: string;
  volume?: string;
  date?: string;
  comment?: string;
}

const FUEL_TYPES = ["Дизельное топливо (ДТ)", "Мазут М-100", "Судовое топливо", "Печное топливо", "Бензин АИ-92", "Бензин АИ-95", "Биодизель В100"];

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "ai",
  text: `Здравствуйте! Я — помощник СИНЕД по заказу топлива. 🔵

Работаем по Санкт-Петербургу и Ленинградской области. Помогаю оформить заявку и отвечаю на любые вопросы о топливе — от котельных до судов.

Как вас зовут?`,
  time: now(),
};

function now() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

type Step = "name" | "phone" | "fuelType" | "volume" | "address" | "date" | "comment" | "confirm" | "done" | "free";

function getAIResponse(step: Step, userInput: string, order: OrderData): { text: string; nextStep: Step; updatedOrder: OrderData } {
  const lower = userInput.toLowerCase();

  // Free conversation for off-topic questions
  if (step === "free") {
    if (lower.includes("котельн") || lower.includes("дом") || lower.includes("отопл")) {
      return {
        text: `Отличный вопрос! Для частного двухэтажного дома с котельной чаще всего подходят:

🔥 **Дизельное топливо (ДТ)** — универсальный выбор, дизельные котлы надёжны и экономичны. Расход ~80-120 л/сутки в сильные морозы.

🏭 **Печное топливо** — дешевле ДТ, но требует специального котла. Отлично для бытовых котлов Buderus, Viessmann.

**Объём на 3 месяца:** для дома 150-200 м² ориентируйтесь на 5 000–8 000 литров.

**Хранение:** рекомендуем пластиковые или стальные ёмкости 3-5 м³ в отапливаемом или вентилируемом помещении, вдали от открытого огня.

Хотите оформить заявку? Уточним точный расчёт и подберём оптимальный вариант под ваш котёл.`,
        nextStep: "free",
        updatedOrder: order,
      };
    }
    if (lower.includes("цен") || lower.includes("сколько стоит") || lower.includes("прайс")) {
      return {
        text: `Цены на топливо зависят от нескольких факторов:
• Вид топлива
• Объём заказа (оптом дешевле)
• Периодичность поставок
• Адрес и сложность доставки

**Ориентировочно:** начинаем от розничной цены с учётом доставки. Точную стоимость менеджер сообщит в течение 30 минут после оформления заявки.

Хотите оформить заявку прямо сейчас?`,
        nextStep: "free",
        updatedOrder: order,
      };
    }
    if (lower.includes("заявк") || lower.includes("оформ") || lower.includes("заказ") || lower.includes("хочу") || lower.includes("нужно")) {
      return {
        text: `Отлично, начнём оформление! Как вас зовут? (имя и фамилия, или название организации)`,
        nextStep: "name",
        updatedOrder: order,
      };
    }
    return {
      text: `Понял вас! Если у вас есть вопросы о топливе, доставке, хранении или нашей компании — я готов помочь. Также могу оформить заявку прямо сейчас — просто скажите «хочу заказать».`,
      nextStep: "free",
      updatedOrder: order,
    };
  }

  switch (step) {
    case "name": {
      const updatedOrder = { ...order, name: userInput.trim() };
      return {
        text: `Приятно познакомиться, ${userInput.trim()}! 👋

Укажите, пожалуйста, ваш номер телефона для связи.`,
        nextStep: "phone",
        updatedOrder,
      };
    }
    case "phone": {
      const updatedOrder = { ...order, phone: userInput.trim() };
      return {
        text: `Записал номер. Теперь выберите вид топлива (можете написать или выбрать из списка):

• Дизельное топливо (ДТ)
• Мазут М-100
• Судовое топливо
• Печное топливо
• Бензин АИ-92 / АИ-95
• Биодизель В100

Если не знаете какое — опишите свою ситуацию, помогу подобрать!`,
        nextStep: "fuelType",
        updatedOrder,
      };
    }
    case "fuelType": {
      const fuelType = userInput.trim();
      if (lower.includes("котельн") || lower.includes("не знаю") || lower.includes("посоветуй")) {
        return {
          text: `Для котельной чаще всего используют:

🔥 **Дизельное топливо** — если у вас современный дизельный котёл
🏭 **Мазут М-100** — для промышленных котлов большой мощности
🔶 **Печное топливо** — для бытовых котлов и небольших помещений

Уточните, какой у вас котёл или для каких целей нужно топливо?`,
          nextStep: "fuelType",
          updatedOrder: order,
        };
      }
      const updatedOrder = { ...order, fuelType };
      return {
        text: `Принял: ${fuelType}. 

Какой объём вам нужен? (например: 500 литров, 2 тонны, 10 000 л)`,
        nextStep: "volume",
        updatedOrder,
      };
    }
    case "volume": {
      const updatedOrder = { ...order, volume: userInput.trim() };
      return {
        text: `Отлично! Укажите адрес доставки в Санкт-Петербурге или Ленинградской области:`,
        nextStep: "address",
        updatedOrder,
      };
    }
    case "address": {
      const updatedOrder = { ...order, address: userInput.trim() };
      return {
        text: `Записал адрес. Когда планируете доставку? (укажите желаемую дату или период)`,
        nextStep: "date",
        updatedOrder,
      };
    }
    case "date": {
      const updatedOrder = { ...order, date: userInput.trim() };
      return {
        text: `Есть ли дополнительные пожелания или комментарии к заказу? (способ оплаты, особенности подъезда, тип ёмкости и т.д.)
        
Или напишите «нет» если всё готово.`,
        nextStep: "comment",
        updatedOrder,
      };
    }
    case "comment": {
      const comment = lower === "нет" ? "" : userInput.trim();
      const updatedOrder = { ...order, comment };
      const o = updatedOrder;
      return {
        text: `📋 **Проверьте вашу заявку:**

👤 Имя: ${o.name}
📞 Телефон: ${o.phone}
⛽ Топливо: ${o.fuelType}
📦 Объём: ${o.volume}
📍 Адрес: ${o.address}
📅 Дата: ${o.date}
${o.comment ? `💬 Комментарий: ${o.comment}` : ""}

⚠️ **Важно:** финальная цена подтверждается менеджером после обработки заявки.

Всё верно? Напишите **«Да, отправить»** или исправьте что нужно.`,
        nextStep: "confirm",
        updatedOrder,
      };
    }
    case "confirm": {
      if (lower.includes("да") || lower.includes("отправ") || lower.includes("верно") || lower.includes("ок")) {
        return {
          text: `✅ **Заявка принята!**

Ваш запрос передан менеджерам СИНЕД. В течение **30 минут** с вами свяжутся для подтверждения и уточнения финальной цены.

📞 Если срочно — позвоните: **+7 (812) 123-45-67**

Также можете отслеживать заказ в личном кабинете. Спасибо, что выбрали СИНЕД! 🔵`,
          nextStep: "done",
          updatedOrder: order,
        };
      }
      return {
        text: `Хорошо, что именно хотите изменить? Напишите исправление:`,
        nextStep: "comment",
        updatedOrder: order,
      };
    }
    case "done":
      return {
        text: `Ваша заявка уже в работе! Есть ещё вопросы? Могу ответить или оформить новый заказ.`,
        nextStep: "free",
        updatedOrder: order,
      };
    default:
      return {
        text: `Понял! Чем ещё могу помочь?`,
        nextStep: step,
        updatedOrder: order,
      };
  }
}

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("name");
  const [order, setOrder] = useState<OrderData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const msgText = text ?? input.trim();
    if (!msgText) return;

    const userMsg: Message = { id: Date.now(), role: "user", text: msgText, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

    const { text: aiText, nextStep, updatedOrder } = getAIResponse(step, msgText, order);
    setOrder(updatedOrder);
    setStep(nextStep);
    if (nextStep === "done") setOrderSubmitted(true);

    const aiMsg: Message = { id: Date.now() + 1, role: "ai", text: aiText, time: now() };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickReplies: string[] = step === "fuelType"
    ? FUEL_TYPES.slice(0, 4)
    : step === "name" ? []
    : step === "confirm" ? ["Да, отправить", "Хочу изменить"]
    : [];

  const progressSteps = ["Имя", "Телефон", "Топливо", "Объём", "Адрес", "Дата", "Готово"];
  const stepIndex = { name: 0, phone: 1, fuelType: 2, volume: 3, address: 4, date: 5, comment: 5, confirm: 5, done: 6, free: 6 }[step] ?? 0;

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto pt-16 overflow-hidden">
        {/* Chat header */}
        <div className="bg-[hsl(var(--navy))] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-[hsl(var(--sky)/0.6)] hover:text-white transition-colors mr-1">
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center">
              <Icon name="Bot" size={20} className="text-white" />
            </div>
            <div>
              <div className="font-golos font-bold text-white text-sm">ИИ-помощник СИНЕД</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                <span className="text-[hsl(var(--sky)/0.7)] text-xs font-ibm">Онлайн</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/cabinet")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-[hsl(var(--sky))] hover:text-white rounded-xl px-3 py-2 text-xs font-ibm transition-all">
            <Icon name="ClipboardList" size={14} />
            История заявок
          </button>
        </div>

        {/* Progress bar */}
        {step !== "free" && (
          <div className="bg-white border-b border-[hsl(var(--border))] px-6 py-3">
            <div className="flex items-center gap-1">
              {progressSteps.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-full h-1.5 rounded-full transition-all duration-300 ${i <= stepIndex ? "bg-[hsl(var(--ocean))]" : "bg-[hsl(var(--muted))]"}`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {progressSteps.map((s, i) => (
                <span key={s} className={`text-[10px] font-ibm ${i === stepIndex ? "text-[hsl(var(--ocean))] font-semibold" : "text-[hsl(var(--muted-foreground))]"}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[hsl(var(--background))]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Icon name="Bot" size={14} className="text-white" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                  <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                      .replace(/🔥|🏭|🔶|📋|👤|📞|⛽|📦|📍|📅|💬|⚠️|✅|📞|🔵|👋/g, (m) => m)
                  }} />
                </div>
                <span className={`text-[10px] font-ibm text-[hsl(var(--muted-foreground))] ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center">
                <Icon name="Bot" size={14} className="text-white" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-1 py-3 px-4">
                <span className="typing-dot w-2 h-2 rounded-full bg-[hsl(var(--ocean))] inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-[hsl(var(--ocean))] inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-[hsl(var(--ocean))] inline-block" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {quickReplies.length > 0 && !isTyping && (
          <div className="px-4 py-2 flex flex-wrap gap-2 bg-white border-t border-[hsl(var(--border))]">
            {quickReplies.map((r) => (
              <button key={r} onClick={() => sendMessage(r)}
                className="text-sm font-ibm px-3 py-1.5 rounded-xl bg-[hsl(var(--ice))] text-[hsl(var(--ocean))] border border-[hsl(var(--ocean)/0.2)] hover:bg-[hsl(var(--ocean))] hover:text-white transition-all">
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="bg-white border-t border-[hsl(var(--border))] px-4 py-3">
          {orderSubmitted ? (
            <div className="flex gap-3">
              <button onClick={() => navigate("/cabinet")} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                <Icon name="User" size={16} />
                Личный кабинет
              </button>
              <button onClick={() => navigate("/map")} className="flex-1 btn-teal py-3 flex items-center justify-center gap-2">
                <Icon name="MapPin" size={16} />
                Отследить на карте
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] placeholder:text-[hsl(var(--muted-foreground))] transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-[hsl(var(--ocean))] text-white flex items-center justify-center hover:bg-[hsl(199_85%_26%)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                <Icon name="Send" size={18} />
              </button>
            </div>
          )}
          <p className="text-[10px] text-center font-ibm text-[hsl(var(--muted-foreground))] mt-2">
            Нажимая «Отправить», вы соглашаетесь с обработкой персональных данных согласно ФЗ-152
          </p>
        </div>
      </div>
    </div>
  );
}
