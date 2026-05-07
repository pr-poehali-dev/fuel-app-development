export const mockOrders = [
  {
    id: "ЗК-2024-001",
    date: "05.05.2024",
    fuel: "Дизельное топливо (ДТ)",
    volume: "3 000 л",
    address: "пр. Обуховской Обороны, 80",
    status: "done" as const,
    statusLabel: "Доставлено",
    driver: "Иванов А.В.",
    vehicle: "МАЗ 5337 · А123ВС78",
    price: "уточнялась у менеджера",
  },
  {
    id: "ЗК-2024-002",
    date: "07.05.2024",
    fuel: "Печное топливо",
    volume: "1 500 л",
    address: "Всеволожск, ул. Плоткина, 12",
    status: "active" as const,
    statusLabel: "В пути",
    driver: "Петров Н.С.",
    vehicle: "КамАЗ 5325 · В456ЕК78",
    price: "уточняется",
  },
  {
    id: "ЗК-2024-003",
    date: "07.05.2024",
    fuel: "Мазут М-100",
    volume: "10 т",
    address: "Кронштадт, ул. Флотская, 1",
    status: "pending" as const,
    statusLabel: "Обработка",
    driver: "—",
    vehicle: "—",
    price: "уточняется",
  },
];

export const statusConfig = {
  done: { icon: "CheckCircle", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Доставлено" },
  active: { icon: "Truck", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "В пути" },
  pending: { icon: "Clock", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Обработка" },
};

export const mockUser = {
  name: "Ваша организация",
  phone: "+7 (905) 215-05-60",
  email: "sinedooo@mail.ru",
  address: "198035, СПб, ул. Двинская, д. 10",
  segment: "Клиент СИНЕД",
};

export const AUTH_URL = "https://functions.poehali.dev/7d46cc7a-17f2-4443-b62e-cf6770ab15d8";

export type AuthStep = "choose" | "contact" | "code" | "name";
export type AuthMethodId = "email" | "tg" | "phone" | "vk" | "max";

export interface UserData {
  token: string; user_id: string; contact: string;
  method: string; name: string; org: string;
}

export const AUTH_METHODS: { id: AuthMethodId; label: string; desc: string; placeholder: string; icon: string; color: string }[] = [
  { id: "email", label: "Email",      desc: "Код придёт на почту",           placeholder: "example@mail.ru",  icon: "Mail",    color: "hover:border-blue-400/50 hover:bg-blue-50" },
  { id: "tg",    label: "Telegram",   desc: "Напишите боту, получите код",   placeholder: "@username",        icon: "Send",    color: "hover:border-[#2AABEE]/50 hover:bg-sky-50" },
  { id: "phone", label: "Телефон",    desc: "Код придёт в Telegram по номеру", placeholder: "+7 999 000-00-00", icon: "Phone",  color: "hover:border-[hsl(var(--ocean)/0.5)] hover:bg-[hsl(var(--ice))]" },
  { id: "vk",    label: "ВКонтакте", desc: "Ссылка придёт в VK сообщения",  placeholder: "@vk_username",     icon: "Users",   color: "hover:border-[#4C75A3]/50 hover:bg-blue-50" },
  { id: "max",   label: "Макс",       desc: "Код придёт в мессенджер Макс",  placeholder: "@username в Макс", icon: "Zap",     color: "hover:border-orange-400/50 hover:bg-orange-50" },
];

export function methodLabel(id: string) {
  return AUTH_METHODS.find(m => m.id === id)?.label || id;
}

export const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
  </svg>
);

export const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const VKIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
  </svg>
);
