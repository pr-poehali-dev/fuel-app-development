import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { addTokens, getBalance, TOKEN_RULES } from "../tokens";
import { REFERRAL_TERMS } from "../legal/referralTerms";

interface Props { open: boolean; onClose: () => void; userKey?: string; onTokens?: () => void }

interface ReferralStats {
  invited: number;
  registered: number;
  ordered: number;
  earned: number;
  isVip: boolean;
}

const REF_KEY = "sined_ref_code";
const REF_STATS_KEY = "sined_ref_stats";
const REF_CONSENT_KEY = "sined_ref_consent_v1";

function genRefCode(seed: string): string {
  const base = (seed || "user").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "USER";
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `REF-${base}-${rnd}`;
}

function getOrCreateRefCode(seed: string): string {
  let code = localStorage.getItem(REF_KEY);
  if (!code) {
    code = genRefCode(seed);
    localStorage.setItem(REF_KEY, code);
  }
  return code;
}

function getStats(): ReferralStats {
  try {
    const s = localStorage.getItem(REF_STATS_KEY);
    if (s) return JSON.parse(s);
  } catch { /* noop */ }
  return { invited: 0, registered: 0, ordered: 0, earned: 0, isVip: false };
}

function saveStats(s: ReferralStats) {
  localStorage.setItem(REF_STATS_KEY, JSON.stringify(s));
}

export default function ReferralProgram({ open, onClose, userKey = "user", onTokens }: Props) {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>(getStats());
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [consent, setConsent] = useState(() => localStorage.getItem(REF_CONSENT_KEY) === "1");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!open) return;
    setCode(getOrCreateRefCode(userKey));
    setStats(getStats());
    setBalance(getBalance());
  }, [open, userKey]);

  const link = `${window.location.origin}/register?ref=${code}`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const acceptTerms = () => {
    localStorage.setItem(REF_CONSENT_KEY, "1");
    setConsent(true);
    setShowTerms(false);
  };

  // Демо: симулировать привлечённого клиента
  const simulateInvite = () => {
    const next = { ...stats, invited: stats.invited + 1, registered: stats.registered + 1 };
    saveStats(next);
    setStats(next);
  };

  const simulateOrder = () => {
    const orderSum = Math.floor(50000 + Math.random() * 200000);
    const percent = stats.isVip || stats.ordered + 1 >= TOKEN_RULES.vipThreshold
      ? TOKEN_RULES.vipRefRewardPercent
      : TOKEN_RULES.refRewardPercent;
    const tokens = Math.floor(orderSum * percent / 100);
    addTokens(tokens, `Партнёрская программа: ${percent}% от заказа ${orderSum.toLocaleString("ru-RU")} ₽`, "earn_referral");

    const next: ReferralStats = {
      ...stats,
      ordered: stats.ordered + 1,
      earned: stats.earned + tokens,
      isVip: stats.ordered + 1 >= TOKEN_RULES.vipThreshold,
    };
    saveStats(next);
    setStats(next);
    setBalance(getBalance());
    onTokens?.();
  };

  const resetDemo = () => {
    const empty = { invited: 0, registered: 0, ordered: 0, earned: 0, isVip: false };
    saveStats(empty);
    setStats(empty);
  };

  if (!open) return null;

  if (!consent || showTerms) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
           onClick={onClose}>
        <div onClick={e => e.stopPropagation()}
             className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--navy))] text-white">
            <div className="flex items-center gap-2">
              <Icon name="FileText" size={18} />
              <h3 className="font-golos font-bold text-base">{REFERRAL_TERMS.title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="overflow-y-auto p-5 flex-1">
            <p className="text-[11px] font-ibm text-[hsl(var(--muted-foreground))] mb-4">
              {REFERRAL_TERMS.version} · {REFERRAL_TERMS.organizer.legalName}
            </p>
            {REFERRAL_TERMS.sections.map(s => (
              <div key={s.title} className="mb-5">
                <h4 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-2">{s.title}</h4>
                <p className="font-ibm text-xs text-[hsl(var(--foreground))] whitespace-pre-line leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[hsl(var(--border))] p-4 bg-[hsl(var(--muted)/0.4)]">
            <p className="text-[11px] font-ibm text-[hsl(var(--muted-foreground))] mb-3 text-center">
              Принимая условия, вы соглашаетесь с правилами программы и обработкой персональных данных согласно ФЗ № 152-ФЗ.
            </p>
            <div className="flex gap-2">
              <button onClick={onClose}
                      className="flex-1 bg-white border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--navy))] py-3 rounded-xl font-golos font-semibold text-sm">
                Отмена
              </button>
              <button onClick={acceptTerms}
                      className="flex-1 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy)/0.9)] text-white py-3 rounded-xl font-golos font-bold text-sm flex items-center justify-center gap-2">
                <Icon name="CheckCircle" size={16} />
                Принимаю
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tier = stats.isVip ? "VIP" : "BASIC";
  const percent = stats.isVip ? TOKEN_RULES.vipRefRewardPercent : TOKEN_RULES.refRewardPercent;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto">

        {/* Шапка */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="UsersRound" size={20} />
              <h3 className="font-golos font-bold text-lg">Приглашай — зарабатывай</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-ibm text-white/90">
            <span className={`px-2 py-0.5 rounded font-semibold ${stats.isVip ? "bg-amber-400 text-amber-900" : "bg-white/20"}`}>
              {tier}
            </span>
            <span>Ваша ставка: <b>{percent}%</b> от заказов друзей</span>
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* Реф-код и ссылка */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
            <div className="text-[10px] font-ibm text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Ваш реферальный код</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-white rounded-lg px-3 py-2.5 border border-emerald-300">
                <code className="font-mono font-bold text-base text-emerald-800">{code}</code>
              </div>
              <button onClick={() => copy(code)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-lg flex items-center gap-1.5 text-xs font-golos font-semibold">
                <Icon name={copied ? "Check" : "Copy"} size={14} />
                {copied ? "OK" : "Копир."}
              </button>
            </div>
            <div className="text-[10px] font-ibm text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Ссылка для друзей</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-emerald-300 truncate">
                <code className="font-mono text-[11px] text-[hsl(var(--navy))]">{link}</code>
              </div>
              <button onClick={() => copy(link)}
                      className="bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-golos font-semibold">
                <Icon name="Link" size={13} />
              </button>
            </div>
          </div>

          {/* Условия */}
          <div className="bg-[hsl(var(--muted)/0.5)] rounded-xl p-4">
            <h4 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3 flex items-center gap-2">
              <Icon name="Sparkles" size={15} className="text-amber-500" />
              Как работает
            </h4>
            <div className="space-y-2.5 text-xs font-ibm text-[hsl(var(--navy))]">
              <div className="flex gap-2">
                <span className="text-emerald-600 font-bold">1.</span>
                <span>Делитесь ссылкой с друзьями и партнёрами</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-600 font-bold">2.</span>
                <span>Друг регистрируется и получает <b className="text-rose-600">{TOKEN_RULES.newClientDiscountPercent}% скидку</b> на первый заказ</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-600 font-bold">3.</span>
                <span>Вы получаете <b className="text-amber-600">{TOKEN_RULES.refRewardPercent}% токенами СИНЕТ</b> с каждого заказа друга в первые 3 месяца</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-600 font-bold">4.</span>
                <span>С {TOKEN_RULES.vipThreshold}-го клиента — статус <b className="text-amber-700">VIP</b> и ставка <b>{TOKEN_RULES.vipRefRewardPercent}%</b> навсегда</span>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Icon name="UserPlus" size={16} className="text-blue-600 mx-auto mb-1" />
              <div className="font-golos font-black text-xl text-[hsl(var(--navy))]">{stats.registered}</div>
              <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Регистраций</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <Icon name="ShoppingCart" size={16} className="text-emerald-600 mx-auto mb-1" />
              <div className="font-golos font-black text-xl text-[hsl(var(--navy))]">{stats.ordered}</div>
              <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase">С заказами</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center col-span-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center">
                  <span className="text-white font-golos font-black text-[10px]">С</span>
                </div>
                <span className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Заработано всего</span>
              </div>
              <div className="font-golos font-black text-2xl text-amber-700">{stats.earned} <span className="text-xs font-normal">СИНЕТ</span></div>
              <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mt-1">Текущий баланс: {balance} токенов</div>
            </div>
          </div>

          {/* VIP прогресс */}
          {!stats.isVip && (
            <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs font-ibm mb-2">
                <span className="text-[hsl(var(--navy))]">До статуса VIP</span>
                <span className="font-bold text-amber-700">{stats.ordered} / {TOKEN_RULES.vipThreshold}</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all"
                     style={{ width: `${Math.min(100, (stats.ordered / TOKEN_RULES.vipThreshold) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Поделиться */}
          <div className="grid grid-cols-3 gap-2">
            <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Дизельное топливо со скидкой 5% от СИНЕД — переходи и регистрируйся!")}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-1.5 bg-[#229ED9] hover:opacity-90 text-white py-2.5 rounded-lg text-xs font-golos font-semibold transition-opacity">
              <Icon name="Send" size={14} />
              Telegram
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent("Скидка 5% на дизель от СИНЕД: " + link)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:opacity-90 text-white py-2.5 rounded-lg text-xs font-golos font-semibold transition-opacity">
              <Icon name="MessageCircle" size={14} />
              WhatsApp
            </a>
            <a href={`https://vk.com/share.php?url=${encodeURIComponent(link)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-1.5 bg-[#4C75A3] hover:opacity-90 text-white py-2.5 rounded-lg text-xs font-golos font-semibold transition-opacity">
              <Icon name="Share2" size={14} />
              ВК
            </a>
          </div>

          {/* Демо-кнопки симуляции */}
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-3">
            <div className="text-[10px] font-ibm text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Icon name="FlaskConical" size={11} />
              Симуляция (только для демо)
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={simulateInvite}
                      className="flex-1 bg-white border border-amber-400 hover:bg-amber-100 text-amber-800 text-[11px] font-golos font-semibold px-2 py-1.5 rounded-lg">
                + Регистрация
              </button>
              <button onClick={simulateOrder}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-golos font-semibold px-2 py-1.5 rounded-lg">
                + Заказ друга
              </button>
              <button onClick={resetDemo}
                      className="bg-white border border-red-300 hover:bg-red-50 text-red-700 text-[11px] font-golos font-semibold px-2 py-1.5 rounded-lg">
                <Icon name="RotateCcw" size={11} />
              </button>
            </div>
          </div>

          <button onClick={() => setShowTerms(true)}
                  className="w-full text-[10px] font-ibm text-[hsl(var(--muted-foreground))] hover:underline flex items-center justify-center gap-1">
            <Icon name="FileText" size={11} />
            Условия партнёрской программы
          </button>
        </div>
      </div>
    </div>
  );
}
