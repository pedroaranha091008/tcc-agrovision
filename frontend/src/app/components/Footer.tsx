import { Link } from "react-router";
import { Globe, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { SECOES, useIrParaSecao } from "./scroll";
import { CONTATO, REDES_SOCIAIS, telefoneHref } from "../lib/site";

const ICONES = { Instagram, LinkedIn: Linkedin, YouTube: Youtube };

export function Footer() {
  const irPara = useIrParaSecao();

  return (
    <footer className="bg-[#0a2e0c] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="mb-4"><Logo variante="claro" /></div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              Tecnologia de precisão para o agronegócio brasileiro. Mapeamento com drones, análises inteligentes e relatórios que transformam dados em resultados.
            </p>
            {REDES_SOCIAIS.length > 0 && (
              <div className="flex gap-3">
                {REDES_SOCIAIS.map(({ nome, url }) => {
                  const Icone = ICONES[nome];
                  return (
                    <a key={nome} href={url} target="_blank" rel="noopener noreferrer" aria-label={`AgroVision no ${nome}`}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#66BB6A] flex items-center justify-center transition-all hover:-translate-y-0.5">
                      <Icone className="w-4 h-4 text-white" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90 font-display">Links</h4>
            <div className="flex flex-col gap-2">
              {SECOES.map(({ label, id }) => (
                <button key={id} onClick={() => irPara(id)} className="text-left text-white/60 hover:text-white text-sm transition-colors">{label}</button>
              ))}
              <Link to="/login" className="text-white/60 hover:text-white text-sm transition-colors">Área do cliente</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90 font-display">Contato</h4>
            <div className="flex flex-col gap-3 text-white/60 text-sm">
              <a href={`mailto:${CONTATO.email}`} className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="w-4 h-4 text-[#66BB6A]" aria-hidden /> {CONTATO.email}</a>
              <a href={telefoneHref(CONTATO.telefone)} className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 text-[#66BB6A]" aria-hidden /> {CONTATO.telefone}</a>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#66BB6A]" aria-hidden /> {CONTATO.cidade}</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#66BB6A]" aria-hidden /> {CONTATO.site}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center md:text-left">© 2026 AgroVision. Todos os direitos reservados. TCC — Agricultura de Precisão.</p>
          <div className="flex gap-6 text-white/40 text-sm">
            <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
