import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";

const navItems = [
  { label: "Главная",       path: "/",       icon: "Home" },
  { label: "Оставить заявку", path: "/chat", icon: "MessageSquare" },
  { label: "О компании",    path: "/about",  icon: "Building2" },
  { label: "Кабинет",       path: "/cabinet", icon: "User" },
];

// SVG иконки соцсетей
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

/* Иконка Макс (OK.ru / ICQ Max) — официальный цвет #F07E16 */
const MaxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.055 4.636c1.97 0 3.567 1.597 3.567 3.567s-1.597 3.566-3.567 3.566c-1.97 0-3.566-1.597-3.566-3.566 0-1.97 1.597-3.567 3.566-3.567zm5.484 9.053c-.59.59-1.55.62-2.18.082l-3.304-2.26-3.304 2.26c-.63.537-1.59.508-2.18-.082a1.54 1.54 0 010-2.18l2.576-2.576a5.045 5.045 0 004.908 0l2.484 2.576a1.54 1.54 0 010 2.18zm-5.484 2.04a5.05 5.05 0 003.566-1.481l.002.002 1.54 1.54c.59.59.59 1.547 0 2.137a1.512 1.512 0 01-2.137 0l-2.97-2.197z"/>
  </svg>
);

const socialLinks = [
  { href: "https://t.me/toplivospb",             title: "Telegram",  Icon: TelegramIcon },
  { href: "https://wa.me/79052150560",            title: "WhatsApp",  Icon: WhatsAppIcon },
  { href: "https://max.ru/sined",                 title: "Макс",      Icon: MaxIcon },
  { href: "https://vk.com/dizelnoetoplivo_spb",   title: "ВКонтакте", Icon: VKIcon },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--navy))] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-white">
              <img
                src="https://cdn.poehali.dev/projects/4cf0026b-b564-47e3-8a8c-63d826844795/bucket/d218ce6f-c6e7-44ca-9118-db1e6fa7bb5a.jpg"
                alt="СИНЕД"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-golos font-black text-white text-lg tracking-wider">СИНЕД</span>
              <span className="font-ibm text-[10px] text-[hsl(var(--sky)/0.7)] tracking-widest uppercase">Топливная компания</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-ibm font-medium transition-all duration-150
                    ${active ? "bg-[hsl(var(--ocean))] text-white" : "text-[hsl(var(--sky))] hover:text-white hover:bg-white/10"}`}>
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Social links */}
          <div className="hidden md:flex items-center gap-1.5">
            {socialLinks.map(({ href, title, Icon: SocialIcon }) => (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer" title={title}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[hsl(var(--ocean))] transition-colors flex items-center justify-center text-[hsl(var(--sky))] hover:text-white">
                <SocialIcon />
              </a>
            ))}
          </div>

          {/* Mobile burger */}
          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[hsl(var(--navy))] border-t border-white/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-ibm transition-all
                    ${active ? "bg-[hsl(var(--ocean))] text-white" : "text-[hsl(var(--sky))] hover:bg-white/10 hover:text-white"}`}>
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </button>
              );
            })}
            <div className="flex gap-2 pt-2 pb-1">
              <a href="tel:+79052150560"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[hsl(var(--ocean))] text-white text-sm font-ibm font-medium">
                <Icon name="Phone" size={15} />
                +7 (905) 215-05-60
              </a>
              {socialLinks.map(({ href, title, Icon: SocialIcon }) => (
                <a key={title} href={href} target="_blank" rel="noopener noreferrer" title={title}
                  className="w-11 py-2.5 rounded-lg bg-white/10 text-[hsl(var(--sky))] hover:bg-white/20 flex items-center justify-center">
                  <SocialIcon />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}