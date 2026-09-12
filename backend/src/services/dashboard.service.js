import { prisma } from "../config/prisma.js";
import { fimDoDia } from "../utils/data.js";

/**
 * Indicadores agregados do usuario autenticado.
 * Todos os filtros sao opcionais: propriedade e intervalo de datas (sobre data_voo).
 */
export async function indicadores(idUsuario, filtros = {}) {
  const escopoUsuario = { propriedade: { id_usuario: idUsuario } };

  const filtroVoo = { talhao: escopoUsuario };
  if (filtros.id_propriedade) {
    filtroVoo.talhao = { id_propriedade: filtros.id_propriedade, propriedade: { id_usuario: idUsuario } };
  }
  if (filtros.data_inicio || filtros.data_fim) {
    filtroVoo.data_voo = {};
    if (filtros.data_inicio) filtroVoo.data_voo.gte = filtros.data_inicio;
    if (filtros.data_fim) filtroVoo.data_voo.lte = fimDoDia(filtros.data_fim);
  }

  const filtroAnalise = { voo: filtroVoo };
  const filtroTalhao = filtros.id_propriedade
    ? { id_propriedade: filtros.id_propriedade, propriedade: { id_usuario: idUsuario } }
    : escopoUsuario;
  const filtroPropriedade = filtros.id_propriedade
    ? { id_usuario: idUsuario, id_propriedade: filtros.id_propriedade }
    : { id_usuario: idUsuario };

  const [
    totalPropriedades,
    totalTalhoes,
    totalVoos,
    totalAnalises,
    areaAgg,
    porRisco,
    porTipo,
  ] = await Promise.all([
    prisma.propriedade.count({ where: filtroPropriedade }),
    prisma.talhao.count({ where: filtroTalhao }),
    prisma.voo.count({ where: filtroVoo }),
    prisma.analise.count({ where: filtroAnalise }),
    prisma.talhao.aggregate({ where: filtroTalhao, _sum: { area_hectares: true } }),
    prisma.analise.groupBy({
      by: ["nivel_risco"],
      where: filtroAnalise,
      _count: { _all: true },
    }),
    prisma.analise.groupBy({
      by: ["tipo_analise"],
      where: filtroAnalise,
      _count: { _all: true },
    }),
  ]);

  const distribuicaoRisco = { baixo: 0, medio: 0, alto: 0, critico: 0, sem_classificacao: 0 };
  for (const linha of porRisco) {
    const chave = linha.nivel_risco ?? "sem_classificacao";
    distribuicaoRisco[chave] = linha._count._all;
  }

  // "Problemas detectados" conta qualquer analise fora do risco "baixo"
  // (medio/atencao, alto e critico) — coerente com o que distribuicao_risco
  // ja mostra, em vez de so alto+critico deixando o "medio" invisivel aqui.
  const analisesComRisco =
    (distribuicaoRisco.medio ?? 0) + (distribuicaoRisco.alto ?? 0) + (distribuicaoRisco.critico ?? 0);

  return {
    total_propriedades: totalPropriedades,
    total_talhoes: totalTalhoes,
    total_voos: totalVoos,
    total_analises: totalAnalises,
    area_monitorada_hectares: areaAgg._sum.area_hectares
      ? Number(areaAgg._sum.area_hectares)
      : 0,
    problemas_detectados: analisesComRisco,
    distribuicao_risco: distribuicaoRisco,
    distribuicao_tipo: porTipo.map((t) => ({
      tipo_analise: t.tipo_analise,
      total: t._count._all,
    })),
  };
}

/**
 * Serie temporal mensal de voos e analises para os graficos do frontend.
 */
export async function series(idUsuario, filtros = {}) {
  const where = { talhao: { propriedade: { id_usuario: idUsuario } } };
  if (filtros.id_propriedade) {
    where.talhao = {
      id_propriedade: filtros.id_propriedade,
      propriedade: { id_usuario: idUsuario },
    };
  }
  if (filtros.data_inicio || filtros.data_fim) {
    where.data_voo = {};
    if (filtros.data_inicio) where.data_voo.gte = filtros.data_inicio;
    if (filtros.data_fim) where.data_voo.lte = fimDoDia(filtros.data_fim);
  }

  const voos = await prisma.voo.findMany({
    where,
    select: {
      data_voo: true,
      _count: { select: { analises: true } },
    },
    orderBy: { data_voo: "asc" },
  });

  const porMes = new Map();
  for (const voo of voos) {
    const chave = voo.data_voo.toISOString().slice(0, 7); // YYYY-MM
    const atual = porMes.get(chave) ?? { mes: chave, voos: 0, analises: 0 };
    atual.voos += 1;
    atual.analises += voo._count.analises;
    porMes.set(chave, atual);
  }

  return [...porMes.values()];
}
