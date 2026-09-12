import { prisma } from "../config/prisma.js";
import { lerPaginacao, meta } from "../utils/paginacao.js";
import { fimDoDia } from "../utils/data.js";

/**
 * Historico de monitoramentos: cada linha e uma analise com o voo, o talhao
 * e a propriedade correspondentes. Paginado e filtravel.
 */
export async function historico(idUsuario, consulta) {
  const { skip, take, pagina, porPagina } = lerPaginacao(consulta, [], {
    data_analise: "desc",
  });

  const where = {
    voo: { talhao: { propriedade: { id_usuario: idUsuario } } },
  };
  if (consulta.tipo_analise) where.tipo_analise = consulta.tipo_analise;
  if (consulta.data_inicio || consulta.data_fim) {
    where.data_analise = {};
    if (consulta.data_inicio) where.data_analise.gte = consulta.data_inicio;
    if (consulta.data_fim) where.data_analise.lte = fimDoDia(consulta.data_fim);
  }
  if (consulta.id_talhao) {
    where.voo.talhao.id_talhao = consulta.id_talhao;
  }
  if (consulta.id_propriedade) {
    where.voo.talhao.propriedade = {
      id_usuario: idUsuario,
      id_propriedade: consulta.id_propriedade,
    };
  }

  const [linhas, total] = await Promise.all([
    prisma.analise.findMany({
      where,
      skip,
      take,
      orderBy: { data_analise: "desc" },
      include: {
        voo: {
          include: {
            talhao: { include: { propriedade: true } },
          },
        },
      },
    }),
    prisma.analise.count({ where }),
  ]);

  const itens = linhas.map((a) => ({
    id_analise: a.id_analise,
    tipo_analise: a.tipo_analise,
    nivel_risco: a.nivel_risco,
    percentual_area_afetada: a.percentual_area_afetada,
    status: a.status,
    data_analise: a.data_analise,
    voo: {
      id_voo: a.voo.id_voo,
      data_voo: a.voo.data_voo,
    },
    talhao: {
      id_talhao: a.voo.talhao.id_talhao,
      nome_talhao: a.voo.talhao.nome_talhao,
      cultura: a.voo.talhao.cultura,
    },
    propriedade: {
      id_propriedade: a.voo.talhao.propriedade.id_propriedade,
      nome_fazenda: a.voo.talhao.propriedade.nome_fazenda,
      cidade: a.voo.talhao.propriedade.cidade,
      estado: a.voo.talhao.propriedade.estado,
    },
  }));

  return { itens, meta: meta(total, { pagina, porPagina }) };
}
