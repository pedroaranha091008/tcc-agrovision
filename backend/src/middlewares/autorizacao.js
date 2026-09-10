import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";

/**
 * Middlewares que carregam um recurso pelo id da rota e garantem que ele
 * pertence ao usuario autenticado, seguindo a cadeia
 * usuario -> propriedade -> talhao -> voo -> analise.
 * Recurso inexistente ou de outro dono retorna 404 (nao revela existencia).
 */

export function carregarPropriedade(param = "id") {
  return async (req, _res, next) => {
    const propriedade = await prisma.propriedade.findFirst({
      where: { id_propriedade: req.params[param], id_usuario: req.usuario.id_usuario },
    });
    if (!propriedade) return next(erros.naoEncontrado("Propriedade nao encontrada"));
    req.propriedade = propriedade;
    next();
  };
}

export function carregarTalhao(param = "id") {
  return async (req, _res, next) => {
    const talhao = await prisma.talhao.findFirst({
      where: {
        id_talhao: req.params[param],
        propriedade: { id_usuario: req.usuario.id_usuario },
      },
      include: { propriedade: true },
    });
    if (!talhao) return next(erros.naoEncontrado("Talhao nao encontrado"));
    req.talhao = talhao;
    next();
  };
}

export function carregarVoo(param = "id") {
  return async (req, _res, next) => {
    const voo = await prisma.voo.findFirst({
      where: {
        id_voo: req.params[param],
        talhao: { propriedade: { id_usuario: req.usuario.id_usuario } },
      },
      include: { talhao: { include: { propriedade: true } } },
    });
    if (!voo) return next(erros.naoEncontrado("Voo nao encontrado"));
    req.voo = voo;
    next();
  };
}

export function carregarAnalise(param = "id") {
  return async (req, _res, next) => {
    const analise = await prisma.analise.findFirst({
      where: {
        id_analise: req.params[param],
        voo: { talhao: { propriedade: { id_usuario: req.usuario.id_usuario } } },
      },
      include: {
        voo: { include: { talhao: { include: { propriedade: true } } } },
      },
    });
    if (!analise) return next(erros.naoEncontrado("Analise nao encontrada"));
    req.analise = analise;
    next();
  };
}
