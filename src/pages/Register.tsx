import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const AUTH_EMAIL_URL = "https://functions.poehali.dev/0a0b2f4a-18da-40f5-82ca-7132b7cdccbf";
const ORDERS_URL = "https://functions.poehali.dev/2d08fa8d-d361-4d58-995f-60ed63a3d4fd";

type Mode = "company" | "person";
type Step = "type" | "form" | "verify" | "done";

export default function Register() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("company");
  const [step, setStep] = useState<Step>("type");

  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Email и пароль обязательны"); return; }
    if (password !== passwordConfirm) { setError("Пароли не совпадают"); return; }
    if (password.length < 6) { setError("Пароль не короче 6 символов"); return; }
    if (mode === "company" && !companyName.trim()) { setError("Укажите название организации"); return; }
    if (mode === "person" && !contactName.trim()) { setError("Укажите ваше имя"); return; }

    const fullName = mode === "company"
      ? `${companyName} (${contactName || "контактное лицо"})`
      : contactName;

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_EMAIL_URL}?action=register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: fullName }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      // Дополнительные данные сохраняем как первую "профильную" заявку (контакт)
      try {
        await fetch(`${ORDERS_URL}?action=create`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: contactName || companyName,
            org: mode === "company" ? companyName : "",
            phone, email: email.trim(),
            address,
            comment: `Регистрация на сайте • ${mode === "company" ? `ИНН: ${inn}` : "Физлицо"}`,
            fuelType: "—",
            volume: "—",
            source: "register",
            contact: email.trim(),
          }),
        });
      } catch {/* */}

      if (data.email_verification_required) {
        setNeedsVerification(true);
        setStep("verify");
      } else if (data.access_token) {
        // Сразу авторизован
        localStorage.setItem("sined_token", data.access_token);
        localStorage.setItem("sined_user", JSON.stringify({
          token: data.access_token,
          user_id: String(data.user?.id || ""),
          contact: email.trim(),
          method: "email",
          name: fullName,
          org: mode === "company" ? companyName : "",
        }));
        setStep("done");
      } else {
        setStep("done");
      }
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  const handleVerifyCode = async () => {
    if (code.length < 4) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_EMAIL_URL}?action=verify-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      if (data.access_token) {
        localStorage.setItem("sined_token", data.access_token);
        localStorage.setItem("sined_user", JSON.stringify({
          token: data.access_token,
          user_id: String(data.user?.id || ""),
          contact: email.trim(),
          method: "email",
          name: contactName || companyName,
          org: mode === "company" ? companyName : "",
        }));
      }
      setStep("done");
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-20 max-w-lg mx-auto px-4 pb-12">

        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--navy))] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Icon name="UserPlus" size={24} className="text-[hsl(var(--sky))]" />
          </div>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-2xl mb-1">Регистрация</h1>
          <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm">
            Создайте кабинет и отслеживайте свои заявки
          </p>
        </div>

        {/* SHAG 1 — выбор типа клиента */}
        {step === "type" && (
          <div className="card-glass border border-[hsl(var(--border))] p-5">
            <p className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-4 text-center">
              Кто вы?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setMode("company"); setStep("form"); }}
                className="bg-white border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--ocean))] rounded-xl p-5 text-center transition-all hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ice))] flex items-center justify-center mx-auto mb-3">
                  <Icon name="Building2" size={22} className="text-[hsl(var(--ocean))]" />
                </div>
                <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Организация</div>
                <div className="font-ibm text-[11px] text-[hsl(var(--muted-foreground))] mt-1">ООО, ИП, ЗАО</div>
              </button>
              <button
                onClick={() => { setMode("person"); setStep("form"); }}
                className="bg-white border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--ocean))] rounded-xl p-5 text-center transition-all hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ice))] flex items-center justify-center mx-auto mb-3">
                  <Icon name="User" size={22} className="text-[hsl(var(--ocean))]" />
                </div>
                <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Физическое лицо</div>
                <div className="font-ibm text-[11px] text-[hsl(var(--muted-foreground))] mt-1">Частный заказчик</div>
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-[hsl(var(--border))] text-center">
              <button onClick={() => navigate("/cabinet")}
                className="font-ibm text-xs text-[hsl(var(--ocean))] hover:underline">
                Уже есть аккаунт? Войти
              </button>
            </div>
          </div>
        )}

        {/* SHAG 2 — форма */}
        {step === "form" && (
          <div className="card-glass border border-[hsl(var(--border))] p-6">
            <button onClick={() => setStep("type")}
              className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] text-sm font-ibm mb-5 transition-colors">
              <Icon name="ArrowLeft" size={15} /> Назад
            </button>

            <div className="flex items-center gap-3 mb-5">
              <Icon name={mode === "company" ? "Building2" : "User"} size={20} className="text-[hsl(var(--ocean))]" />
              <div className="font-golos font-bold text-[hsl(var(--navy))] text-base">
                {mode === "company" ? "Регистрация организации" : "Регистрация физлица"}
              </div>
            </div>

            <div className="space-y-3">
              {mode === "company" && (
                <>
                  <Field label="Название организации" required>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                      placeholder='ООО "Ромашка"' className={inputCls} />
                  </Field>
                  <Field label="ИНН (необязательно)">
                    <input value={inn} onChange={e => setInn(e.target.value)}
                      placeholder="7805824660" className={inputCls} />
                  </Field>
                </>
              )}

              <Field label={mode === "company" ? "Контактное лицо" : "Ваше имя"} required={mode === "person"}>
                <input value={contactName} onChange={e => setContactName(e.target.value)}
                  placeholder="Иванов Иван Иванович" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Телефон">
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+7 999 000-00-00" type="tel" className={inputCls} />
                </Field>
                <Field label="Email" required>
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="example@mail.ru" type="email" autoComplete="email" className={inputCls} />
                </Field>
              </div>

              <Field label="Адрес доставки (необязательно)">
                <input value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="СПб, ул. Невский 100" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Пароль" required>
                  <input value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" type="password" autoComplete="new-password" className={inputCls} />
                </Field>
                <Field label="Повторите пароль" required>
                  <input value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                    placeholder="••••••••" type="password" autoComplete="new-password" className={inputCls} />
                </Field>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-ibm mt-3 flex items-center gap-1">
                <Icon name="AlertCircle" size={13} />{error}
              </p>
            )}

            <button onClick={handleRegister} disabled={loading}
              className="w-full btn-primary py-3 mt-5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Icon name="Loader" size={16} className="animate-spin" /> Создаём...</> : <>Зарегистрироваться <Icon name="ArrowRight" size={16} /></>}
            </button>

            <p className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] text-center mt-3 leading-relaxed">
              Регистрируясь, вы соглашаетесь с обработкой персональных данных согласно ФЗ-152
            </p>
          </div>
        )}

        {/* SHAG 3 — подтверждение email */}
        {step === "verify" && (
          <div className="card-glass border border-[hsl(var(--border))] p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="Mail" size={26} className="text-emerald-600" />
              </div>
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-1">Проверьте почту</h3>
              <p className="font-ibm text-sm text-[hsl(var(--muted-foreground))]">
                Мы отправили 6-значный код на<br/>
                <strong className="text-[hsl(var(--navy))]">{email}</strong>
              </p>
            </div>

            <Field label="Код из письма" required>
              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                placeholder="000000" maxLength={6} type="text" inputMode="numeric"
                className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-4 text-2xl font-golos font-black text-center tracking-[0.5em] outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)]" />
            </Field>

            {error && <p className="text-red-500 text-xs font-ibm mt-3 flex items-center gap-1"><Icon name="AlertCircle" size={13} />{error}</p>}

            <button onClick={handleVerifyCode} disabled={code.length !== 6 || loading}
              className="w-full btn-primary py-3 mt-4 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Icon name="Loader" size={16} className="animate-spin" /> Проверяем...</> : "Подтвердить"}
            </button>
          </div>
        )}

        {/* SHAG 4 — успех */}
        {step === "done" && (
          <div className="card-glass border border-[hsl(var(--border))] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-emerald-600" />
            </div>
            <h3 className="font-golos font-black text-[hsl(var(--navy))] text-xl mb-2">Готово!</h3>
            <p className="font-ibm text-sm text-[hsl(var(--muted-foreground))] mb-6">
              Аккаунт создан. Менеджер свяжется с вами в течение 30 минут для уточнения деталей.
            </p>
            <button onClick={() => navigate("/cabinet")}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              <Icon name="LayoutDashboard" size={16} />
              Перейти в кабинет
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-2.5 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] transition-all";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1 block font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
