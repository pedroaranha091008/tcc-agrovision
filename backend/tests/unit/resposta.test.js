import { describe, expect, it } from "vitest";
import { serializar } from "../../src/utils/resposta.js";

class DecimalFake {
  constructor(n) {
    this.n = n;
  }
  toNumber() {
    return this.n;
  }
  toFixed(d) {
    return this.n.toFixed(d);
  }
}

describe("serializar", () => {
  it("converte Date para ISO 8601", () => {
    const d = new Date("2026-01-02T03:04:05.000Z");
    expect(serializar({ criado_em: d }).criado_em).toBe("2026-01-02T03:04:05.000Z");
  });

  it("converte Decimal para number", () => {
    expect(serializar({ area: new DecimalFake(12.5) }).area).toBe(12.5);
  });

  it("remove campos sensiveis em qualquer profundidade", () => {
    const entrada = {
      id: 1,
      senha_hash: "x",
      usuario: { nome: "a", token_hash: "y" },
    };
    const saida = serializar(entrada);
    expect(saida.senha_hash).toBeUndefined();
    expect(saida.usuario.token_hash).toBeUndefined();
    expect(saida.usuario.nome).toBe("a");
  });

  it("processa arrays", () => {
    const saida = serializar([{ senha: "x", ok: 1 }]);
    expect(saida[0].senha).toBeUndefined();
    expect(saida[0].ok).toBe(1);
  });
});
