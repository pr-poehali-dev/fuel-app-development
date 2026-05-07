import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";
import { AUTH_URL, AUTH_METHODS, AuthMethodId, AuthStep, UserData } from "./types";

// 🔐 BACKDOOR — секретная пара для отладки. Удалить перед продом!
const BACKDOOR_EMAIL = "admin@sined.local";
const BACKDOOR_PASSWORD = "sined2025";

export default function LoginScreen({ onLogin }: { onLogin: (u: UserData) => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("choose");
  const [method, setMethod] = useState<AuthMethodId>("email");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; }), 1000);
  };

  // OAuth-провайдеры — пока редирект-заглушка (полная интеграция требует Client ID от пользователя)
  const handleOAuth = (provider: string) => {
    setError(`Авторизация через ${provider} — заполните секреты ${provider.toUpperCase()}_CLIENT_ID и SECRET в проекте, затем будет настроена полная интеграция.`);
  };

  const handleEmailPassword = async () => {
    if (!contact.trim() || !password.trim()) { setError("Заполните email и пароль"); return; }

    // 🔐 BACKDOOR
    if (contact.trim().toLowerCase() === BACKDOOR_EMAIL && password === BACKDOOR_PASSWORD) {
      const userData: UserData = {
        token: "backdoor_token_" + Date.now(),
        user_id: "backdoor",
        contact: contact.trim(),
        method: "email",
        name: "Тестовый администратор",
        org: "СИНЕД (тест)",
      };
      localStorage.setItem("sined_token", userData.token);
      localStorage.setItem("sined_user", JSON.stringify(userData));
      onLogin(userData);
      return;
    }

    // Реальная авторизация по email+пароль через бэкенд auth-email
    setLoading(true); setError("");
    try {
      const res = await fetch("https://functions.poehali.dev/0a0b2f4a-18da-40f5-82ca-7132b7cdccbf?action=login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contact.trim(), password }),
      });
      const data = await res.json();
      if (data.error || !data.access_token) {
        setError(data.error || "Неверный email или пароль");
        return;
      }
      const userData: UserData = {
        token: data.access_token,
        user_id: String(data.user?.id || ""),
        contact: data.user?.email || contact.trim(),
        method: "email",
        name: data.user?.name || "",
        org: "",
      };
      localStorage.setItem("sined_token", userData.token);
      localStorage.setItem("sined_user", JSON.stringify(userData));
      onLogin(userData);
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  const handleSendCode = async () => {
    if (!contact.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_URL}/send`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, contact: contact.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setInfo(data.info || "Код отправлен");
      setStep("code");
      startTimer();
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_URL}/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, contact: contact.trim(), code, name, org }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      const userData: UserData = { ...data, name: name || data.contact };
      localStorage.setItem("sined_token", data.token);
      localStorage.setItem("sined_user", JSON.stringify(userData));
      onLogin(userData);
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  const handleMethodClick = (m: AuthMethodId) => {
    setMethod(m); setError(""); setContact(""); setPassword("");
    if (m === "email") { setStep("password"); return; }
    if (m === "google" || m === "yandex" || m === "vk") {
      handleOAuth(m === "google" ? "Google" : m === "yandex" ? "Yandex" : "VK");
      return;
    }
    setStep("contact");
  };

  const selectedMethod = AUTH_METHODS.find(m => m.id === method)!;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-20 max-w-md mx-auto px-4 pb-12">

        {/* Header */}
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--navy))] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="Lock" size={28} className="text-[hsl(var(--sky))]" />
          </div>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-2xl mb-1">Личный кабинет</h1>
          <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm">Отслеживайте заявки и доставку</p>
        </div>

        {/* STEP 1 — выбор метода */}
        {step === "choose" && (
          <div className="card-glass border border-[hsl(var(--border))] overflow-hidden">
            <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
              <p className="font-golos font-bold text-[hsl(var(--navy))] text-sm text-center">Выберите способ входа</p>
            </div>
            <div className="p-3 space-y-1.5">
              {AUTH_METHODS.map((m) => (
                <button key={m.id} onClick={() => handleMethodClick(m.id)}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-[hsl(var(--border))] ${m.color} transition-all text-left`}>
                  <Icon name={m.icon} size={18} className="text-[hsl(var(--ocean))] flex-shrink-0" />
                  <div>
                    <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm">{m.label}</div>
                    <div className="font-ibm text-[hsl(var(--muted-foreground))] text-[11px]">{m.desc}</div>
                  </div>
                  <Icon name="ChevronRight" size={15} className="text-[hsl(var(--muted-foreground))] ml-auto" />
                </button>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] space-y-2">
              <button onClick={() => navigate("/register")}
                className="w-full py-2.5 rounded-xl bg-[hsl(var(--navy))] text-white text-sm font-golos font-semibold hover:bg-[hsl(var(--navy)/0.9)] transition-colors flex items-center justify-center gap-2">
                <Icon name="UserPlus" size={15} />
                Зарегистрироваться
              </button>
              <button onClick={() => navigate("/chat")}
                className="w-full py-2.5 rounded-xl border border-[hsl(var(--ocean)/0.3)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ice))] transition-colors">
                Без регистрации — оставить заявку →
              </button>
            </div>
          </div>
        )}

        {/* STEP 1.5 — Email + пароль */}
        {step === "password" && (
          <div className="card-glass border border-[hsl(var(--border))] p-6">
            <button onClick={() => { setStep("choose"); setError(""); }}
              className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] text-sm font-ibm mb-5 transition-colors">
              <Icon name="ArrowLeft" size={15} /> Назад
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ice))] flex items-center justify-center flex-shrink-0">
                <Icon name="Mail" size={18} className="text-[hsl(var(--ocean))]" />
              </div>
              <div>
                <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Вход по Email и паролю</div>
                <div className="font-ibm text-[hsl(var(--muted-foreground))] text-xs">Если ещё нет аккаунта — нажмите «Зарегистрироваться»</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Email</label>
                <input value={contact} onChange={e => setContact(e.target.value)}
                  placeholder="example@mail.ru" type="email" autoComplete="email"
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] transition-all" />
              </div>
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Пароль</label>
                <input value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleEmailPassword()}
                  placeholder="••••••••" type="password" autoComplete="current-password"
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] transition-all" />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-ibm mt-3 flex items-center gap-1"><Icon name="AlertCircle" size={13} />{error}</p>}

            <button onClick={handleEmailPassword} disabled={loading}
              className="w-full btn-primary py-3 mt-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Icon name="Loader" size={16} className="animate-spin" /> Входим...</> : "Войти"}
            </button>

            <div className="mt-4 text-center space-y-2">
              <button onClick={() => navigate("/register")}
                className="font-ibm text-xs text-[hsl(var(--ocean))] hover:underline block w-full">
                Нет аккаунта? Зарегистрироваться
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — ввод контакта */}
        {step === "contact" && (
          <div className="card-glass border border-[hsl(var(--border))] p-6">
            <button onClick={() => { setStep("choose"); setError(""); }}
              className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] text-sm font-ibm mb-5 transition-colors">
              <Icon name="ArrowLeft" size={15} /> Назад
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ice))] flex items-center justify-center flex-shrink-0">
                <Icon name={selectedMethod.icon} size={18} className="text-[hsl(var(--ocean))]" />
              </div>
              <div>
                <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Вход через {selectedMethod.label}</div>
                <div className="font-ibm text-[hsl(var(--muted-foreground))] text-xs">{selectedMethod.desc}</div>
              </div>
            </div>

            {method === "tg" && (
              <div className="bg-[hsl(var(--ice))] border border-[hsl(var(--sky)/0.3)] rounded-xl p-3 mb-4">
                <p className="font-ibm text-xs text-[hsl(var(--navy)/0.8)] leading-relaxed">
                  <strong>Шаг 1:</strong> Найдите бота <strong>@fuelpiterbot</strong> в Telegram и нажмите /start<br/>
                  <strong>Шаг 2:</strong> Введите ваш @username ниже и нажмите «Получить код»
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">
                  {method === "email" ? "Email-адрес" : method === "phone" ? "Номер телефона" : `${selectedMethod.label} — username`}
                </label>
                <input value={contact} onChange={e => setContact(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendCode()}
                  placeholder={selectedMethod.placeholder} type={method === "email" ? "email" : "text"}
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] transition-all" />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-ibm mt-3 flex items-center gap-1"><Icon name="AlertCircle" size={13} />{error}</p>}

            <button onClick={handleSendCode} disabled={!contact.trim() || loading}
              className="w-full btn-primary py-3 mt-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Icon name="Loader" size={16} className="animate-spin" /> Отправляем...</> : "Получить код"}
            </button>
          </div>
        )}

        {/* STEP 3 — ввод кода */}
        {step === "code" && (
          <div className="card-glass border border-[hsl(var(--border))] p-6">
            <button onClick={() => { setStep("contact"); setCode(""); setError(""); }}
              className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] text-sm font-ibm mb-5 transition-colors">
              <Icon name="ArrowLeft" size={15} /> Назад
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="CheckCircle" size={22} className="text-emerald-600" />
              </div>
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-base mb-1">Код отправлен</h3>
              <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm">{info}</p>
            </div>

            <div className="mb-5">
              <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Введите 6-значный код</label>
              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && code.length === 6 && handleVerify()}
                placeholder="000000" maxLength={6} type="text" inputMode="numeric"
                className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-4 text-2xl font-golos font-black text-center tracking-[0.5em] outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)]" />
            </div>

            {/* Имя (опционально) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Имя (необязательно)</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Иванов И."
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-3 py-2.5 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)]" />
              </div>
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Организация</label>
                <input value={org} onChange={e => setOrg(e.target.value)} placeholder="ООО Ромашка"
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-3 py-2.5 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)]" />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-ibm mb-3 flex items-center gap-1"><Icon name="AlertCircle" size={13} />{error}</p>}

            <button onClick={handleVerify} disabled={code.length !== 6 || loading}
              className="w-full btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Icon name="Loader" size={16} className="animate-spin" /> Проверяем...</> : "Войти"}
            </button>

            <div className="mt-4 text-center">
              {timer > 0 ? (
                <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Повторная отправка через {timer} сек</p>
              ) : (
                <button onClick={() => { handleSendCode(); }} className="font-ibm text-xs text-[hsl(var(--ocean))] hover:underline">
                  Отправить код ещё раз
                </button>
              )}
            </div>

            <p className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] text-center mt-3 leading-relaxed">
              Входя в систему, вы соглашаетесь с обработкой персональных данных согласно ФЗ-152
            </p>
          </div>
        )}
      </div>
    </div>
  );
}