import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom nao implementa scrollTo/scrollIntoView; varias telas chamam isso.
beforeEach(() => {
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  localStorage.clear();
});

// jsdom nao implementa matchMedia; o GSAP ScrollTrigger usa isso so de
// registrar o plugin (import da HeroSection), mesmo sem nenhum teste
// simular scroll de verdade.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

// Desmonta o DOM renderizado entre testes (equivalente ao auto-cleanup do
// Testing Library, que depende de um afterEach global que nao habilitamos).
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom nao implementa ResizeObserver; o Recharts (graficos do dashboard) usa.
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver ??= ResizeObserverPolyfill;
