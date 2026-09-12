import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Navbar } from "@/components/landing/Navbar";
import { getLenis, iniciarSmoothScroll, pararSmoothScroll } from "@/lib/smoothScroll";

/** Estrutura das paginas publicas com a barra de navegacao institucional. */
export function PublicLayout() {
  const { pathname } = useLocation();

  // Smooth scroll (Lenis) fica restrito as paginas publicas — ver
  // lib/smoothScroll.ts para o porque de nao ligar isso globalmente.
  useEffect(() => {
    iniciarSmoothScroll();
    return () => pararSmoothScroll();
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      <Outlet />
    </div>
  );
}
