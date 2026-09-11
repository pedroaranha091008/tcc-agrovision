import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ImagensSecao } from "@/features/voos/ImagensSecao";
import * as imagemService from "@/services/imagens";

describe("ImagensSecao — validação de upload", () => {
  it("rejeita arquivo de tipo não suportado sem chamar o serviço de envio", async () => {
    const enviarSpy = vi.spyOn(imagemService, "enviar");

    render(<ImagensSecao idVoo="voo-1" itens={[]} carregando={false} onAlterado={() => {}} />);

    // fireEvent.change (em vez de userEvent.upload) para nao ser filtrado
    // pela simulacao de "accept" do input, e exercitar a validacao do proprio componente.
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const arquivoInvalido = new File(["conteudo"], "documento.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [arquivoInvalido] } });

    expect(await screen.findByText(/não suportado/i)).toBeInTheDocument();
    expect(enviarSpy).not.toHaveBeenCalled();
  });

  it("mostra estado vazio quando não há imagens nem fila", () => {
    render(<ImagensSecao idVoo="voo-1" itens={[]} carregando={false} onAlterado={() => {}} />);
    expect(screen.getByText(/nenhuma imagem enviada/i)).toBeInTheDocument();
  });
});
