import { DollarSign, Leaf, Shield, Star, Target, TrendingUp, Wifi } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Redução de Custos",
    desc: "Diminua gastos com insumos em até 30% por meio da aplicação seletiva e precisa baseada em dados reais da lavoura.",
    color: "#1B5E20",
  },
  {
    icon: TrendingUp,
    title: "Maior Produtividade",
    desc: "Aumente o rendimento por hectare com intervenções no momento certo e no lugar exato, baseadas em análises de NDVI.",
    color: "#2E7D32",
  },
  {
    icon: Target,
    title: "Decisões Assertivas",
    desc: "Tome decisões agronômicas fundamentadas em dados geoespaciais precisos, eliminando achismos e intuições.",
    color: "#388E3C",
  },
  {
    icon: Wifi,
    title: "Monitoramento Remoto",
    desc: "Acompanhe sua lavoura de qualquer lugar pelo app ou web, recebendo alertas em tempo real sobre áreas críticas.",
    color: "#1B5E20",
  },
  {
    icon: Leaf,
    title: "Sustentabilidade",
    desc: "Reduza o impacto ambiental com aplicação precisa de agroquímicos, preservando solo, água e biodiversidade.",
    color: "#2E7D32",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    desc: "Toda a informação da sua propriedade é armazenada com criptografia AES-256 e backups redundantes na nuvem.",
    color: "#388E3C",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-28 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-4 text-sm font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <Star className="w-4 h-4" /> Benefícios
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Por que escolher a<span className="text-[#1B5E20]"> AgroVision?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group bg-white rounded-2xl p-7 border border-border hover:border-[#A5D6A7] hover:shadow-lg hover:shadow-green-900/8 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ backgroundColor: b.color + "15" }}
              >
                <b.icon className="w-6 h-6" style={{ color: b.color }} />
              </div>
              <h3 className="text-lg font-bold text-[#212121] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                {b.title}
              </h3>
              <p className="text-[#4a5568] text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
