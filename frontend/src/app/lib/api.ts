// Cliente HTTP da API AgroVision. Respostas seguem o padrão { data } / { error: { code, message, details } }.
//
// Sessão: o token de acesso (15 min) fica só na memória desta página. O token de renovação fica num
// cookie httpOnly que o JavaScript não consegue ler; quando o acesso expira, renovamos pelo cookie.

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

// ─── Sessão ──────────────────────────────────────────────────────────────────

/** Só um lembrete de que existe sessão (para não tentar renovar à toa); não é segredo nenhum. */
const MARCA_SESSAO = "agrovision.sessao";

function guardar(fn: () => void) {
  try { fn(); } catch { /* armazenamento indisponível (aba anônima, bloqueio): segue sem o lembrete */ }
}

// Versões antigas guardavam o token no localStorage; remove o que tiver sobrado.
guardar(() => { localStorage.removeItem("agrovision.token"); sessionStorage.removeItem("agrovision.token"); });

let tokenAcesso: string | null = null;
let aoExpirar: (() => void) | null = null;
let renovacaoEmAndamento: Promise<RespostaSessao | null> | null = null;

export type RespostaSessao<U = unknown> = { token: string; usuario: U };

export const sessao = {
  token: () => tokenAcesso,
  iniciar(token: string) {
    tokenAcesso = token;
    guardar(() => localStorage.setItem(MARCA_SESSAO, "1"));
  },
  limpar() {
    tokenAcesso = null;
    guardar(() => localStorage.removeItem(MARCA_SESSAO));
  },
  provavelmenteAtiva() {
    try { return localStorage.getItem(MARCA_SESSAO) === "1"; } catch { return true; }
  },
  /** Chamado quando a sessão expira de vez (o contexto de autenticação volta para "deslogado"). */
  aoExpirar(fn: (() => void) | null) { aoExpirar = fn; },
};

/** Pede um novo token de acesso usando o cookie. Várias chamadas ao mesmo tempo viram uma só. */
export function renovarSessao<U>(): Promise<RespostaSessao<U> | null> {
  renovacaoEmAndamento ??= (async () => {
    try {
      const resposta = await fetch(API_URL + "/auth/renovar", { method: "POST", credentials: "include" });
      if (!resposta.ok) { sessao.limpar(); return null; }
      const { data } = await resposta.json();
      sessao.iniciar(data.token);
      return data as RespostaSessao;
    } catch {
      return null; // sem conexão: não derruba a sessão, só não renovou agora
    } finally {
      renovacaoEmAndamento = null;
    }
  })();
  return renovacaoEmAndamento as Promise<RespostaSessao<U> | null>;
}

/** fetch com token; se o acesso expirou (401), renova uma vez e repete. */
async function fetchAutenticado(caminho: string, init: RequestInit = {}, autenticar = true): Promise<Response> {
  const fazer = () => fetch(API_URL + caminho, {
    ...init,
    credentials: "include",
    headers: { ...(init.headers as Record<string, string>), ...(autenticar && tokenAcesso ? { Authorization: `Bearer ${tokenAcesso}` } : {}) },
  });
  let resposta: Response;
  try {
    resposta = await fazer();
    if (resposta.status === 401 && autenticar && !caminho.startsWith("/auth/login") && !caminho.startsWith("/auth/cadastro")) {
      if (await renovarSessao()) resposta = await fazer();
      else aoExpirar?.();
    }
  } catch {
    throw new ApiError(SEM_CONEXAO, 0, "SEM_CONEXAO");
  }
  return resposta;
}

// ─── Requisições ─────────────────────────────────────────────────────────────

type Opcoes = { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown; publico?: boolean };

async function requisitar(caminho: string, { method = "GET", body, publico = false }: Opcoes = {}) {
  const resposta = await fetchAutenticado(caminho, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }, !publico);
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

/** Baixa um arquivo protegido (imagens, mapas) com o token; o <img> comum não consegue mandar o header. */
export async function apiBlob(caminho: string): Promise<Blob> {
  const resposta = await fetchAutenticado(caminho);
  if (!resposta.ok) throw erroDaResposta(resposta.status, await resposta.json().catch(() => null));
  return resposta.blob();
}

/** Envia arquivos em multipart com progresso (o fetch não informa progresso de upload; o XHR sim). */
export async function apiUpload<T>(caminho: string, campo: string, arquivos: File[], aoProgredir: (fracao: number) => void): Promise<T> {
  const enviar = () => new Promise<{ status: number; json: { data?: T } | null }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL + caminho);
    xhr.withCredentials = true;
    if (tokenAcesso) xhr.setRequestHeader("Authorization", `Bearer ${tokenAcesso}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable) aoProgredir(e.loaded / e.total); };
    xhr.onerror = () => reject(new ApiError(SEM_CONEXAO, 0, "SEM_CONEXAO"));
    xhr.onload = () => {
      let json = null;
      try { json = JSON.parse(xhr.responseText); } catch { /* resposta sem JSON */ }
      resolve({ status: xhr.status, json });
    };
    const form = new FormData();
    for (const arquivo of arquivos) form.append(campo, arquivo);
    xhr.send(form);
  });

  let resultado = await enviar();
  if (resultado.status === 401) {
    if (await renovarSessao()) { aoProgredir(0); resultado = await enviar(); }
    else aoExpirar?.();
  }
  if (resultado.status >= 200 && resultado.status < 300) return resultado.json?.data as T;
  throw erroDaResposta(resultado.status, resultado.json as never);
}

/** Baixa um arquivo protegido e dispara o "salvar como", usando o nome enviado pelo servidor. */
export async function apiDownload(caminho: string, nomePadrao: string) {
  const resposta = await fetchAutenticado(caminho);
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
