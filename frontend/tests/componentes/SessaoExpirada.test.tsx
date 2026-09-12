import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { renderWithProviders } from "../utils/renderWithProviders";
import { RequireAuth } from "@/features/auth/RequireAuth";
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
    </Routes>
  );
}

describe("sessão expirada em segundo plano", () => {
  it("desloga a UI quando session.limpar() é chamado longe do AuthContext", async () => {
    await authService.registrar({
      nome: "Sessão Teste",
      email: `sessao-${Date.now()}@teste.local`,
      senha: "senhaForte123",
    });

    renderWithProviders(<Rotas />, { rota: "/protegida" });
    expect(await screen.findByText("Conteúdo protegido")).toBeInTheDocument();

    // Simula uma renovacao de sessao que falhou bem no fundo da pilha
    // (dentro de http.ts, por exemplo), sem passar pelo logout() do
    // AuthContext. Antes da correcao, a tela continuava mostrando o
    // conteudo protegido indefinidamente.
    session.limpar();

    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
  });
});
