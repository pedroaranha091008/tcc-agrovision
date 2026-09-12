import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Leaf, Menu, X } from "lucide-react";
import { scrollToId } from "@/lib/scroll";

const SECOES = [
  { label: "Início", id: "hero" },
  { label: "Sobre", id: "sobre" },
  { label: "Serviços", id: "servicos" },
  { label: "Dashboard", id: "dashboard-preview" },
  { label: "Contato", id: "contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const naHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const irParaSecao = (id: string) => {
    setMobileOpen(false);
    if (naHome) {
      scrollToId(id);
    } else {
      navigate("/");
      setTimeout(() => scrollToId(id), 100);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_24px_rgba(0,0,0,0.06)] border-b border-black/[0.06]"
          : "bg-gradient-to-b from-black/25 via-black/5 to-transparent backdrop-blur-[2px]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-md bg-[#1B5E20] flex items-center justify-center transition-transform group-hover:-rotate-6">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            <span className={scrolled ? "text-[#1B5E20]" : "text-white"}>Agro</span>
            <span className={scrolled ? "text-[#66BB6A]" : "text-[#A5D6A7]"}>Vision</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {SECOES.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => irParaSecao(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled
                  ? "text-[#212121] hover:text-[#1B5E20] hover:bg-[#1B5E20]/[0.06]"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {label}
            </button>
          ))}
          <Link
            to="/login"
            className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              scrolled
                ? "text-[#1B5E20] border border-[#1B5E20]/25 hover:bg-[#1B5E20]/[0.06]"
                : "text-white border border-white/30 hover:bg-white/10"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Login
          </Link>
          <button
            onClick={() => irParaSecao("contato")}
            className="ml-2 px-5 py-2 rounded-md text-sm font-semibold bg-[#1B5E20] text-white transition-all shadow-[3px_3px_0_0_#66BB6A] hover:shadow-[1px_1px_0_0_#66BB6A] hover:translate-x-[2px] hover:translate-y-[2px]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Solicitar Orçamento
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-[#212121]" : "text-white"}`}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/85 backdrop-blur-xl border-t border-black/[0.06] px-6 py-4 flex flex-col gap-2">
          {SECOES.filter((s) => s.id !== "dashboard-preview").map(({ label, id }) => (
            <button
              key={id}
              onClick={() => irParaSecao(id)}
              className="text-left px-4 py-2.5 rounded-lg text-[#212121] hover:bg-[#E8F5E9] hover:text-[#1B5E20] font-medium transition-colors"
            >
              {label}
            </button>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-2.5 rounded-lg text-[#1B5E20] border border-[#1B5E20]/30 font-medium text-left"
          >
            Login
          </Link>
          <button
            onClick={() => irParaSecao("contato")}
            className="px-4 py-2.5 rounded-lg bg-[#1B5E20] text-white font-semibold text-left"
          >
            Solicitar Orçamento
          </button>
        </div>
      )}
    </nav>
  );
}
