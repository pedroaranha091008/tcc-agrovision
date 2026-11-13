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

const DIA_MS = 24 * 60 * 60 * 1000;
const PESO_RISCO = { baixo: 0, medio: 1, alto: 2, critico: 3 };

/** Ultimos `n` meses no formato AAAA-MM, do mais antigo ao mais recente. */
function ultimosMeses(n, hoje = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - (n - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

/**
 * Painel da Visao Geral: situacao atual de cada talhao (pela analise do voo
 * mais recente), talhoes por risco, voos e area afetada media por mes e as
 * ultimas analises do periodo. Agrega em memoria a partir da hierarquia do
 * usuario: simples e suficiente para o volume de um produtor.
 */
export async function painel(idUsuario, { id_propriedade, dias = 90 } = {}) {
  const desde = new Date(Date.now() - dias * DIA_MS);

  const propriedades = await prisma.propriedade.findMany({
    where: { id_usuario: idUsuario, ...(id_propriedade ? { id_propriedade } : {}) },
    orderBy: { nome_fazenda: "asc" },
    include: {
      talhoes: {
        orderBy: { nome_talhao: "asc" },
        include: {
          voos: {
            include: {
              _count: { select: { imagens: true } },
              analises: {
                select: {
                  id_analise: true,
                  tipo_analise: true,
                  nivel_risco: true,
                  percentual_area_afetada: true,
                  origem: true,
                  data_analise: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const talhoes = [];
  const analisesNoPeriodo = [];
  let voosTotal = 0;
  let voosPeriodo = 0;
  let imagens = 0;
  const meses = ultimosMeses(dias >= 365 ? 12 : 6);
  const serie = Object.fromEntries(meses.map((m) => [m, { voos: 0, somaAfetada: 0, qtdAfetada: 0 }]));

  for (const p of propriedades) {
    for (const t of p.talhoes) {
      let ultima = null;
      for (const v of t.voos) {
        voosTotal++;
        imagens += v._count.imagens;
        const noPeriodo = v.data_voo >= desde;
        if (noPeriodo) voosPeriodo++;
        const mes = v.data_voo.toISOString().slice(0, 7);
        if (serie[mes]) serie[mes].voos++;

        for (const a of v.analises) {
          const item = {
            ...a,
            id_voo: v.id_voo,
            data_voo: v.data_voo,
            talhao: t.nome_talhao,
            id_talhao: t.id_talhao,
            propriedade: p.nome_fazenda,
          };
          if (noPeriodo) analisesNoPeriodo.push(item);
          if (serie[mes] && a.percentual_area_afetada !== null) {
            serie[mes].somaAfetada += Number(a.percentual_area_afetada);
            serie[mes].qtdAfetada++;
          }
          // Situacao atual do talhao = analise do voo mais recente (empate: analise mais recente).
          if (
            !ultima ||
            v.data_voo > ultima.data_voo ||
            (v.data_voo.getTime() === ultima.data_voo.getTime() && a.data_analise > ultima.data_analise)
          ) {
            ultima = item;
          }
        }
      }
      talhoes.push({
        id_talhao: t.id_talhao,
        nome_talhao: t.nome_talhao,
        cultura: t.cultura,
        area_hectares: t.area_hectares,
        status: t.status,
        propriedade: { id_propriedade: p.id_propriedade, nome_fazenda: p.nome_fazenda },
        total_voos: t.voos.length,
        ultima_analise: ultima
          ? {
              id_analise: ultima.id_analise,
              id_voo: ultima.id_voo,
              nivel_risco: ultima.nivel_risco,
              percentual_area_afetada: ultima.percentual_area_afetada,
              tipo_analise: ultima.tipo_analise,
              data_voo: ultima.data_voo,
            }
          : null,
      });
    }
  }

  // Talhoes mais preocupantes primeiro.
  talhoes.sort(
    (a, b) => (PESO_RISCO[b.ultima_analise?.nivel_risco] ?? -1) - (PESO_RISCO[a.ultima_analise?.nivel_risco] ?? -1),
  );

  const riscoTalhoes = { baixo: 0, medio: 0, alto: 0, critico: 0, sem_analise: 0 };
  for (const t of talhoes) riscoTalhoes[t.ultima_analise?.nivel_risco ?? "sem_analise"]++;

  const areaTalhoes = talhoes.reduce((s, t) => s + (t.area_hectares ? Number(t.area_hectares) : 0), 0);
  const areaPropriedades = propriedades.reduce(
    (s, p) => s + (p.area_total_hectares ? Number(p.area_total_hectares) : 0),
    0,
  );

  return {
    periodo_dias: dias,
    totais: {
      propriedades: propriedades.length,
      talhoes: talhoes.length,
      area_monitorada_hectares: areaTalhoes || areaPropriedades,
      voos: voosTotal,
      voos_periodo: voosPeriodo,
      imagens,
      analises_periodo: analisesNoPeriodo.length,
      areas_criticas: riscoTalhoes.alto + riscoTalhoes.critico,
    },
    risco_talhoes: riscoTalhoes,
    talhoes,
    serie_mensal: meses.map((m) => ({
      mes: m,
      voos: serie[m].voos,
      area_afetada_media: serie[m].qtdAfetada
        ? Math.round((serie[m].somaAfetada / serie[m].qtdAfetada) * 10) / 10
        : null,
    })),
    ultimas_analises: analisesNoPeriodo
      .sort((a, b) => b.data_voo - a.data_voo || b.data_analise - a.data_analise)
      .slice(0, 5),
  };
}
