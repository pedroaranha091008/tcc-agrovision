import { ArrowRight, Leaf } from "lucide-react";
import { scrollToId } from "@/lib/scroll";

const numeros = [
  { value: "500+", label: "Clientes ativos" },
  { value: "50k ha", label: "Área mapeada" },
  { value: "98%", label: "Satisfação" },
  { value: "3", label: "Estados atendidos" },
];

export function AboutSection() {
  return (
    <section id="sobre" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-6 text-sm font-medium"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Leaf className="w-4 h-4" /> Sobre a AgroVision
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#212121] leading-tight mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Tecnologia aeroespacial a serviço do campo
            </h2>
            <p className="text-[#4a5568] leading-relaxed mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
              A AgroVision é uma plataforma de análise agrícola que utiliza drones de última geração equipados com
              sensores multiespectrais para capturar dados precisos da lavoura. Nosso sistema transforma imagens aéreas
              em relatórios detalhados que auxiliam produtores rurais a tomar decisões estratégicas baseadas em dados
              reais.
            </p>
            <p className="text-[#4a5568] leading-relaxed mb-10" style={{ fontFamily: "Inter, sans-serif" }}>
              Fundada com o objetivo de democratizar a agricultura de precisão, a AgroVision oferece tecnologia antes
              acessível apenas às grandes corporações, agora disponível para produtores de todos os portes — de pequenos
              sítios a grandes fazendas e cooperativas.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              {numeros.map(({ value, label }) => (
                <div
                  key={label}
                  className="border border-[#E8F5E9] rounded-2xl p-5 hover:border-[#66BB6A] transition-colors"
                >
                  <div className="text-3xl font-bold text-[#1B5E20]" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {value}
                  </div>
                  <div className="text-sm text-[#4a5568] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollToId("contato")}
              className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-[#2E7D32] transition-all hover:-translate-y-0.5 shadow-lg shadow-green-900/20"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Fale Conosco <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-green-900/15 border border-[#E8F5E9]">
              <div className="bg-[#1B5E20] px-5 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-white/70 text-sm flex-1 text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                  Mapa Agrícola — Fazenda São João
                </span>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&h=450&fit=crop&auto=format"
                  alt="Mapa agrícola de lavoura vista de cima"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B5E20]/60 to-transparent" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(102,187,106,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.8) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="absolute top-4 left-4 w-16 h-16 rounded-lg bg-green-500/50 border border-green-400/50" />
                <div className="absolute top-4 left-24 w-20 h-20 rounded-lg bg-yellow-400/40 border border-yellow-300/50" />
                <div className="absolute top-4 right-8 w-14 h-14 rounded-lg bg-red-500/40 border border-red-400/50" />
                <div className="absolute bottom-12 left-8 w-24 h-12 rounded-lg bg-green-400/50 border border-green-300/50" />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  {[
                    { color: "bg-green-500", label: "Saudável" },
                    { color: "bg-yellow-400", label: "Atenção" },
                    { color: "bg-red-500", label: "Crítico" },
                  ].map(({ color, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-white text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#F8F9FA] px-5 py-4 flex items-center justify-between">
                <div className="text-sm text-[#4a5568]" style={{ fontFamily: "Inter, sans-serif" }}>
                  320 ha mapeados · Índice NDVI: 0.82
                </div>
                <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-3 py-1 rounded-full">
                  Atualizado hoje
                </span>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#E8F5E9] -z-10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#E8F5E9] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
