import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { gerarHashSenha } from "../utils/hash.js";

function publico(usuario) {
  const { senha_hash, google_sub, ...resto } = usuario;
  return resto;
}

export async function obterPerfil(idUsuario) {
  const usuario = await prisma.usuario.findUnique({ where: { id_usuario: idUsuario } });
  if (!usuario) throw erros.naoEncontrado("Usuario nao encontrado");
  return publico(usuario);
}

export async function atualizarPerfil(idUsuario, dados) {
  const patch = {};
  if (dados.nome !== undefined) patch.nome = dados.nome;
  if (dados.telefone !== undefined) patch.telefone = dados.telefone;
  if (dados.senha !== undefined) patch.senha_hash = await gerarHashSenha(dados.senha);

  const usuario = await prisma.usuario.update({
    where: { id_usuario: idUsuario },
    data: patch,
  });
  return publico(usuario);
}
