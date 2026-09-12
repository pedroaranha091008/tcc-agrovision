import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils/renderWithProviders";
import { LoginPage } from "@/pages/LoginPage";
import * as authService from "@/services/auth";
import { session } from "@/services/session";

describe("LoginPage — estados de erro da API", () => {
  it("mostra 'Email ou senha incorretos.' para credenciais inválidas", async () => {
    const email = `login-${Date.now()}@teste.local`;
    await authService.registrar({ nome: "Teste", email, senha: "senhaCorreta123" });
    session.limpar(); // desloga para testar o formulario de login

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { rota: "/login" });

    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Senha"), "senhaErrada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email ou senha incorretos.");
  });
});
