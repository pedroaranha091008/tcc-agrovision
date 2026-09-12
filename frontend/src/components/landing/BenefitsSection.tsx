import { DollarSign, Leaf, Shield, Target, TrendingUp, Wifi } from "lucide-react";
import { Kicker } from "./Kicker";

const benefits = [
  {
    icon: DollarSign,
    title: "Redução de Custos",
    desc: "Diminua gastos com insumos em até 30% por meio da aplicação seletiva e precisa baseada em dados reais da lavoura.",
  },
  {
    icon: TrendingUp,
    title: "Maior Produtividade",
    desc: "Aumente o rendimento por hectare com intervenções no momento certo e no lugar exato, baseadas em análises de NDVI.",
  },
  {
    icon: Target,
    title: "Decisões Assertivas",
    desc: "Tome decisões agronômicas fundamentadas em dados geoespaciais precisos, eliminando achismos e intuições.",
  },
  {
    icon: Wifi,
    title: "Monitoramento Remoto",
    desc: "Acompanhe sua lavoura de qualquer lugar pelo app ou web, recebendo alertas em tempo real sobre áreas críticas.",
  },
  {
    icon: Leaf,
    title: "Sustentabilidade",
    desc: "Reduza o impacto ambiental com aplicação precisa de agroquímicos, preservando solo, água e biodiversidade.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    desc: "Toda a informação da sua propriedade é armazenada com criptografia AES-256 e backups redundantes na nuvem.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-28 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center">
            <Kicker>Benefícios</Kicker>
          </div>
          <h2
            className="text-5xl md:text-6xl font-black text-[#212121] mb-4 tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Por que escolher a<span className="text-[#1B5E20]"> AgroVision?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#212121]/10 border border-[#212121]/10">
          {benefits.map((b) => (
            <div key={b.title} className="group bg-[#F8F9FA] hover:bg-white p-7 transition-colors duration-200">
              <div className="w-12 h-12 rounded-md flex items-center justify-center mb-5 bg-[#1B5E20]">
                <b.icon className="w-6 h-6 text-white" />
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
