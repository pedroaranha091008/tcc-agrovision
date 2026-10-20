// Cliente HTTP da API AgroVision. Respostas seguem o padrão { data } / { error: { code, message, details } }.

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000/api/v1";

export type DetalheErro = { campo: string; mensagem: string };

export class ApiError extends Error {
  status: number;
  code: string;
  details: DetalheErro[] | null;

  constructor(message: string, status: number, code: string, details: DetalheErro[] | null = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Mensagem do campo informado, quando a API devolveu erro de validação. */
  campo(nome: string) {
    return this.details?.find(d => d.campo === nome)?.mensagem;
  }
}

const TOKEN_KEY = "agrovision.token";

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string, lembrar: boolean) {
    try {
      tokenStorage.clear();
      (lembrar ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    } catch {
      /* armazenamento indisponível (aba anônima, bloqueio) — sessão dura só enquanto a página estiver aberta */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignora */
    }
  },
};

type Opcoes = { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown; token?: string | null };

export async function api<T>(caminho: string, { method = "GET", body, token = tokenStorage.get() }: Opcoes = {}): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em instantes.",
      0,
      "SEM_CONEXAO",
    );
  }

  if (resposta.status === 204) return undefined as T;

  const json = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const erro = json?.error;
    throw new ApiError(
      erro?.message ?? "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      resposta.status,
      erro?.code ?? "ERRO_INTERNO",
      erro?.details ?? null,
    );
  }
  return json?.data as T;
}
