import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eye, Leaf, Target, Wifi } from "lucide-react";
import { DroneIllustration } from "./DroneIllustration";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

export function DroneScrollSection() {
  const wrapperRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const droneWrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scanLinhaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const callouts = gsap.utils.toArray<HTMLElement>(".agv-callout");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      gsap.set(droneWrapRef.current, { opacity: 0, x: 140, y: 160, scale: 0.5, rotate: 12 });
      gsap.set(callouts, { opacity: 0, y: 24 });
      gsap.set(gridRef.current, { opacity: 0 });
      gsap.set(scanLinhaRef.current, { opacity: 0, yPercent: -120 });
      gsap.set(outroRef.current, { opacity: 0, y: 24 });

      tl.to(introRef.current, { opacity: 0, y: -40, duration: 0.4 }, 0)
        .to(
          droneWrapRef.current,
          { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: "power2.out" },
          0.05,
        )
        .to(gridRef.current, { opacity: 0.35, duration: 0.3 }, 0.6)
        .to(scanLinhaRef.current, { opacity: 1, duration: 0.15 }, 0.75)
        .to(scanLinhaRef.current, { yPercent: 120, duration: 1.6, ease: "none" }, 0.75)
        .to(scanLinhaRef.current, { opacity: 0, duration: 0.2 }, 2.2);

      callouts.forEach((el, i) => {
        const entrada = 0.95 + i * 0.32;
        tl.to(el, { opacity: 1, y: 0, duration: 0.3 }, entrada);
      });

      tl.to(callouts, { opacity: 0, y: -16, duration: 0.3, stagger: 0.05 }, 2.55)
        .to(gridRef.current, { opacity: 0, duration: 0.3 }, 2.55)
        .to(
          droneWrapRef.current,
          { y: -220, scale: 0.7, opacity: 0, duration: 0.6, ease: "power1.in" },
          2.7,
        )
        .to(outroRef.current, { opacity: 1, y: 0, duration: 0.5 }, 2.9);
    },
    { scope: wrapperRef },
  );

  return (
    <section ref={wrapperRef} className="relative bg-[#0a2e0c]" style={{ height: "450vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2e0c] via-[#0d1f0f] to-[#0a2e0c]" />

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

        <div ref={introRef} className="absolute z-10 text-center px-6 max-w-lg" style={{ fontFamily: "Inter, sans-serif" }}>
          <p className="text-xs uppercase tracking-widest text-[#66BB6A] mb-3">Como funciona</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
            Veja o que o drone enxerga
          </h2>
          <p className="text-white/60">Role a página para acompanhar o voo sobre a lavoura.</p>
        </div>

        <div ref={droneWrapRef} className="relative z-10 w-[220px] sm:w-[300px] md:w-[420px] aspect-[4/3]">
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
      </div>
    </section>
  );
}
