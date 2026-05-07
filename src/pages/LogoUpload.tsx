import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

export default function LogoUpload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSaved(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <div className="pt-24 max-w-xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--ocean))] mb-4 transition-colors text-sm font-ibm">
            <Icon name="ArrowLeft" size={16} />
            На главную
          </button>
          <h1 className="font-golos font-black text-[hsl(var(--navy))] text-3xl mb-2">Загрузка логотипа</h1>
          <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm">
            Загрузите логотип СИНЕД — он появится в шапке сайта. Рекомендуем PNG с прозрачным фоном.
          </p>
        </div>

        {/* Upload area */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-12 text-center mb-6
            ${dragging
              ? "border-[hsl(var(--ocean))] bg-[hsl(var(--ice))]"
              : preview
              ? "border-[hsl(var(--ocean)/0.4)] bg-white"
              : "border-[hsl(var(--border))] hover:border-[hsl(var(--ocean)/0.5)] hover:bg-[hsl(var(--ice))] bg-white"
            }`}
        >
          {preview ? (
            <div className="flex flex-col items-center gap-4">
              <img src={preview} alt="Логотип" className="max-h-32 max-w-full object-contain" />
              <span className="font-ibm text-sm text-[hsl(var(--muted-foreground))]">Нажмите чтобы заменить</span>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] flex items-center justify-center mb-4">
                <Icon name="Upload" size={28} className="text-[hsl(var(--ocean))]" />
              </div>
              <p className="font-golos font-bold text-[hsl(var(--navy))] text-lg mb-1">Перетащите или нажмите</p>
              <p className="font-ibm text-sm text-[hsl(var(--muted-foreground))]">PNG, SVG, JPG • до 5 МБ</p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {/* Info block */}
        <div className="bg-[hsl(var(--ice))] border border-[hsl(var(--ocean)/0.2)] rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={16} className="text-[hsl(var(--ocean))] mt-0.5 flex-shrink-0" />
            <div className="font-ibm text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              <strong className="text-[hsl(var(--navy))]">Рекомендации по логотипу:</strong><br />
              Размер: от 200×200 пикселей. Формат PNG с прозрачным фоном. Логотип будет отображён в квадрате 36×36 px в шапке сайта.
              После загрузки мы адаптируем цвета сайта под ваш фирменный стиль.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {preview && !saved && (
            <button onClick={handleSave} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
              <Icon name="Check" size={18} />
              Сохранить логотип
            </button>
          )}
          <button onClick={() => navigate("/")} className={`${preview ? "flex-none" : "flex-1"} py-3 px-6 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-ibm font-medium hover:border-[hsl(var(--ocean)/0.3)] hover:text-[hsl(var(--ocean))] transition-colors`}>
            {preview ? "Отмена" : "Позже"}
          </button>
        </div>

        {saved && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 font-ibm text-sm animate-fade-in">
            <Icon name="CheckCircle" size={16} />
            Логотип сохранён! Возвращаемся на главную...
          </div>
        )}
      </div>
    </div>
  );
}
