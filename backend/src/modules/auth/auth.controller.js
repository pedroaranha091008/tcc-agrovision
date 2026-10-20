import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";

export const COOKIE_RENOVACAO = "agrovision_renovacao";

const opcoesCookie = () => ({
  httpOnly: true, // JavaScript da página não consegue ler
  secure: env.producao, // só HTTPS em produção
  sameSite: "lax",
  path: "/api/v1/auth" // só é enviado para as rotas de autenticação
});

/** Grava o cookie de renovação. Sem "manter conectado", vira cookie de sessão (some ao fechar o navegador). */
function gravarCookie(res, { renovacao, lembrar, expiraEm }) {
  res.cookie(COOKIE_RENOVACAO, renovacao, { ...opcoesCookie(), ...(lembrar ? { expires: expiraEm } : {}) });
}

const opcoesSessao = (req, lembrar) => ({ lembrar, userAgent: req.get("user-agent") });
const resposta = ({ token, usuario }) => ({ data: { token, usuario } });

export async function cadastrar(req, res) {
  const { lembrar, ...dados } = req.body;
  const sessao = await authService.cadastrar(dados, opcoesSessao(req, lembrar));
  gravarCookie(res, sessao);
  res.status(201).json(resposta(sessao));
}

export async function login(req, res) {
  const { lembrar, ...dados } = req.body;
  const sessao = await authService.login(dados, opcoesSessao(req, lembrar));
  gravarCookie(res, sessao);
  res.json(resposta(sessao));
}

export async function renovar(req, res) {
  try {
    const sessao = await authService.renovar(req.cookies?.[COOKIE_RENOVACAO], req.get("user-agent"));
    gravarCookie(res, sessao);
    res.json(resposta(sessao));
  } catch (erro) {
    res.clearCookie(COOKIE_RENOVACAO, opcoesCookie());
    throw erro;
  }
}

export async function sair(req, res) {
  await authService.sair(req.cookies?.[COOKIE_RENOVACAO]);
  res.clearCookie(COOKIE_RENOVACAO, opcoesCookie());
  res.status(204).end();
}
