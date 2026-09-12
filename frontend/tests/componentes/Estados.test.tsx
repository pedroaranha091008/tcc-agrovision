import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EstadoErro, EstadoVazio } from "@/components/comum/Estados";
import { ApiError } from "@/services/erros";

describe("EstadoErro", () => {
  it("mostra a mensagem traduzida do erro em uma região role=alert", () => {
    render(<EstadoErro erro={new ApiError("CREDENCIAIS_INVALIDAS", "x", 401)} />);
    const alerta = screen.getByRole("alert");
    expect(alerta).toHaveTextContent("Email ou senha incorretos.");
  });

  it("chama onTentarNovamente ao clicar no botão", async () => {
    const onTentar = vi.fn();
    const user = userEvent.setup();
    render(<EstadoErro erro={new Error("falhou")} onTentarNovamente={onTentar} />);
    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(onTentar).toHaveBeenCalledTimes(1);
  });

  it("não mostra botão de retry quando o callback não é passado", () => {
    render(<EstadoErro erro={new Error("falhou")} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("EstadoVazio", () => {
  it("mostra título, descrição e ação", () => {
    render(<EstadoVazio titulo="Nada aqui" descricao="Explicação" acao={<button>Ação</button>} />);
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByText("Explicação")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument();
  });
});
