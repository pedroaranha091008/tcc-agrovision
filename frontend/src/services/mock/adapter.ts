import type { ApiEnvelope } from "@/types/api";
import { ApiError } from "../erros";
import { mockDb, paraUsuarioPublico } from "./db";
import { abrirSessao, idDoToken, usuarioAutenticado, type Ctx } from "./base";
import { rotasDominio } from "./rotasDominio";

/**
 * Adaptador do modo mock (VITE_API_MOCK=true). Implementa auth/perfil aqui e
 * delega o dominio agricola para rotasDominio.
 */

const LATENCIA_MS = 300;
const espera = () => new Promise((r) => setTimeout(r, LATENCIA_MS));

type Handler = (ctx: Ctx, params: Record<string, string>, query: URLSearchParams) => unknown;

const rotasAuth: Array<{ metodo: string; regex: RegExp; handler: Handler }> = [
  {
    metodo: "POST",
    regex: /^\/auth\/registro$/,
    handler: ({ body }) => {
      const b = body as { nome: string; email: string; senha: string; telefone?: string };
      if (mockDb.acharPorEmail(b.email)) {
        throw new ApiError("CONFLITO", "Não foi possível concluir o cadastro com esses dados", 409);
      }
      const u = mockDb.criarUsuario({
        nome: b.nome,
        email: b.email,
        senha: b.senha,
        telefone: b.telefone ?? null,
        provedor_auth: "local",
      });
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/login$/,
    handler: ({ body }) => {
      const b = body as { email: string; senha: string };
      const u = mockDb.acharPorEmail(b.email);
      if (!u || u.senha !== b.senha) {
        throw new ApiError("CREDENCIAIS_INVALIDAS", "Credenciais inválidas", 401);
      }
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/google$/,
    handler: () => {
      const email = "google.demo@agrovision.local";
      let u = mockDb.acharPorEmail(email);
      if (!u) {
        u = mockDb.criarUsuario({
          nome: "Usuário Google (demo)",
          email,
          senha: null,
          provedor_auth: "google",
          google_sub: "mock-google-sub",
          email_verificado: true,
        });
      }
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/refresh$/,
    handler: ({ body }) => {
      const b = body as { refresh_token: string };
      const id = mockDb.refreshTokens.get(b.refresh_token) ?? idDoToken(b.refresh_token);
      const u = id ? mockDb.acharPorId(id) : undefined;
      if (!u) throw new ApiError("SESSAO_EXPIRADA", "Sessão inválida ou expirada", 401);
      mockDb.refreshTokens.delete(b.refresh_token);
      return { data: abrirSessao(u) };
    },
  },
  {
    metodo: "POST",
    regex: /^\/auth\/logout$/,
    handler: ({ body }) => {
      const b = body as { refresh_token: string };
      mockDb.refreshTokens.delete(b.refresh_token);
      return { data: { mensagem: "Sessão encerrada" } };
    },
  },
  {
    metodo: "GET",
    regex: /^\/usuarios\/me$/,
    handler: () => ({ data: paraUsuarioPublico(usuarioAutenticado()) }),
  },
  {
    metodo: "PATCH",
    regex: /^\/usuarios\/me$/,
    handler: ({ body }) => {
      const u = usuarioAutenticado();
      const b = body as { nome?: string; telefone?: string | null; senha?: string };
      if (b.nome !== undefined) u.nome = b.nome;
      if (b.telefone !== undefined) u.telefone = b.telefone;
      if (b.senha !== undefined) u.senha = b.senha;
      u.atualizado_em = new Date().toISOString();
      mockDb.persistir();
      return { data: paraUsuarioPublico(u) };
    },
  },
];

const TODAS = [...rotasAuth, ...rotasDominio];

export async function mockRequest<T>(metodo: string, caminho: string, ctx: Ctx): Promise<ApiEnvelope<T>> {
  await espera();
  const [semQuery, queryStr = ""] = caminho.split("?");
  const query = new URLSearchParams(queryStr);

  for (const rota of TODAS) {
    if (rota.metodo !== metodo) continue;
    const m = semQuery.match(rota.regex);
    if (!m) continue;
    return (rota.handler as Handler)(ctx, m.groups ?? {}, query) as ApiEnvelope<T>;
  }
  throw new ApiError("NAO_ENCONTRADO", `Mock sem rota para ${metodo} ${semQuery}`, 404);
}
