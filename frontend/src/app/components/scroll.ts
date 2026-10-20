import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

/** Rola até uma seção da home; se estiver em outra página, navega para "/#secao". */
export function useIrParaSecao() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id: string) => {
      if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", id === "hero" ? "/" : `/#${id}`);
      } else {
        navigate(id === "hero" ? "/" : `/#${id}`);
      }
    },
    [navigate, pathname],
  );
}

export const SECOES = [
  { label: "Início", id: "hero" },
  { label: "Sobre", id: "sobre" },
  { label: "Serviços", id: "servicos" },
  { label: "Dashboard", id: "dashboard-preview" },
  { label: "Contato", id: "contato" },
];
