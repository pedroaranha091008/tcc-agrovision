import { Route, Routes } from "react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RedirectIfAuth, RequireAuth } from "@/features/auth/RequireAuth";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PropriedadesListPage } from "@/pages/propriedades/PropriedadesListPage";
import { PropriedadeDetailPage } from "@/pages/propriedades/PropriedadeDetailPage";
import { TalhaoDetailPage } from "@/pages/talhoes/TalhaoDetailPage";
import { VooDetailPage } from "@/pages/voos/VooDetailPage";
import { AnalisesHistoricoPage } from "@/pages/analises/AnalisesHistoricoPage";
import { AnaliseDetailPage } from "@/pages/analises/AnaliseDetailPage";
import { RelatoriosListPage } from "@/pages/relatorios/RelatoriosListPage";
import { ConfiguracoesPage } from "@/pages/ConfiguracoesPage";
import { PrivacidadePage, TermosPage } from "@/pages/LegalPages";
import { EsqueciSenhaPage, RedefinirSenhaPage } from "@/pages/SenhaPages";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacidade" element={<PrivacidadePage />} />
        <Route path="/termos" element={<TermosPage />} />
      </Route>

      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />
      <Route
        path="/cadastro"
        element={
          <RedirectIfAuth>
            <RegisterPage />
          </RedirectIfAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/propriedades" element={<PropriedadesListPage />} />
        <Route path="/propriedades/:id" element={<PropriedadeDetailPage />} />
        <Route path="/talhoes/:id" element={<TalhaoDetailPage />} />
        <Route path="/voos/:id" element={<VooDetailPage />} />
        <Route path="/analises" element={<AnalisesHistoricoPage />} />
        <Route path="/analises/:id" element={<AnaliseDetailPage />} />
        <Route path="/relatorios" element={<RelatoriosListPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Route>

      <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
      <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
