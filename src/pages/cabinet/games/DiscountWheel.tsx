import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

interface Props { open: boolean; onClose: () => void }

interface Sector { value: number; weight: number; color: string }

// Распределение шансов (как в казино — большие призы редкие)
const SECTORS: Sector[] = [
  { value: 1, weight: 28, color: "#94a3b8" },
  { value: 2, weight: 22, color: "#64748b" },
  { value: 1, weight: 18, color: "#cbd5e1" },
  { value: 5, weight: 14, color: "#3b82f6" },
  { value: 2, weight: 9, color: "#0ea5e9" },
  { value: 5, weight: 5, color: "#1e40af" },
  { value: 10, weight: 3, color: "#f59e0b" },
  { value: 20, weight: 1, color: "#dc2626" },
];

const TOTAL_WEIGHT = SECTORS.reduce((s, x) => s + x.weight, 0);

interface WinRecord { value: number; date: string; code: string }

const STORAGE_KEY = "sined_wheel_win";
const COOLDOWN_KEY = "sined_wheel_cooldown";
const COOLDOWN_HOURS = 24;

function pickSector(): number {
  const r = Math.random() * TOTAL_WEIGHT;
  let acc = 0;
  for (let i = 0; i < SECTORS.length; i++) {
    acc += SECTORS[i].weight;
    if (r <= acc) return i;
  }
  return 0;
}

function genCode(value: number): string {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SINED${value}-${rnd}`;
}

function hoursLeft(): number {
  const ts = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
  if (!ts) return 0;
  const diff = (ts + COOLDOWN_HOURS * 3600_000 - Date.now()) / 3600_000;
  return Math.max(0, diff);
}

export default function DiscountWheel({ open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WinRecord | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setResult(JSON.parse(saved)); } catch { /* noop */ }
    }
    setCooldown(hoursLeft());
  }, [open]);

  useEffect(() => {
    draw(angle);
     
  }, [angle, open]);

  const draw = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    // Внешнее кольцо
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.fill();

    const sectorAngle = (Math.PI * 2) / SECTORS.length;

    for (let i = 0; i < SECTORS.length; i++) {
      const s = SECTORS[i];
      const start = rot + i * sectorAngle;
      const end = start + sectorAngle;

      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Текст
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sectorAngle / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px 'Golos Text', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${s.value}%`, r - 14, 6);
      ctx.restore();
    }

    // Центр
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⛽", cx, cy + 1);
  };

  const spin = () => {
    if (spinning) return;
    if (cooldown > 0) return;

    setSpinning(true);
    const idx = pickSector();
    const sectorAngle = (Math.PI * 2) / SECTORS.length;
    // Стрелка сверху (на -PI/2). Чтобы сектор idx остановился под стрелкой:
    // start + sectorAngle/2 + rot ≡ -PI/2  (mod 2PI)
    const target = -Math.PI / 2 - (idx * sectorAngle + sectorAngle / 2);
    const turns = 6 + Math.random() * 2;
    const finalAngle = target + Math.PI * 2 * turns;

    const startTime = performance.now();
    const startAngle = angle % (Math.PI * 2);
    const duration = 4500;

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = startAngle + (finalAngle - startAngle) * eased;
      setAngle(cur);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        const value = SECTORS[idx].value;
        const rec: WinRecord = {
          value,
          date: new Date().toISOString(),
          code: genCode(value),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        setResult(rec);
        setSpinning(false);
        setCooldown(COOLDOWN_HOURS);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const resetCooldown = () => {
    localStorage.removeItem(COOLDOWN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setCooldown(0);
    setResult(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Icon name="Gift" size={18} className="text-rose-600" />
            <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-base">Колесо скидок</h3>
            <span className="ml-2 bg-rose-50 text-rose-700 text-[10px] font-ibm font-semibold px-2 py-0.5 rounded">
              ДЕМО
            </span>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--muted))] flex items-center justify-center">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-5 bg-gradient-to-b from-rose-50 to-white">
          {/* Колесо со стрелкой */}
          <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
            {/* Стрелка сверху */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-10">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-[hsl(var(--navy))] drop-shadow-md" />
            </div>
            <canvas ref={canvasRef} width={320} height={320} className="w-full h-full" />
          </div>

          {/* Результат */}
          {result && !spinning && (
            <div className="mt-4 bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-dashed border-amber-300 rounded-xl p-4 text-center animate-fade-in">
              <div className="text-xs font-ibm text-[hsl(var(--muted-foreground))] mb-1">Ваш приз:</div>
              <div className="font-golos font-black text-3xl text-rose-600 mb-2">
                Скидка {result.value}%
              </div>
              <div className="bg-white rounded-lg px-3 py-2 inline-block border border-amber-300">
                <span className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))] mr-2">Промокод:</span>
                <span className="font-mono font-bold text-sm text-[hsl(var(--navy))]">{result.code}</span>
              </div>
              <p className="font-ibm text-[11px] text-[hsl(var(--muted-foreground))] mt-2">
                Назовите менеджеру при оформлении заявки
              </p>
            </div>
          )}

          {/* Кнопка крутить */}
          {!result || cooldown === 0 ? (
            <button
              onClick={spin}
              disabled={spinning || cooldown > 0}
              className="mt-4 w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white py-3.5 rounded-xl font-golos font-bold text-sm transition-all flex items-center justify-center gap-2">
              {spinning ? (
                <><Icon name="Loader" size={16} className="animate-spin" /> Крутим...</>
              ) : (
                <><Icon name="Sparkles" size={16} /> Крутить колесо</>
              )}
            </button>
          ) : (
            <div className="mt-4 text-center">
              <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">
                Следующая попытка через {Math.ceil(cooldown)} ч
              </p>
              <button onClick={resetCooldown}
                      className="mt-2 text-[11px] font-ibm text-[hsl(var(--ocean))] hover:underline">
                [демо] сбросить кулдаун
              </button>
            </div>
          )}

          <p className="text-center text-[10px] font-ibm text-[hsl(var(--muted-foreground))] mt-3 leading-relaxed">
            Шансы: 1% и 2% — частые, 5% — реже, 10% — редко, 20% — джекпот.<br />
            Промокод действителен 7 дней.
          </p>
        </div>
      </div>
    </div>
  );
}
