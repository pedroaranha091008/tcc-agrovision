import { Calendar, CheckCircle, Download, Map, Upload } from "lucide-react";

const steps = [
  {
    icon: Upload,
    num: "01",
    title: "Solicitação Online",
    desc: "Preencha o formulário com os dados da sua propriedade, cultura e área desejada. Nossa equipe retorna em até 2 horas úteis.",
  },
  {
    icon: Calendar,
    num: "02",
    title: "Agendamento de Voo",
    desc: "Definimos a data e horário ideal para o voo, considerando condições climáticas e disponibilidade da equipe técnica.",
  },
  {
    icon: Map,
    num: "03",
    title: "Captura e Processamento",
    desc: "Nossos drones realizam o voo e as imagens são processadas com algoritmos de IA para gerar mapas de alta precisão.",
  },
  {
    icon: Download,
    num: "04",
    title: "Entrega dos Relatórios",
    desc: "Em até 48 horas você recebe os relatórios completos no dashboard com mapas, índices e recomendações técnicas.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-1.5 mb-4 text-sm font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <CheckCircle className="w-4 h-4" /> Como Funciona
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Processo simples,
            <span className="text-[#1B5E20]"> resultados excepcionais</span>
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#E8F5E9] via-[#66BB6A] to-[#E8F5E9]" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center group">
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] flex items-center justify-center shadow-xl shadow-green-900/20 group-hover:shadow-green-900/30 group-hover:-translate-y-1 transition-all">
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <span
                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#66BB6A] text-white text-xs font-bold flex items-center justify-center"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="text-4xl font-bold text-[#E8F5E9] mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-[#212121] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {step.title}
                </h3>
                <p className="text-[#4a5568] text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
