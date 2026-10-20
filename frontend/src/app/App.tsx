import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Carregando } from "./components/Carregando";
import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PrivacidadePage, TermosPage } from "./pages/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// O painel (com Recharts) só é baixado por quem entra na conta.
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const OverviewPage = lazy(() => import("./pages/dashboard/OverviewPage").then(m => ({ default: m.OverviewPage })));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage").then(m => ({ default: m.SettingsPage })));
const FazendasPage = lazy(() => import("./pages/dashboard/fazendas/FazendasPage").then(m => ({ default: m.FazendasPage })));
const PropriedadePage = lazy(() => import("./pages/dashboard/fazendas/PropriedadePage").then(m => ({ default: m.PropriedadePage })));
const TalhaoPage = lazy(() => import("./pages/dashboard/fazendas/TalhaoPage").then(m => ({ default: m.TalhaoPage })));
const VooPage = lazy(() => import("./pages/dashboard/fazendas/VooPage").then(m => ({ default: m.VooPage })));
const EmBrevePage = lazy(() => import("./pages/dashboard/EmBrevePage").then(m => ({ default: m.EmBrevePage })));

const TITULOS: Record<string, string> = {
  "/": "AgroVision — Mapeamento com Drones para Agricultura de Precisão",
  "/login": "Entrar — AgroVision",
  "/cadastro": "Criar conta — AgroVision",
  "/privacidade": "Política de Privacidade — AgroVision",
  "/termos": "Termos de Uso — AgroVision",
};

function AoMudarDeRota() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    document.title = TITULOS[pathname] ?? (pathname.startsWith("/dashboard") ? "Painel — AgroVision" : "Página não encontrada — AgroVision");
  }, [pathname, hash]);
  return null;
}

function SitePublico() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AoMudarDeRota />
        <Toaster position="top-right" richColors closeButton />
        <Suspense fallback={<Carregando tela />}>
          <Routes>
            <Route element={<SitePublico />}>
              <Route index element={<HomePage />} />
              <Route path="privacidade" element={<PrivacidadePage />} />
              <Route path="termos" element={<TermosPage />} />
            </Route>
            <Route path="login" element={<LoginPage />} />
            <Route path="cadastro" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardLayout />}>
                <Route index element={<OverviewPage />} />
                <Route path="analises" element={<EmBrevePage secao="analises" />} />
                <Route path="relatorios" element={<EmBrevePage secao="relatorios" />} />
                <Route path="fazendas" element={<FazendasPage />} />
                <Route path="fazendas/:id" element={<PropriedadePage />} />
                <Route path="talhoes/:id" element={<TalhaoPage />} />
                <Route path="voos/:id" element={<VooPage />} />
                <Route path="agendamentos" element={<EmBrevePage secao="agendamentos" />} />
                <Route path="configuracoes" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
