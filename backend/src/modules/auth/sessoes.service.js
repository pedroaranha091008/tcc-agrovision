// Sessões com token de renovação rotativo.
// - O token de renovação é aleatório, vai num cookie httpOnly e só o hash SHA-256 fica no banco.
// - A cada renovação o token é trocado (rotação). Se um token já trocado for usado de novo,
//   alguém pode tê-lo copiado: todas as sessões do usuário são encerradas por segurança.
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

const DIA_MS = 24 * 60 * 60 * 1000;
// Sem "manter conectado", a sessão no servidor dura no máximo 1 dia (e o cookie some ao fechar o navegador).
const DURACAO_SESSAO_CURTA_MS = DIA_MS;

const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const sessaoInvalida = () => new AppError("Sua sessão expirou. Entre novamente.", 401, "SESSAO_INVALIDA");

export function gerarTokenAcesso(idUsuario) {
  return jwt.sign({}, env.jwtSecret, { subject: idUsuario, expiresIn: `${env.acessoMinutos}m` });
}

export async function criar(idUsuario, { lembrar, userAgent }) {
  const token = crypto.randomBytes(48).toString("base64url");
  const sessao = await prisma.sessao.create({
    data: {
      id_usuario: idUsuario,
      token_hash: hash(token),
      lembrar,
      expira_em: new Date(Date.now() + (lembrar ? env.renovacaoDias * DIA_MS : DURACAO_SESSAO_CURTA_MS)),
      user_agent: userAgent?.slice(0, 255) ?? null
    }
  });
  return { token, sessao };
}

/** Troca um token de renovação válido por um novo; devolve o usuário dono da sessão. */
export async function renovar(token, userAgent) {
  if (!token) throw sessaoInvalida();
  const sessao = await prisma.sessao.findUnique({ where: { token_hash: hash(token) } });
  if (!sessao) throw sessaoInvalida();

  if (sessao.revogada_em) {
    // Reuso de um token já trocado: possível roubo. Encerra todas as sessões do usuário.
    if (sessao.substituida_por) await revogarTodas(sessao.id_usuario);
    throw sessaoInvalida();
  }
  if (sessao.expira_em < new Date()) throw sessaoInvalida();

  const nova = await criar(sessao.id_usuario, { lembrar: sessao.lembrar, userAgent });
  // Mantém o prazo original: renovar não estende a sessão para sempre.
  await prisma.sessao.update({ where: { id_sessao: nova.sessao.id_sessao }, data: { expira_em: sessao.expira_em } });
  const trocada = await prisma.sessao.updateMany({
    where: { id_sessao: sessao.id_sessao, revogada_em: null },
    data: { revogada_em: new Date(), substituida_por: nova.sessao.id_sessao }
  });
  if (trocada.count === 0) {
    // Outra aba renovou ao mesmo tempo; descarta a sessão recém-criada.
    await prisma.sessao.delete({ where: { id_sessao: nova.sessao.id_sessao } });
    throw sessaoInvalida();
  }

  return { token: nova.token, idUsuario: sessao.id_usuario, lembrar: sessao.lembrar, expiraEm: sessao.expira_em };
}

export async function revogar(token) {
  if (!token) return;
  await prisma.sessao.updateMany({ where: { token_hash: hash(token), revogada_em: null }, data: { revogada_em: new Date() } });
}

export async function revogarTodas(idUsuario) {
  await prisma.sessao.updateMany({ where: { id_usuario: idUsuario, revogada_em: null }, data: { revogada_em: new Date() } });
}
