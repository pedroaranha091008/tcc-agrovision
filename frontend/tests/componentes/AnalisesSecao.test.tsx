import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AnalisesSecao } from "@/features/voos/AnalisesSecao";
import * as analiseService from "@/services/analises";
import { ApiError } from "@/services/erros";
import type { Analise } from "@/types/dominio";

const renderizar = (temImagens: boolean, onAlterado = vi.fn()) =>
  render(
    <MemoryRouter>
      <AnalisesSecao idVoo="v1" itens={[]} carregando={false} temImagens={temImagens} onAlterado={onAlterado} />
    </MemoryRouter>,
  );

describe("análise automática no voo", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sem imagens, o botão fica desligado e explica o motivo", () => {
    renderizar(false);
    expect(screen.getByRole("button", { name: /Analisar imagens/ })).toBeDisabled();
    expect(screen.getByText(/Envie as imagens do voo acima/)).toBeInTheDocument();
  });

  it("analisa e atualiza a tela", async () => {
    const analisar = vi.spyOn(analiseService, "analisarVoo").mockResolvedValue({} as Analise);
    const onAlterado = vi.fn();
    renderizar(true, onAlterado);
    fireEvent.click(screen.getByRole("button", { name: /Analisar imagens/ }));
    await waitFor(() => expect(onAlterado).toHaveBeenCalled());
    expect(analisar).toHaveBeenCalledWith("v1");
  });

  it("mostra o erro se a análise falhar", async () => {
    vi.spyOn(analiseService, "analisarVoo").mockRejectedValue(new ApiError("VALIDACAO", "Não foi possível processar as imagens deste voo.", 422));
    renderizar(true);
    fireEvent.click(screen.getByRole("button", { name: /Analisar imagens/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/processar as imagens/);
  });
});
