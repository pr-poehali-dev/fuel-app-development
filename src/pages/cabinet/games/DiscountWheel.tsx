import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { addTokens, getBalance, spendForWheel, canSpend, TOKEN_RULES } from "../tokens";
import { WHEEL_TERMS } from "../legal/wheelTerms";

interface Props { open: boolean; onClose: () => void; onTokens?: () => void }

interface Prize {
  id: string;
  label: string;
  short: string;
  type: "discount" | "fuel" | "delivery" | "tokens";
  value: number;
  weight: number;
  color: string;
  textColor: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legend";
}

// Обратный ряд Фибоначчи: 89, 55, 34, 21, 13, 8, 5, 3, 2, 1, 1, 1
const PRIZES: Prize[] = [
  { id: "d1",   label: "Скидка 1%",          short: "1%",     type: "discount", value: 1,   weight: 89, color: "#94a3b8", textColor: "#fff", icon: "Percent",  rarity: "common" },
  { id: "f5",   label: "5 л ДТ в подарок",   short: "5 л",    type: "fuel",     value: 5,   weight: 55, color: "#60a5fa", textColor: "#fff", icon: "Droplet",  rarity: "common" },
  { id: "d2",   label: "Скидка 2%",          short: "2%",     type: "discount", value: 2,   weight: 34, color: "#64748b", textColor: "#fff", icon: "Percent",  rarity: "common" },
  { id: "f10",  label: "10 л ДТ",            short: "10 л",   type: "fuel",     value: 10,  weight: 21, color: "#3b82f6", textColor: "#fff", icon: "Droplets", rarity: "rare" },
  { id: "d3",  label: "Скидка 3%",           short: "3%",     type: "discount", value: 3,   weight: 21, color: "#475569", textColor: "#fff", icon: "Percent",  rarity: "rare" },
  { id: "del",  label: "Бесплатная доставка",short: "🚚",     type: "delivery", value: 0,   weight: 13, color: "#10b981", textColor: "#fff", icon: "Truck",    rarity: "rare" },
  { id: "d5",   label: "Скидка 5%",          short: "5%",     type: "discount", value: 5,   weight: 13, color: "#1e40af", textColor: "#fff", icon: "Percent",  rarity: "rare" },
  { id: "t100", label: "100 СИНЕТ",          short: "100С",   type: "tokens",   value: 100, weight: 8,  color: "#f59e0b", textColor: "#fff", icon: "Coins",    rarity: "epic" },
  { id: "f25",  label: "25 л ДТ",            short: "25 л",   type: "fuel",     value: 25,  weight: 8,  color: "#1d4ed8", textColor: "#fff", icon: "Droplets", rarity: "epic" },
  { id: "d7",   label: "Скидка 7%",          short: "7%",     type: "discount", value: 7,   weight: 5,  color: "#7c3aed", textColor: "#fff", icon: "Percent",  rarity: "epic" },
  { id: "f50",  label: "50 л ДТ",            short: "50 л",   type: "fuel",     value: 50,  weight: 3,  color: "#6d28d9", textColor: "#fff", icon: "Fuel",     rarity: "epic" },
  { id: "d10",  label: "Скидка 10%",         short: "10%",    type: "discount", value: 10,  weight: 2,  color: "#be185d", textColor: "#fff", icon: "Percent",  rarity: "legend" },
  { id: "d20",  label: "ДЖЕКПОТ 20%",        short: "20%",    type: "discount", value: 20,  weight: 1,  color: "#dc2626", textColor: "#fff", icon: "Crown",    rarity: "legend" },
];

const TOTAL_WEIGHT = PRIZES.reduce((s, p) => s + p.weight, 0);

interface WinRecord { prizeId: string; date: string; code: string }

const STORAGE_KEY = "sined_wheel_win";
const COOLDOWN_KEY = "sined_wheel_cooldown";
const CONSENT_KEY = "sined_wheel_consent_v1";
const COOLDOWN_HOURS = 24;
const EXTRA_SPIN_COST = TOKEN_RULES.wheelExtraSpinCost;

function pickPrize(): number {
  const r = Math.random() * TOTAL_WEIGHT;
  let acc = 0;
  for (let i = 0; i < PRIZES.length; i++) {
    acc += PRIZES[i].weight;
    if (r <= acc) return i;
  }
  return 0;
}

function genCode(prize: Prize): string {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  const tag = prize.type === "discount" ? "DSC" + prize.value
            : prize.type === "fuel"     ? "FUEL" + prize.value
            : prize.type === "delivery" ? "DELIV"
            : "TKN" + prize.value;
  return `SINED-${tag}-${rnd}`;
}

function hoursLeft(): number {
  const ts = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
  if (!ts) return 0;
  return Math.max(0, (ts + COOLDOWN_HOURS * 3600_000 - Date.now()) / 3600_000);
}

// === ЗВУК (Web Audio API) ===
let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); } catch { return null; }
  }
  return audioCtx;
}
function playTick() {
  const ctx = getCtx(); if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = 800;
  o.type = "square";
  g.gain.setValueAtTime(0.05, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.05);
}
function playWin(rarity: Prize["rarity"]) {
  const ctx = getCtx(); if (!ctx) return;
  const notes = rarity === "legend" ? [523, 659, 784, 1046, 1318]
              : rarity === "epic"   ? [523, 659, 784, 1046]
              : rarity === "rare"   ? [523, 659, 784]
              :                       [523, 659];
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = "triangle";
    const t = ctx.currentTime + i * 0.12;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.3);
  });
}
function playLose() {
  const ctx = getCtx(); if (!ctx) return;
  [400, 300, 200].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = "sawtooth";
    const t = ctx.currentTime + i * 0.18;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.4);
  });
}

interface ConfettiParticle {
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; rot: number; vRot: number;
}

export default function DiscountWheel({ open, onClose, onTokens }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ rec: WinRecord; prize: Prize } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [consent, setConsent] = useState(() => localStorage.getItem(CONSENT_KEY) === "1");
  const [showTerms, setShowTerms] = useState(false);
  const [balance, setBalance] = useState(0);
  const lastTickRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const confettiAnimRef = useRef<number | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const rec: WinRecord = JSON.parse(saved);
        const prize = PRIZES.find(p => p.id === rec.prizeId);
        if (prize) setResult({ rec, prize });
      } catch { /* noop */ }
    }
    setCooldown(hoursLeft());
    setBalance(getBalance());
  }, [open]);

  useEffect(() => {
    draw(angle);
    if (spinning) {
      const sectorAngle = (Math.PI * 2) / PRIZES.length;
      const passed = Math.floor(angle / sectorAngle);
      if (passed !== lastTickRef.current) {
        playTick();
        lastTickRef.current = passed;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, open]);

  function shade(hex: string, amt: number): string {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
    const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }

  const draw = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 16;

    ctx.clearRect(0, 0, size, size);

    // Внешнее свечение
    const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 14);
    glow.addColorStop(0, "rgba(251,191,36,0.4)");
    glow.addColorStop(1, "rgba(251,191,36,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.fill();

    // Внешнее кольцо
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
    ctx.fill();

    // Лампочки
    const bulbCount = 24;
    for (let i = 0; i < bulbCount; i++) {
      const a = (i / bulbCount) * Math.PI * 2;
      const bx = cx + Math.cos(a) * (r + 5);
      const by = cy + Math.sin(a) * (r + 5);
      const lit = (Math.floor(rot * 4) + i) % 2 === 0;
      ctx.fillStyle = lit ? "#fde047" : "#713f12";
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const sectorAngle = (Math.PI * 2) / PRIZES.length;

    for (let i = 0; i < PRIZES.length; i++) {
      const p = PRIZES[i];
      const start = rot + i * sectorAngle;
      const end = start + sectorAngle;
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, r);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, shade(p.color, -25));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Текст ровно по центру сектора
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sectorAngle / 2);
      ctx.fillStyle = p.textColor;
      ctx.font = `bold ${p.short.length > 4 ? 11 : 14}px 'Golos Text', sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(p.short, r - 16, 0);
      if (p.rarity === "legend") {
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(r - 52, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.textBaseline = "alphabetic";

    // Тонкие риски-указатели в центре каждого сектора (для отладки попадания)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    for (let i = 0; i < PRIZES.length; i++) {
      const a = rot + i * sectorAngle + sectorAngle / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 4), Math.sin(a) * (r - 4));
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.restore();

    // Центр
    const centerGrad = ctx.createRadialGradient(cx - 6, cy - 6, 5, cx, cy, 32);
    centerGrad.addColorStop(0, "#fbbf24");
    centerGrad.addColorStop(0.6, "#f59e0b");
    centerGrad.addColorStop(1, "#92400e");
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px 'Golos Text', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("СИНЕТ", cx, cy);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  };

  const launchConfetti = (rarity: Prize["rarity"]) => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const count = rarity === "legend" ? 220 : rarity === "epic" ? 130 : 80;
    const colors = ["#fbbf24", "#dc2626", "#3b82f6", "#10b981", "#a855f7", "#f59e0b"];
    particlesRef.current = [];
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.4,
      });
    }
    runConfetti();
  };

  const runConfetti = () => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.rot += p.vRot;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    if (alive) {
      confettiAnimRef.current = requestAnimationFrame(runConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSpin = (paid: boolean) => {
    if (spinning) return;
    if (!consent) { setShowTerms(true); return; }
    if (!paid && cooldown > 0) return;
    if (paid) {
      if (!canSpend(EXTRA_SPIN_COST)) {
        alert(`Нужно ${EXTRA_SPIN_COST} токенов. У вас: ${getBalance()}`);
        return;
      }
      spendForWheel(EXTRA_SPIN_COST);
      setBalance(getBalance());
      onTokens?.();
    }

    setSpinning(true);
    setResult(null);
    lastTickRef.current = 0;

    const idx = pickPrize();
    const sectorAngle = (Math.PI * 2) / PRIZES.length;
    // Целевой угол: центр выпавшего сектора должен встать под стрелкой (-π/2 = сверху)
    const target = -Math.PI / 2 - (idx * sectorAngle + sectorAngle / 2);
    // ЦЕЛОЕ количество оборотов + лёгкий джиттер ВНУТРИ сектора (чтобы стрелка
    // не всегда попадала в одну и ту же точку, но всегда — в этот сектор)
    const turns = 7 + Math.floor(Math.random() * 4);
    const jitter = (Math.random() - 0.5) * sectorAngle * 0.6;
    const startAngle = angle % (Math.PI * 2);
    // Делаем target ВСЕГДА больше startAngle, чтобы колесо крутилось вперёд
    let normalizedTarget = target;
    while (normalizedTarget <= startAngle) normalizedTarget += Math.PI * 2;
    const finalAngle = normalizedTarget + Math.PI * 2 * turns + jitter;

    const startTime = performance.now();
    const duration = 5500;

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const cur = startAngle + (finalAngle - startAngle) * eased;
      setAngle(cur);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        const prize = PRIZES[idx];
        const rec: WinRecord = {
          prizeId: prize.id,
          date: new Date().toISOString(),
          code: genCode(prize),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
        if (!paid) {
          localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
          setCooldown(COOLDOWN_HOURS);
        }
        setResult({ rec, prize });
        setSpinning(false);

        if (prize.type === "tokens") {
          addTokens(prize.value, `Колесо: ${prize.label}`, "earn_game");
          setBalance(getBalance());
          onTokens?.();
        }

        if (prize.rarity === "legend" || prize.rarity === "epic" || prize.rarity === "rare") {
          playWin(prize.rarity);
          launchConfetti(prize.rarity);
        } else {
          playLose();
        }
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current);
    };
  }, []);

  const acceptTerms = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    setConsent(true);
    setShowTerms(false);
  };

  const resetCooldown = () => {
    localStorage.removeItem(COOLDOWN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setCooldown(0);
    setResult(null);
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
              <h3 className="font-golos font-bold text-base">{WHEEL_TERMS.title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="overflow-y-auto p-5 flex-1">
            <p className="text-[11px] font-ibm text-[hsl(var(--muted-foreground))] mb-4">
              {WHEEL_TERMS.version} · {WHEEL_TERMS.organizer.shortName}
            </p>
            {WHEEL_TERMS.sections.map(s => (
              <div key={s.title} className="mb-5">
                <h4 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-2">{s.title}</h4>
                <p className="font-ibm text-xs text-[hsl(var(--foreground))] whitespace-pre-line leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[hsl(var(--border))] p-4 bg-[hsl(var(--muted)/0.4)]">
            <p className="text-[11px] font-ibm text-[hsl(var(--muted-foreground))] mb-3 text-center">
              Нажимая «Принимаю», вы подтверждаете согласие с правилами акции и обработкой персональных данных согласно ФЗ № 152-ФЗ.
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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

        <canvas ref={confettiRef} width={500} height={700}
                className="absolute inset-0 w-full h-full pointer-events-none z-40" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--border))] bg-gradient-to-r from-rose-600 to-amber-500 text-white relative z-10">
          <div className="flex items-center gap-2">
            <Icon name="Gift" size={18} />
            <h3 className="font-golos font-bold text-base">Колесо скидок</h3>
            <span className="ml-2 bg-white/20 text-[10px] font-ibm font-semibold px-2 py-0.5 rounded">ДЕМО</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTerms(true)} title="Правила"
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <Icon name="Info" size={14} />
            </button>
            <button onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-b from-rose-50 via-amber-50 to-white relative z-10">
          {/* Баланс */}
          <div className="flex items-center justify-between mb-3 bg-white/70 rounded-xl px-3 py-2 border border-amber-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-golos font-black text-xs">С</span>
              </div>
              <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Баланс СИНЕТ:</span>
            </div>
            <span className="font-golos font-black text-lg text-amber-700">{balance}</span>
          </div>

          {/* Колесо */}
          <div className="relative mx-auto" style={{ width: 340, height: 340 }}>
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10">
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[30px] border-t-rose-600 drop-shadow-lg" />
            </div>
            <canvas ref={canvasRef} width={340} height={340} className="w-full h-full" />
          </div>

          {/* Результат */}
          {result && !spinning && (
            <div className={`mt-4 rounded-xl p-4 text-center animate-fade-in border-2 ${
              result.prize.rarity === "legend" ? "bg-gradient-to-r from-amber-100 via-rose-100 to-purple-100 border-amber-400" :
              result.prize.rarity === "epic"   ? "bg-gradient-to-r from-purple-50 to-amber-50 border-purple-300" :
              result.prize.rarity === "rare"   ? "bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-300" :
                                                  "bg-[hsl(var(--muted)/0.5)] border-[hsl(var(--border))]"
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name={result.prize.icon} size={20} className={
                  result.prize.rarity === "legend" ? "text-amber-600" :
                  result.prize.rarity === "epic"   ? "text-purple-600" :
                  result.prize.rarity === "rare"   ? "text-blue-600" : "text-slate-600"
                } />
                <div className="text-xs font-ibm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  {result.prize.rarity === "legend" ? "🏆 Легендарный" :
                   result.prize.rarity === "epic"   ? "💎 Эпический" :
                   result.prize.rarity === "rare"   ? "✨ Редкий" : "Приз"}
                </div>
              </div>
              <div className="font-golos font-black text-2xl text-[hsl(var(--navy))] mb-2">
                {result.prize.label}
              </div>
              {result.prize.type !== "tokens" && (
                <div className="bg-white rounded-lg px-3 py-2 inline-block border border-amber-300">
                  <span className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mr-2">Промокод:</span>
                  <span className="font-mono font-bold text-sm text-[hsl(var(--navy))]">{result.rec.code}</span>
                </div>
              )}
              <p className="font-ibm text-[11px] text-[hsl(var(--muted-foreground))] mt-2">
                {result.prize.type === "tokens"
                  ? "Токены зачислены на баланс"
                  : "Назовите менеджеру при оформлении заявки"}
              </p>
            </div>
          )}

          {/* Кнопки */}
          {cooldown === 0 ? (
            <button
              onClick={() => handleSpin(false)}
              disabled={spinning}
              className="mt-4 w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white py-3.5 rounded-xl font-golos font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg">
              {spinning ? (
                <><Icon name="Loader" size={16} className="animate-spin" /> Крутим...</>
              ) : (
                <><Icon name="Sparkles" size={16} /> Бесплатное вращение</>
              )}
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-center font-ibm text-xs text-[hsl(var(--muted-foreground))] mb-3">
                Бесплатная попытка через {Math.ceil(cooldown)} ч
              </p>
              <button
                onClick={() => handleSpin(true)}
                disabled={spinning || !canSpend(EXTRA_SPIN_COST)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-golos font-bold text-sm transition-all flex items-center justify-center gap-2">
                {spinning ? (
                  <><Icon name="Loader" size={16} className="animate-spin" /> Крутим...</>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black">С</div>
                    Ещё за {EXTRA_SPIN_COST} токенов
                  </>
                )}
              </button>
              {!canSpend(EXTRA_SPIN_COST) && (
                <p className="text-center font-ibm text-[10px] text-rose-600 mt-2">
                  Не хватает токенов — копите за заказы и приглашения
                </p>
              )}
              <button onClick={resetCooldown}
                      className="mt-2 w-full text-[10px] font-ibm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] hover:underline">
                [демо] сбросить кулдаун
              </button>
            </div>
          )}

          <button onClick={() => setShowTerms(true)}
                  className="mt-3 w-full text-[10px] font-ibm text-[hsl(var(--muted-foreground))] hover:underline flex items-center justify-center gap-1">
            <Icon name="FileText" size={11} />
            Правила акции и согласие на обработку данных
          </button>
        </div>
      </div>
    </div>
  );
}