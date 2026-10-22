import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { EsqueciSenhaPage, RedefinirSenhaPage } from "@/pages/SenhaPages";
import * as authService from "@/services/auth";
import { ApiError } from "@/services/erros";

function LoginFalso() {
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso;
  return <p>login: {aviso}</p>;
}

const renderizar = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
        <Route path="/login" element={<LoginFalso />} />
      </Routes>
    </MemoryRouter>,
  );

describe("esqueci a senha", () => {
  afterEach(() => vi.restoreAllMocks());

  it("não envia com email inválido", () => {
    const enviar = vi.spyOn(authService, "esqueciSenha");
    renderizar("/esqueci-senha");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "x@y" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um email válido.");
    expect(enviar).not.toHaveBeenCalled();
  });

  it("envia o pedido e mostra a confirmação", async () => {
    const enviar = vi.spyOn(authService, "esqueciSenha").mockResolvedValue();
    renderizar("/esqueci-senha");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: " joao@fazenda.com.br " } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByText("Confira seu email")).toBeInTheDocument();
    expect(screen.getByText("joao@fazenda.com.br")).toBeInTheDocument();
    expect(enviar).toHaveBeenCalledWith("joao@fazenda.com.br");
  });
});

describe("redefinir a senha", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sem token no link mostra que o link é inválido", () => {
    renderizar("/redefinir-senha");
    expect(screen.getByText("Link inválido ou expirado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedir um novo link" })).toHaveAttribute("href", "/esqueci-senha");
  });

  it("confere as senhas antes de enviar", () => {
    const redefinir = vi.spyOn(authService, "redefinirSenha");
    renderizar("/redefinir-senha?token=abc");
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "senhaNova123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: "outra12345" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(screen.getByRole("alert")).toHaveTextContent("As senhas não conferem.");
    expect(redefinir).not.toHaveBeenCalled();
  });

  it("salva e volta ao login com o aviso de sucesso", async () => {
    const redefinir = vi.spyOn(authService, "redefinirSenha").mockResolvedValue();
    renderizar("/redefinir-senha?token=abc");
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "senhaNova123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: "senhaNova123" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(await screen.findByText("login: Senha alterada. Entre com a nova senha.")).toBeInTheDocument();
    expect(redefinir).toHaveBeenCalledWith("abc", "senhaNova123");
  });

  it("link recusado pelo servidor mostra a tela de link inválido", async () => {
    vi.spyOn(authService, "redefinirSenha").mockRejectedValue(new ApiError("REQUISICAO_INVALIDA", "Este link é inválido ou expirou.", 400));
    renderizar("/redefinir-senha?token=velho");
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "senhaNova123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: "senhaNova123" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(await screen.findByText("Link inválido ou expirado")).toBeInTheDocument();
  });
});
