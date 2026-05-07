import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const PRICES_URL = "https://functions.poehali.dev/cb3618e5-4d1d-41cf-b3ad-80626a79623b";

const IMG_TRUCK    = "https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/files/f9141a5d-925e-41ea-8a90-b143fac2f693.jpg";
const IMG_BOILER   = "https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/files/a72afbaa-dd80-45b2-b3e0-1185d9d3a6c5.jpg";
const IMG_BARRELS  = "https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/files/70002b14-51c1-46c6-b7ac-b0642901cdf7.jpg";

interface FuelPrice {
  name: string; tag: string; price: string | null; unit: string; updated_at: string;
}

const FUEL_COLORS: Record<string, { border: string; bg: string; dot: string; text: string }> = {
  "ДТ-К":  { border: "border-amber-400/50",  bg: "bg-amber-50/10",  dot: "bg-amber-400",  text: "text-amber-200" },
  "ДТ-Е5": { border: "border-amber-300/40",  bg: "bg-amber-50/8",   dot: "bg-amber-300",  text: "text-amber-200" },
  "КЕР":   { border: "border-sky-400/50",    bg: "bg-sky-50/10",    dot: "bg-sky-400",    text: "text-sky-200" },
  "АИ-92": { border: "border-emerald-400/40",bg: "bg-emerald-50/8", dot: "bg-emerald-400",text: "text-emerald-200" },
  "АИ-95": { border: "border-emerald-300/40",bg: "bg-emerald-50/8", dot: "bg-emerald-300",text: "text-emerald-200" },
  "М-100": { border: "border-slate-400/40",  bg: "bg-slate-50/8",   dot: "bg-slate-400",  text: "text-slate-300" },
  "БД":    { border: "border-stone-400/40",  bg: "bg-stone-50/8",   dot: "bg-stone-400",  text: "text-stone-300" },
};

const DEFAULT_FUELS: FuelPrice[] = [
  { name: "ДТ для котельных и котлов отопления", tag: "ДТ-К",  price: null, unit: "руб/т", updated_at: "" },
  { name: "Дизельное топливо Евро 5",            tag: "ДТ-Е5", price: null, unit: "руб/т", updated_at: "" },
  { name: "Керосин",                             tag: "КЕР",   price: null, unit: "руб/л", updated_at: "" },
  { name: "Бензин АИ-92",                        tag: "АИ-92", price: null, unit: "руб/л", updated_at: "" },
  { name: "Бензин АИ-95",                        tag: "АИ-95", price: null, unit: "руб/л", updated_at: "" },
  { name: "Мазут М-100",                         tag: "М-100", price: null, unit: "руб/т", updated_at: "" },
  { name: "Битум дорожный",                      tag: "БД",    price: null, unit: "руб/т", updated_at: "" },
];

const clients = [
  { icon: "Flame",  label: "Котельные",                 desc: "Промышленные и частные котельные, котлы отопления — поставляем дизельное топливо и мазут" },
  { icon: "Truck",  label: "Транспортные компании",      desc: "Автопарки и перевозчики — дизельное топливо Евро 5, бензин АИ-92/95 оптом" },
  { icon: "Ship",   label: "Водный транспорт",           desc: "Речные и морские суда, яхты — судовое и дизельное топливо по Северо-западному региону" },
  { icon: "Train",  label: "Железнодорожный транспорт", desc: "Локомотивы, дрезины, путейская техника — дизельное топливо и керосин" },
];

const steps = [
  { n: "01", icon: "MessageSquare", title: "Напишите Денису",     desc: "ИИ-консультант соберёт данные: топливо, объём, адрес и дату" },
  { n: "02", icon: "Phone",         title: "Менеджер перезвонит", desc: "В течение 30 минут для окончательного подтверждения отгрузки" },
  { n: "03", icon: "Navigation",    title: "Доставка с GPS",      desc: "Отслеживайте автомобиль в реальном времени на карте" },
];

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const VKIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
  </svg>
);

/* Иконка Макс (ICQ / Mail.ru Messenger) */
const MaxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.055 4.636c1.97 0 3.567 1.597 3.567 3.567s-1.597 3.566-3.567 3.566c-1.97 0-3.566-1.597-3.566-3.566 0-1.97 1.597-3.567 3.566-3.567zm5.484 9.053c-.59.59-1.55.62-2.18.082l-1.304-.893-1.304.893c-.314.268-.697.399-1.087.399-.39 0-.773-.131-1.087-.399l-1.304-.893-1.304.893c-.63.537-1.59.508-2.18-.082a1.54 1.54 0 010-2.18l1.576-1.576a5.045 5.045 0 004.398 2.607 5.045 5.045 0 004.398-2.607l1.378 1.378a1.54 1.54 0 010 2.378z"/>
  </svg>
);

export default function Index() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [pricesUpdated, setPricesUpdated] = useState("");
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    fetch(PRICES_URL).then(r => r.json()).then(d => {
      setPrices(d.prices || []);
      setPricesUpdated(d.updated_at || "");
    }).catch(() => {}).finally(() => setPricesLoading(false));
  }, []);

  const fuels = prices.length > 0 ? prices : DEFAULT_FUELS;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-20 overflow-hidden">
        {/* Фоновая картинка */}
        <div className="absolute inset-0">
          <img src={IMG_TRUCK} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy))/0.92] via-[hsl(var(--navy))/0.80] to-[hsl(var(--navy))/0.40]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy))/0.6] to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-[hsl(var(--sky))] text-xs font-golos font-semibold px-4 py-2 rounded-full uppercase tracking-wider mb-6">
              <Icon name="MapPin" size={12} />
              Северо-западный регион — СПб и Ленинградская область
            </div>

            <h1 className="font-golos font-black text-white text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] mb-6">
              Поставки<br />
              <span className="text-[hsl(var(--sky))]">топлива</span><br />
              для вашего бизнеса
            </h1>

            <p className="font-ibm text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              ООО «СИНЕД» — оптовые поставки дизельного топлива Евро 5, мазута, керосина и битума.
              Котельные, транспорт, флот и железная дорога Северо-западного региона.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={() => navigate("/chat")}
                className="btn-green flex items-center gap-2 text-base px-7 py-3.5">
                <Icon name="MessageSquare" size={18} />
                Оставить заявку
              </button>
              <a href="tel:+79052150560"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/40 font-golos font-semibold hover:bg-white/10 transition-colors text-base text-green-50">
                <Icon name="Phone" size={18} />
                +7 (905) 215-05-60
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[["2025", "год основания"], ["500+", "клиентов"], ["24/7", "поддержка"], ["7", "видов топлива"]].map(([v, l]) => (
                <div key={l}>
                  <div className="font-golos font-black text-[hsl(var(--sky))] text-2xl">{v}</div>
                  <div className="font-ibm text-white/55 text-xs mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ КОГО ОБСЛУЖИВАЕМ ═══ */}
      <section className="py-16 px-4 bg-[hsl(var(--navy))]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-[hsl(var(--sky))] text-xs font-golos font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
              Клиенты
            </div>
            <h2 className="font-golos font-black text-white text-3xl sm:text-4xl">Кого мы обслуживаем</h2>
            <p className="font-ibm text-white/50 text-sm mt-2">Северо-западный регион — Санкт-Петербург и Ленинградская область</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clients.map((c, i) => (
              <div key={c.label}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[hsl(var(--sky)/0.3)] rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ocean)/0.4)] flex items-center justify-center mb-4">
                  <Icon name={c.icon} size={22} className="text-[hsl(var(--sky))]" />
                </div>
                <h3 className="font-golos font-bold text-white text-base mb-2">{c.label}</h3>
                <p className="font-ibm text-white/55 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ФОТО + ПРЕИМУЩЕСТВА ═══ */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Фото */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img src={IMG_BOILER} alt="Котельная" className="w-full h-full object-cover" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-[hsl(var(--sky)/0.2)]">
                <div className="font-golos font-black text-[hsl(var(--ocean))] text-2xl">7</div>
                <div className="font-ibm text-[hsl(var(--navy))] text-xs font-medium">видов топлива</div>
              </div>
              <div className="absolute -top-4 -left-4 bg-[hsl(var(--navy))] rounded-2xl shadow-xl p-4">
                <div className="font-golos font-black text-[hsl(var(--sky))] text-xl">24/7</div>
                <div className="font-ibm text-white/70 text-xs">поддержка</div>
              </div>
            </div>

            {/* Преимущества */}
            <div>
              <div className="section-badge mb-5">
                Почему СИНЕД
              </div>
              <h2 className="font-golos font-black text-[hsl(var(--navy))] text-3xl sm:text-4xl mb-6 leading-tight">
                Надёжные поставки<br />с подтверждёнными документами
              </h2>
              <div className="space-y-4">
                {[
                  { icon: "FileCheck",   title: "Полный пакет документов",      desc: "Договор поставки, счёт, товарная накладная, сертификат качества" },
                  { icon: "Navigation",  title: "GPS-отслеживание в реальном времени", desc: "Следите за местоположением водителя прямо в личном кабинете" },
                  { icon: "Clock",       title: "Ответ за 30 минут",            desc: "Менеджер перезвонит для окончательного подтверждения отгрузки" },
                  { icon: "MapPin",      title: "Северо-западный регион",       desc: "Работаем по всему Санкт-Петербургу и Ленинградской области" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ice))] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name={item.icon} size={18} className="text-[hsl(var(--ocean))]" />
                    </div>
                    <div>
                      <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-0.5">{item.title}</div>
                      <div className="font-ibm text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/chat")} className="btn-primary flex items-center gap-2 mt-8">
                <Icon name="MessageSquare" size={16} />
                Оставить заявку
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ЦЕНЫ НА ТОПЛИВО ═══ */}
      <section className="py-16 px-4 bg-gradient-to-br from-[hsl(var(--navy))] to-[hsl(218_55%_18%)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="section-badge mb-4">
                <Icon name="Fuel" size={12} />
                Ассортимент
              </div>
              <h2 className="font-golos font-black text-white text-3xl sm:text-4xl">Виды топлива и цены</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-ibm text-white/40">
              {pricesLoading ? (
                <span className="animate-pulse">Загрузка цен...</span>
              ) : pricesUpdated ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--sky))] animate-pulse-dot" />
                  Обновлено {pricesUpdated}
                </>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fuels.map((f, i) => {
              const c = FUEL_COLORS[f.tag] || { border: "border-white/20", bg: "bg-white/5", dot: "bg-white/50", text: "text-white/70" };
              return (
                <div key={f.name}
                  className={`${c.bg} border ${c.border} rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 animate-fade-in`}
                  style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                    <span className={`font-ibm text-xs font-semibold ${c.text}`}>{f.tag}</span>
                    {f.price && (
                      <span className="ml-auto font-golos font-black text-white text-base">
                        {parseInt(f.price).toLocaleString("ru-RU")}
                        <span className="text-[10px] font-ibm font-normal text-white/50 ml-1">{f.unit}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-golos font-bold text-white text-sm leading-snug mb-3">{f.name}</h3>
                  {!f.price && (
                    <div className="font-ibm text-[10px] text-white/40 italic mb-3">цена — по запросу</div>
                  )}
                  <button onClick={() => navigate("/chat")}
                    className="w-full py-2 rounded-xl bg-white/10 border border-white/15 text-white/80 text-xs font-ibm font-medium hover:bg-[hsl(var(--ocean))] hover:text-white hover:border-transparent transition-all">
                    Запросить / заказать
                  </button>
                </div>
              );
            })}
            {/* Остальное по запросу */}
            <div className="bg-white/8 border border-white/20 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="font-golos font-bold text-white text-sm mb-2">Другие позиции</div>
                <p className="font-ibm text-white/50 text-xs leading-relaxed">Судовое топливо, печное, авиационный керосин и другие — по запросу</p>
              </div>
              <button onClick={() => navigate("/chat")}
                className="mt-4 w-full py-2 rounded-xl bg-white/10 border border-white/20 text-[hsl(var(--sky))] text-xs font-ibm font-medium hover:bg-[hsl(var(--ocean))] hover:text-white hover:border-transparent transition-all">
                Уточнить
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 bg-amber-900/30 border border-amber-500/30 rounded-xl px-4 py-3">
            <Icon name="Info" size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="font-ibm text-xs text-amber-200/80 leading-relaxed">
              <strong className="text-amber-300">Цены ориентировочные</strong> — финальная стоимость зависит от объёма, периодичности и адреса доставки.
              Менеджер перезвонит для окончательного подтверждения отгрузки.{" "}
              Обновляются ежедневно из нашего{" "}
              <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer"
                className="text-amber-300 hover:text-white underline underline-offset-2 transition-colors">
                Telegram-канала @toplivospb
              </a>.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ ФОТО + КАК РАБОТАЕМ ═══ */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="section-badge mb-5">
                <Icon name="Zap" size={12} />
                Как это работает
              </div>
              <h2 className="font-golos font-black text-[hsl(var(--navy))] text-3xl sm:text-4xl mb-8">Три шага до доставки</h2>
              <div className="space-y-6">
                {steps.map((s, i) => (
                  <div key={s.n} className="flex items-start gap-5 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[hsl(var(--ocean))] flex items-center justify-center shadow-md">
                      <Icon name={s.icon} size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-golos font-black text-[hsl(var(--ocean)/0.3)] text-xs">{s.n}</span>
                        <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-base">{s.title}</h3>
                      </div>
                      <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/chat")} className="btn-green flex items-center gap-2 mt-8">
                <Icon name="MessageSquare" size={16} />
                Написать Денису
              </button>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img src={IMG_BARRELS} alt="Хранение топлива" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-[hsl(var(--sky)/0.2)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ocean))] flex items-center justify-center flex-shrink-0">
                    <Icon name="ShieldCheck" size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Сертифицированное топливо</div>
                    <div className="font-ibm text-[hsl(var(--muted-foreground))] text-xs">Сертификат качества с каждой поставкой</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 px-4 bg-[hsl(var(--navy))]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-golos font-black text-white text-3xl sm:text-4xl mb-4">
            Нужно топливо?
          </h2>
          <p className="font-ibm text-white/80 text-base mb-8 max-w-xl mx-auto">
            Напишите нашему ИИ-консультанту Денису — он поможет подобрать топливо и оформить заявку за 2 минуты
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate("/chat")}
              className="flex items-center gap-2 bg-white text-[hsl(var(--navy))] font-golos font-bold px-8 py-4 rounded-xl hover:bg-[hsl(var(--ice))] transition-colors shadow-lg text-base">
              <Icon name="MessageSquare" size={18} />
              Оставить заявку
            </button>
            <a href="tel:+79052150560"
              className="flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 text-white font-golos font-semibold px-8 py-4 rounded-xl hover:bg-white/25 transition-colors text-base">
              <Icon name="Phone" size={18} />
              +7 (905) 215-05-60
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[hsl(var(--navy))] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow">
                  <img src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg" alt="СИНЕД" className="w-full h-full object-cover" />
                </div>
                <span className="font-golos font-black text-white text-xl">СИНЕД</span>
              </div>
              <p className="font-ibm text-white/45 text-sm leading-relaxed mb-4">
                ООО «СИНЕД» — оптовые поставки топлива.<br />Северо-западный регион.
              </p>
              <button onClick={() => navigate("/about")} className="font-ibm text-[hsl(var(--sky)/0.6)] hover:text-[hsl(var(--lime2))] text-sm transition-colors underline">
                О компании и реквизиты →
              </button>
            </div>
            <div>
              <h4 className="font-golos font-bold text-white mb-4">Контакты</h4>
              <div className="space-y-2.5">
                <a href="tel:+79052150560" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-ibm transition-colors">
                  <Icon name="Phone" size={14} className="text-[hsl(var(--lime)/0.7)]" />
                  +7 (905) 215-05-60
                </a>
                <a href="mailto:sinedooo@mail.ru" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-ibm transition-colors">
                  <Icon name="Mail" size={14} className="text-[hsl(var(--lime)/0.7)]" />
                  sinedooo@mail.ru
                </a>
                <div className="flex items-center gap-2 text-white/60 text-sm font-ibm">
                  <Icon name="MapPin" size={14} className="text-[hsl(var(--lime)/0.7)]" />
                  СПб, ул. Двинская, д. 10
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-golos font-bold text-white mb-4">Мы в сетях</h4>
              <div className="flex flex-col gap-2">
                <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/8 hover:bg-[#2AABEE]/20 border border-white/10 hover:border-[#2AABEE]/40 rounded-xl px-4 py-2.5 text-white/70 hover:text-white text-sm font-ibm transition-all">
                  <TelegramIcon />Telegram — @toplivospb
                </a>
                <div className="relative group">
                  <a href="https://wa.me/79052150560" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/8 hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/40 rounded-xl px-4 py-2.5 text-white/70 hover:text-white text-sm font-ibm transition-all w-full">
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                    <span className="ml-auto text-white/25 text-[10px]">*</span>
                  </a>
                  {/* Всплывающая сноска */}
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[hsl(var(--navy))] border border-white/15 rounded-xl px-3 py-2 text-[10px] font-ibm text-white/60 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    * WhatsApp принадлежит Meta — организации, признанной экстремистской и запрещённой в Российской Федерации
                  </div>
                </div>
                <a href="https://max.ru/sined" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/8 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 rounded-xl px-4 py-2.5 text-white/70 hover:text-white text-sm font-ibm transition-all">
                  <MaxIcon />Макс
                </a>
                <a href="https://vk.com/dizelnoetoplivo_spb" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/8 hover:bg-[#4C75A3]/20 border border-white/10 hover:border-[#4C75A3]/40 rounded-xl px-4 py-2.5 text-white/70 hover:text-white text-sm font-ibm transition-all">
                  <VKIcon />ВКонтакте
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="font-ibm text-xs text-white/30">© 2025 ООО «СИНЕД». Все права защищены.</p>
            <p className="font-ibm text-xs text-white/30">Обработка персональных данных согласно ФЗ-152</p>
          </div>
        </div>
      </footer>
    </div>
  );
}