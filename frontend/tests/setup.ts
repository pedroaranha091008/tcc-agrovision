import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom nao implementa scrollTo/scrollIntoView; varias telas chamam isso.
beforeEach(() => {
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  localStorage.clear();
});

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
