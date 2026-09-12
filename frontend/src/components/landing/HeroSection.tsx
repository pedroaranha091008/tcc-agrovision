import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router";
import { ArrowRight, ChevronDown, Clock, Eye, Layers, Leaf, Play, Target, Wifi } from "lucide-react";
import { scrollToId } from "@/lib/scroll";
import { DroneIllustration } from "./DroneIllustration";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const destaques = [
  { icon: Target, value: "98%", label: "Precisão de mapeamento" },
  { icon: Clock, value: "48h", label: "Entrega de relatórios" },
  { icon: Layers, value: "+500", label: "Hectares analisados" },
];

const callouts = [
  {
    icon: Leaf,
    titulo: "Sensores Multiespectrais",
    texto: "Captura índices de vegetação como o NDVI em cada pixel da lavoura.",
    posicao: "top-[16%] left-[4%] md:left-[8%]",
  },
  {
    icon: Eye,
    titulo: "Visão em Alta Resolução",
    texto: "Identifica falhas de plantio e focos de praga com nitidez centimétrica.",
    posicao: "top-[16%] right-[4%] md:right-[8%]",
  },
  {
    icon: Wifi,
    titulo: "Telemetria em Tempo Real",
    texto: "Acompanhe rota, altitude e status do voo ao vivo, direto no dashboard.",
    posicao: "bottom-[18%] left-[4%] md:left-[10%]",
  },
  {
    icon: Target,
    titulo: "Precisão Georreferenciada",
    texto: "Cada imagem é posicionada com exatidão para gerar mapas confiáveis.",
    posicao: "bottom-[18%] right-[4%] md:right-[10%]",
  },
] as const;

/**
 * Hero + demonstração do drone como uma única jornada presa ao scroll
 * (inspirado em sites de produto como thetinypod.com/flite.bike): a seção
 * fica "grudada" na tela por vários viewports enquanto uma timeline do GSAP,
 * escrubada 1:1 com o scroll, toca a história abaixo. Nada disso depende de
 * JS para o conteúdo inicial existir — é só a animação que é progressiva.
 */
export function HeroSection() {
  const wrapperRef = useRef<HTMLElement>(null);
  const fotoRef = useRef<HTMLImageElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scanLinhaRef = useRef<HTMLDivElement>(null);
  const droneWrapRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cartoes = gsap.utils.toArray<HTMLElement>(".agv-callout");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      gsap.set(gridRef.current, { opacity: 0 });
      gsap.set(scanLinhaRef.current, { opacity: 0, yPercent: -120 });
      gsap.set(droneWrapRef.current, { opacity: 0, x: 140, y: 160, scale: 0.5, rotate: 12 });
      gsap.set(cartoes, { opacity: 0, y: 24 });
      gsap.set(outroRef.current, { opacity: 0, y: 24 });

      // 0 -> 0.5: nada muda (segura o topo pro usuario ler antes de animar).
      tl.to(introRef.current, { opacity: 0, y: -40, duration: 0.4 }, 0.5)
        .to(chevronRef.current, { opacity: 0, duration: 0.3 }, 0.5)
        .to(fotoRef.current, { opacity: 0, scale: 1.08, duration: 0.5 }, 0.5)
        .to(gridRef.current, { opacity: 0.35, duration: 0.4 }, 0.7)
        .to(
          droneWrapRef.current,
          { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: "power2.out" },
          0.6,
        )
        .to(scanLinhaRef.current, { opacity: 1, duration: 0.15 }, 1.3)
        .to(scanLinhaRef.current, { yPercent: 120, duration: 1.6, ease: "none" }, 1.3)
        .to(scanLinhaRef.current, { opacity: 0, duration: 0.2 }, 2.75);

      cartoes.forEach((el, i) => {
        tl.to(el, { opacity: 1, y: 0, duration: 0.3 }, 1.5 + i * 0.32);
      });

      tl.to(cartoes, { opacity: 0, y: -16, duration: 0.3, stagger: 0.05 }, 3.1)
        .to(gridRef.current, { opacity: 0, duration: 0.3 }, 3.1)
        .to(
          droneWrapRef.current,
          { y: -220, scale: 0.7, opacity: 0, duration: 0.6, ease: "power1.in" },
          3.25,
        )
        .to(outroRef.current, { opacity: 1, y: 0, duration: 0.5 }, 3.45);
    },
    { scope: wrapperRef },
  );

  return (
    <section ref={wrapperRef} id="hero" className="relative bg-[#0a2e0c]" style={{ height: "550vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* fundo: foto real no topo, some para a "sala de mapeamento" escura */}
        <div className="absolute inset-0">
          <img
            ref={fotoRef}
            src="https://images.unsplash.com/photo-1657093114835-031e7cf9520c?w=1600&h=900&fit=crop&auto=format"
            alt="Drone sobrevoando uma lavoura de trigo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a2e0c]/95 via-[#0a2e0c]/60 to-[#0a2e0c]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a2e0c]/90 via-transparent to-[#0a2e0c]/20" />
        </div>

        <div
          ref={gridRef}
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(102,187,106,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(102,187,106,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div
          ref={scanLinhaRef}
          className="absolute left-0 right-0 top-1/2 h-24 -translate-y-1/2 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(102,187,106,0.35) 45%, rgba(165,214,167,0.55) 50%, rgba(102,187,106,0.35) 55%, transparent)",
          }}
        />

        {/* fase 1: heading/CTA originais da Hero */}
        <div ref={introRef} className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
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

        {/* fase 2: drone + callouts */}
        <div ref={droneWrapRef} className="absolute z-10 w-[220px] sm:w-[300px] md:w-[420px] aspect-[4/3]">
          <DroneIllustration />
        </div>

        {callouts.map(({ icon: Icon, titulo, texto, posicao }) => (
          <div
            key={titulo}
            className={`agv-callout absolute z-20 hidden md:block w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 ${posicao}`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <div className="w-9 h-9 rounded-lg bg-[#66BB6A]/20 border border-[#66BB6A]/30 flex items-center justify-center mb-2">
              <Icon className="w-4 h-4 text-[#A5D6A7]" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
              {titulo}
            </h3>
            <p className="text-white/60 text-xs leading-relaxed">{texto}</p>
          </div>
        ))}

        <div ref={outroRef} className="absolute z-10 text-center px-6 max-w-xl" style={{ fontFamily: "Inter, sans-serif" }}>
          <h3 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
            De cada voo, <span className="text-[#66BB6A]">uma decisão melhor.</span>
          </h3>
        </div>

        <button
          ref={chevronRef}
          onClick={() => scrollToId("sobre")}
          aria-label="Rolar para a seção Sobre"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors animate-bounce"
        >
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>
            Explorar
          </span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
