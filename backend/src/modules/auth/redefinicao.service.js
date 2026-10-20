// "Esqueci a senha": link com token de uso único, válido por 1 hora. Só o hash do token fica no banco.
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { enviarEmail } from "../../utils/email.js";
import { revogarTodas } from "./sessoes.service.js";

const VALIDADE_MINUTOS = 60;
const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");

/** Sempre termina sem erro, exista ou não a conta: a resposta não pode revelar quais emails estão cadastrados. */
export async function solicitar(email) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return;

  // Um pedido novo invalida os anteriores ainda não usados.
  await prisma.redefinicaoSenha.updateMany({ where: { id_usuario: usuario.id_usuario, usada_em: null }, data: { usada_em: new Date() } });

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.redefinicaoSenha.create({
    data: { id_usuario: usuario.id_usuario, token_hash: hash(token), expira_em: new Date(Date.now() + VALIDADE_MINUTOS * 60 * 1000) }
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
      "Se não foi você, ignore este email: sua senha continua a mesma."
    ].join("\n"),
    html: `<p>Olá, ${primeiroNome}!</p><p>Recebemos um pedido para redefinir a senha da sua conta AgroVision.</p>
<p><a href="${link}">Clique aqui para criar uma nova senha</a> (válido por ${VALIDADE_MINUTOS} minutos).</p>
<p>Se não foi você, ignore este email: sua senha continua a mesma.</p>`
  });
}

export async function redefinir(token, novaSenha) {
  const pedido = await prisma.redefinicaoSenha.findUnique({ where: { token_hash: hash(token) } });
  if (!pedido || pedido.usada_em || pedido.expira_em < new Date()) {
    throw new AppError("Este link é inválido ou expirou. Peça um novo link de redefinição.", 400, "LINK_INVALIDO");
  }

  await prisma.$transaction([
    prisma.usuario.update({ where: { id_usuario: pedido.id_usuario }, data: { senha_hash: await bcrypt.hash(novaSenha, 10) } }),
    prisma.redefinicaoSenha.update({ where: { id_redefinicao: pedido.id_redefinicao }, data: { usada_em: new Date() } })
  ]);
  // Quem tinha a senha antiga (ou um dispositivo perdido) perde o acesso.
  await revogarTodas(pedido.id_usuario);
}
