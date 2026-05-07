import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { addTokens } from "../tokens";

interface Props { open: boolean; onClose: () => void; onTokens?: () => void }

interface Obstacle { x: number; w: number; h: number; type: "barrel" | "cone" }
interface Coin { x: number; y: number; collected: boolean }

const W = 720;
const H = 240;
const GROUND = 200;
const GRAVITY = 0.7;
const JUMP = 13;

export default function TruckGame({ open, onClose, onTokens }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("sined_truck_best") || 0));
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);

  const stateRef = useRef({
    y: GROUND,
    vy: 0,
    speed: 6,
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    spawnIn: 80,
    coinSpawnIn: 120,
    score: 0,
    coinsCollected: 0,
    frame: 0,
    cloudX: 100,
    cloudX2: 400,
    rafId: 0,
    running: false,
    over: false,
    tokenAwarded: false,
  });

  const reset = () => {
    stateRef.current = {
      y: GROUND, vy: 0, speed: 6, obstacles: [], coins: [], spawnIn: 80, coinSpawnIn: 120,
      score: 0, coinsCollected: 0, frame: 0, cloudX: 100, cloudX2: 400, rafId: 0,
      running: true, over: false, tokenAwarded: false,
    };
    setScore(0);
    setOver(false);
    setRunning(true);
    setTokensEarned(0);
  };

  const jump = () => {
    const s = stateRef.current;
    if (s.over) { reset(); return; }
    if (!s.running) { reset(); return; }
    if (s.y >= GROUND) {
      s.vy = -JUMP;
    }
  };

  const drawTruck = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
    // Тень
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(x + 40, GROUND + 18, 38, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Шасси
    ctx.fillStyle = "#374151";
    ctx.fillRect(x + 2, y - 8, 78, 4);

    // Цистерна (СЛЕВА — корпус, скруглённая)
    const tankGrad = ctx.createLinearGradient(0, y - 32, 0, y - 8);
    tankGrad.addColorStop(0, "#60a5fa");
    tankGrad.addColorStop(0.5, "#1e40af");
    tankGrad.addColorStop(1, "#1e3a8a");
    ctx.fillStyle = tankGrad;
    const tx = x + 4, ty = y - 32, tw = 50, th = 24;
    ctx.beginPath();
    ctx.moveTo(tx + 4, ty);
    ctx.lineTo(tx + tw - 2, ty);
    ctx.quadraticCurveTo(tx + tw + 4, ty + th / 2, tx + tw - 2, ty + th);
    ctx.lineTo(tx + 4, ty + th);
    ctx.quadraticCurveTo(tx - 4, ty + th / 2, tx + 4, ty);
    ctx.closePath();
    ctx.fill();

    // Жёлтая полоса
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(tx + 2, ty + 11, tw - 4, 3);

    // Логотип
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("СИНЕД", tx + tw / 2, ty + 8);
    ctx.textAlign = "left";

    // Заклёпки на торцах
    ctx.fillStyle = "#1e3a8a";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(tx + 1, ty + 4 + i * 4, 0.8, 0, Math.PI * 2);
      ctx.arc(tx + tw - 1, ty + 4 + i * 4, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Кабина (СПРАВА)
    const cabX = x + 56, cabY = y - 36;
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(cabX, cabY + 12);
    ctx.lineTo(cabX + 4, cabY);
    ctx.lineTo(cabX + 22, cabY);
    ctx.lineTo(cabX + 22, cabY + 28);
    ctx.lineTo(cabX, cabY + 28);
    ctx.closePath();
    ctx.fill();

    // Лобовое стекло
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.moveTo(cabX + 5, cabY + 3);
    ctx.lineTo(cabX + 19, cabY + 3);
    ctx.lineTo(cabX + 19, cabY + 13);
    ctx.lineTo(cabX + 2, cabY + 13);
    ctx.closePath();
    ctx.fill();
    // Блик
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(cabX + 5, cabY + 3);
    ctx.lineTo(cabX + 11, cabY + 3);
    ctx.lineTo(cabX + 7, cabY + 13);
    ctx.lineTo(cabX + 2, cabY + 13);
    ctx.closePath();
    ctx.fill();

    // Дверная линия
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cabX + 11, cabY + 14);
    ctx.lineTo(cabX + 11, cabY + 27);
    ctx.stroke();

    // Ручка двери
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(cabX + 13, cabY + 18, 3, 1.5);

    // Фара спереди
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(cabX + 21, cabY + 22, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Бампер
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(cabX + 20, cabY + 25, 3, 4);

    // Зеркало
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(cabX + 22, cabY + 4, 2, 4);

    // Выхлопная труба
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(cabX + 1, cabY - 6, 3, 8);
    if (frame % 6 < 3) {
      ctx.fillStyle = "rgba(156,163,175,0.55)";
      ctx.beginPath();
      ctx.arc(cabX + 2, cabY - 10, 3, 0, Math.PI * 2);
      ctx.arc(cabX + 5, cabY - 14, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Колёса с вращением
    const wheelRot = frame * 0.4;
    const wheels = [x + 12, x + 38, x + 66];
    wheels.forEach(wx => {
      ctx.fillStyle = "#111827";
      ctx.beginPath();
      ctx.arc(wx, y - 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9ca3af";
      ctx.beginPath();
      ctx.arc(wx, y - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const a = wheelRot + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(wx, y - 2);
        ctx.lineTo(wx + Math.cos(a) * 3, y - 2 + Math.sin(a) * 3);
        ctx.stroke();
      }
    });
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, o: Obstacle) => {
    if (o.type === "barrel") {
      // Бочка с топливом
      const grad = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
      grad.addColorStop(0, "#991b1b");
      grad.addColorStop(0.5, "#dc2626");
      grad.addColorStop(1, "#991b1b");
      ctx.fillStyle = grad;
      ctx.fillRect(o.x, GROUND - o.h, o.w, o.h);
      ctx.fillStyle = "#7f1d1d";
      ctx.fillRect(o.x, GROUND - o.h, o.w, 2);
      ctx.fillRect(o.x, GROUND - o.h + Math.floor(o.h / 2), o.w, 2);
      ctx.fillRect(o.x, GROUND - 4, o.w, 2);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px monospace";
      ctx.fillText("⚠", o.x + 5, GROUND - o.h / 2 + 3);
    } else {
      // Конус
      const grad = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
      grad.addColorStop(0, "#ea580c");
      grad.addColorStop(0.5, "#f97316");
      grad.addColorStop(1, "#ea580c");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(o.x + o.w / 2, GROUND - o.h);
      ctx.lineTo(o.x, GROUND);
      ctx.lineTo(o.x + o.w, GROUND);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(o.x + 3, GROUND - o.h * 0.6, o.w - 6, 3);
      ctx.fillRect(o.x + 1, GROUND - 6, o.w - 2, 3);
    }
  };

  const drawCoin = (ctx: CanvasRenderingContext2D, c: Coin, frame: number) => {
    if (c.collected) return;
    const pulse = Math.sin(frame * 0.15) * 0.2 + 1;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(pulse, 1);
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
    grad.addColorStop(0, "#fef3c7");
    grad.addColorStop(0.5, "#fbbf24");
    grad.addColorStop(1, "#d97706");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#92400e";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("С", 0, 1);
    ctx.restore();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
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

    s.frame++;
    ctx.clearRect(0, 0, W, H);

    // Небо
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
      // Физика
      s.vy += GRAVITY;
      s.y += s.vy;
      if (s.y > GROUND) { s.y = GROUND; s.vy = 0; }

      // Препятствия
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

      // Монетки СИНЕТ
      s.coinSpawnIn--;
      if (s.coinSpawnIn <= 0) {
        const high = Math.random() < 0.4;
        s.coins.push({
          x: W,
          y: high ? GROUND - 70 : GROUND - 30,
          collected: false,
        });
        s.coinSpawnIn = 180 + Math.floor(Math.random() * 200);
      }

      s.obstacles.forEach(o => { o.x -= s.speed; });
      s.obstacles = s.obstacles.filter(o => o.x + o.w > 0);

      s.coins.forEach(c => { c.x -= s.speed; });
      s.coins = s.coins.filter(c => c.x > -20 && !c.collected);

      // Скорость
      s.speed = 6 + s.score / 200;

      // Очки
      s.score += 1;
      setScore(Math.floor(s.score / 5));

      // Сбор монет
      const truckBox = { x: 60, y: s.y - 36, w: 80, h: 36 };
      for (const c of s.coins) {
        if (!c.collected) {
          const dx = (c.x) - (truckBox.x + truckBox.w / 2);
          const dy = c.y - (truckBox.y + truckBox.h / 2);
          if (Math.abs(dx) < truckBox.w / 2 + 9 && Math.abs(dy) < truckBox.h / 2 + 9) {
            c.collected = true;
            s.coinsCollected++;
          }
        }
      }

      // Коллизия с препятствиями
      for (const o of s.obstacles) {
        if (
          truckBox.x < o.x + o.w - 4 &&
          truckBox.x + truckBox.w - 6 > o.x &&
          truckBox.y < GROUND &&
          truckBox.y + truckBox.h > GROUND - o.h + 4
        ) {
          s.over = true;
          s.running = false;
          const final = Math.floor(s.score / 5);
          if (final > best) {
            setBest(final);
            localStorage.setItem("sined_truck_best", String(final));
          }
          // Награда токенами: 1 токен за каждые 200 очков + по 1 за монетку
          if (!s.tokenAwarded) {
            const reward = Math.floor(final / 200) + s.coinsCollected;
            if (reward > 0) {
              addTokens(reward, "Игра «Бензовоз»: " + final + " очков, монет " + s.coinsCollected);
              setTokensEarned(reward);
              onTokens?.();
            }
            s.tokenAwarded = true;
          }
          setOver(true);
          setRunning(false);
        }
      }
    }

    // Рисуем
    s.obstacles.forEach(o => drawObstacle(ctx, o));
    s.coins.forEach(c => drawCoin(ctx, c, s.frame));
    drawTruck(ctx, 60, s.y, s.frame);

    // HUD
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px 'Golos Text', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`HI ${String(best).padStart(5, "0")}  ${String(Math.floor(s.score / 5)).padStart(5, "0")}`, W - 20, 28);
    ctx.textAlign = "left";

    // Монеты HUD
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(28, 24, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#92400e";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("С", 28, 25);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px 'Golos Text'";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`× ${s.coinsCollected}`, 42, 30);

    if (s.over) {
      ctx.fillStyle = "rgba(15,23,42,0.78)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 26px 'Golos Text', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("БУМ! Бензовоз разбился", W / 2, H / 2 - 24);
      ctx.font = "14px 'IBM Plex Mono', monospace";
      ctx.fillText(`Очки: ${Math.floor(s.score / 5)} · Рекорд: ${best}`, W / 2, H / 2);
      if (tokensEarned > 0) {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 16px 'Golos Text'";
        ctx.fillText(`+${tokensEarned} СИНЕТ-токенов`, W / 2, H / 2 + 22);
      }
      ctx.fillStyle = "#fff";
      ctx.font = "12px 'IBM Plex Mono', monospace";
      ctx.fillText("Пробел / клик / тап — снова", W / 2, H / 2 + 44);
      ctx.textAlign = "left";
    } else if (!s.running) {
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 22px 'Golos Text', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Жми ПРОБЕЛ или тап — поехали!", W / 2, H / 2);
      ctx.font = "12px 'IBM Plex Mono'";
      ctx.fillText("Собирай монеты СИНЕТ за прыжки", W / 2, H / 2 + 22);
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
