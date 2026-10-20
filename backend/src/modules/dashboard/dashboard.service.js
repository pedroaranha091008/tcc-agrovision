import { prisma } from "../../config/prisma.js";
import { normalizar } from "../../utils/serializers.js";
import { garantirDono as garantirDonoPropriedade } from "../propriedades/propriedades.service.js";

const DIA_MS = 24 * 60 * 60 * 1000;
const PESO_RISCO = { baixo: 0, medio: 1, alto: 2, critico: 3 };

/** Últimos `n` meses no formato AAAA-MM, do mais antigo ao mais recente. */
function ultimosMeses(n, hoje = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - (n - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

/**
 * Indicadores do painel. A agregação é feita em memória a partir da hierarquia do usuário,
 * o que é simples e suficiente para o volume de um produtor; com muitos dados, migrar para SQL agregado.
 */
export async function resumo(idUsuario, { id_propriedade, dias = 90 }) {
  if (id_propriedade) await garantirDonoPropriedade(id_propriedade, idUsuario);
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
              analises: { select: { id_analise: true, tipo_analise: true, nivel_risco: true, percentual_area_afetada: true, data_analise: true } }
            }
          }
        }
      }
    }
  });

  const talhoes = [];
  const analisesNoPeriodo = [];
  let voosTotal = 0, voosPeriodo = 0, imagens = 0;
  const meses = ultimosMeses(dias >= 365 ? 12 : 6);
  const serie = Object.fromEntries(meses.map((m) => [m, { mes: m, voos: 0, somaAfetada: 0, qtdAfetada: 0 }]));

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
          const item = { ...a, id_voo: v.id_voo, data_voo: v.data_voo, talhao: t.nome_talhao, id_talhao: t.id_talhao, propriedade: p.nome_fazenda };
          if (noPeriodo) analisesNoPeriodo.push(item);
          if (serie[mes] && a.percentual_area_afetada !== null) {
            serie[mes].somaAfetada += Number(a.percentual_area_afetada);
            serie[mes].qtdAfetada++;
          }
          // Situação atual do talhão = análise do voo mais recente (empate: análise mais recente).
          if (!ultima || v.data_voo > ultima.data_voo || (v.data_voo.getTime() === ultima.data_voo.getTime() && a.data_analise > ultima.data_analise)) {
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
          ? { id_analise: ultima.id_analise, id_voo: ultima.id_voo, nivel_risco: ultima.nivel_risco, percentual_area_afetada: ultima.percentual_area_afetada, tipo_analise: ultima.tipo_analise, data_voo: ultima.data_voo }
          : null
      });
    }
  }

  // Talhões mais preocupantes primeiro.
  talhoes.sort((a, b) => (PESO_RISCO[b.ultima_analise?.nivel_risco] ?? -1) - (PESO_RISCO[a.ultima_analise?.nivel_risco] ?? -1));

  const riscoTalhoes = { baixo: 0, medio: 0, alto: 0, critico: 0, sem_analise: 0 };
  for (const t of talhoes) riscoTalhoes[t.ultima_analise?.nivel_risco ?? "sem_analise"]++;

  const areaTalhoes = talhoes.reduce((s, t) => s + (t.area_hectares ? Number(t.area_hectares) : 0), 0);
  const areaPropriedades = propriedades.reduce((s, p) => s + (p.area_total_hectares ? Number(p.area_total_hectares) : 0), 0);

  return normalizar({
    periodo_dias: dias,
    totais: {
      propriedades: propriedades.length,
      talhoes: talhoes.length,
      area_monitorada_hectares: areaTalhoes || areaPropriedades,
      voos: voosTotal,
      voos_periodo: voosPeriodo,
      imagens,
      analises_periodo: analisesNoPeriodo.length,
      areas_criticas: riscoTalhoes.alto + riscoTalhoes.critico
    },
    risco_talhoes: riscoTalhoes,
    talhoes,
    serie_mensal: meses.map((m) => ({
      mes: m,
      voos: serie[m].voos,
      area_afetada_media: serie[m].qtdAfetada ? Math.round((serie[m].somaAfetada / serie[m].qtdAfetada) * 10) / 10 : null
    })),
    ultimas_analises: analisesNoPeriodo.sort((a, b) => b.data_voo - a.data_voo || b.data_analise - a.data_analise).slice(0, 5)
  });
}

export async function monitoramentos(idUsuario, filtros) {
  const { data_inicio, data_fim, id_propriedade, id_talhao, tipo_analise, nivel_risco, pagina, por_pagina } = filtros;
  const where = {
    ...(tipo_analise ? { tipo_analise } : {}),
    ...(nivel_risco ? { nivel_risco } : {}),
    voo: {
      ...(data_inicio || data_fim
        ? { data_voo: { ...(data_inicio ? { gte: new Date(data_inicio) } : {}), ...(data_fim ? { lte: new Date(`${data_fim}T23:59:59.999Z`) } : {}) } }
        : {}),
      ...(id_talhao ? { id_talhao } : {}),
      talhao: { propriedade: { id_usuario: idUsuario, ...(id_propriedade ? { id_propriedade } : {}) } }
    }
  };

  const [total, analises] = await Promise.all([
    prisma.analise.count({ where }),
    prisma.analise.findMany({
      where,
      orderBy: [{ voo: { data_voo: "desc" } }, { data_analise: "desc" }],
      skip: (pagina - 1) * por_pagina,
      take: por_pagina,
      select: {
        id_analise: true,
        tipo_analise: true,
        nivel_risco: true,
        percentual_area_afetada: true,
        origem: true,
        data_analise: true,
        voo: {
          select: {
            id_voo: true,
            data_voo: true,
            talhao: {
              select: { id_talhao: true, nome_talhao: true, cultura: true, propriedade: { select: { id_propriedade: true, nome_fazenda: true } } }
            }
          }
        }
      }
    })
  ]);

  return {
    dados: normalizar(analises),
    meta: { total, pagina, por_pagina, total_paginas: Math.max(1, Math.ceil(total / por_pagina)) }
  };
}
