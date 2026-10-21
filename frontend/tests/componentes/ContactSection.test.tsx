import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ContactSection } from "@/components/landing/ContactSection";
import * as orcamentos from "@/services/orcamentos";
import { ApiError } from "@/services/erros";

function preencherValido() {
  fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Maria da Conceição" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "maria@fazenda.com.br" } });
  fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "16999990000" } });
  fireEvent.change(screen.getByLabelText("Cidade / Estado"), { target: { value: "Ribeirão Preto, SP" } });
  fireEvent.change(screen.getByLabelText("Área (hectares)"), { target: { value: "120,5" } });
  fireEvent.change(screen.getByLabelText("Tipo de cultura"), { target: { value: "Café" } });
  fireEvent.change(screen.getByLabelText("Serviço desejado"), { target: { value: "Falhas de plantio" } });
}

const renderizar = () => render(<MemoryRouter><ContactSection /></MemoryRouter>);

describe("formulário de orçamento da página inicial", () => {
  afterEach(() => vi.restoreAllMocks());

  it("valida os campos e não envia nada com dados inválidos", () => {
    const enviar = vi.spyOn(orcamentos, "solicitarOrcamento");
    renderizar();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "x@y" } });
    fireEvent.change(screen.getByLabelText("Área (hectares)"), { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: "Solicitar Análise Gratuita" }));

    expect(screen.getByText("Informe seu nome completo.")).toBeInTheDocument();
    expect(screen.getByText(/Informe um email válido/)).toBeInTheDocument();
    expect(screen.getByText("Informe uma área maior que zero.")).toBeInTheDocument();
    expect(screen.getByText("Selecione a cultura.")).toBeInTheDocument();
    expect(enviar).not.toHaveBeenCalled();
  });

  it("formata o telefone enquanto digita", () => {
    renderizar();
    fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "16999990000" } });
    expect(screen.getByLabelText("Telefone")).toHaveValue("(16) 99999-0000");
  });

  it("envia para a API (área com vírgula vira número) e só então confirma", async () => {
    const enviar = vi.spyOn(orcamentos, "solicitarOrcamento").mockResolvedValue({ id_solicitacao: "x", status: "novo", criado_em: "" });
    renderizar();
    preencherValido();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar Análise Gratuita" }));

    expect(await screen.findByText("Solicitação recebida, Maria!")).toBeInTheDocument();
    expect(enviar).toHaveBeenCalledWith(expect.objectContaining({ area_hectares: 120.5, telefone: "(16) 99999-0000", cultura: "Café" }));
  });

  it("se a API falhar, não finge sucesso e mostra os contatos diretos", async () => {
    vi.spyOn(orcamentos, "solicitarOrcamento").mockRejectedValue(ApiError.rede());
    renderizar();
    preencherValido();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar Análise Gratuita" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível enviar sua solicitação agora.");
    expect(screen.queryByText(/Solicitação recebida/)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("contato@agrovision.com.br");
  });
});
