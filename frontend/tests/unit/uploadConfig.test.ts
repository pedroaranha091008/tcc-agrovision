import { describe, expect, it } from "vitest";
import { UPLOAD_MAX_FILE_MB, validarArquivo } from "@/features/voos/uploadConfig";

function arquivo(nome: string, tipo: string, tamanhoBytes: number): File {
  return new File([new Uint8Array(tamanhoBytes)], nome, { type: tipo });
}

describe("validarArquivo", () => {
  it("aceita JPEG dentro do limite", () => {
    expect(validarArquivo(arquivo("foto.jpg", "image/jpeg", 1024))).toBeNull();
  });

  it("rejeita tipo nao suportado", () => {
    expect(validarArquivo(arquivo("doc.pdf", "application/pdf", 1024))).toMatch(/não suportado/);
  });

  it("rejeita extensao incompativel mesmo com MIME correto", () => {
    expect(validarArquivo(arquivo("foto.gif", "image/jpeg", 1024))).toMatch(/não suportado/);
  });

  it("rejeita arquivo maior que o limite", () => {
    const grande = arquivo("foto.png", "image/png", (UPLOAD_MAX_FILE_MB + 1) * 1024 * 1024);
    expect(validarArquivo(grande)).toMatch(/MB/);
  });
});
