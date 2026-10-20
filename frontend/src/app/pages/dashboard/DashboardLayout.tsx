import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Activity, Bell, Calendar, FileText, LayoutDashboard, LogOut, Menu, Settings, Tractor, X } from "lucide-react";
import { Logo } from "../../components/Logo";
import { useAuth } from "../../lib/auth";
import { TIPOS_USUARIO } from "../../lib/site";

export const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Visão Geral", end: true },
  { to: "/dashboard/analises", icon: Activity, label: "Minhas Análises" },
  { to: "/dashboard/relatorios", icon: FileText, label: "Relatórios" },
  { to: "/dashboard/fazendas", icon: Tractor, label: "Fazendas" },
  { to: "/dashboard/agendamentos", icon: Calendar, label: "Agendamentos" },
  { to: "/dashboard/configuracoes", icon: Settings, label: "Configurações" },
];

export function DashboardLayout() {
  const { usuario, sair } = useAuth();
  const { pathname } = useLocation();
  const [recolhido, setRecolhido] = useState(false); // desktop
  const [gavetaAberta, setGavetaAberta] = useState(false); // celular
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setGavetaAberta(false); setNotificacoesAbertas(false); }, [pathname]);

  useEffect(() => {
    if (!notificacoesAbertas) return;
    const fechar = (e: MouseEvent) => { if (!notifRef.current?.contains(e.target as Node)) setNotificacoesAbertas(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setNotificacoesAbertas(false); };
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", fechar); document.removeEventListener("keydown", esc); };
  }, [notificacoesAbertas]);


  if (!usuario) return null;
  const iniciais = usuario.nome.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join("");
  const mostrarRotulos = !recolhido || gavetaAberta;

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {gavetaAberta && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setGavetaAberta(false)} aria-hidden />}

      <aside className={`fixed md:sticky top-0 z-40 h-screen bg-[#1B5E20] flex flex-col transition-all duration-300 flex-shrink-0
        ${gavetaAberta ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"} ${recolhido ? "md:w-16" : "md:w-60"}`}>
        <div className="p-4 flex items-center justify-between gap-3 border-b border-white/10 h-16">
          <Link to="/" aria-label="AgroVision — página inicial">{mostrarRotulos ? <Logo variante="claro" tamanho="sm" /> : <span className="block w-8"><Logo variante="claro" tamanho="sm" /></span>}</Link>
          <button onClick={() => setGavetaAberta(false)} className="md:hidden p-1 text-white/70 hover:text-white" aria-label="Fechar menu"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto" aria-label="Menu do painel">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} title={mostrarRotulos ? undefined : label}
              className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden />
              {mostrarRotulos ? <span>{label}</span> : <span className="sr-only">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={sair}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden />
            {mostrarRotulos ? <span>Sair</span> : <span className="sr-only">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center gap-3 px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20">
          <button onClick={() => setGavetaAberta(true)} className="md:hidden p-2 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568]" aria-label="Abrir menu">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={() => setRecolhido(!recolhido)} className="hidden md:block p-2 rounded-lg hover:bg-[#F8F9FA] text-[#4a5568]"
            aria-label={recolhido ? "Expandir menu lateral" : "Recolher menu lateral"} aria-expanded={!recolhido}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotificacoesAbertas(!notificacoesAbertas)} aria-label="Notificações" aria-expanded={notificacoesAbertas} aria-haspopup="true"
              className="p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors">
              <Bell className="w-5 h-5 text-[#4a5568]" />
            </button>
            {notificacoesAbertas && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-border rounded-2xl shadow-xl p-4 z-30">
                <h2 className="font-semibold text-sm text-[#212121] mb-2 font-display">Notificações</h2>
                <p className="text-sm text-[#4a5568]">Você não tem notificações. Avisaremos aqui quando uma análise ficar pronta ou uma área crítica for detectada.</p>
              </div>
            )}
          </div>

          <Link to="/dashboard/configuracoes" className="flex items-center gap-2.5 pl-3 border-l border-border" aria-label="Minha conta">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#66BB6A] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{iniciais}</span>
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-sm font-medium text-[#212121] truncate max-w-[12rem]">{usuario.nome}</div>
              <div className="text-xs text-[#4a5568]">{TIPOS_USUARIO[usuario.tipo_usuario]}</div>
            </div>
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function CabecalhoPagina({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121] font-display">{titulo}</h1>
        {descricao && <p className="text-[#4a5568] text-sm">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}
