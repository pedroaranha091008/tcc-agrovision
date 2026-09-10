import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Navbar } from "@/components/landing/Navbar";

/** Estrutura das paginas publicas com a barra de navegacao institucional. */
export function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      <Outlet />
    </div>
  );
}
