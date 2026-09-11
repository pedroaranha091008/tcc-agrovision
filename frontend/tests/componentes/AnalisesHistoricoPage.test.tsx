import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils/renderWithProviders";
import { semearAnalise } from "../utils/seed";
import { AnalisesHistoricoPage } from "@/pages/analises/AnalisesHistoricoPage";

describe("AnalisesHistoricoPage — filtros", () => {
  it("lista a análise semeada e filtra por tipo", async () => {
    await semearAnalise({ tipo_analise: "NDVI" });

    const user = userEvent.setup();
    renderWithProviders(<AnalisesHistoricoPage />, { rota: "/analises" });

    const tabela = await screen.findByRole("table");
    expect(within(tabela).getByText("Fazenda Teste")).toBeInTheDocument();

    // filtra por um tipo que nao bate com o registro -> lista vazia
    await user.selectOptions(screen.getByLabelText("Tipo de análise"), "RGB");
    expect(await screen.findByText(/nenhum resultado/i)).toBeInTheDocument();

    // volta para "Todos" -> registro reaparece
    await user.selectOptions(screen.getByLabelText("Tipo de análise"), "");
    const tabelaNovamente = await screen.findByRole("table");
    expect(within(tabelaNovamente).getByText("Fazenda Teste")).toBeInTheDocument();
  }, 15000);

  it("mostra estado vazio (nao erro) quando o usuario nao tem analises", async () => {
    const authService = await import("@/services/auth");
    await authService.registrar({
      nome: "Sem Dados",
      email: `vazio-${Date.now()}@teste.local`,
      senha: "senhaForte123",
    });

    renderWithProviders(<AnalisesHistoricoPage />, { rota: "/analises" });

    expect(await screen.findByText(/nenhuma análise registrada ainda/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  }, 10000);
});
