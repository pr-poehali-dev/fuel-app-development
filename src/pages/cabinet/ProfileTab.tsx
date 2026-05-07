import Icon from "@/components/ui/icon";
import { mockUser, TelegramIcon, WhatsAppIcon, VKIcon } from "./types";

export default function ProfileTab() {
  return (
    <div className="animate-fade-in max-w-xl">
      <div className="card-glass p-6 space-y-4">
        <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-4">Данные организации</h2>
        {[
          { label: "Название / ФИО", val: mockUser.name, icon: "Building2" },
          { label: "Телефон", val: mockUser.phone, icon: "Phone" },
          { label: "Email", val: mockUser.email, icon: "Mail" },
          { label: "Адрес", val: mockUser.address, icon: "MapPin" },
          { label: "Сегмент", val: mockUser.segment, icon: "Layers" },
        ].map((f) => (
          <div key={f.label} className="flex items-start gap-3 py-3 border-b border-[hsl(var(--border))] last:border-0">
            <Icon name={f.icon} size={16} className="text-[hsl(var(--ocean))] mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{f.label}</div>
              <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm mt-0.5">{f.val}</div>
            </div>
          </div>
        ))}
        <button className="w-full py-3 rounded-xl border border-[hsl(var(--ocean)/0.3)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ice))] transition-colors mt-2">
          Редактировать данные
        </button>
      </div>

      <div className="card-glass p-6 mt-4">
        <h3 className="font-golos font-bold text-[hsl(var(--navy))] mb-4">Связаться с менеджером</h3>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-[hsl(29_89%_52%/0.08)] hover:border-[hsl(29_89%_52%/0.4)] rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all group">
            <TelegramIcon />
            Telegram
          </a>
          <a href="https://wa.me/79052150560" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-emerald-50 hover:border-emerald-300 rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all">
            <WhatsAppIcon />
            WhatsApp
          </a>
          <a href="https://max.ru/sined" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-orange-50 hover:border-orange-300 rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all">
            <Icon name="Zap" size={16} className="flex-shrink-0 text-orange-500" />
            Макс
          </a>
          <a href="https://vk.com/dizelnoetoplivo_spb" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-blue-50 hover:border-blue-300 rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all">
            <VKIcon />
            ВКонтакте
          </a>
          <a href="mailto:sinedooo@mail.ru"
            className="flex items-center gap-2 bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] hover:bg-slate-50 hover:border-slate-300 rounded-xl px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-all col-span-2 justify-center">
            <Icon name="Mail" size={16} className="flex-shrink-0 text-[hsl(var(--ocean))]" />
            sinedooo@mail.ru
          </a>
        </div>
        <a href="tel:+79052150560"
          className="mt-3 flex items-center justify-center gap-2 w-full btn-primary py-3 text-sm">
          <Icon name="Phone" size={16} />
          +7 (905) 215-05-60
        </a>
      </div>
    </div>
  );
}
