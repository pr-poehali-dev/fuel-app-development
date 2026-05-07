import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

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

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-6 text-sm font-ibm text-[hsl(var(--muted-foreground))]">
          <button onClick={() => navigate("/")} className="hover:text-[hsl(var(--ocean))] transition-colors">Главная</button>
          <Icon name="ChevronRight" size={14} />
          <span className="text-[hsl(var(--navy))]">О компании</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[hsl(var(--green-bg))] border border-[hsl(var(--lime)/0.3)] text-[hsl(var(--lime))] text-xs font-golos font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
            О компании
          </div>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-3xl sm:text-4xl mb-3">
            ООО «СИНЕД»
          </h1>
          <p className="font-ibm text-[hsl(var(--muted-foreground))] text-base leading-relaxed max-w-2xl">
            Оптовая торговля жидким топливом в Северо-западном регионе России. Работаем с котельными,
            транспортными компаниями, флотом и железнодорожным транспортом.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-4">
            {/* Общие сведения */}
            <div className="card-glass p-6 border border-[hsl(var(--border))]">
              <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-5 flex items-center gap-2">
                <Icon name="Building2" size={18} className="text-[hsl(var(--ocean))]" />
                Общие сведения
              </h2>
              <div className="space-y-3">
                {[
                  ["Полное наименование", "Общество с ограниченной ответственностью «СИНЕД»"],
                  ["Краткое наименование", "ООО «СИНЕД»"],
                  ["ОГРН", "1257800069383 от 01.08.2025"],
                  ["ИНН / КПП", "7805824660 / 780501001"],
                  ["Генеральный директор", "Шведова Юлия Сергеевна"],
                  ["Основной вид деятельности", "ОКВЭД 46.71 — Торговля оптовая жидким топливом"],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-[hsl(var(--border))] last:border-0">
                    <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide sm:w-48 flex-shrink-0">{label}</span>
                    <span className="font-ibm text-sm text-[hsl(var(--navy))] font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Адрес */}
            <div className="card-glass p-6 border border-[hsl(var(--border))]">
              <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-5 flex items-center gap-2">
                <Icon name="MapPin" size={18} className="text-[hsl(var(--lime))]" />
                Адрес
              </h2>
              <p className="font-ibm text-sm text-[hsl(var(--navy))] leading-relaxed">
                198035, г. Санкт-Петербург,<br />
                муниципальный округ Морские Ворота,<br />
                ул. Двинская, д. 10, к. 3, литера А, офис 1020/2в
              </p>
            </div>

            {/* Банковские реквизиты */}
            <div className="card-glass p-6 border border-[hsl(var(--border))]">
              <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-5 flex items-center gap-2">
                <Icon name="CreditCard" size={18} className="text-[hsl(var(--ocean))]" />
                Банковские реквизиты
              </h2>
              <div className="space-y-3">
                {[
                  ["Банк", "Филиал «Санкт-Петербургский» АО «Альфа-Банк»"],
                  ["БИК", "044030786"],
                  ["Расчётный счёт", "40702810432470004964"],
                  ["Корреспондентский счёт", "30101810600000000786"],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-[hsl(var(--border))] last:border-0">
                    <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide sm:w-48 flex-shrink-0">{label}</span>
                    <span className="font-ibm text-sm text-[hsl(var(--navy))] font-medium font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Виды деятельности */}
            <div className="card-glass p-6 border border-[hsl(var(--border))]">
              <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-5 flex items-center gap-2">
                <Icon name="Layers" size={18} className="text-[hsl(var(--lime))]" />
                Виды деятельности
              </h2>
              <div className="space-y-2">
                {[
                  ["46.71",   "Торговля оптовая твёрдым, жидким и газообразным топливом", true],
                  ["46.71.1", "Торговля оптовая твёрдым топливом", false],
                  ["46.71.2", "Торговля оптовая моторным топливом, включая авиационный бензин", false],
                  ["46.71.9", "Торговля оптовая прочим топливом и подобными продуктами", false],
                  ["46.73.4", "Торговля оптовая лакокрасочными материалами", false],
                  ["46.75",   "Торговля оптовая химическими продуктами", false],
                ].map(([code, name, main]) => (
                  <div key={code as string} className="flex items-start gap-3 py-2">
                    <span className={`font-ibm text-xs font-mono px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${main ? "bg-[hsl(var(--green-bg))] text-[hsl(var(--lime))] font-bold" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
                      {code as string}
                    </span>
                    <span className={`font-ibm text-sm ${main ? "text-[hsl(var(--navy))] font-semibold" : "text-[hsl(var(--muted-foreground))]"}`}>
                      {name as string}
                      {main && <span className="ml-2 text-[10px] bg-[hsl(var(--lime)/0.15)] text-[hsl(var(--lime))] px-1.5 py-0.5 rounded">основной</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Сайдбар — контакты */}
          <div className="space-y-4">
            <div className="card-glass p-5 border border-[hsl(var(--border))]">
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] mb-4 flex items-center gap-2">
                <Icon name="Phone" size={16} className="text-[hsl(var(--lime))]" />
                Контакты
              </h3>
              <div className="space-y-3">
                <a href="tel:+79052150560"
                  className="flex items-center gap-3 w-full py-3 px-4 bg-[hsl(var(--navy))] text-white rounded-xl hover:bg-[hsl(var(--ocean))] transition-colors font-ibm text-sm font-medium">
                  <Icon name="Phone" size={15} />
                  +7 (905) 215-05-60
                </a>
                <a href="mailto:sinedooo@mail.ru"
                  className="flex items-center gap-3 w-full py-3 px-4 bg-[hsl(var(--muted))] text-[hsl(var(--navy))] rounded-xl hover:bg-[hsl(var(--ice))] transition-colors font-ibm text-sm font-medium">
                  <Icon name="Mail" size={15} className="text-[hsl(var(--ocean))]" />
                  sinedooo@mail.ru
                </a>
              </div>
            </div>

            {/* Соцсети */}
            <div className="card-glass p-5 border border-[hsl(var(--border))]">
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] mb-4">Мы в сетях</h3>
              <div className="space-y-2">
                <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full py-2.5 px-4 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--navy))] rounded-xl hover:bg-[#2AABEE]/15 hover:border-[#2AABEE]/40 transition-all font-ibm text-sm">
                  <TelegramIcon /><span>Telegram</span><span className="ml-auto text-[hsl(var(--muted-foreground))] text-xs">@toplivospb</span>
                </a>
                <a href="https://wa.me/79052150560" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full py-2.5 px-4 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--navy))] rounded-xl hover:bg-[#25D366]/15 hover:border-[#25D366]/40 transition-all font-ibm text-sm">
                  <WhatsAppIcon /><span>WhatsApp</span>
                </a>
                <a href="https://vk.com/dizelnoetoplivo_spb" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full py-2.5 px-4 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--navy))] rounded-xl hover:bg-[#4C75A3]/15 hover:border-[#4C75A3]/40 transition-all font-ibm text-sm">
                  <VKIcon /><span>ВКонтакте</span>
                </a>
              </div>
            </div>

            {/* Политика ПД */}
            <div className="bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Icon name="Shield" size={14} className="text-[hsl(var(--ocean))] mt-0.5 flex-shrink-0" />
                <p className="font-ibm text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Обработка персональных данных осуществляется в соответствии с ФЗ-152 «О персональных данных».
                </p>
              </div>
            </div>

            <button onClick={() => navigate("/chat")} className="w-full btn-green flex items-center justify-center gap-2">
              <Icon name="MessageSquare" size={16} />
              Оставить заявку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
