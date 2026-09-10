import { useState } from "react";
import { AlertTriangle, BarChart2, ChevronRight, Eye, FileText, Leaf, Trees, Zap } from "lucide-react";

const services = [
  {
    icon: Leaf,
    title: "Plantas Daninhas",
    desc: "Identificação precisa de invasoras na lavoura com mapeamento multiespectral para tratamento seletivo e redução de herbicidas.",
    color: "from-green-500 to-green-700",
  },
  {
    icon: AlertTriangle,
    title: "Falhas de Plantio",
    desc: "Detecção automática de falhas no estande de plantas para replantio assertivo e maximização da produtividade por hectare.",
    color: "from-yellow-500 to-orange-600",
  },
  {
    icon: BarChart2,
    title: "Saúde Vegetativa NDVI",
    desc: "Análise do índice de vegetação NDVI em tempo real para monitorar a saúde das plantas e identificar deficiências nutricionais.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Trees,
    title: "Contagem de Árvores",
    desc: "Contagem automática de indivíduos arbóreos com 98% de precisão para inventário florestal e estimativa de produção.",
    color: "from-lime-600 to-green-700",
  },
  {
    icon: Eye,
    title: "Monitoramento de Lavoura",
    desc: "Acompanhamento contínuo da evolução da cultura ao longo do ciclo produtivo com histórico temporal e alertas inteligentes.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: FileText,
    title: "Relatórios Personalizados",
    desc: "Documentos técnicos completos com mapas, gráficos, índices e recomendações agronômicas para cada talhão da propriedade.",
    color: "from-violet-500 to-purple-700",
  },
];

export function ServicesSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="servicos" className="py-28 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-4 text-sm font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Zap className="w-4 h-4" /> Nossos Serviços
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Análises que transformam
            <span className="block text-[#1B5E20]">sua gestão agrícola</span>
          </h2>
          <p className="text-[#4a5568] max-w-2xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Cada serviço é desenvolvido com algoritmos de visão computacional e inteligência artificial para entregar
            insights precisos e acionáveis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`group bg-white rounded-2xl p-7 border transition-all duration-300 cursor-pointer ${
                hovered === i
                  ? "border-[#66BB6A] shadow-xl shadow-green-900/10 -translate-y-2"
                  : "border-border hover:border-[#A5D6A7]"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 shadow-md transition-transform duration-300 group-hover:scale-110`}
              >
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                {s.title}
              </h3>
              <p className="text-[#4a5568] text-sm leading-relaxed mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                {s.desc}
              </p>
              <button
                className="inline-flex items-center gap-1.5 text-[#1B5E20] text-sm font-semibold hover:gap-2.5 transition-all"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Saiba mais <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
