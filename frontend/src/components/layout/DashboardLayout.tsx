import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  Activity,
  Bell,
  FileText,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Settings,
  Tractor,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  /** false = rota ainda nao implementada (Fases seguintes do planejamento). */
  disponivel: boolean;
  /** so marca ativo em match exato (sem sub-rotas) */
  exato?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Visão Geral", disponivel: true, exato: true },
  { to: "/propriedades", icon: Tractor, label: "Propriedades", disponivel: true },
  { to: "/analises", icon: Activity, label: "Análises", disponivel: true },
  { to: "/relatorios", icon: FileText, label: "Relatórios", disponivel: true },
  { to: "/configuracoes", icon: Settings, label: "Configurações", disponivel: false },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const nome = usuario?.nome ?? "Usuário";
  const inicial = nome.trim().charAt(0).toUpperCase() || "U";
  const papel = usuario?.provedor_auth === "google" ? "Conta Google" : "Produtor Rural";

  const sair = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]" style={{ fontFamily: "Inter, sans-serif" }}>
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } bg-[#1B5E20] flex flex-col transition-all duration-300 min-h-screen flex-shrink-0`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-white text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
              Agro<span className="text-[#A5D6A7]">Vision</span>
            </span>
          )}
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, disponivel, exato }) =>
            disponivel ? (
              <NavLink
                key={to}
                to={to}
                end={exato}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium ${
                    isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ) : (
              <div
                key={to}
                aria-disabled
                title="Disponível em breve"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/35 cursor-not-allowed select-none"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="flex items-center gap-2">
                    {label}
                    <span className="text-[10px] uppercase tracking-wide bg-white/10 rounded px-1.5 py-0.5">em breve</span>
                  </span>
                )}
              </div>
            ),
          )}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={sair}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center gap-4 px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Alternar menu lateral"
            className="p-2 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors" aria-label="Notificações">
              <Bell className="w-5 h-5 text-[#4a5568]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center">
                <span className="text-white text-sm font-bold">{inicial}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-[#212121]">{nome}</div>
                <div className="text-xs text-[#4a5568]">{papel}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
