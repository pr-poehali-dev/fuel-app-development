import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";

const navItems = [
  { label: "Главная", path: "/", icon: "Home" },
  { label: "Чат с ИИ", path: "/chat", icon: "MessageSquare" },
  { label: "Кабинет", path: "/cabinet", icon: "User" },
  { label: "Карта", path: "/map", icon: "MapPin" },
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
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center shadow-md">
              <span className="text-white font-golos font-900 text-base tracking-tight">С</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-golos font-900 text-white text-lg tracking-wider">СИНЕД</span>
              <span className="font-ibm text-[10px] text-[hsl(var(--sky)/0.7)] tracking-widest uppercase">Топливная компания</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-ibm font-500 transition-all duration-150
                    ${active
                      ? "bg-[hsl(var(--ocean))] text-white"
                      : "text-[hsl(var(--sky))] hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Social links */}
          <div className="hidden md:flex items-center gap-2">
            <a href="https://t.me/sined_fuel" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[hsl(var(--sky)/0.3)] transition-colors flex items-center justify-center text-[hsl(var(--sky))] hover:text-white text-sm font-golos font-700"
              title="Telegram">
              TG
            </a>
            <a href="https://wa.me/78121234567" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[hsl(var(--sky)/0.3)] transition-colors flex items-center justify-center text-[hsl(var(--sky))] hover:text-white text-sm font-golos font-700"
              title="WhatsApp">
              WA
            </a>
            <a href="https://ok.ru/sined" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[hsl(var(--sky)/0.3)] transition-colors flex items-center justify-center text-[hsl(var(--sky))] hover:text-white text-sm font-golos font-700"
              title="Одноклассники">
              ОК
            </a>
            <a href="https://vk.com/sined_fuel" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[hsl(var(--sky)/0.3)] transition-colors flex items-center justify-center text-[hsl(var(--sky))] hover:text-white text-sm font-golos font-700"
              title="ВКонтакте">
              ВК
            </a>
            <button
              onClick={() => navigate("/chat")}
              className="ml-2 btn-primary text-sm py-2 px-4"
            >
              Оформить заявку
            </button>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
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
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-ibm transition-all
                    ${active
                      ? "bg-[hsl(var(--ocean))] text-white"
                      : "text-[hsl(var(--sky))] hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </button>
              );
            })}
            <div className="flex gap-2 pt-2">
              {[["TG","https://t.me/sined_fuel"],["WA","https://wa.me/78121234567"],["ОК","https://ok.ru/sined"],["ВК","https://vk.com/sined_fuel"]].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 text-center rounded-lg bg-white/10 text-[hsl(var(--sky))] text-sm font-golos font-700 hover:bg-white/20">
                  {label}
                </a>
              ))}
            </div>
            <button
              onClick={() => { navigate("/chat"); setMenuOpen(false); }}
              className="w-full btn-primary mt-1"
            >
              Оформить заявку
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
