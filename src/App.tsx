import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Cabinet from "./pages/Cabinet";
import Register from "./pages/Register";
import MapPage from "./pages/MapPage";
import About from "./pages/About";
import LogoUpload from "./pages/LogoUpload";
import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Icon from "./components/ui/icon";

function ProtectedMap() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("sined_user") || "null"); } catch { return null; } })();
  if (!user) return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pt-16">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--ocean))] to-[hsl(var(--lime))] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Icon name="Lock" size={28} className="text-white" />
        </div>
        <h2 className="font-golos font-black text-[hsl(var(--navy))] text-2xl mb-2">Только для авторизованных</h2>
        <p className="font-ibm text-[hsl(var(--muted-foreground))] text-sm mb-6 max-w-xs">
          Отслеживание доставки доступно в личном кабинете
        </p>
        <button onClick={() => navigate("/cabinet")} className="btn-primary flex items-center gap-2">
          <Icon name="User" size={16} />
          Войти в кабинет
        </button>
      </div>
    </div>
  );
  return <MapPage />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={<ProtectedMap />} />
          <Route path="/about" element={<About />} />
          <Route path="/logo" element={<LogoUpload />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-orders" element={<AdminOrders />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;