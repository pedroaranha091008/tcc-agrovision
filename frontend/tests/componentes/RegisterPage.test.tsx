import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils/renderWithProviders";
import { RegisterPage } from "@/pages/RegisterPage";

async function preencher(user: ReturnType<typeof userEvent.setup>, senha: string, confirmar: string) {
  await user.type(screen.getByLabelText("Nome completo"), "João da Silva");
  await user.type(screen.getByLabelText("Email"), `joao-${Date.now()}@teste.local`);
  await user.type(screen.getByLabelText("Senha"), senha);
  await user.type(screen.getByLabelText("Confirmar senha"), confirmar);
  await user.click(screen.getByRole("button", { name: /criar conta/i }));
}

describe("RegisterPage — validação do formulário", () => {
  it("mostra erro quando a senha é curta demais", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { rota: "/cadastro" });

    await preencher(user, "123", "123");

    expect(await screen.findByRole("alert")).toHaveTextContent(/ao menos 8 caracteres/i);
  });

  it("mostra erro quando as senhas não conferem", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { rota: "/cadastro" });

    await preencher(user, "senhaForte123", "outraSenha123");

    expect(await screen.findByRole("alert")).toHaveTextContent(/não conferem/i);
  });

  it("não exibe erro para dados válidos até o submit", () => {
    renderWithProviders(<RegisterPage />, { rota: "/cadastro" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
