import { describe, expect, it } from "vitest";
import { registroSchema, loginSchema } from "../../src/schemas/auth.schema.js";
import { criarPropriedadeSchema } from "../../src/schemas/propriedade.schema.js";
import { criarTalhaoSchema } from "../../src/schemas/talhao.schema.js";
import { criarVooSchema } from "../../src/schemas/voo.schema.js";
import { criarAnaliseSchema } from "../../src/schemas/analise.schema.js";

describe("auth schema", () => {
  it("aceita registro valido e normaliza email", () => {
    const r = registroSchema.parse({
      nome: "  Maria  ",
      email: "MARIA@EXEMPLO.COM",
      senha: "12345678",
    });
    expect(r.email).toBe("maria@exemplo.com");
    expect(r.nome).toBe("Maria");
  });

  it("rejeita senha curta", () => {
    expect(() => registroSchema.parse({ nome: "Ana", email: "a@b.com", senha: "1234" })).toThrow();
  });

  it("login exige email valido", () => {
    expect(() => loginSchema.parse({ email: "invalido", senha: "x" })).toThrow();
  });
});

describe("propriedade schema", () => {
  it("normaliza UF para maiusculas", () => {
    const p = criarPropriedadeSchema.parse({
      nome_fazenda: "Sitio",
      estado: "sp",
      cidade: "Campinas",
    });
    expect(p.estado).toBe("SP");
  });

  it("rejeita UF com mais de duas letras", () => {
    expect(() =>
      criarPropriedadeSchema.parse({ nome_fazenda: "X", estado: "SPX", cidade: "Y" }),
    ).toThrow();
  });

  it("rejeita area negativa", () => {
    expect(() =>
      criarPropriedadeSchema.parse({
        nome_fazenda: "Sitio",
        estado: "SP",
        cidade: "Campinas",
        area_total_hectares: -1,
      }),
    ).toThrow();
  });
});

describe("talhao schema", () => {
  it("rejeita latitude fora de faixa", () => {
    expect(() =>
      criarTalhaoSchema.parse({
        id_propriedade: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        nome_talhao: "T1",
        latitude: 200,
      }),
    ).toThrow();
  });

  it("aceita geojson com type", () => {
    const t = criarTalhaoSchema.parse({
      id_propriedade: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
      nome_talhao: "T1",
      geojson: { type: "Polygon", coordinates: [] },
    });
    expect(t.geojson.type).toBe("Polygon");
  });
});

describe("voo schema", () => {
  it("coage data_voo string para Date", () => {
    const v = criarVooSchema.parse({
      id_talhao: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
      data_voo: "2026-01-10",
    });
    expect(v.data_voo).toBeInstanceOf(Date);
  });

  it("rejeita data muito no futuro", () => {
    expect(() =>
      criarVooSchema.parse({
        id_talhao: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        data_voo: "2999-01-01",
      }),
    ).toThrow();
  });
});

describe("analise schema", () => {
  it("rejeita tipo_analise invalido", () => {
    expect(() =>
      criarAnaliseSchema.parse({
        id_voo: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        tipo_analise: "FALSO",
      }),
    ).toThrow();
  });

  it("rejeita percentual acima de 100", () => {
    expect(() =>
      criarAnaliseSchema.parse({
        id_voo: "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        tipo_analise: "NDVI",
        percentual_area_afetada: 150,
      }),
    ).toThrow();
  });
});
