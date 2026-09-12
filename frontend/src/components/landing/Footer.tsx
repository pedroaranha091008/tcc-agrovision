import { Globe, Instagram, Leaf, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";

const redes = [Instagram, Twitter, Linkedin, Youtube];
const links = ["Início", "Sobre", "Serviços", "Dashboard", "Contato"];

export function Footer() {
  return (
    <footer className="bg-[#0a2e0c] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-md bg-[#66BB6A] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#0a2e0c]" />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: "Poppins, sans-serif" }}>
                Agro<span className="text-[#66BB6A]">Vision</span>
              </span>
            </div>
            <p
              className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Tecnologia de precisão para o agronegócio brasileiro. Mapeamento com drones, análises inteligentes e
              relatórios que transformam dados em resultados.
            </p>
            <div className="flex gap-3">
              {redes.map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-md bg-white/10 hover:bg-[#66BB6A] flex items-center justify-center transition-all hover:-translate-y-0.5"
                >
                  <Icon className="w-4 h-4 text-white" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: "Poppins, sans-serif" }}>
              Links
            </h4>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <button
                  key={link}
                  className="text-left text-white/60 hover:text-white text-sm transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90" style={{ fontFamily: "Poppins, sans-serif" }}>
              Contato
            </h4>
            <div className="flex flex-col gap-3 text-white/60 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#66BB6A]" /> contato@agrovision.com.br
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#66BB6A]" /> +55 (16) 99999-0000
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#66BB6A]" /> Ribeirão Preto, SP
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#66BB6A]" /> agrovision.com.br
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            © 2026 AgroVision. Todos os direitos reservados. TCC — Agricultura de Precisão.
          </p>
          <div className="flex gap-6 text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            <button className="hover:text-white transition-colors">Privacidade</button>
            <button className="hover:text-white transition-colors">Termos de Uso</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
