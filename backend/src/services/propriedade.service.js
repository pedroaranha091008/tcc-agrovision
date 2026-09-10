import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { lerPaginacao, meta } from "../utils/paginacao.js";

const ORDENAVEIS = ["criado_em", "nome_fazenda", "estado"];

export async function listar(idUsuario, consulta) {
  const { skip, take, orderBy, pagina, porPagina } = lerPaginacao(consulta, ORDENAVEIS);
  const where = { id_usuario: idUsuario };
  if (consulta.estado) where.estado = consulta.estado;
  if (consulta.busca) where.nome_fazenda = { contains: consulta.busca };

  const [itens, total] = await Promise.all([
    prisma.propriedade.findMany({ where, skip, take, orderBy }),
    prisma.propriedade.count({ where }),
  ]);
  return { itens, meta: meta(total, { pagina, porPagina }) };
}

export async function criar(idUsuario, dados) {
  return prisma.propriedade.create({
    data: {
      id_usuario: idUsuario,
      nome_fazenda: dados.nome_fazenda,
      estado: dados.estado,
      cidade: dados.cidade,
      area_total_hectares: dados.area_total_hectares ?? null,
    },
  });
}

export async function atualizar(propriedade, dados) {
  return prisma.propriedade.update({
    where: { id_propriedade: propriedade.id_propriedade },
    data: dados,
  });
}

export async function remover(propriedade) {
  const dependentes = await prisma.talhao.count({
    where: { id_propriedade: propriedade.id_propriedade },
  });
  if (dependentes > 0) {
    throw erros.conflito("Propriedade possui talhoes vinculados", {
      talhoes: dependentes,
    });
  }
  await prisma.propriedade.delete({
    where: { id_propriedade: propriedade.id_propriedade },
  });
}
