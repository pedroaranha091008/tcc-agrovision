import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltrosAtivos } from "@/components/comum/FiltrosAtivos";

describe("FiltrosAtivos", () => {
  it("não renderiza nada quando não há filtros", () => {
    const { container } = render(<FiltrosAtivos itens={[]} onRemover={() => {}} onLimparTudo={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra um chip por filtro e chama onRemover com a chave certa", async () => {
    const onRemover = vi.fn();
    const user = userEvent.setup();
    render(
      <FiltrosAtivos
        itens={[
          { chave: "tipo_analise", rotulo: "Tipo: NDVI" },
          { chave: "data_inicio", rotulo: "De: 01/01/2026" },
        ]}
        onRemover={onRemover}
        onLimparTudo={() => {}}
      />,
    );

    expect(screen.getByText("Tipo: NDVI")).toBeInTheDocument();
    expect(screen.getByText("De: 01/01/2026")).toBeInTheDocument();

    await user.click(screen.getByText("Tipo: NDVI"));
    expect(onRemover).toHaveBeenCalledWith("tipo_analise");
  });

  it("chama onLimparTudo ao clicar em 'Limpar tudo'", async () => {
    const onLimparTudo = vi.fn();
    const user = userEvent.setup();
    render(
      <FiltrosAtivos itens={[{ chave: "x", rotulo: "X" }]} onRemover={() => {}} onLimparTudo={onLimparTudo} />,
    );
    await user.click(screen.getByText("Limpar tudo"));
    expect(onLimparTudo).toHaveBeenCalledTimes(1);
  });
});
