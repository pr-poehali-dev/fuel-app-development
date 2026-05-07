import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const DRIVER = {
  name: "Петров Николай",
  vehicle: "КамАЗ 5325",
  plate: "В456ЕК78",
  phone: "+7 (921) 555-99-11",
  order: "ЗК-2024-002",
  fuel: "Печное топливо, 1 500 л",
  eta: "~35 мин",
  destination: "Всеволожск, ул. Плоткина, 12",
  progress: 68,
};

// Начальные координаты водителя (между СПб и Всеволожском)
const START_COORDS = { lat: 60.02, lng: 30.55 };
const END_COORDS = { lat: 60.0214, lng: 30.6974 }; // Всеволожск

const waypoints = [
  { label: "Отправление", loc: "Склад СИНЕД, СПб", done: true },
  { label: "Контрольная точка", loc: "КАД, выезд на Всеволожск", done: true },
  { label: "Пункт назначения", loc: "Всеволожск, ул. Плоткина, 12", done: false },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ymaps: any;
  }
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const ymapsRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [driverPos, setDriverPos] = useState(START_COORDS);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Load Yandex Maps script
  useEffect(() => {
    const apiKey = (import.meta as any).env?.VITE_YANDEX_MAPS_KEY || "";

    if (window.ymaps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(initMap);
    };
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);

    return () => {
      // cleanup
    };
  }, []);

  function initMap() {
    if (!mapRef.current) return;

    try {
      const map = new window.ymaps.Map(mapRef.current, {
        center: [START_COORDS.lat, START_COORDS.lng],
        zoom: 11,
        controls: ["zoomControl"],
      });

      ymapsRef.current = map;

      // Destination placemark
      const destMark = new window.ymaps.Placemark(
        [END_COORDS.lat, END_COORDS.lng],
        { balloonContent: "Пункт назначения: " + DRIVER.destination },
        {
          preset: "islands#redDotIcon",
        }
      );
      map.geoObjects.add(destMark);

      // Driver placemark
      const driverMark = new window.ymaps.Placemark(
        [START_COORDS.lat, START_COORDS.lng],
        { balloonContent: `Водитель: ${DRIVER.name}<br>${DRIVER.vehicle} ${DRIVER.plate}` },
        {
          preset: "islands#blueDeliveryCircleIcon",
        }
      );
      map.geoObjects.add(driverMark);
      markerRef.current = driverMark;

      // Route
      window.ymaps.route([
        [59.943543, 30.3], // Склад СПб
        [START_COORDS.lat, START_COORDS.lng],
        [END_COORDS.lat, END_COORDS.lng],
      ]).then((route: any) => {
        route.getPaths().options.set({
          strokeColor: "1A7AC8",
          strokeWidth: 4,
          opacity: 0.7,
        });
        map.geoObjects.add(route);
      });

      setMapLoaded(true);
    } catch {
      setMapError(true);
    }
  }

  // Simulate truck movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPos((prev) => {
        const newPos = {
          lat: prev.lat + (END_COORDS.lat - prev.lat) * 0.02 + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (END_COORDS.lng - prev.lng) * 0.02 + (Math.random() - 0.5) * 0.001,
        };
        if (markerRef.current) {
          markerRef.current.geometry.setCoordinates([newPos.lat, newPos.lng]);
        }
        return newPos;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative">
      {/* Заглушка "В разработке" — поверх всей страницы */}
      <div className="fixed inset-0 z-[100] bg-[hsl(var(--navy))/0.92] backdrop-blur-md flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--sky))] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Icon name="Wrench" size={36} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-4">
            <Icon name="Clock" size={12} className="text-amber-600" />
            <span className="font-golos font-semibold text-amber-700 text-[11px] uppercase tracking-wider">В разработке</span>
          </div>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-2xl mb-3">
            Отслеживание на карте
          </h1>
          <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm leading-relaxed mb-6">
            Функционал в разработке. Скоро здесь появится онлайн-карта с реальным движением бензовоза, маршрутом доставки и временем прибытия.
          </p>
          <div className="bg-[hsl(var(--ice))] border border-[hsl(var(--sky)/0.3)] rounded-xl p-4 mb-6 text-left">
            <p className="font-ibm text-xs text-[hsl(var(--navy))] leading-relaxed">
              <strong className="font-golos">Пока что</strong> — статус заявки и контакты водителя доступны в личном кабинете. Менеджер свяжется с вами за 30 минут до прибытия.
            </p>
          </div>
          <button
            onClick={() => navigate("/cabinet")}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-golos">
            <Icon name="ArrowLeft" size={16} />
            Вернуться в кабинет
          </button>
        </div>
      </div>

      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate("/cabinet")} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div className="section-badge">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              Отслеживание доставки
            </div>
          </div>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-3xl">
            Заявка {DRIVER.order}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-[hsl(var(--border))] animate-fade-in" style={{ height: "440px" }}>
              {/* Yandex Map container */}
              <div ref={mapRef} className="w-full h-full" />

              {/* Loading state */}
              {!mapLoaded && !mapError && (
                <div className="absolute inset-0 bg-[hsl(var(--navy))] flex items-center justify-center">
                  <div className="map-grid absolute inset-0 opacity-20" />
                  <div className="relative text-center text-white">
                    <Icon name="MapPin" size={40} className="mx-auto mb-3 opacity-60 animate-pulse" />
                    <p className="font-golos font-bold">Загрузка карты...</p>
                    <p className="font-ibm text-xs text-[hsl(var(--sky)/0.6)] mt-1">Яндекс.Карты</p>
                  </div>
                </div>
              )}

              {/* Error / no key state */}
              {mapError && (
                <div className="absolute inset-0 bg-[hsl(var(--navy))] flex items-center justify-center">
                  <div className="map-grid absolute inset-0 opacity-20" />
                  <div className="relative text-center text-white px-6">
                    <Icon name="Map" size={40} className="mx-auto mb-3 opacity-60" />
                    <p className="font-golos font-bold mb-1">Карта недоступна</p>
                    <p className="font-ibm text-xs text-[hsl(var(--sky)/0.6)]">
                      Добавьте ключ Яндекс.Карт в настройках
                    </p>
                  </div>
                  {/* Fallback animated truck */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M15 75 Q 40 60 55 50 Q 70 40 85 25" stroke="hsl(200 80% 60%)" strokeWidth="0.6" strokeDasharray="2 1" fill="none" opacity="0.4" />
                  </svg>
                </div>
              )}

              {/* ETA badge overlay */}
              <div className="absolute bottom-3 right-3 bg-white rounded-xl shadow-lg px-4 py-2 text-right z-10">
                <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">До прибытия</div>
                <div className="font-golos font-black text-[hsl(var(--ocean))] text-xl">{DRIVER.eta}</div>
              </div>

              {/* GPS badge */}
              <div className="absolute top-3 left-3 bg-[hsl(var(--navy)/0.85)] backdrop-blur-sm text-white rounded-xl px-3 py-2 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                  <span className="font-golos font-bold text-xs">GPS активен</span>
                </div>
                <div className="font-ibm text-[10px] text-[hsl(var(--sky)/0.7)] mt-0.5">Обновляется каждые 30 сек</div>
              </div>
            </div>

            {/* Route waypoints */}
            <div className="card-glass p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-4">Маршрут</h3>
              <div className="space-y-3">
                {waypoints.map((wp, i) => (
                  <div key={wp.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${wp.done ? "bg-[hsl(var(--ocean))]" : "bg-[hsl(var(--muted))] border-2 border-[hsl(var(--border))]"}`}>
                        {wp.done ? <Icon name="Check" size={10} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--muted-foreground))]" />}
                      </div>
                      {i < waypoints.length - 1 && (
                        <div className={`w-px h-6 mt-1 ${wp.done ? "bg-[hsl(var(--ocean)/0.3)]" : "bg-[hsl(var(--border))]"}`} />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className={`font-golos font-semibold text-sm ${wp.done ? "text-[hsl(var(--navy))]" : "text-[hsl(var(--muted-foreground))]"}`}>{wp.label}</div>
                      <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">{wp.loc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {/* Driver card */}
            <div className="card-glass p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--teal))] flex items-center justify-center shadow">
                  <Icon name="User" size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-golos font-bold text-[hsl(var(--navy))]">{DRIVER.name}</div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Водитель</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Транспорт", val: DRIVER.vehicle, icon: "Truck" },
                  { label: "Гос. номер", val: DRIVER.plate, icon: "CreditCard" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 py-2 border-b border-[hsl(var(--border))] last:border-0">
                    <Icon name={f.icon} size={14} className="text-[hsl(var(--ocean))]" />
                    <div>
                      <div className="font-ibm text-[10px] text-[hsl(var(--muted-foreground))]">{f.label}</div>
                      <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm">{f.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a href={`tel:${DRIVER.phone}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ocean))] hover:text-white transition-all">
                <Icon name="Phone" size={15} />
                Позвонить водителю
              </a>
            </div>

            {/* Order info */}
            <div className="card-glass p-5">
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3">Детали заказа</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Топливо</div>
                  <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm">{DRIVER.fuel}</div>
                </div>
                <div>
                  <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Адрес доставки</div>
                  <div className="font-golos font-semibold text-[hsl(var(--navy))] text-sm">{DRIVER.destination}</div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-ibm text-xs text-[hsl(var(--muted-foreground))]">Прогресс</span>
                    <span className="font-golos font-bold text-[hsl(var(--ocean))] text-xs">{DRIVER.progress}%</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[hsl(var(--ocean))] to-[hsl(var(--teal))] rounded-full transition-all duration-500"
                      style={{ width: `${DRIVER.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="card-glass p-5">
              <h3 className="font-golos font-bold text-[hsl(var(--navy))] text-sm mb-3">Поддержка СИНЕД</h3>
              <div className="space-y-2">
                <a href="tel:+79052150560"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(var(--navy))] text-white text-sm font-ibm font-medium hover:bg-[hsl(var(--ocean))] transition-colors">
                  <Icon name="Phone" size={15} />
                  +7 (905) 215-05-60
                </a>
                <a href="https://t.me/toplivospb" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] text-[hsl(var(--ocean))] text-sm font-ibm font-medium hover:bg-[hsl(var(--ocean))] hover:text-white transition-all">
                  Написать в Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}