import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

interface Props { open: boolean; onClose: () => void }

interface Obstacle { x: number; w: number; h: number; type: "barrel" | "cone" }

const W = 720;
const H = 240;
const GROUND = 200;
const GRAVITY = 0.7;
const JUMP = 13;

export default function TruckGame({ open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("sined_truck_best") || 0));
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);

  const stateRef = useRef({
    y: GROUND,
    vy: 0,
    speed: 6,
    obstacles: [] as Obstacle[],
    spawnIn: 80,
    score: 0,
    cloudX: 100,
    cloudX2: 400,
    rafId: 0,
    running: false,
    over: false,
  });

  const reset = () => {
    stateRef.current = {
      y: GROUND, vy: 0, speed: 6, obstacles: [], spawnIn: 80,
      score: 0, cloudX: 100, cloudX2: 400, rafId: 0, running: true, over: false,
    };
    setScore(0);
    setOver(false);
    setRunning(true);
  };

  const jump = () => {
    const s = stateRef.current;
    if (s.over) { reset(); return; }
    if (!s.running) { reset(); return; }
    if (s.y >= GROUND) {
      s.vy = -JUMP;
    }
  };

  const drawTruck = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Тень
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(x + 35, GROUND + 18, 32, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Цистерна
    ctx.fillStyle = "#1e40af";
    ctx.fillRect(x + 18, y - 28, 48, 24);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(x + 18, y - 28, 48, 6);

    // Кабина
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x, y - 32, 18, 28);
    ctx.fillStyle = "#7dd3fc";
    ctx.fillRect(x + 3, y - 28, 12, 10);

    // Рамка цистерны
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 18, y - 28, 48, 24);

    // Колёса
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(x + 8, y - 2, 6, 0, Math.PI * 2);
    ctx.arc(x + 32, y - 2, 6, 0, Math.PI * 2);
    ctx.arc(x + 56, y - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b7280";
    ctx.beginPath();
    ctx.arc(x + 8, y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 32, y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 56, y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, o: Obstacle) => {
    if (o.type === "barrel") {
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(o.x, GROUND - o.h, o.w, o.h);
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(o.x, GROUND - o.h + 6, o.w, 3);
      ctx.fillRect(o.x, GROUND - 8, o.w, 3);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px monospace";
      ctx.fillText("⛽", o.x + 2, GROUND - o.h / 2 + 3);
    } else {
      // конус
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(o.x + o.w / 2, GROUND - o.h);
      ctx.lineTo(o.x, GROUND);
      ctx.lineTo(o.x + o.w, GROUND);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(o.x + 2, GROUND - o.h * 0.6, o.w - 4, 3);
    }
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.arc(x + 14, y - 4, 14, 0, Math.PI * 2);
    ctx.arc(x + 28, y, 12, 0, Math.PI * 2);
    ctx.fill();
  };

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Очистка
    ctx.clearRect(0, 0, W, H);

    // Небо градиент
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#dbeafe");
    grad.addColorStop(1, "#f0f9ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Облака
    s.cloudX -= s.speed * 0.2;
    s.cloudX2 -= s.speed * 0.15;
    if (s.cloudX < -50) s.cloudX = W + 50;
    if (s.cloudX2 < -50) s.cloudX2 = W + 50;
    drawCloud(ctx, s.cloudX, 50);
    drawCloud(ctx, s.cloudX2, 80);

    // Земля
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(0, GROUND + 20, W, 2);
    ctx.fillStyle = "#cbd5e1";
    for (let i = 0; i < W; i += 30) {
      const off = (i - (s.score * 2) % 30);
      ctx.fillRect(off, GROUND + 25, 12, 2);
    }

    if (s.running && !s.over) {
      // Физика прыжка
      s.vy += GRAVITY;
      s.y += s.vy;
      if (s.y > GROUND) { s.y = GROUND; s.vy = 0; }

      // Спавн препятствий
      s.spawnIn--;
      if (s.spawnIn <= 0) {
        const isBarrel = Math.random() < 0.6;
        s.obstacles.push({
          x: W,
          w: isBarrel ? 20 : 22,
          h: isBarrel ? 26 + Math.random() * 14 : 28,
          type: isBarrel ? "barrel" : "cone",
        });
        s.spawnIn = 50 + Math.floor(Math.random() * 60) - Math.min(30, Math.floor(s.score / 100));
      }

      // Двигаем препятствия
      s.obstacles.forEach(o => { o.x -= s.speed; });
      s.obstacles = s.obstacles.filter(o => o.x + o.w > 0);

      // Скорость растёт
      s.speed = 6 + s.score / 200;

      // Очки
      s.score += 1;
      setScore(Math.floor(s.score / 5));

      // Коллизия
      const truckBox = { x: 60, y: s.y - 32, w: 66, h: 32 };
      for (const o of s.obstacles) {
        if (
          truckBox.x < o.x + o.w &&
          truckBox.x + truckBox.w > o.x &&
          truckBox.y < GROUND &&
          truckBox.y + truckBox.h > GROUND - o.h
        ) {
          s.over = true;
          s.running = false;
          const final = Math.floor(s.score / 5);
          if (final > best) {
            setBest(final);
            localStorage.setItem("sined_truck_best", String(final));
          }
          setOver(true);
          setRunning(false);
        }
      }
    }

    // Отрисовка препятствий
    s.obstacles.forEach(o => drawObstacle(ctx, o));

    // Бензовоз
    drawTruck(ctx, 60, s.y);

    // Очки
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px 'Golos Text', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`HI ${String(best).padStart(5, "0")}  ${String(Math.floor(s.score / 5)).padStart(5, "0")}`, W - 20, 30);
    ctx.textAlign = "left";

    if (s.over) {
      ctx.fillStyle = "rgba(15,23,42,0.7)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px 'Golos Text', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("БУМ! Бензовоз разбился", W / 2, H / 2 - 10);
      ctx.font = "14px 'IBM Plex Mono', monospace";
      ctx.fillText(`Очки: ${Math.floor(s.score / 5)}   Рекорд: ${best}`, W / 2, H / 2 + 18);
      ctx.fillText("Пробел / клик / тап — снова", W / 2, H / 2 + 40);
      ctx.textAlign = "left";
    } else if (!s.running) {
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 22px 'Golos Text', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Жми ПРОБЕЛ или тап — поехали!", W / 2, H / 2);
      ctx.textAlign = "left";
    }

    s.rafId = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!open) return;
    stateRef.current.rafId = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(stateRef.current.rafId);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Icon name="Truck" size={18} className="text-blue-600" />
            <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-base">Бензовоз-раннер</h3>
            <span className="ml-2 bg-blue-50 text-blue-700 text-[10px] font-ibm font-semibold px-2 py-0.5 rounded">
              ДЕМО
            </span>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--muted))] flex items-center justify-center">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-4 bg-gradient-to-b from-blue-50 to-white">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onClick={jump}
            onTouchStart={(e) => { e.preventDefault(); jump(); }}
            className="w-full rounded-xl border border-[hsl(var(--border))] cursor-pointer touch-none"
            style={{ aspectRatio: `${W}/${H}` }}
          />
          <div className="flex items-center justify-between mt-3 text-xs font-ibm text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-3">
              <span><kbd className="bg-[hsl(var(--muted))] px-2 py-0.5 rounded">Space</kbd> прыжок</span>
              <span><kbd className="bg-[hsl(var(--muted))] px-2 py-0.5 rounded">Esc</kbd> закрыть</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Очки: <b className="text-[hsl(var(--navy))]">{score}</b></span>
              <span>Рекорд: <b className="text-amber-600">{best}</b></span>
            </div>
          </div>
          {!running && !over && (
            <button onClick={jump}
                    className="mt-3 w-full bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy)/0.9)] text-white py-3 rounded-xl font-golos font-semibold text-sm">
              Начать
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
