import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { normalizar } from "../../utils/serializers.js";

const naoEncontrada = () => new AppError("Propriedade não encontrada.", 404, "NAO_ENCONTRADO");

/** Garante que a propriedade existe e pertence ao usuário; senão 404 (não revela que existe). */
export async function garantirDono(idPropriedade, idUsuario) {
  const propriedade = await prisma.propriedade.findFirst({ where: { id_propriedade: idPropriedade, id_usuario: idUsuario } });
  if (!propriedade) throw naoEncontrada();
  return propriedade;
}

export async function listar(idUsuario) {
  const propriedades = await prisma.propriedade.findMany({
    where: { id_usuario: idUsuario },
    orderBy: { nome_fazenda: "asc" },
    include: {
      talhoes: { select: { area_hectares: true } },
      _count: { select: { talhoes: true } }
    }
  });

  return normalizar(
    propriedades.map(({ talhoes, _count, ...p }) => ({
      ...p,
      total_talhoes: _count.talhoes,
      area_talhoes_hectares: talhoes.reduce((soma, t) => soma + (t.area_hectares ? Number(t.area_hectares) : 0), 0)
    }))
  );
}

export async function buscar(idPropriedade, idUsuario) {
  await garantirDono(idPropriedade, idUsuario);
  const propriedade = await prisma.propriedade.findUnique({
    where: { id_propriedade: idPropriedade },
    include: {
      talhoes: {
        orderBy: { nome_talhao: "asc" },
        include: {
          _count: { select: { voos: true } },
          voos: { orderBy: { data_voo: "desc" }, take: 1, select: { data_voo: true } }
        }
      }
    }
  });

  return normalizar({
    ...propriedade,
    talhoes: propriedade.talhoes.map(({ _count, voos, ...t }) => ({
      ...t,
      total_voos: _count.voos,
      ultimo_voo: voos[0]?.data_voo ?? null
    }))
  });
}

export async function criar(idUsuario, dados) {
  const propriedade = await prisma.propriedade.create({ data: { ...dados, id_usuario: idUsuario } });
  return normalizar(propriedade);
}

export async function atualizar(idPropriedade, idUsuario, dados) {
  await garantirDono(idPropriedade, idUsuario);
  const propriedade = await prisma.propriedade.update({ where: { id_propriedade: idPropriedade }, data: dados });
  return normalizar(propriedade);
}

export async function excluir(idPropriedade, idUsuario) {
  await garantirDono(idPropriedade, idUsuario);
  const talhoes = await prisma.talhao.count({ where: { id_propriedade: idPropriedade } });
  if (talhoes > 0) {
    throw new AppError(
      `Esta propriedade tem ${talhoes} talhão(ões). Exclua os talhões antes de excluir a propriedade.`,
      409,
      "POSSUI_DEPENDENTES"
    );
  }
  await prisma.propriedade.delete({ where: { id_propriedade: idPropriedade } });
}
