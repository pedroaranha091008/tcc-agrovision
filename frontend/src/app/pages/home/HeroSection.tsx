import { useNavigate } from "react-router";
import { ArrowRight, ChevronDown, Clock, Layers, LayoutDashboard, Target } from "lucide-react";
import heroImg from "../../../assets/hero.jpg";
import { useIrParaSecao } from "../../components/scroll";

export function HeroSection() {
  const navigate = useNavigate();
  const irPara = useIrParaSecao();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20]/92 via-[#2E7D32]/80 to-[#1B5E20]/90" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(102,187,106,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
      </div>

      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(rgba(102,187,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#66BB6A] animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Tecnologia de Precisão para o Agro</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 font-display">
            Mapeamento
            <span className="block text-[#A5D6A7]">Inteligente</span>
            <span className="block text-white/90 text-4xl md:text-5xl font-medium mt-1">com Drones para</span>
            <span className="block text-[#66BB6A]">Agricultura de Precisão</span>
          </h1>

          <p className="text-lg md:text-xl text-white/75 mb-10 max-w-xl leading-relaxed">
            Transforme imagens aéreas em decisões estratégicas para aumentar produtividade e reduzir custos na sua lavoura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button onClick={() => irPara("contato")}
              className="group px-8 py-4 bg-[#66BB6A] hover:bg-[#81C784] text-[#1B5E20] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-900/30 hover:-translate-y-1 hover:shadow-green-900/40 font-display">
              Solicitar Orçamento
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 font-display">
              <LayoutDashboard className="w-5 h-5" />
              Acessar Plataforma
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { icon: Target, value: "98%", label: "Precisão de mapeamento" },
              { icon: Clock, value: "48h", label: "Entrega de relatórios" },
              { icon: Layers, value: "50 mil ha", label: "Área já mapeada" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3">
                <div className="w-10 h-10 rounded-xl bg-[#66BB6A]/20 border border-[#66BB6A]/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#A5D6A7]" aria-hidden />
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-display">{value}</div>
                  <div className="text-xs text-white/60">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => irPara("sobre")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors animate-bounce">
        <span className="text-xs uppercase tracking-widest">Explorar</span>
        <ChevronDown className="w-5 h-5" aria-hidden />
      </button>
    </section>
  );
}
