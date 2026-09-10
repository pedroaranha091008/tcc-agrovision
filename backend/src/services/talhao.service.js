import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { lerPaginacao, meta } from "../utils/paginacao.js";

const ORDENAVEIS = ["criado_em", "nome_talhao", "status"];

async function garantirPropriedadeDoUsuario(idPropriedade, idUsuario) {
  const prop = await prisma.propriedade.findFirst({
    where: { id_propriedade: idPropriedade, id_usuario: idUsuario },
  });
  if (!prop) throw erros.naoEncontrado("Propriedade nao encontrada");
  return prop;
}

export async function listar(idUsuario, consulta) {
  const { skip, take, orderBy, pagina, porPagina } = lerPaginacao(consulta, ORDENAVEIS);
  const where = { propriedade: { id_usuario: idUsuario } };
  if (consulta.id_propriedade) where.id_propriedade = consulta.id_propriedade;
  if (consulta.status) where.status = consulta.status;
  if (consulta.cultura) where.cultura = { contains: consulta.cultura };

  const [itens, total] = await Promise.all([
    prisma.talhao.findMany({ where, skip, take, orderBy }),
    prisma.talhao.count({ where }),
  ]);
  return { itens, meta: meta(total, { pagina, porPagina }) };
}

export async function criar(idUsuario, dados) {
  await garantirPropriedadeDoUsuario(dados.id_propriedade, idUsuario);
  return prisma.talhao.create({
    data: {
      id_propriedade: dados.id_propriedade,
      nome_talhao: dados.nome_talhao,
      cultura: dados.cultura ?? null,
      area_hectares: dados.area_hectares ?? null,
      latitude: dados.latitude ?? null,
      longitude: dados.longitude ?? null,
      geojson: dados.geojson ?? null,
      status: dados.status ?? "ativo",
    },
  });
}

export async function atualizar(talhao, dados) {
  return prisma.talhao.update({
    where: { id_talhao: talhao.id_talhao },
    data: dados,
  });
}

export async function remover(talhao) {
  const dependentes = await prisma.voo.count({ where: { id_talhao: talhao.id_talhao } });
  if (dependentes > 0) {
    throw erros.conflito("Talhao possui voos vinculados", { voos: dependentes });
  }
  await prisma.talhao.delete({ where: { id_talhao: talhao.id_talhao } });
}
