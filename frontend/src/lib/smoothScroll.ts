import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll suave (estilo dos sites de produto com scroll-storytelling) via
 * Lenis, sincronizado com o ticker do GSAP para o ScrollTrigger acompanhar
 * o scroll "virtual" do Lenis em vez do nativo do navegador.
 *
 * Escopo deliberadamente só nas páginas públicas (ver PublicLayout): a área
 * autenticada tem tabelas, modais e formulários onde um scroll customizado
 * atrapalharia mais do que ajudaria.
 */

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

export function iniciarSmoothScroll(): void {
  if (lenis || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);

  tickerFn = (time: number) => {
    lenis?.raf(time * 1000);
  };
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);
}

export function pararSmoothScroll(): void {
  if (tickerFn) {
    gsap.ticker.remove(tickerFn);
    tickerFn = null;
  }
  lenis?.destroy();
  lenis = null;
}

export function getLenis(): Lenis | null {
  return lenis;
}
