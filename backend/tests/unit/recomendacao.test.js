import { describe, expect, it } from "vitest";
import { gerarRecomendacao, VERSAO_REGRAS } from "../../src/utils/recomendacao.js";

describe("motor de recomendacao (por regras)", () => {
  it("marca a recomendacao como baseada em regras e versionada", () => {
    const r = gerarRecomendacao({
      tipo_analise: "NDVI",
      nivel_risco: "baixo",
      percentual_area_afetada: 5,
    });
    expect(r.baseada_em_regras).toBe(true);
    expect(r.versao).toBe(VERSAO_REGRAS);
    expect(r.texto).toContain("nao substitui");
  });

  it("e deterministico para a mesma entrada", () => {
    const entrada = { tipo_analise: "termico", nivel_risco: "alto", percentual_area_afetada: 30 };
    expect(gerarRecomendacao(entrada).texto).toBe(gerarRecomendacao(entrada).texto);
  });

  it("varia a acao conforme o nivel de risco", () => {
    const baixo = gerarRecomendacao({ tipo_analise: "RGB", nivel_risco: "baixo", percentual_area_afetada: null });
    const critico = gerarRecomendacao({ tipo_analise: "RGB", nivel_risco: "critico", percentual_area_afetada: null });
    expect(baixo.texto).not.toBe(critico.texto);
    expect(critico.texto.toLowerCase()).toContain("imediata");
  });

  it("usa faixa de percentual quando informado", () => {
    const alto = gerarRecomendacao({ tipo_analise: "NDVI", nivel_risco: "medio", percentual_area_afetada: 50 });
    expect(alto.texto).toContain("extensa");
  });

  it("aceita tipo desconhecido sem quebrar", () => {
    const r = gerarRecomendacao({ tipo_analise: "inexistente", nivel_risco: null, percentual_area_afetada: null });
    expect(r.texto.length).toBeGreaterThan(0);
  });
});
