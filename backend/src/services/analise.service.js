import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { lerPaginacao, meta } from "../utils/paginacao.js";

const ORDENAVEIS = ["data_analise", "atualizado_em", "nivel_risco", "tipo_analise"];

async function garantirVooDoUsuario(idVoo, idUsuario) {
  const voo = await prisma.voo.findFirst({
    where: {
      id_voo: idVoo,
      talhao: { propriedade: { id_usuario: idUsuario } },
    },
  });
  if (!voo) throw erros.naoEncontrado("Voo nao encontrado");
  return voo;
}

export async function listar(idUsuario, consulta) {
  const { skip, take, orderBy, pagina, porPagina } = lerPaginacao(
    consulta,
    ORDENAVEIS,
    { data_analise: "desc" },
  );
  const where = {
    voo: { talhao: { propriedade: { id_usuario: idUsuario } } },
  };
  if (consulta.id_voo) where.id_voo = consulta.id_voo;
  if (consulta.tipo_analise) where.tipo_analise = consulta.tipo_analise;
  if (consulta.nivel_risco) where.nivel_risco = consulta.nivel_risco;
  if (consulta.status) where.status = consulta.status;

  const [itens, total] = await Promise.all([
    prisma.analise.findMany({ where, skip, take, orderBy }),
    prisma.analise.count({ where }),
  ]);
  return { itens, meta: meta(total, { pagina, porPagina }) };
}

export async function obter(analise) {
  return analise;
}

export async function criar(idUsuario, dados) {
  await garantirVooDoUsuario(dados.id_voo, idUsuario);
  return prisma.analise.create({
    data: {
      id_voo: dados.id_voo,
      tipo_analise: dados.tipo_analise,
      nivel_risco: dados.nivel_risco ?? null,
      percentual_area_afetada: dados.percentual_area_afetada ?? null,
      resultado: dados.resultado ?? null,
      url_arquivo: dados.url_arquivo ?? null,
      status: dados.status ?? "concluido",
    },
  });
}

export async function atualizar(analise, dados) {
  return prisma.analise.update({
    where: { id_analise: analise.id_analise },
    data: dados,
  });
}

export async function remover(analise) {
  const relatorios = await prisma.relatorio.count({
    where: { id_analise: analise.id_analise },
  });
  if (relatorios > 0) {
    throw erros.conflito("Analise possui relatorios gerados", { relatorios });
  }
  await prisma.analise.delete({ where: { id_analise: analise.id_analise } });
}
