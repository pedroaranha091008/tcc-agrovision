import type { SessaoResposta } from "@/types/api";
import { ApiError } from "../erros";
import { session } from "../session";
import { mockDb, paraUsuarioPublico, type RegistroUsuario } from "./db";

export interface Ctx {
  body?: unknown;
  auth?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rota = (ctx: Ctx, params: Record<string, string>) => any;

export interface DefinicaoRota {
  metodo: string;
  regex: RegExp;
  handler: Rota;
}

// Formato: mock:<tipo>:<id_usuario>:<aleatorio>. Sem "-" como separador
// porque o id (UUID) contem hifens.
export function token(prefixo: string, id: string) {
  return `mock:${prefixo}:${id}:${Math.random().toString(36).slice(2, 12)}`;
}

export function idDoToken(t: string | null | undefined): string | undefined {
  if (!t || !t.startsWith("mock:")) return undefined;
  return t.split(":")[2];
}

export function abrirSessao(u: RegistroUsuario): SessaoResposta {
  const access = token("access", u.id_usuario);
  const refresh = token("refresh", u.id_usuario);
  mockDb.accessTokens.set(access, u.id_usuario);
  mockDb.refreshTokens.set(refresh, u.id_usuario);
  return {
    usuario: paraUsuarioPublico(u),
    access_token: access,
    refresh_token: refresh,
    token_type: "Bearer",
  };
}

export function usuarioAutenticado(): RegistroUsuario {
  const access = session.getAccessToken();
  const id = (access && mockDb.accessTokens.get(access)) || idDoToken(access);
  const u = id ? mockDb.acharPorId(id) : undefined;
  if (!u) throw new ApiError("NAO_AUTENTICADO", "Autenticação necessária", 401);
  return u;
}

export function paginar<T>(itens: T[], ctxQuery: URLSearchParams) {
  const pagina = Math.max(1, Number(ctxQuery.get("pagina") ?? "1") || 1);
  let porPagina = Number(ctxQuery.get("por_pagina") ?? "20") || 20;
  porPagina = Math.min(Math.max(1, porPagina), 100);
  const total = itens.length;
  const inicio = (pagina - 1) * porPagina;
  return {
    data: itens.slice(inicio, inicio + porPagina),
    meta: {
      pagina,
      por_pagina: porPagina,
      total,
      total_paginas: Math.max(1, Math.ceil(total / porPagina)),
    },
  };
}
