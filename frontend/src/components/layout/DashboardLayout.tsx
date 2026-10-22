import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
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
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  /** so marca ativo em match exato (sem sub-rotas) */
  exato?: boolean;
  /** outras rotas que tambem pertencem a este item (ex.: talhoes e voos sao "Propriedades") */
  tambem?: string[];
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Visão Geral", exato: true },
  { to: "/analises", icon: Activity, label: "Minhas Análises" },
  { to: "/relatorios", icon: FileText, label: "Relatórios" },
  { to: "/propriedades", icon: Tractor, label: "Fazendas", tambem: ["/talhoes", "/voos"] },
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

export function DashboardLayout() {
  const [recolhido, setRecolhido] = useState(false); // computador: menu estreito so com icones
  const [gavetaAberta, setGavetaAberta] = useState(false); // celular: menu sobreposto
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const notificacoesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { usuario, logout } = useAuth();

  const nome = usuario?.nome ?? "Usuário";
  const inicial = nome.trim().charAt(0).toUpperCase() || "U";
  const papel = usuario?.provedor_auth === "google" ? "Conta Google" : "Produtor Rural";
  const mostrarRotulos = !recolhido || gavetaAberta;

  // Trocar de pagina fecha a gaveta e o painel de notificacoes.
  useEffect(() => {
    setGavetaAberta(false);
    setNotificacoesAbertas(false);
  }, [pathname]);

  useEffect(() => {
    if (!notificacoesAbertas) return;
    const fecharFora = (e: MouseEvent) => {
      if (!notificacoesRef.current?.contains(e.target as Node)) setNotificacoesAbertas(false);
    };
    const fecharEsc = (e: KeyboardEvent) => e.key === "Escape" && setNotificacoesAbertas(false);
    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", fecharEsc);
    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", fecharEsc);
    };
  }, [notificacoesAbertas]);

  const sair = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]" style={{ fontFamily: "Inter, sans-serif" }}>
      {gavetaAberta && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setGavetaAberta(false)} aria-hidden />
      )}

      {/* No celular o menu fica fora da tela e abre como gaveta; no computador fica fixo e pode ser recolhido. */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen bg-[#1B5E20] flex flex-col transition-all duration-300 flex-shrink-0
          ${gavetaAberta ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"} ${recolhido ? "md:w-16" : "md:w-60"}`}
      >
        <div className="p-4 flex items-center justify-between gap-3 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3" aria-label="AgroVision — página inicial">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            {mostrarRotulos && (
              <span className="font-bold text-white text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
                Agro<span className="text-[#A5D6A7]">Vision</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setGavetaAberta(false)}
            aria-label="Fechar menu"
            className="md:hidden p-1 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto" aria-label="Menu do painel">
          {NAV_ITEMS.map(({ to, icon: Icon, label, exato, tambem }) => (
            <NavLink
              key={to}
              to={to}
              end={exato}
              title={mostrarRotulos ? undefined : label}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium ${
                  isActive || tambem?.some((p) => pathname.startsWith(p))
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {mostrarRotulos ? <span>{label}</span> : <span className="sr-only">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={sair}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {mostrarRotulos ? <span>Sair</span> : <span className="sr-only">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-border flex items-center gap-3 px-4 sm:px-6 flex-shrink-0">
          <button
            onClick={() => setGavetaAberta(true)}
            aria-label="Abrir menu"
            className="md:hidden p-2 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setRecolhido(!recolhido)}
            aria-label={recolhido ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-expanded={!recolhido}
            className="hidden md:block p-2 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative" ref={notificacoesRef}>
              <button
                onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
                aria-label="Notificações"
                aria-expanded={notificacoesAbertas}
                className="p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors"
              >
                <Bell className="w-5 h-5 text-[#4a5568]" />
              </button>
              {notificacoesAbertas && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-border rounded-lg shadow-xl p-4 z-30">
                  <p className="font-semibold text-sm text-[#212121] mb-1">Notificações</p>
                  <p className="text-sm text-[#4a5568]">
                    Nenhuma notificação por enquanto. Os resultados das análises aparecem no histórico de Análises.
                  </p>
                </div>
              )}
            </div>
            <Link
              to="/configuracoes"
              className="flex items-center gap-2.5 pl-3 border-l border-border min-w-0"
              aria-label="Minha conta"
            >
              <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{inicial}</span>
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="text-sm font-medium text-[#212121] truncate max-w-[12rem]">{nome}</div>
                <div className="text-xs text-[#4a5568]">{papel}</div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
