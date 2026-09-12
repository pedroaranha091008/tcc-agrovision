import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validarCom, numeroOpcional, textoOpcional } from "@/lib/formularios";

describe("validarCom", () => {
  const schema = z.object({
    nome: z.string().min(2, "nome curto"),
    idade: z.coerce.number().min(0),
  });

  it("retorna ok:true com os dados parseados quando validos", () => {
    const r = validarCom(schema, { nome: "Ana", idade: "30" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dados.nome).toBe("Ana");
      expect(r.dados.idade).toBe(30);
    }
  });

  it("retorna ok:false com um mapa campo->mensagem quando invalido", () => {
    const r = validarCom(schema, { nome: "A", idade: -1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erros.nome).toBe("nome curto");
      expect(r.erros.idade).toBeTruthy();
    }
  });
});

describe("numeroOpcional", () => {
  const schema = z.object({ v: numeroOpcional });

  it("converte string vazia para undefined", () => {
    const r = schema.safeParse({ v: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.v).toBeUndefined();
  });

  it("converte string numerica para number", () => {
    const r = schema.safeParse({ v: "12.5" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.v).toBe(12.5);
  });

  it("rejeita valor nao numerico", () => {
    const r = schema.safeParse({ v: "abc" });
    expect(r.success).toBe(false);
  });
});

describe("textoOpcional", () => {
  const schema = z.object({ v: textoOpcional });

  it("converte string vazia para undefined", () => {
    const r = schema.safeParse({ v: "   " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.v).toBeUndefined();
  });

  it("mantem texto normal", () => {
    const r = schema.safeParse({ v: " Soja " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.v).toBe("Soja");
  });
});
