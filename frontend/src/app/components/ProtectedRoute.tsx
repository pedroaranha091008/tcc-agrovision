import { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../lib/auth";
import { Carregando } from "./Carregando";

/** Só deixa passar usuários autenticados; os demais vão para o login e voltam depois. */
export function ProtectedRoute() {
  const { usuario, carregando, saiu } = useAuth();
  const location = useLocation();
  // Se a pessoa clicou em "Sair" com o painel aberto, vai para a home; se entrou depois numa rota protegida, vai para o login.
  const jaTinhaSaido = useRef(saiu).current;

  if (carregando) return <Carregando tela />;
  if (!usuario && saiu && !jaTinhaSaido) return <Navigate to="/" replace />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  return <Outlet />;
}
