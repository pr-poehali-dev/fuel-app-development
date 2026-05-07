import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";
import { methodLabel, UserData } from "./cabinet/types";
import LoginScreen from "./cabinet/LoginScreen";
import OrdersTab from "./cabinet/OrdersTab";
import ProfileTab from "./cabinet/ProfileTab";

export default function Cabinet() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserData | null>(() => {
    try { return JSON.parse(localStorage.getItem("sined_user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return <LoginScreen onLogin={(u) => setUser(u)} />;

  const displayName = user?.name || user?.org || user?.contact || "Кабинет";
  const initial = (displayName[0] || "?").toUpperCase();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 pb-12">

        {/* Минималистичная шапка */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="font-golos font-black text-[hsl(var(--navy))] text-2xl sm:text-3xl leading-tight">
              {displayName}
            </h1>
            <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm mt-1">
              Добро пожаловать в личный кабинет
            </p>
          </div>

          {/* Аватар-меню (выпадающее) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-11 h-11 rounded-full bg-[hsl(var(--navy))] flex items-center justify-center text-white font-golos font-bold text-base shadow-sm hover:shadow-md transition-shadow">
              {initial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[hsl(var(--border))] overflow-hidden animate-fade-in z-20">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--ice))]">
                  <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm truncate">{displayName}</div>
                  {user?.method && (
                    <div className="font-ibm text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
                      {methodLabel(user.method)} • {user.contact}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { localStorage.removeItem("sined_user"); localStorage.removeItem("sined_token"); setUser(null); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-ibm text-red-600 hover:bg-red-50 transition-colors">
                  <Icon name="LogOut" size={15} />
                  Выйти из аккаунта
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Чистые табы — просто текст с подчёркиванием */}
        <div className="flex gap-6 border-b border-[hsl(var(--border))] mb-6">
          {[["orders", "Мои заявки"], ["profile", "Профиль"]].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "orders" | "profile")}
              className={`relative pb-3 text-sm font-golos font-semibold transition-colors
                ${activeTab === tab
                  ? "text-[hsl(var(--navy))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--navy))]"}`}>
              {label}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--ocean))] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
          <OrdersTab selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
        )}
        {activeTab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
}
