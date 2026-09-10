import type { ApiEnvelope, ApiErrorBody } from "@/types/api";
import { ApiError } from "./erros";
import { session } from "./session";
import { mockRequest } from "./mock/adapter";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");
const USAR_MOCK = import.meta.env.VITE_API_MOCK === "true";

export type Metodo = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface OpcoesRequisicao {
  body?: unknown;
  signal?: AbortSignal;
  /** anexa o access token; padrao true */
  auth?: boolean;
  /** internamente: nao tentar refresh de novo */
  _semRetry?: boolean;
}

/** Registrado pelo modulo de auth para evitar dependencia circular. */
let tentarRenovarSessao: (() => Promise<boolean>) | null = null;
export function configurarRenovacao(fn: () => Promise<boolean>) {
  tentarRenovarSessao = fn;
}

async function parseCorpo(resp: Response): Promise<unknown> {
  const texto = await resp.text();
  if (!texto) return undefined;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

export async function request<T>(
  metodo: Metodo,
  caminho: string,
  opts: OpcoesRequisicao = {},
): Promise<ApiEnvelope<T>> {
  const { body, signal, auth = true } = opts;

  if (USAR_MOCK) {
    return mockRequest<T>(metodo, caminho, { body, auth });
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = session.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let resp: Response;
  try {
    resp = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw ApiError.rede();
  }

  if (resp.status === 401 && auth && !opts._semRetry && tentarRenovarSessao) {
    const ok = await tentarRenovarSessao();
    if (ok) return request<T>(metodo, caminho, { ...opts, _semRetry: true });
    throw ApiError.sessaoExpirada();
  }

  const corpo = await parseCorpo(resp);

  if (!resp.ok) {
    const err = (corpo as ApiErrorBody | undefined)?.error;
    throw new ApiError(
      err?.code ?? `HTTP_${resp.status}`,
      err?.message ?? `Erro ${resp.status}`,
      resp.status,
      err?.details,
    );
  }

  if (resp.status === 204 || corpo === undefined) {
    return { data: undefined as T };
  }
  return corpo as ApiEnvelope<T>;
}

export const http = {
  get: <T>(caminho: string, opts?: OpcoesRequisicao) => request<T>("GET", caminho, opts),
  post: <T>(caminho: string, body?: unknown, opts?: OpcoesRequisicao) =>
    request<T>("POST", caminho, { ...opts, body }),
  patch: <T>(caminho: string, body?: unknown, opts?: OpcoesRequisicao) =>
    request<T>("PATCH", caminho, { ...opts, body }),
  delete: <T>(caminho: string, opts?: OpcoesRequisicao) => request<T>("DELETE", caminho, opts),
};
