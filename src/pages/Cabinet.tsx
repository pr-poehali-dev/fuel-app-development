import { useState } from "react";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";
import { mockOrders, methodLabel, UserData } from "./cabinet/types";
import LoginScreen from "./cabinet/LoginScreen";
import OrdersTab from "./cabinet/OrdersTab";
import ProfileTab from "./cabinet/ProfileTab";

export default function Cabinet() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(() => {
    try { return JSON.parse(localStorage.getItem("sined_user") || "null"); } catch { return null; }
  });

  const selected = mockOrders.find((o) => o.id === selectedOrder);

  if (!user) return <LoginScreen onLogin={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="card-glass border border-[hsl(var(--border))] p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--navy))] flex items-center justify-center shadow-md flex-shrink-0">
                <Icon name="User" size={22} className="text-[hsl(var(--sky))]" />
              </div>
              <div>
                <h1 className="font-golos font-black text-[hsl(var(--navy))] text-xl sm:text-2xl leading-tight">
                  {user?.name || user?.org || user?.contact || "Личный кабинет"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 bg-[hsl(var(--ice))] text-[hsl(var(--ocean))] text-[10px] font-golos font-semibold px-2 py-0.5 rounded-full border border-[hsl(var(--sky)/0.3)]">
                    <Icon name="CheckCircle" size={10} />
                    Авторизован
                  </span>
                  {user?.method && (
                    <span className="text-[10px] font-ibm text-[hsl(var(--muted-foreground))]">
                      через {methodLabel(user.method)} • {user.contact}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => { localStorage.removeItem("sined_user"); setUser(null); }}
              className="flex items-center gap-2 font-ibm font-medium text-sm text-white bg-red-500 hover:bg-red-600 transition-colors px-4 py-2.5 rounded-xl shadow-sm flex-shrink-0">
              <Icon name="LogOut" size={15} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[hsl(var(--muted))] p-1 rounded-xl mb-6 w-fit">
          {[["orders", "ClipboardList", "Мои заявки"], ["profile", "User", "Профиль"]].map(([tab, icon, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as "orders" | "profile")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-ibm font-medium transition-all duration-150
                ${activeTab === tab ? "bg-white text-[hsl(var(--navy))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--navy))]"}`}>
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === "orders" && (
          <OrdersTab selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
        )}

        {/* Profile tab */}
        {activeTab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
}
