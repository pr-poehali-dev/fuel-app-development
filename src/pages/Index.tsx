import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const clients = [
  { icon: "Flame", label: "Котельные", desc: "Промышленные и частные. ДТ, мазут, дизельное топливо" },
  { icon: "Truck", label: "Транспортные компании", desc: "Оптовые поставки дизеля, заправка автопарков" },
  { icon: "Ship", label: "Водный транспорт", desc: "Речные и морские суда, яхты — судовое топливо" },
  { icon: "Train", label: "Железнодорожный", desc: "Локомотивы, спецтехника, ТО на путях" },
];

const fuels = [
  { name: "Дизельное топливо", tag: "ДТ", color: "bg-amber-50 border-amber-200" },
  { name: "Мазут", tag: "М-100", color: "bg-slate-50 border-slate-200" },
  { name: "Судовое топливо", tag: "СТ", color: "bg-blue-50 border-blue-200" },
  { name: "Печное топливо", tag: "ПТ", color: "bg-orange-50 border-orange-200" },
  { name: "Бензин АИ-92/95", tag: "АИ", color: "bg-green-50 border-green-200" },
  { name: "Биодизель", tag: "В100", color: "bg-emerald-50 border-emerald-200" },
];

const steps = [
  { n: "01", title: "Напишите в чат", desc: "ИИ-помощник соберёт все данные: вид топлива, объём, адрес и сроки" },
  { n: "02", title: "Менеджер подтвердит", desc: "В течение 30 минут свяжется с вами и уточнит финальную цену" },
  { n: "03", title: "Доставка и отслеживание", desc: "Отслеживайте машину на карте в реальном времени" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(199_85%_32%/0.06)] blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(172_60%_35%/0.05)] blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="section-badge mb-6">
                <Icon name="MapPin" size={12} />
                Санкт-Петербург и Ленинградская область
              </div>
              <h1 className="font-golos font-black text-[hsl(var(--navy))] text-5xl lg:text-6xl leading-[1.1] mb-6">
                Надёжные поставки<br />
                <span className="text-[hsl(var(--ocean))]">топлива</span> для<br />
                вашего бизнеса
              </h1>
              <p className="font-ibm text-[hsl(var(--muted-foreground))] text-lg leading-relaxed mb-8 max-w-xl">
                СИНЕД — поставщик топлива для котельных, транспортных, судоходных и железнодорожных компаний
                Северо-Западного региона. Работаем с 2010 года.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate("/chat")} className="btn-primary text-base px-8 py-4">
                  <span className="flex items-center gap-2">
                    <Icon name="MessageSquare" size={18} />
                    Оформить заявку
                  </span>
                </button>
                <a href="tel:+78121234567"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[hsl(var(--ocean))] text-[hsl(var(--ocean))] font-golos font-semibold hover:bg-[hsl(var(--ice))] transition-colors text-base">
                  <Icon name="Phone" size={18} />
                  +7 (812) 123-45-67
                </a>
              </div>
              <div className="flex items-center gap-8 mt-10">
                {[["10+", "лет на рынке"], ["500+", "клиентов"], ["24/7", "поддержка"]].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <div className="font-golos font-black text-[hsl(var(--ocean))] text-2xl">{val}</div>
                    <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="animate-fade-in hidden lg:flex justify-center" style={{ animationDelay: "0.15s" }}>
              <div className="relative w-full max-w-lg">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-[hsl(var(--navy))] to-[hsl(var(--ocean))] shadow-2xl overflow-hidden relative">
                  <div className="absolute inset-0 map-grid opacity-20" />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none">
                    <path d="M80 320 Q 200 280 240 200 Q 280 120 320 80" stroke="hsl(200 80% 60%)" strokeWidth="2" strokeDasharray="8 4" opacity="0.6" />
                    <circle cx="80" cy="320" r="8" fill="hsl(172 60% 35%)" />
                    <circle cx="80" cy="320" r="20" fill="hsl(172 60% 35%)" fillOpacity="0.2" />
                    <circle cx="320" cy="80" r="8" fill="hsl(200 80% 60%)" />
                    <circle cx="200" cy="200" r="14" fill="white" fillOpacity="0.9" />
                    <circle cx="200" cy="200" r="28" fill="white" fillOpacity="0.12" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-40">
                    <Icon name="Truck" size={64} />
                  </div>
                </div>
                {/* Floating card 1 */}
                <div className="absolute -left-10 top-1/4 card-glass px-4 py-3 animate-fade-in shadow-lg" style={{ animationDelay: "0.4s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                    <span className="font-ibm text-xs font-medium text-[hsl(var(--navy))]">Водитель в пути</span>
                  </div>
                  <div className="font-golos font-bold text-sm text-[hsl(var(--ocean))] mt-1">~45 мин до точки</div>
                </div>
                {/* Floating card 2 */}
                <div className="absolute -right-8 bottom-1/4 card-glass px-4 py-3 animate-fade-in shadow-lg" style={{ animationDelay: "0.55s" }}>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Доставлено</div>
                  <div className="font-golos font-bold text-sm text-[hsl(var(--navy))]">5 000 л ДТ</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">✓ Сегодня, 14:30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-16 px-4 bg-[hsl(var(--navy))]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-[hsl(var(--sky))] text-xs font-golos font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
              Клиенты
            </div>
            <h2 className="font-golos font-black text-white text-4xl">Кого мы обслуживаем</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clients.map((c, i) => (
              <div key={c.label}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-12 h-12 rounded-xl bg-[hsl(199_85%_32%/0.4)] flex items-center justify-center mb-4">
                  <Icon name={c.icon} size={24} className="text-[hsl(var(--sky))]" />
                </div>
                <h3 className="font-golos font-bold text-white text-base mb-2">{c.label}</h3>
                <p className="font-ibm text-[hsl(var(--sky)/0.65)] text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fuels */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-badge mb-4">
              <Icon name="Fuel" size={12} />
              Ассортимент
            </div>
            <h2 className="font-golos font-black text-[hsl(var(--navy))] text-4xl mb-3">Виды топлива</h2>
            <p className="font-ibm text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
              Точную стоимость уточняйте у менеджера — цена зависит от объёма, периодичности и адреса доставки
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fuels.map((f, i) => (
              <div key={f.name}
                className={`card-glass border-2 ${f.color} p-6 hover:-translate-y-1 transition-all duration-200 animate-fade-in`}
                style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="fuel-tag">{f.tag}</span>
                  <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">цена по запросу</span>
                </div>
                <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-lg">{f.name}</h3>
                <button
                  onClick={() => navigate("/chat")}
                  className="mt-4 w-full py-2 rounded-xl border border-[hsl(var(--ocean)/0.3)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ice))] transition-colors">
                  Запросить цену
                </button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center font-ibm text-sm text-[hsl(var(--muted-foreground))]">
            * Финальная цена формируется индивидуально и подтверждается менеджером
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-[hsl(var(--ice))]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-badge mb-4">
              <Icon name="Zap" size={12} />
              Процесс
            </div>
            <h2 className="font-golos font-black text-[hsl(var(--navy))] text-4xl">Как оформить заявку</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="card-glass p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="font-golos font-black text-[hsl(var(--ocean)/0.2)] text-5xl leading-none mb-4">{s.n}</div>
                <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-2">{s.title}</h3>
                <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate("/chat")} className="btn-primary text-base px-10 py-4">
              <span className="flex items-center gap-2">
                <Icon name="MessageSquare" size={18} />
                Начать оформление
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Privacy notice */}
      <section className="py-8 px-4 bg-white border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-3 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] rounded-xl p-4">
            <Icon name="Shield" size={18} className="text-[hsl(var(--ocean))] mt-0.5 flex-shrink-0" />
            <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              <strong className="text-[hsl(var(--navy))]">Персональные данные.</strong>{" "}
              При оформлении заявки мы собираем только необходимые данные (имя, телефон, адрес доставки) в соответствии с ФЗ-152 «О персональных данных».
              Данные используются исключительно для обработки вашего заказа. Нажимая «Оформить заявку», вы соглашаетесь с{" "}
              <a href="#" className="text-[hsl(var(--ocean))] underline">Политикой конфиденциальности</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--navy))] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center">
                  <span className="text-white font-golos font-black text-base">С</span>
                </div>
                <span className="font-golos font-black text-white text-xl tracking-wider">СИНЕД</span>
              </div>
              <p className="font-ibm text-[hsl(var(--sky)/0.6)] text-sm leading-relaxed">
                Топливная компания Северо-Западного региона.<br />Санкт-Петербург и Ленинградская область.
              </p>
            </div>
            <div>
              <h4 className="font-golos font-bold text-white mb-4">Контакты</h4>
              <div className="space-y-2">
                <a href="tel:+78121234567" className="flex items-center gap-2 text-[hsl(var(--sky)/0.7)] hover:text-white text-sm font-ibm transition-colors">
                  <Icon name="Phone" size={14} /> +7 (812) 123-45-67
                </a>
                <a href="mailto:sinedooo@mail.ru" className="flex items-center gap-2 text-[hsl(var(--sky)/0.7)] hover:text-white text-sm font-ibm transition-colors">
                  <Icon name="Mail" size={14} /> sinedooo@mail.ru
                </a>
                <div className="flex items-center gap-2 text-[hsl(var(--sky)/0.7)] text-sm font-ibm">
                  <Icon name="MapPin" size={14} /> г. Санкт-Петербург
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-golos font-bold text-white mb-4">Мы в сетях</h4>
              <div className="grid grid-cols-2 gap-2">
                {[["TG", "Telegram", "https://t.me/toplivospb"], ["WA", "WhatsApp", "https://wa.me/78121234567"], ["ВК", "ВКонтакте", "https://vk.com/dizelnoetoplivo_spb"]].map(([s, name, href]) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-[hsl(var(--sky))] hover:text-white text-sm font-ibm transition-all">
                    <span className="font-golos font-bold text-xs">{s}</span>{name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="font-ibm text-xs text-[hsl(var(--sky)/0.4)]">© 2024 СИНЕД. Все права защищены.</p>
            <p className="font-ibm text-xs text-[hsl(var(--sky)/0.4)]">Обработка ПД в соответствии с ФЗ-152</p>
          </div>
        </div>
      </footer>
    </div>
  );
}