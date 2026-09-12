import { Calendar, Download, Map, Upload } from "lucide-react";
import { Kicker } from "./Kicker";

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
          <div className="flex justify-center">
            <Kicker>Como Funciona</Kicker>
          </div>
          <h2
            className="text-5xl md:text-6xl font-black text-[#212121] mb-4 tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Processo simples,
            <span className="text-[#1B5E20]"> resultados excepcionais</span>
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-0.5 bg-[#212121]/10" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center group">
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-md bg-[#1B5E20] flex items-center justify-center transition-transform group-hover:-translate-y-1">
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <span
                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#66BB6A] text-[#0a2e0c] text-xs font-bold flex items-center justify-center border-2 border-white"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="text-4xl font-bold text-[#212121]/10 mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>
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
