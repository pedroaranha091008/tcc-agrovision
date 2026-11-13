import { Link, useLocation, useNavigate } from "react-router";
import { Globe, Leaf, Mail, MapPin, Phone } from "lucide-react";
import { scrollToId } from "@/lib/scroll";

const SECOES = [
  { label: "Início", id: "hero" },
  { label: "Sobre", id: "sobre" },
  { label: "Serviços", id: "servicos" },
  { label: "Dashboard", id: "dashboard-preview" },
  { label: "Contato", id: "contato" },
];

// Contatos exibidos no site — troque pelos dados reais da equipe antes de publicar.
const CONTATO = { email: "contato@agrovision.com.br", telefone: "+55 (16) 99999-0000", cidade: "Ribeirão Preto, SP", site: "agrovision.com.br" };

export function Footer() {
  const naHome = useLocation().pathname === "/";
  const navigate = useNavigate();

  const irParaSecao = (id: string) => {
    if (naHome) return scrollToId(id);
    navigate("/");
    setTimeout(() => scrollToId(id), 100);
  };

  return (
    <footer className="bg-[#0a2e0c] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-md bg-[#66BB6A] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#0a2e0c]" />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: "Poppins, sans-serif" }}>
                Agro<span className="text-[#66BB6A]">Vision</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Tecnologia de precisão para o agronegócio brasileiro. Mapeamento com drones, análises e relatórios que
              transformam dados em decisões.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: "Poppins, sans-serif" }}>
              Links
            </h4>
            <div className="flex flex-col gap-2" style={{ fontFamily: "Inter, sans-serif" }}>
              {SECOES.map(({ label, id }) => (
                <button key={id} onClick={() => irParaSecao(id)} className="text-left text-white/60 hover:text-white text-sm transition-colors">
                  {label}
                </button>
              ))}
              <Link to="/login" className="text-white/60 hover:text-white text-sm transition-colors">
                Área do cliente
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: "Poppins, sans-serif" }}>
              Contato
            </h4>
            <div className="flex flex-col gap-3 text-white/60 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              <a href={`mailto:${CONTATO.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#66BB6A]" /> {CONTATO.email}
              </a>
              <a href={`tel:+${CONTATO.telefone.replace(/\D/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#66BB6A]" /> {CONTATO.telefone}
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#66BB6A]" /> {CONTATO.cidade}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#66BB6A]" /> {CONTATO.site}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center md:text-left" style={{ fontFamily: "Inter, sans-serif" }}>
            © 2026 AgroVision. Todos os direitos reservados. TCC — Agricultura de Precisão.
          </p>
          <div className="flex gap-6 text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
