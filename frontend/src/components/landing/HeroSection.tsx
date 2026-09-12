import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router";
import { ArrowRight, ChevronDown, Clock, Layers, Play, Target } from "lucide-react";
import { scrollToId } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const destaques = [
  { icon: Target, value: "98%", label: "Precisão de mapeamento" },
  { icon: Clock, value: "48h", label: "Entrega de relatórios" },
  { icon: Layers, value: "+500", label: "Hectares analisados" },
];

export function HeroSection() {
  const secaoRef = useRef<HTMLElement>(null);
  const imagemRef = useRef<HTMLImageElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);

  // Parallax preso ao scroll (scrub): a imagem de fundo se move mais devagar
  // que o conteudo, e o conteudo sobe e esmaece conforme a Hero sai de tela.
  // Desativado para quem prefere menos movimento na tela.
  useGSAP(
    () => {
      const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefereMenosMovimento || !imagemRef.current || !conteudoRef.current) return;

      const gatilho = {
        trigger: secaoRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };

      gsap.fromTo(
        imagemRef.current,
        { yPercent: -8 },
        { yPercent: 8, ease: "none", scrollTrigger: gatilho },
      );
      gsap.to(conteudoRef.current, {
        yPercent: 25,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: gatilho,
      });
    },
    { scope: secaoRef },
  );

  return (
    <section ref={secaoRef} id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          ref={imagemRef}
          src="https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=1600&h=900&fit=crop&auto=format"
          alt="Drone sobrevoando plantação agrícola"
          className="w-full h-full object-cover scale-125 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E20]/92 via-[#2E7D32]/80 to-[#1B5E20]/90" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(102,187,106,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(102,187,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div ref={conteudoRef} className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full will-change-transform">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#66BB6A] animate-pulse" />
            <span className="text-white/90 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
              Tecnologia de Precisão para o Agro
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Mapeamento
            <span className="block text-[#A5D6A7]">Inteligente</span>
            <span className="block text-white/90 text-4xl md:text-5xl font-medium mt-1">com Drones para</span>
            <span className="block text-[#66BB6A]">Agricultura de Precisão</span>
          </h1>

          <p
            className="text-lg md:text-xl text-white/75 mb-10 max-w-xl leading-relaxed"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Transforme imagens aéreas em decisões estratégicas para aumentar produtividade e reduzir custos na sua
            lavoura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={() => scrollToId("contato")}
              className="group px-8 py-4 bg-[#66BB6A] hover:bg-[#81C784] text-[#1B5E20] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-900/30 hover:-translate-y-1 hover:shadow-green-900/40"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Solicitar Orçamento
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/dashboard"
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <Play className="w-5 h-5" />
              Ver Dashboard
            </Link>
          </div>

          <div className="flex flex-wrap gap-4">
            {destaques.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 hover:bg-white/15 transition-all hover:-translate-y-0.5 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-[#66BB6A]/20 border border-[#66BB6A]/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#A5D6A7]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {value}
                  </div>
                  <div className="text-xs text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => scrollToId("sobre")}
        aria-label="Rolar para a seção Sobre"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors animate-bounce"
      >
        <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>
          Explorar
        </span>
        <ChevronDown className="w-5 h-5" />
      </button>
    </section>
  );
}
