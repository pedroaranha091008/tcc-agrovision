// Envio de emails. Com SMTP configurado no .env, envia de verdade (nodemailer).
// Sem SMTP, fora de produção, o email é mostrado no terminal e salvo em backend/emails-enviados/
// para a equipe (e os testes) poderem abrir o link sem depender de um provedor de email.
import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const PASTA_EMAILS_DEV = path.resolve("emails-enviados");

const transporte = env.email.host
  ? nodemailer.createTransport({
      host: env.email.host,
      port: env.email.porta,
      secure: env.email.porta === 465,
      auth: env.email.usuario ? { user: env.email.usuario, pass: env.email.senha } : undefined
    })
  : null;

export async function enviarEmail({ para, assunto, texto, html }) {
  if (transporte) {
    await transporte.sendMail({ from: env.email.remetente, to: para, subject: assunto, text: texto, html });
    return;
  }
  if (env.producao) {
    console.error(`[email] SMTP não configurado: email "${assunto}" para ${para} NÃO foi enviado.`);
    return;
  }
  const conteudo = `Para: ${para}\nAssunto: ${assunto}\n\n${texto}\n`;
  console.log(`\n[email de desenvolvimento]\n${conteudo}`);
  await fs.mkdir(PASTA_EMAILS_DEV, { recursive: true });
  const nome = `${new Date().toISOString().replace(/[:.]/g, "-")}-${para.replace(/[^a-zA-Z0-9.@-]/g, "_")}.txt`;
  await fs.writeFile(path.join(PASTA_EMAILS_DEV, nome), conteudo, "utf8");
}
