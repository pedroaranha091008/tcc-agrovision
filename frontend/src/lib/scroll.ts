import { getLenis } from "./smoothScroll";

/**
 * Rola suavemente ate uma secao da landing page pelo id do elemento.
 * Usado pelos links de ancora do menu e dos CTAs.
 *
 * Quando o smooth scroll (Lenis) esta ativo, usa o metodo dele — chamar
 * scrollIntoView nativo por cima do Lenis faz os dois disputarem o scroll.
 */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth" });
}
