import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "../config/logger.js";

/**
 * Envio de emails. Com SMTP configurado no .env, envia de verdade (nodemailer).
 * Sem SMTP, fora de producao, o email vai para o log e e salvo em
 * emails-enviados/ (fora do git) — assim a equipe e os testes conseguem abrir o
 * link de redefinicao de senha sem depender de um provedor de email.
 */
export const PASTA_EMAILS_DEV = path.resolve("emails-enviados");

const transporte = env.email.host
  ? nodemailer.createTransport({
      host: env.email.host,
      port: env.email.porta,
      secure: env.email.porta === 465,
      auth: env.email.usuario ? { user: env.email.usuario, pass: env.email.senha } : undefined,
    })
  : null;

export async function enviarEmail({ para, assunto, texto, html }) {
  if (transporte) {
    await transporte.sendMail({ from: env.email.remetente, to: para, subject: assunto, text: texto, html });
    return;
  }
  if (env.isProd) {
    logger.error({ assunto }, "SMTP nao configurado: email NAO foi enviado");
    return;
  }
  logger.info({ para, assunto }, `Email de desenvolvimento (SMTP nao configurado):\n${texto}`);
  await fs.mkdir(PASTA_EMAILS_DEV, { recursive: true });
  const nome = `${new Date().toISOString().replace(/[:.]/g, "-")}-${para.replace(/[^a-zA-Z0-9.@+-]/g, "_")}.txt`;
  await fs.writeFile(path.join(PASTA_EMAILS_DEV, nome), `Para: ${para}\nAssunto: ${assunto}\n\n${texto}\n`, "utf8");
}
