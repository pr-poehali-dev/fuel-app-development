import { useState } from "react";
import Icon from "@/components/ui/icon";
import { mockUser, TelegramIcon, WhatsAppIcon, VKIcon } from "./types";

export default function ProfileTab() {
  const [contactsOpen, setContactsOpen] = useState(false);

  const fields = [
    { label: "Название / ФИО", val: mockUser.name, icon: "Building2" },
    { label: "Телефон", val: mockUser.phone, icon: "Phone" },
    { label: "Email", val: mockUser.email, icon: "Mail" },
    { label: "Адрес", val: mockUser.address, icon: "MapPin" },
    { label: "Сегмент", val: mockUser.segment, icon: "Layers" },
  ];

  return (
    <div className="animate-fade-in max-w-2xl space-y-3">

      {/* Данные организации — чистый список */}
      <div className="bg-white border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <h2 className="font-golos font-bold text-[hsl(var(--navy))] text-base">Данные организации</h2>
          <button className="text-[hsl(var(--ocean))] text-xs font-ibm font-medium hover:underline flex items-center gap-1">
            <Icon name="Pencil" size={12} />
            Изменить
          </button>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-4 px-5 py-3.5">
              <Icon name={f.icon} size={15} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
              <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{f.label}</span>
                <span className="font-golos font-semibold text-[hsl(var(--navy))] text-sm text-right truncate">{f.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Контакты менеджера — раскрывающийся аккордеон */}
      <div className="bg-white border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <button
          onClick={() => setContactsOpen(o => !o)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-[hsl(var(--muted)/0.4)] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--ice))] flex items-center justify-center">
              <Icon name="Headphones" size={16} className="text-[hsl(var(--ocean))]" />
            </div>
            <div className="text-left">
              <div className="font-golos font-bold text-[hsl(var(--navy))] text-sm">Связаться с менеджером</div>
              <div className="font-ibm text-[11px] text-[hsl(var(--muted-foreground))]">5 каналов связи</div>
            </div>
          </div>
          <Icon name={contactsOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-[hsl(var(--muted-foreground))]" />
        </button>

        {contactsOpen && (
          <div className="px-5 pb-5 border-t border-[hsl(var(--border))] animate-fade-in">
            <a href="tel:+79052150560"
              className="mt-4 flex items-center justify-center gap-2 w-full bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy)/0.9)] text-white py-3 rounded-xl text-sm font-ibm font-medium transition-colors">
              <Icon name="Phone" size={15} />
              +7 (905) 215-05-60
            </a>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[hsl(var(--ice))] hover:bg-sky-100 rounded-lg px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-colors">
                <TelegramIcon />
                Telegram
              </a>
              <a href="https://wa.me/79052150560" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[hsl(var(--ice))] hover:bg-emerald-50 rounded-lg px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-colors">
                <WhatsAppIcon />
                WhatsApp
              </a>
              <a href="https://max.ru/sined" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[hsl(var(--ice))] hover:bg-orange-50 rounded-lg px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-colors">
                <Icon name="Zap" size={15} className="text-orange-500" />
                Макс
              </a>
              <a href="https://vk.com/dizelnoetoplivo_spb" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[hsl(var(--ice))] hover:bg-blue-50 rounded-lg px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-colors">
                <VKIcon />
                ВКонтакте
              </a>
              <a href="mailto:sinedooo@mail.ru"
                className="flex items-center gap-2 bg-[hsl(var(--ice))] hover:bg-slate-100 rounded-lg px-3 py-2.5 text-[hsl(var(--navy))] text-sm font-ibm transition-colors col-span-2 justify-center">
                <Icon name="Mail" size={15} className="text-[hsl(var(--ocean))]" />
                sinedooo@mail.ru
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
