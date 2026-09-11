import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { renderWithProviders } from "../utils/renderWithProviders";
import { RedirectIfAuth, RequireAuth } from "@/features/auth/RequireAuth";
import * as authService from "@/services/auth";
import { session } from "@/services/session";

function Rotas() {
  return (
    <Routes>
      <Route path="/login" element={<p>Tela de login</p>} />
      <Route
        path="/protegida"
        element={
          <RequireAuth>
            <p>Conteúdo protegido</p>
          </RequireAuth>
        }
      />
      <Route
        path="/cadastro"
        element={
          <RedirectIfAuth>
            <p>Tela de cadastro</p>
          </RedirectIfAuth>
        }
      />
      <Route path="/dashboard" element={<p>Painel</p>} />
    </Routes>
  );
}

describe("proteção de rotas", () => {
  it("redireciona usuário não autenticado de /protegida para /login", async () => {
    renderWithProviders(<Rotas />, { rota: "/protegida" });
    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });

  it("mantém usuário autenticado em /protegida", async () => {
    await authService.registrar({ nome: "Maria", email: `maria-${Date.now()}@teste.local`, senha: "senhaForte123" });

    renderWithProviders(<Rotas />, { rota: "/protegida" });
    expect(await screen.findByText("Conteúdo protegido")).toBeInTheDocument();

    session.limpar();
  });

  it("redireciona usuário já autenticado para longe de /cadastro", async () => {
    await authService.registrar({ nome: "Ana", email: `ana-${Date.now()}@teste.local`, senha: "senhaForte123" });

    renderWithProviders(<Rotas />, { rota: "/cadastro" });
    expect(await screen.findByText("Painel")).toBeInTheDocument();
    expect(screen.queryByText("Tela de cadastro")).not.toBeInTheDocument();

    session.limpar();
  });
});
