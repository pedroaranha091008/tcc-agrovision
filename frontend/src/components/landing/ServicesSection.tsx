import { useState } from "react";
import { AlertTriangle, BarChart2, ChevronRight, Eye, FileText, Leaf, Trees } from "lucide-react";
import { Kicker } from "./Kicker";

const services = [
  {
    icon: Leaf,
    title: "Plantas Daninhas",
    desc: "Identificação precisa de invasoras na lavoura com mapeamento multiespectral para tratamento seletivo e redução de herbicidas.",
  },
  {
    icon: AlertTriangle,
    title: "Falhas de Plantio",
    desc: "Detecção automática de falhas no estande de plantas para replantio assertivo e maximização da produtividade por hectare.",
  },
  {
    icon: BarChart2,
    title: "Saúde Vegetativa NDVI",
    desc: "Análise do índice de vegetação NDVI em tempo real para monitorar a saúde das plantas e identificar deficiências nutricionais.",
  },
  {
    icon: Trees,
    title: "Contagem de Árvores",
    desc: "Contagem automática de indivíduos arbóreos com 98% de precisão para inventário florestal e estimativa de produção.",
  },
  {
    icon: Eye,
    title: "Monitoramento de Lavoura",
    desc: "Acompanhamento contínuo da evolução da cultura ao longo do ciclo produtivo com histórico temporal e alertas inteligentes.",
  },
  {
    icon: FileText,
    title: "Relatórios Personalizados",
    desc: "Documentos técnicos completos com mapas, gráficos, índices e recomendações agronômicas para cada talhão da propriedade.",
  },
];

export function ServicesSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="servicos" className="py-28 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <Kicker>Nossos Serviços</Kicker>
          <h2
            className="text-5xl md:text-6xl font-black text-[#212121] leading-[0.95] mb-4 tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Análises que transformam sua gestão agrícola
          </h2>
          <p className="text-[#4a5568] text-lg" style={{ fontFamily: "Inter, sans-serif" }}>
            Cada serviço é desenvolvido com algoritmos de visão computacional e inteligência artificial para entregar
            insights precisos e acionáveis.
          </p>
        </div>

        <div className="border-t-2 border-[#212121]">
          {services.map((s, i) => (
            <div
              key={s.title}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group grid grid-cols-[auto_1fr] md:grid-cols-[5rem_16rem_1fr_auto] items-center gap-x-6 gap-y-2 py-8 border-b-2 border-[#212121] cursor-pointer transition-colors"
            >
              <div
                className="text-2xl font-black tabular-nums transition-colors row-span-2 md:row-span-1 self-start md:self-center"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  color: hovered === i ? "#1B5E20" : "#A5D6A7",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <h3
                className="text-2xl md:text-3xl font-bold text-[#212121] flex items-center gap-3"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <s.icon
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    hovered === i ? "text-[#1B5E20]" : "text-[#212121]"
                  }`}
                />
                {s.title}
              </h3>

              <p
                className="text-[#4a5568] text-sm leading-relaxed max-w-lg col-span-2 md:col-span-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {s.desc}
              </p>

              <ChevronRight
                className={`hidden md:block w-6 h-6 transition-all ${
                  hovered === i ? "text-[#1B5E20] translate-x-1" : "text-[#212121]/20"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
