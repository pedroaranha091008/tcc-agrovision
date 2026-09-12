import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { lerPaginacao, meta } from "../utils/paginacao.js";
import { fimDoDia } from "../utils/data.js";

const ORDENAVEIS = ["criado_em", "data_voo", "status_processamento"];

async function garantirTalhaoDoUsuario(idTalhao, idUsuario) {
  const talhao = await prisma.talhao.findFirst({
    where: { id_talhao: idTalhao, propriedade: { id_usuario: idUsuario } },
  });
  if (!talhao) throw erros.naoEncontrado("Talhao nao encontrado");
  return talhao;
}

export async function listar(idUsuario, consulta) {
  const { skip, take, orderBy, pagina, porPagina } = lerPaginacao(
    consulta,
    ORDENAVEIS,
    { data_voo: "desc" },
  );
  const where = { talhao: { propriedade: { id_usuario: idUsuario } } };
  if (consulta.id_talhao) where.id_talhao = consulta.id_talhao;
  if (consulta.status_processamento) where.status_processamento = consulta.status_processamento;
  if (consulta.data_inicio || consulta.data_fim) {
    where.data_voo = {};
    if (consulta.data_inicio) where.data_voo.gte = consulta.data_inicio;
    if (consulta.data_fim) where.data_voo.lte = fimDoDia(consulta.data_fim);
  }

  const [itens, total] = await Promise.all([
    prisma.voo.findMany({ where, skip, take, orderBy }),
    prisma.voo.count({ where }),
  ]);
  return { itens, meta: meta(total, { pagina, porPagina }) };
}

export async function criar(idUsuario, dados) {
  await garantirTalhaoDoUsuario(dados.id_talhao, idUsuario);
  return prisma.voo.create({
    data: {
      id_talhao: dados.id_talhao,
      data_voo: dados.data_voo,
      altitude_metros: dados.altitude_metros ?? null,
      modelo_drone: dados.modelo_drone ?? null,
      operador: dados.operador ?? null,
      observacoes: dados.observacoes ?? null,
      status_processamento: dados.status_processamento ?? "pendente",
    },
  });
}

export async function atualizar(voo, dados) {
  return prisma.voo.update({ where: { id_voo: voo.id_voo }, data: dados });
}

export async function remover(voo) {
  const [analises, imagens] = await Promise.all([
    prisma.analise.count({ where: { id_voo: voo.id_voo } }),
    prisma.imagemVoo.count({ where: { id_voo: voo.id_voo } }),
  ]);
  if (analises > 0) {
    throw erros.conflito("Voo possui analises vinculadas", { analises });
  }
  if (imagens > 0) {
    throw erros.conflito("Voo possui imagens vinculadas; remova as imagens primeiro", {
      imagens,
    });
  }
  await prisma.voo.delete({ where: { id_voo: voo.id_voo } });
}
