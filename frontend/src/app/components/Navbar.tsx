import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { SECOES, useIrParaSecao } from "./scroll";
import { useAuth } from "../lib/auth";

export function Navbar() {
  const { pathname } = useLocation();
  const { usuario } = useAuth();
  const irPara = useIrParaSecao();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuAberto(false), [pathname]);

  // Fora da home (termos, privacidade) não há foto no topo, então a barra fica sempre sólida.
  const solida = rolou || pathname !== "/" || menuAberto;

  const clicarSecao = (id: string) => {
    setMenuAberto(false);
    irPara(id);
  };

  const acessoConta = usuario
    ? { to: "/dashboard", label: "Meu painel" }
    : { to: "/login", label: "Entrar" };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${solida ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="AgroVision — página inicial">
          <Logo variante={solida ? "escuro" : "claro"} />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {SECOES.map(({ label, id }) => (
            <button key={id} onClick={() => clicarSecao(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${solida ? "text-[#212121] hover:text-[#1B5E20] hover:bg-[#E8F5E9]" : "text-white/90 hover:text-white hover:bg-white/10"}`}>
              {label}
            </button>
          ))}
          <Link to={acessoConta.to}
            className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${solida ? "text-[#1B5E20] border border-[#1B5E20]/30 hover:bg-[#E8F5E9]" : "text-white border border-white/30 hover:bg-white/10"}`}>
            {acessoConta.label}
          </Link>
          <button onClick={() => clicarSecao("contato")}
            className="ml-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white hover:from-[#2E7D32] hover:to-[#388E3C] transition-all shadow-md hover:shadow-green-900/30 hover:-translate-y-0.5">
            Solicitar Orçamento
          </button>
        </div>

        <button onClick={() => setMenuAberto(!menuAberto)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto}
          className={`md:hidden p-2 rounded-lg ${solida ? "text-[#212121]" : "text-white"}`}>
          {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuAberto && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-2">
          {SECOES.map(({ label, id }) => (
            <button key={id} onClick={() => clicarSecao(id)} className="text-left px-4 py-2.5 rounded-lg text-[#212121] hover:bg-[#E8F5E9] hover:text-[#1B5E20] font-medium transition-colors">{label}</button>
          ))}
          <Link to={acessoConta.to} className="px-4 py-2.5 rounded-lg text-[#1B5E20] border border-[#1B5E20]/30 font-medium">{acessoConta.label}</Link>
          <button onClick={() => clicarSecao("contato")} className="px-4 py-2.5 rounded-lg bg-[#1B5E20] text-white font-semibold text-left">Solicitar Orçamento</button>
        </div>
      )}
    </nav>
  );
}
