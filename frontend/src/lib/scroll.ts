/**
 * Rola suavemente ate uma secao da landing page pelo id do elemento.
 * Usado pelos links de ancora do menu e dos CTAs.
 */
export function scrollToId(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
