import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const PRICES_URL = "https://functions.poehali.dev/cb3618e5-4d1d-41cf-b3ad-80626a79623b";

interface FuelPrice {
  name: string;
  tag: string;
  price: string | null;
  unit: string;
  updated_at: string;
}

const FUEL_COLORS: Record<string, string> = {
  "ДТ-К":   "border-amber-200 bg-amber-50",
  "ДТ-Е5":  "border-amber-200 bg-amber-50",
  "КЕР":    "border-sky-200 bg-sky-50",
  "АИ-92":  "border-green-200 bg-green-50",
  "АИ-95":  "border-emerald-200 bg-emerald-50",
  "М-100":  "border-slate-200 bg-slate-50",
  "БД":     "border-stone-200 bg-stone-50",
};

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

const clients = [
  { icon: "Flame",  label: "Котельные",             desc: "Промышленные и частные. ДТ Евро 5, мазут, печное топливо" },
  { icon: "Truck",  label: "Транспортные компании",  desc: "Оптовые поставки дизеля, заправка автопарков по договору" },
  { icon: "Ship",   label: "Водный транспорт",       desc: "Речные и морские суда, яхты — судовое топливо по СПб и ЛО" },
  { icon: "Train",  label: "Железнодорожный",        desc: "Локомотивы, спецтехника, ТО на путях" },
];

const steps = [
  { n: "01", title: "Напишите Денису",       desc: "ИИ-помощник соберёт данные: топливо, объём, адрес, дату" },
  { n: "02", title: "Менеджер перезвонит",   desc: "В течение 30 минут уточнит финальную цену и детали" },
  { n: "03", title: "Доставка с GPS",        desc: "Отслеживайте машину на карте в реальном времени" },
];

const facts = [
  { val: "2025",    label: "год основания" },
  { val: "500+",    label: "клиентов" },
  { val: "24/7",    label: "поддержка" },
  { val: "СЗ РФ",  label: "регион работы" },
];

export default function Index() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [pricesUpdated, setPricesUpdated] = useState<string>("");
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    fetch(PRICES_URL)
      .then((r) => r.json())
      .then((d) => {
        setPrices(d.prices || []);
        setPricesUpdated(d.updated_at || "");
      })
      .catch(() => {})
      .finally(() => setPricesLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* bg blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[hsl(218_72%_38%/0.07)] blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-[hsl(100_65%_38%/0.05)] blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="section-badge mb-5">
              <Icon name="MapPin" size={12} />
              Санкт-Петербург и Ленинградская область
            </div>

            <h1 className="font-golos font-black text-[hsl(var(--navy))] text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-5">
              Поставки топлива<br />
              <span className="text-[hsl(var(--ocean))]">для бизнеса</span><br />
              в СЗ регионе
            </h1>

            <p className="font-ibm text-[hsl(var(--muted-foreground))] text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              ООО «СИНЕД» — оптовые поставки дизельного топлива Евро 5, мазута, судового и печного топлива.
              Работаем с котельными, транспортными компаниями, флотом и железной дорогой.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={() => navigate("/chat")} className="btn-primary flex items-center gap-2 text-base px-7 py-3.5">
                <Icon name="MessageSquare" size={18} />
                Оставить заявку
              </button>
              <a href="tel:+79052150560"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-[hsl(var(--ocean))] text-[hsl(var(--ocean))] font-golos font-semibold hover:bg-[hsl(var(--ice))] transition-colors text-base">
                <Icon name="Phone" size={18} />
                +7 (905) 215-05-60
              </a>
            </div>

            {/* Facts */}
            <div className="flex flex-wrap gap-6 sm:gap-10">
              {facts.map(({ val, label }) => (
                <div key={label}>
                  <div className="font-golos font-black text-[hsl(var(--ocean))] text-2xl">{val}</div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── О КОМПАНИИ ─── */}
      <section className="py-14 px-4 bg-[hsl(var(--navy))]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 text-[hsl(var(--sky))] text-xs font-golos font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-5">
                О компании
              </div>
              <h2 className="font-golos font-black text-white text-3xl sm:text-4xl mb-5 leading-tight">
                ООО «СИНЕД» —<br />надёжный партнёр
              </h2>
              <p className="font-ibm text-[hsl(var(--sky)/0.75)] leading-relaxed mb-5">
                Зарегистрированы в 2025 году, основной вид деятельности — оптовая торговля жидким топливом (ОКВЭД 46.71).
                Работаем по договорам поставки, выставляем закрывающие документы.
              </p>
              <p className="font-ibm text-[hsl(var(--sky)/0.75)] leading-relaxed">
                Генеральный директор — Шведова Юлия Сергеевна. Юридический адрес: ул. Двинская, д. 10, к. 3, литера А, офис 1020/2в, Санкт-Петербург.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "FileText", label: "ИНН", val: "7805824660" },
                { icon: "Hash",    label: "ОГРН", val: "1257800069383" },
                { icon: "Building2", label: "Банк", val: "Альфа-Банк СПб" },
                { icon: "CreditCard", label: "Р/с", val: "40702810432470004964" },
              ].map((r) => (
                <div key={r.label} className="bg-white/8 border border-white/10 rounded-xl p-4">
                  <Icon name={r.icon} size={18} className="text-[hsl(var(--sky)/0.6)] mb-2" />
                  <div className="font-ibm text-[10px] text-[hsl(var(--sky)/0.5)] uppercase tracking-wider">{r.label}</div>
                  <div className="font-golos font-bold text-white text-sm mt-0.5 break-all">{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── КОГО ОБСЛУЖИВАЕМ ─── */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-badge mb-4">Клиенты</div>
            <h2 className="font-golos font-black text-[hsl(var(--navy))] text-3xl sm:text-4xl">Кого мы обслуживаем</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clients.map((c, i) => (
              <div key={c.label}
                className="card-glass p-6 hover:-translate-y-1 transition-all duration-200 animate-fade-in border border-[hsl(var(--border))]"
                style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--ice))] flex items-center justify-center mb-4">
                  <Icon name={c.icon} size={22} className="text-[hsl(var(--ocean))]" />
                </div>
                <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-base mb-2">{c.label}</h3>
                <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ЦЕНЫ НА ТОПЛИВО ─── */}
      <section className="py-14 px-4 bg-[hsl(var(--ice))]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="section-badge mb-3">
                <Icon name="Fuel" size={12} />
                Ассортимент
              </div>
              <h2 className="font-golos font-black text-[hsl(var(--navy))] text-3xl sm:text-4xl">Виды топлива и цены</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-ibm text-[hsl(var(--muted-foreground))]">
              {pricesLoading ? (
                <span className="animate-pulse">Загружаем цены...</span>
              ) : pricesUpdated ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                  Обновлено {pricesUpdated}
                </>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(prices.length > 0 ? prices : [
              { name: "ДТ для котельных и котлов отопления", tag: "ДТ-К",  price: null, unit: "руб/т", updated_at: "" },
              { name: "Дизельное топливо Евро 5",           tag: "ДТ-Е5", price: null, unit: "руб/т", updated_at: "" },
              { name: "Керосин",                            tag: "КЕР",   price: null, unit: "руб/л", updated_at: "" },
              { name: "Бензин АИ-92",                      tag: "АИ-92", price: null, unit: "руб/л", updated_at: "" },
              { name: "Бензин АИ-95",                      tag: "АИ-95", price: null, unit: "руб/л", updated_at: "" },
              { name: "Мазут М-100",                       tag: "М-100", price: null, unit: "руб/т", updated_at: "" },
              { name: "Битум дорожный",                    tag: "БД",    price: null, unit: "руб/т", updated_at: "" },
            ] as FuelPrice[]).map((f, i) => (
              <div key={f.name}
                className={`card-glass border-2 ${FUEL_COLORS[f.tag] || "border-gray-200 bg-gray-50"} p-5 hover:-translate-y-1 transition-all duration-200 animate-fade-in`}
                style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="fuel-tag">{f.tag}</span>
                  {f.price ? (
                    <span className="font-golos font-black text-[hsl(var(--navy))] text-lg">
                      {parseInt(f.price).toLocaleString("ru-RU")} <span className="text-xs font-ibm font-normal text-[hsl(var(--muted-foreground))]">{f.unit}</span>
                    </span>
                  ) : (
                    <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))] italic">по запросу</span>
                  )}
                </div>
                <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-base mb-3">{f.name}</h3>
                <button onClick={() => navigate("/chat")}
                  className="w-full py-2 rounded-xl border border-[hsl(var(--ocean)/0.3)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ocean))] hover:text-white transition-all">
                  Запросить / заказать
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Icon name="Info" size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="font-ibm text-xs text-amber-800">
              <strong>Цены ориентировочные</strong> — финальная стоимость зависит от объёма, периодичности и адреса доставки.
              Точную цену подтвердит менеджер в течение 30 минут после оформления заявки.
              {pricesUpdated && ` Цены обновляются ежедневно из нашего Telegram-канала.`}
            </p>
          </div>
        </div>
      </section>

      {/* ─── КАК РАБОТАЕМ ─── */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-badge mb-4">
              <Icon name="Zap" size={12} />
              Процесс
            </div>
            <h2 className="font-golos font-black text-[hsl(var(--navy))] text-3xl sm:text-4xl">Как оформить заявку</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div key={s.n} className="card-glass p-6 border border-[hsl(var(--border))] animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="font-golos font-black text-[hsl(var(--ocean)/0.2)] text-5xl leading-none mb-3">{s.n}</div>
                <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-2">{s.title}</h3>
                <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate("/chat")} className="btn-primary flex items-center gap-2 mx-auto px-9 py-4 text-base">
              <Icon name="MessageSquare" size={18} />
              Написать Денису
            </button>
          </div>
        </div>
      </section>

      {/* ─── РЕКВИЗИТЫ ─── */}
      <section className="py-10 px-4 bg-[hsl(var(--muted))] border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto">
          <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-5">Реквизиты ООО «СИНЕД»</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm font-ibm">
            {[
              ["ИНН / КПП", "7805824660 / 780501001"],
              ["ОГРН", "1257800069383 от 01.08.2025"],
              ["Р/с", "40702810432470004964"],
              ["Корр. счёт", "30101810600000000786"],
              ["БИК", "044030786"],
              ["Банк", "Альфа-Банк, филиал Санкт-Петербургский"],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wide">{label}</span>
                <span className="text-[hsl(var(--navy))] font-medium">{val}</span>
              </div>
            ))}
          </div>
          <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mt-5">
            Юридический адрес: 198035, г. Санкт-Петербург, мун. округ Морские Ворота, ул. Двинская, д. 10, к. 3, литера А, офис 1020/2в
          </p>
        </div>
      </section>

      {/* ─── PRIVACY ─── */}
      <div className="px-4 py-5 bg-white border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto flex items-start gap-3">
          <Icon name="Shield" size={16} className="text-[hsl(var(--ocean))] mt-0.5 flex-shrink-0" />
          <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            <strong className="text-[hsl(var(--navy))]">Персональные данные.</strong>{" "}
            Сбор и обработка в соответствии с ФЗ-152. Данные используются исключительно для обработки заявок.{" "}
            <a href="#" className="text-[hsl(var(--ocean))] underline">Политика конфиденциальности</a>.
          </p>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[hsl(var(--navy))] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white flex-shrink-0">
                  <img src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg" alt="СИНЕД" className="w-full h-full object-cover" />
                </div>
                <span className="font-golos font-black text-white text-xl tracking-wider">СИНЕД</span>
              </div>
              <p className="font-ibm text-[hsl(var(--sky)/0.55)] text-sm leading-relaxed">
                ООО «СИНЕД» — оптовая торговля топливом.<br />Северо-Западный регион.
              </p>
            </div>
            <div>
              <h4 className="font-golos font-bold text-white mb-4">Контакты</h4>
              <div className="space-y-2">
                <a href="tel:+79052150560" className="flex items-center gap-2 text-[hsl(var(--sky)/0.7)] hover:text-white text-sm font-ibm transition-colors">
                  <Icon name="Phone" size={14} /> +7 (905) 215-05-60
                </a>
                <a href="mailto:sinedooo@mail.ru" className="flex items-center gap-2 text-[hsl(var(--sky)/0.7)] hover:text-white text-sm font-ibm transition-colors">
                  <Icon name="Mail" size={14} /> sinedooo@mail.ru
                </a>
                <div className="flex items-center gap-2 text-[hsl(var(--sky)/0.7)] text-sm font-ibm">
                  <Icon name="MapPin" size={14} /> СПб, ул. Двинская, д. 10
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-golos font-bold text-white mb-4">Мы в сетях</h4>
              <div className="flex gap-2">
                <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer" title="Telegram"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-[#2AABEE]/30 rounded-xl text-[hsl(var(--sky))] hover:text-white text-xs font-ibm transition-all">
                  <TelegramIcon />Telegram
                </a>
                <a href="https://wa.me/79052150560" target="_blank" rel="noopener noreferrer" title="WhatsApp"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-[#25D366]/30 rounded-xl text-[hsl(var(--sky))] hover:text-white text-xs font-ibm transition-all">
                  <WhatsAppIcon />WhatsApp
                </a>
                <a href="https://vk.com/dizelnoetoplivo_spb" target="_blank" rel="noopener noreferrer" title="ВКонтакте"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-[#4C75A3]/30 rounded-xl text-[hsl(var(--sky))] hover:text-white text-xs font-ibm transition-all">
                  <VKIcon />ВКонтакте
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="font-ibm text-xs text-[hsl(var(--sky)/0.4)]">© 2025 ООО «СИНЕД». Все права защищены.</p>
            <p className="font-ibm text-xs text-[hsl(var(--sky)/0.4)]">Обработка ПД согласно ФЗ-152</p>
          </div>
        </div>
      </footer>
    </div>
  );
}