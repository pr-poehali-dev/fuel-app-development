import { useState } from "react";
import Icon from "@/components/ui/icon";

const NOTIFY_URL = "https://functions.poehali.dev/a9663a74-1164-44b6-b35f-51e91189827a";
const ORDERS_URL = "https://functions.poehali.dev/2d08fa8d-d361-4d58-995f-60ed63a3d4fd";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CallbackModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async () => {
    if (!phone.trim()) { setError("Укажите номер телефона"); return; }
    setLoading(true); setError("");
    const order = {
      name: name.trim() || "Не указано",
      phone: phone.trim(),
      fuelType: "Обратный звонок",
      volume: "—",
      address: "—",
      date: "Как можно скорее",
      comment: comment.trim() || "Запрос обратного звонка с главной страницы",
    };
    try {
      await Promise.all([
        fetch(NOTIFY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order, conversation: "Запрос обратного звонка с главной страницы" }),
        }),
        fetch(`${ORDERS_URL}?action=create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...order, source: "callback", contact: phone.trim() }),
        }),
      ]);
      setDone(true);
    } catch {
      setError("Ошибка отправки. Попробуйте позвонить напрямую: +7 (905) 215-05-60");
    } finally { setLoading(false); }
  };

  const close = () => {
    setName(""); setPhone(""); setComment(""); setDone(false); setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in" onClick={close}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-[hsl(var(--muted))] flex items-center justify-center transition-colors">
          <Icon name="X" size={18} className="text-[hsl(var(--muted-foreground))]" />
        </button>

        {!done ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--navy))] flex items-center justify-center mb-4">
              <Icon name="PhoneCall" size={26} className="text-[hsl(var(--sky))]" />
            </div>
            <h2 className="font-golos font-black text-[hsl(var(--navy))] text-2xl mb-1">Обратная связь</h2>
            <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm mb-6">
              Оставьте номер — менеджер перезвонит в течение 30 минут
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1 block font-medium">Имя</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Иван"
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)]" />
              </div>
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1 block font-medium">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder="+7 999 000-00-00"
                  type="tel"
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)]" />
              </div>
              <div>
                <label className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-1 block font-medium">Комментарий (необязательно)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Что вас интересует?"
                  rows={2}
                  className="w-full bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm font-ibm outline-none focus:ring-2 focus:ring-[hsl(var(--ocean)/0.3)] resize-none" />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-ibm mt-3 flex items-center gap-1">
                <Icon name="AlertCircle" size={13} />{error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={loading || !phone.trim()}
              className="w-full mt-5 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy)/0.9)] text-white py-3.5 rounded-xl text-sm font-golos font-semibold disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {loading ? <><Icon name="Loader" size={16} className="animate-spin" /> Отправляем...</> : <>Перезвоните мне <Icon name="ArrowRight" size={16} /></>}
            </button>

            <p className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] text-center mt-3 leading-relaxed">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных согласно ФЗ-152
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={32} className="text-emerald-600" />
            </div>
            <h2 className="font-golos font-black text-[hsl(var(--navy))] text-2xl mb-2">Заявка принята!</h2>
            <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm mb-6">
              Менеджер СИНЕД перезвонит в течение 30 минут
            </p>
            <button
              onClick={close}
              className="w-full bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy)/0.9)] text-white py-3 rounded-xl text-sm font-golos font-semibold transition-colors">
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
