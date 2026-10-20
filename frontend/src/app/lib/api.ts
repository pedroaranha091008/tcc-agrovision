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

async function requisitar(caminho: string, { method = "GET", body, token = tokenStorage.get() }: Opcoes = {}) {
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
    throw new ApiError(SEM_CONEXAO, 0, "SEM_CONEXAO");
  }

  if (resposta.status === 204) return null;

  const json = await resposta.json().catch(() => null);
  if (!resposta.ok) throw erroDaResposta(resposta.status, json);
  return json;
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  return (await requisitar(caminho, opcoes))?.data as T;
}

/** Para listagens paginadas: devolve também o "meta" (total, página...). */
export async function apiLista<T, M>(caminho: string): Promise<{ data: T[]; meta: M }> {
  const json = await requisitar(caminho);
  return { data: json?.data ?? [], meta: json?.meta };
}

const SEM_CONEXAO = "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em instantes.";

function erroDaResposta(status: number, json: { error?: { message?: string; code?: string; details?: DetalheErro[] } } | null) {
  const erro = json?.error;
  return new ApiError(
    erro?.message ?? "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    status,
    erro?.code ?? "ERRO_INTERNO",
    erro?.details ?? null,
  );
}

/** Baixa um arquivo protegido (imagens, mapas) com o token; o <img> comum não consegue mandar o header. */
export async function apiBlob(caminho: string): Promise<Blob> {
  const token = tokenStorage.get();
  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError(SEM_CONEXAO, 0, "SEM_CONEXAO");
  }
  if (!resposta.ok) throw erroDaResposta(resposta.status, await resposta.json().catch(() => null));
  return resposta.blob();
}

/** Envia arquivos em multipart com progresso (o fetch não informa progresso de upload; o XHR sim). */
export function apiUpload<T>(caminho: string, campo: string, arquivos: File[], aoProgredir: (fracao: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL + caminho);
    const token = tokenStorage.get();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable) aoProgredir(e.loaded / e.total); };
    xhr.onerror = () => reject(new ApiError(SEM_CONEXAO, 0, "SEM_CONEXAO"));
    xhr.onload = () => {
      let json = null;
      try { json = JSON.parse(xhr.responseText); } catch { /* resposta sem JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json?.data as T);
      else reject(erroDaResposta(xhr.status, json));
    };
    const form = new FormData();
    for (const arquivo of arquivos) form.append(campo, arquivo);
    xhr.send(form);
  });
}

/** Baixa um arquivo protegido e dispara o "salvar como", usando o nome enviado pelo servidor. */
export async function apiDownload(caminho: string, nomePadrao: string) {
  const token = tokenStorage.get();
  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError(SEM_CONEXAO, 0, "SEM_CONEXAO");
  }
  if (!resposta.ok) throw erroDaResposta(resposta.status, await resposta.json().catch(() => null));
  const nome = /filename="?([^";]+)"?/.exec(resposta.headers.get("content-disposition") ?? "")?.[1] ?? nomePadrao;
  const url = URL.createObjectURL(await resposta.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
