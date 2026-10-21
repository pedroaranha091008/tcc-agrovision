import crypto from "node:crypto";
import env from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { erros } from "../utils/AppError.js";
import { enviarEmail } from "../utils/email.js";
import { gerarHashSenha } from "../utils/hash.js";

/**
 * "Esqueci a senha": link com token de uso unico, valido por 1 hora.
 * So o hash do token e guardado no banco.
 */
const VALIDADE_MINUTOS = 60;
const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");

/** Termina sempre sem erro, exista ou nao a conta: a resposta nao pode revelar quais emails estao cadastrados. */
export async function solicitar(email) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return;

  // Um pedido novo invalida os anteriores ainda nao usados.
  await prisma.redefinicaoSenha.updateMany({
    where: { id_usuario: usuario.id_usuario, usada_em: null },
    data: { usada_em: new Date() },
  });

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.redefinicaoSenha.create({
    data: {
      id_usuario: usuario.id_usuario,
      token_hash: hash(token),
      expira_em: new Date(Date.now() + VALIDADE_MINUTOS * 60 * 1000),
    },
  });

  const link = `${env.frontendUrl}/redefinir-senha?token=${token}`;
  const primeiroNome = usuario.nome.split(" ")[0];
  await enviarEmail({
    para: usuario.email,
    assunto: "Redefinição de senha — AgroVision",
    texto: [
      `Olá, ${primeiroNome}!`,
      "",
      "Recebemos um pedido para redefinir a senha da sua conta AgroVision.",
      `Para criar uma nova senha, acesse o link abaixo (válido por ${VALIDADE_MINUTOS} minutos):`,
      "",
      link,
      "",
      "Se não foi você, ignore este email: sua senha continua a mesma.",
    ].join("\n"),
    html:
      `<p>Olá, ${primeiroNome}!</p><p>Recebemos um pedido para redefinir a senha da sua conta AgroVision.</p>` +
      `<p><a href="${link}">Clique aqui para criar uma nova senha</a> (válido por ${VALIDADE_MINUTOS} minutos).</p>` +
      "<p>Se não foi você, ignore este email: sua senha continua a mesma.</p>",
  });
}

export async function redefinir(token, novaSenha) {
  const pedido = await prisma.redefinicaoSenha.findUnique({ where: { token_hash: hash(token) } });
  if (!pedido || pedido.usada_em || pedido.expira_em < new Date()) {
    throw erros.requisicaoInvalida("Este link é inválido ou expirou. Peça um novo link de redefinição.");
  }

  // Marca como usado de forma condicional: dois envios simultaneos do mesmo link nao trocam a senha duas vezes.
  const usado = await prisma.redefinicaoSenha.updateMany({
    where: { id_redefinicao: pedido.id_redefinicao, usada_em: null },
    data: { usada_em: new Date() },
  });
  if (usado.count === 0) {
    throw erros.requisicaoInvalida("Este link é inválido ou expirou. Peça um novo link de redefinição.");
  }

  await prisma.usuario.update({
    where: { id_usuario: pedido.id_usuario },
    data: { senha_hash: await gerarHashSenha(novaSenha) },
  });
  // Quem tinha a senha antiga (ou um dispositivo perdido) perde o acesso.
  await prisma.sessao.updateMany({
    where: { id_usuario: pedido.id_usuario, revogado_em: null },
    data: { revogado_em: new Date() },
  });
}
