import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "@/app/App";
import { AuthProvider } from "@/features/auth/AuthContext";

function renderApp(rotaInicial: string) {
  return render(
    <MemoryRouter initialEntries={[rotaInicial]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("fluxo essencial: cadastro -> dashboard protegido -> logout", () => {
  it("cadastra, cai no dashboard autenticado e desloga de volta para a home", async () => {
    const user = userEvent.setup();
    renderApp("/cadastro");

    expect(await screen.findByRole("heading", { name: "Criar conta" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nome completo"), "Carlos Produtor");
    await user.type(screen.getByLabelText("Email"), `carlos-${Date.now()}@teste.local`);
    await user.type(screen.getByLabelText("Senha"), "senhaForte123");
    await user.type(screen.getByLabelText("Confirmar senha"), "senhaForte123");
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    // Caiu no dashboard, autenticado, com o nome do usuario.
    expect(await screen.findByText(/bem-vindo, carlos/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText("Carlos Produtor")).toBeInTheDocument(); // topo do layout autenticado

    // Rota publica de login nao aparece mais (usuario esta logado).
    expect(screen.queryByRole("heading", { name: "Bem-vindo de volta" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sair/i }));

    // Voltou para a landing page (publica).
    expect(await screen.findByRole("link", { name: "Login" })).toBeInTheDocument();
  }, 20000);

  it("bloqueia acesso direto ao dashboard sem sessão e manda para /login", async () => {
    renderApp("/dashboard");
    expect(await screen.findByText("Bem-vindo de volta")).toBeInTheDocument();
  }, 10000);
});
