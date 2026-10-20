import { useState } from "react";
import { AlertTriangle, ArrowRight, BarChart2, CheckCircle, ChevronDown, Eye, FileText, Leaf, Trees, Zap } from "lucide-react";
import { SERVICOS } from "../../lib/site";

const services = [
  {
    icon: Leaf, title: "Plantas Daninhas", servico: SERVICOS[2], color: "from-green-500 to-green-700",
    desc: "Identificação precisa de invasoras na lavoura com mapeamento multiespectral para tratamento seletivo e redução de herbicidas.",
    detalhes: ["Mapa de infestação por talhão", "Arquivo de prescrição para pulverização localizada", "Comparativo entre voos"],
  },
  {
    icon: AlertTriangle, title: "Falhas de Plantio", servico: SERVICOS[1], color: "from-yellow-500 to-orange-600",
    desc: "Detecção de falhas no estande de plantas para replantio assertivo e maximização da produtividade por hectare.",
    detalhes: ["Percentual de falhas por setor", "Localização das linhas com falha", "Recomendação de replantio"],
  },
  {
    icon: BarChart2, title: "Saúde Vegetativa NDVI", servico: SERVICOS[0], color: "from-emerald-500 to-teal-600",
    desc: "Análise do índice de vegetação NDVI para monitorar a saúde das plantas e identificar deficiências nutricionais.",
    detalhes: ["Mapa NDVI colorido por zona", "Evolução do índice ao longo da safra", "Áreas prioritárias para inspeção"],
  },
  {
    icon: Trees, title: "Contagem de Árvores", servico: SERVICOS[3], color: "from-lime-600 to-green-700",
    desc: "Contagem automática de indivíduos arbóreos para inventário florestal, pomares e estimativa de produção.",
    detalhes: ["Total de plantas por talhão", "Identificação de falhas e mortes", "Ideal para café, citros e eucalipto"],
  },
  {
    icon: Eye, title: "Monitoramento de Lavoura", servico: SERVICOS[4], color: "from-cyan-500 to-blue-600",
    desc: "Acompanhamento da evolução da cultura ao longo do ciclo produtivo com histórico temporal e alertas.",
    detalhes: ["Voos periódicos agendados", "Histórico de todas as análises no painel", "Alertas de áreas críticas"],
  },
  {
    icon: FileText, title: "Relatórios Personalizados", servico: SERVICOS[5], color: "from-violet-500 to-purple-700",
    desc: "Documentos técnicos com mapas, gráficos, índices e recomendações agronômicas para cada talhão da propriedade.",
    detalhes: ["Relatório em PDF", "Indicadores escolhidos pelo cliente", "Recomendações por talhão"],
  },
];

export function ServicesSection({ onSolicitar }: { onSolicitar: (servico: string) => void }) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <section id="servicos" className="py-28 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
            <Zap className="w-4 h-4" aria-hidden /> Nossos Serviços
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4 font-display">
            Análises que transformam
            <span className="block text-[#1B5E20]">sua gestão agrícola</span>
          </h2>
          <p className="text-[#4a5568] max-w-2xl mx-auto">
            Cada serviço combina imagens de drone e processamento digital para entregar informações precisas e acionáveis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {services.map((s, i) => {
            const expandido = aberto === i;
            return (
              <div key={s.title}
                className={`group bg-white rounded-2xl p-7 border transition-all duration-300 ${expandido ? "border-[#66BB6A] shadow-xl shadow-green-900/10" : "border-border hover:border-[#A5D6A7] hover:shadow-lg hover:-translate-y-1"}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 shadow-md transition-transform duration-300 group-hover:scale-110`}>
                  <s.icon className="w-7 h-7 text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[#212121] mb-3 font-display">{s.title}</h3>
                <p className="text-[#4a5568] text-sm leading-relaxed mb-5">{s.desc}</p>

                {expandido && (
                  <div id={`servico-${i}`} className="mb-5 space-y-2">
                    {s.detalhes.map(d => (
                      <div key={d} className="flex items-start gap-2 text-sm text-[#212121]">
                        <CheckCircle className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" aria-hidden /> {d}
                      </div>
                    ))}
                    <button onClick={() => onSolicitar(s.servico)}
                      className="mt-3 inline-flex items-center gap-2 bg-[#1B5E20] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#2E7D32] transition-colors">
                      Solicitar este serviço <ArrowRight className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                )}

                <button onClick={() => setAberto(expandido ? null : i)} aria-expanded={expandido} aria-controls={`servico-${i}`}
                  className="inline-flex items-center gap-1.5 text-[#1B5E20] text-sm font-semibold">
                  {expandido ? "Mostrar menos" : "Saiba mais"}
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandido ? "rotate-180" : ""}`} aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
