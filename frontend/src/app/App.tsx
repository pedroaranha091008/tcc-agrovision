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
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
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
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
