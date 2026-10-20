import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { usuarioPublico } from "../../utils/serializers.js";

export async function buscarPorId(idUsuario) {
  const usuario = await prisma.usuario.findUnique({ where: { id_usuario: idUsuario } });
  if (!usuario) throw new AppError("Conta não encontrada. Entre novamente.", 401, "SESSAO_INVALIDA");
  return usuarioPublico(usuario);
}

export async function atualizar(idUsuario, dados) {
  await buscarPorId(idUsuario);
  const usuario = await prisma.usuario.update({ where: { id_usuario: idUsuario }, data: dados });
  return usuarioPublico(usuario);
}
