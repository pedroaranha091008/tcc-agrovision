import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Leaf } from "lucide-react";
import { useAuth } from "./AuthContext";

function TelaCarregando() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <div className="w-12 h-12 rounded-lg bg-[#1B5E20] flex items-center justify-center animate-pulse">
        <Leaf className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
        Carregando sua sessão...
      </p>
    </div>
  );
}

/** Protege rotas autenticadas. Guarda a rota pedida para retornar apos o login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <TelaCarregando />;
  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

/** Impede que usuarios ja logados vejam login/cadastro. */
export function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();
  const destino = (location.state as { from?: Location } | null)?.from?.pathname ?? "/dashboard";

  if (carregando) return <TelaCarregando />;
  if (autenticado) return <Navigate to={destino} replace />;
  return <>{children}</>;
}
