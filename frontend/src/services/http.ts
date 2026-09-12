import type { ApiEnvelope, ApiErrorBody } from "@/types/api";
import { ApiError } from "./erros";
import { session } from "./session";
import { mockRequest, mockUpload, mockDownload } from "./mock/adapter";

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

export interface OpcoesUpload {
  onProgresso?: (percentual: number) => void;
  signal?: AbortSignal;
}

/**
 * POST multipart/form-data com progresso real (via XHR; fetch nao expoe
 * progresso de upload de forma amplamente suportada).
 */
export function upload<T>(caminho: string, formData: FormData, opts: OpcoesUpload = {}): Promise<ApiEnvelope<T>> {
  const { onProgresso, signal } = opts;

  if (USAR_MOCK) {
    return mockUpload<T>(caminho, formData, onProgresso, signal);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${caminho}`);
    const token = session.getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgresso?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onerror = () => reject(ApiError.rede());
    xhr.onabort = () => reject(new DOMException("Upload cancelado", "AbortError"));

    xhr.onload = () => {
      const corpo = xhr.response as ApiEnvelope<T> | ApiErrorBody | undefined;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve((corpo as ApiEnvelope<T>) ?? { data: undefined as T });
      } else {
        const err = (corpo as ApiErrorBody | undefined)?.error;
        reject(new ApiError(err?.code ?? `HTTP_${xhr.status}`, err?.message ?? `Erro ${xhr.status}`, xhr.status, err?.details));
      }
    };

    if (signal) {
      if (signal.aborted) return xhr.abort();
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(formData);
  });
}

/**
 * Baixa um arquivo autenticado (ex.: PDF de relatório) como Blob.
 * Usa XHR para reaproveitar o retry de 401 e reportar progresso de download.
 */
export function baixarArquivo(
  caminho: string,
  opts: OpcoesUpload = {},
): Promise<Blob> {
  const { onProgresso, signal } = opts;

  if (USAR_MOCK) {
    return mockDownload(caminho);
  }

  const tentar = (semRetry: boolean): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${BASE_URL}${caminho}`);
      const token = session.getAccessToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.responseType = "blob";

      xhr.onprogress = (e) => {
        if (e.lengthComputable) onProgresso?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onerror = () => reject(ApiError.rede());
      xhr.onabort = () => reject(new DOMException("Download cancelado", "AbortError"));

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as Blob);
          return;
        }
        if (xhr.status === 401 && !semRetry && tentarRenovarSessao) {
          const ok = await tentarRenovarSessao();
          if (ok) {
            tentar(true).then(resolve, reject);
            return;
          }
        }
        // corpo de erro vem como Blob; tenta interpretar como JSON
        let mensagem = `Erro ${xhr.status}`;
        let code = `HTTP_${xhr.status}`;
        try {
          const texto = await (xhr.response as Blob).text();
          const corpo = JSON.parse(texto) as ApiErrorBody;
          mensagem = corpo.error?.message ?? mensagem;
          code = corpo.error?.code ?? code;
        } catch {
          /* corpo nao era JSON */
        }
        reject(new ApiError(code, mensagem, xhr.status));
      };

      if (signal) {
        if (signal.aborted) return xhr.abort();
        signal.addEventListener("abort", () => xhr.abort(), { once: true });
      }
      xhr.send();
    });

  return tentar(false);
}

/** Dispara o download de um Blob no navegador com o nome de arquivo dado. */
export function salvarBlobComoArquivo(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
