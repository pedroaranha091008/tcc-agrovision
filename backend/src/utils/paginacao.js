const POR_PAGINA_PADRAO = 20;
const POR_PAGINA_MAX = 100;

/**
 * Interpreta query string de paginacao/ordenacao ja validada.
 * Retorna { skip, take, pagina, porPagina, orderBy }.
 */
export function lerPaginacao(query, ordenaveis = [], ordemPadrao = { criado_em: "desc" }) {
  const pagina = Math.max(1, Number.parseInt(query.pagina ?? "1", 10) || 1);
  let porPagina = Number.parseInt(query.por_pagina ?? String(POR_PAGINA_PADRAO), 10);
  if (Number.isNaN(porPagina) || porPagina < 1) porPagina = POR_PAGINA_PADRAO;
  porPagina = Math.min(porPagina, POR_PAGINA_MAX);

  let orderBy = ordemPadrao;
  if (query.ordenar_por && ordenaveis.includes(query.ordenar_por)) {
    const direcao = query.ordem === "asc" ? "asc" : "desc";
    orderBy = { [query.ordenar_por]: direcao };
  }

  return {
    skip: (pagina - 1) * porPagina,
    take: porPagina,
    pagina,
    porPagina,
    orderBy,
  };
}

export function meta(total, { pagina, porPagina }) {
  return {
    pagina,
    por_pagina: porPagina,
    total,
    total_paginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}
