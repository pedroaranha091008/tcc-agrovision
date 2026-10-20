import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { normalizar } from "../../utils/serializers.js";
import { garantirDono as garantirDonoPropriedade } from "../propriedades/propriedades.service.js";

export async function garantirDono(idTalhao, idUsuario) {
  const talhao = await prisma.talhao.findFirst({
    where: { id_talhao: idTalhao, propriedade: { id_usuario: idUsuario } }
  });
  if (!talhao) throw new AppError("Talhão não encontrado.", 404, "NAO_ENCONTRADO");
  return talhao;
}

export async function buscar(idTalhao, idUsuario) {
  await garantirDono(idTalhao, idUsuario);
  const talhao = await prisma.talhao.findUnique({
    where: { id_talhao: idTalhao },
    include: {
      propriedade: { select: { id_propriedade: true, nome_fazenda: true, cidade: true, estado: true } },
      voos: {
        orderBy: { data_voo: "desc" },
        include: { _count: { select: { analises: true, imagens: true } } }
      }
    }
  });

  return normalizar({
    ...talhao,
    voos: talhao.voos.map(({ _count, ...v }) => ({ ...v, total_analises: _count.analises, total_imagens: _count.imagens }))
  });
}

export async function criar(idUsuario, { id_propriedade, ...dados }) {
  await garantirDonoPropriedade(id_propriedade, idUsuario);
  const talhao = await prisma.talhao.create({ data: { ...dados, id_propriedade } });
  return normalizar(talhao);
}

export async function atualizar(idTalhao, idUsuario, dados) {
  await garantirDono(idTalhao, idUsuario);
  const talhao = await prisma.talhao.update({ where: { id_talhao: idTalhao }, data: dados });
  return normalizar(talhao);
}

export async function excluir(idTalhao, idUsuario) {
  await garantirDono(idTalhao, idUsuario);
  const voos = await prisma.voo.count({ where: { id_talhao: idTalhao } });
  if (voos > 0) {
    throw new AppError(`Este talhão tem ${voos} voo(s) registrado(s). Exclua os voos antes de excluir o talhão.`, 409, "POSSUI_DEPENDENTES");
  }
  await prisma.talhao.delete({ where: { id_talhao: idTalhao } });
}
