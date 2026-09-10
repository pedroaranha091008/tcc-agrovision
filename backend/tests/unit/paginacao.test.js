import { describe, expect, it } from "vitest";
import { lerPaginacao, meta } from "../../src/utils/paginacao.js";

describe("lerPaginacao", () => {
  it("usa padroes quando a query e vazia", () => {
    const p = lerPaginacao({}, ["criado_em"]);
    expect(p).toMatchObject({ skip: 0, take: 20, pagina: 1, porPagina: 20 });
    expect(p.orderBy).toEqual({ criado_em: "desc" });
  });

  it("calcula skip a partir da pagina", () => {
    const p = lerPaginacao({ pagina: "3", por_pagina: "10" }, []);
    expect(p.skip).toBe(20);
    expect(p.take).toBe(10);
  });

  it("limita por_pagina ao maximo de 100", () => {
    expect(lerPaginacao({ por_pagina: "5000" }, []).take).toBe(100);
  });

  it("so ordena por campos permitidos", () => {
    const p = lerPaginacao({ ordenar_por: "email", ordem: "asc" }, ["criado_em"]);
    expect(p.orderBy).toEqual({ criado_em: "desc" });
    const q = lerPaginacao({ ordenar_por: "criado_em", ordem: "asc" }, ["criado_em"]);
    expect(q.orderBy).toEqual({ criado_em: "asc" });
  });
});

describe("meta", () => {
  it("calcula total de paginas", () => {
    expect(meta(45, { pagina: 1, porPagina: 20 })).toEqual({
      pagina: 1,
      por_pagina: 20,
      total: 45,
      total_paginas: 3,
    });
  });

  it("total zero ainda tem ao menos uma pagina", () => {
    expect(meta(0, { pagina: 1, porPagina: 20 }).total_paginas).toBe(1);
  });
});
