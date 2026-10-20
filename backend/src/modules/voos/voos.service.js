import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { normalizar } from "../../utils/serializers.js";
import { garantirDono as garantirDonoTalhao } from "../talhoes/talhoes.service.js";

export async function garantirDono(idVoo, idUsuario) {
  const voo = await prisma.voo.findFirst({
    where: { id_voo: idVoo, talhao: { propriedade: { id_usuario: idUsuario } } }
  });
  if (!voo) throw new AppError("Voo não encontrado.", 404, "NAO_ENCONTRADO");
  return voo;
}

export async function buscar(idVoo, idUsuario) {
  await garantirDono(idVoo, idUsuario);
  const voo = await prisma.voo.findUnique({
    where: { id_voo: idVoo },
    include: {
      talhao: {
        select: {
          id_talhao: true,
          nome_talhao: true,
          cultura: true,
          area_hectares: true,
          propriedade: { select: { id_propriedade: true, nome_fazenda: true } }
        }
      },
      analises: { orderBy: { data_analise: "desc" } }
    }
  });
  return normalizar(voo);
}

export async function criar(idUsuario, { id_talhao, ...dados }) {
  await garantirDonoTalhao(id_talhao, idUsuario);
  const voo = await prisma.voo.create({ data: { ...dados, id_talhao } });
  return normalizar(voo);
}

export async function atualizar(idVoo, idUsuario, dados) {
  await garantirDono(idVoo, idUsuario);
  const voo = await prisma.voo.update({ where: { id_voo: idVoo }, data: dados });
  return normalizar(voo);
}

export async function excluir(idVoo, idUsuario) {
  await garantirDono(idVoo, idUsuario);
  const analises = await prisma.analise.count({ where: { id_voo: idVoo } });
  if (analises > 0) {
    throw new AppError(`Este voo tem ${analises} análise(s). Exclua as análises antes de excluir o voo.`, 409, "POSSUI_DEPENDENTES");
  }
  await prisma.voo.delete({ where: { id_voo: idVoo } });
}
