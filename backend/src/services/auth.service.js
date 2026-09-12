import { OAuth2Client } from "google-auth-library";
import { prisma } from "../config/prisma.js";
import env from "../config/env.js";
import { erros } from "../utils/AppError.js";
import { HASH_FANTASMA, conferirSenha, gerarHashSenha } from "../utils/hash.js";
import {
  expiracaoRefresh,
  gerarAccessToken,
  gerarRefreshToken,
  hashRefreshToken,
} from "../utils/tokens.js";

const googleClient = env.google.clientId ? new OAuth2Client(env.google.clientId) : null;

function publico(usuario) {
  const { senha_hash, google_sub, ...resto } = usuario;
  return resto;
}

async function abrirSessao(usuario, contexto = {}) {
  const refreshToken = gerarRefreshToken();
  await prisma.sessao.create({
    data: {
      id_usuario: usuario.id_usuario,
      token_hash: hashRefreshToken(refreshToken),
      user_agent: contexto.userAgent?.slice(0, 255) ?? null,
      ip: contexto.ip?.slice(0, 64) ?? null,
      expira_em: expiracaoRefresh(),
    },
  });
  return {
    usuario: publico(usuario),
    access_token: gerarAccessToken(usuario),
    refresh_token: refreshToken,
    token_type: "Bearer",
  };
}

export async function registrar(dados, contexto) {
  const existente = await prisma.usuario.findUnique({ where: { email: dados.email } });
  if (existente) {
    // Mensagem generica: nao confirma nem nega a existencia da conta.
    throw erros.conflito("Nao foi possivel concluir o cadastro com esses dados");
  }
  const usuario = await prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone ?? null,
      senha_hash: await gerarHashSenha(dados.senha),
      provedor_auth: "local",
      email_verificado: false,
    },
  });
  return abrirSessao(usuario, contexto);
}

export async function login(dados, contexto) {
  const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } });
  // Compara sempre contra um hash valido (o real ou um "fantasma") para que
  // email inexistente, conta so-Google e senha errada levem o mesmo tempo.
  const senhaConfere = await conferirSenha(dados.senha, usuario?.senha_hash ?? HASH_FANTASMA);
  if (!usuario || !senhaConfere) throw erros.credenciaisInvalidas();
  return abrirSessao(usuario, contexto);
}

export async function loginGoogle(idToken, contexto) {
  if (!googleClient) {
    throw erros.requisicaoInvalida("Login Google nao configurado neste ambiente");
  }
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.google.clientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw erros.credenciaisInvalidas("Token do Google invalido");
  }
  if (!payload?.email || payload.email_verified !== true) {
    throw erros.credenciaisInvalidas("Conta Google sem email verificado");
  }

  const email = payload.email.toLowerCase();
  let usuario = await prisma.usuario.findFirst({
    where: { OR: [{ google_sub: payload.sub }, { email }] },
  });

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        nome: payload.name ?? email.split("@")[0],
        email,
        senha_hash: null,
        provedor_auth: "google",
        google_sub: payload.sub,
        email_verificado: true,
      },
    });
  } else if (!usuario.google_sub) {
    usuario = await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        google_sub: payload.sub,
        email_verificado: true,
        provedor_auth: usuario.senha_hash ? usuario.provedor_auth : "google",
      },
    });
  }

  return abrirSessao(usuario, contexto);
}

export async function renovar(refreshToken, contexto) {
  const tokenHash = hashRefreshToken(refreshToken);
  const sessao = await prisma.sessao.findUnique({
    where: { token_hash: tokenHash },
    include: { usuario: true },
  });
  if (!sessao || sessao.revogado_em || sessao.expira_em < new Date()) {
    throw erros.naoAutenticado("Sessao invalida ou expirada");
  }

  // Rotaciona: revoga a sessao atual e abre uma nova.
  await prisma.sessao.update({
    where: { id_sessao: sessao.id_sessao },
    data: { revogado_em: new Date() },
  });
  return abrirSessao(sessao.usuario, contexto);
}

export async function logout(refreshToken) {
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.sessao.updateMany({
    where: { token_hash: tokenHash, revogado_em: null },
    data: { revogado_em: new Date() },
  });
}
