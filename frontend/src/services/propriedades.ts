import type { ApiEnvelope, PaginacaoMeta } from "@/types/api";
import type { ListaQuery, Propriedade, PropriedadePayload } from "@/types/dominio";
import { http } from "./http";

function qs(params: ListaQuery = {}): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export interface Lista<T> {
  itens: T[];
  meta: PaginacaoMeta;
}

export async function listar(query: ListaQuery, signal?: AbortSignal): Promise<Lista<Propriedade>> {
  const r = await http.get<Propriedade[]>(`/propriedades${qs(query)}`, { signal });
  return { itens: r.data, meta: metaOuPadrao(r) };
}

export async function obter(id: string, signal?: AbortSignal): Promise<Propriedade> {
  const { data } = await http.get<Propriedade>(`/propriedades/${id}`, { signal });
  return data;
}

export async function criar(payload: PropriedadePayload): Promise<Propriedade> {
  const { data } = await http.post<Propriedade>("/propriedades", payload);
  return data;
}

export async function atualizar(id: string, payload: Partial<PropriedadePayload>): Promise<Propriedade> {
  const { data } = await http.patch<Propriedade>(`/propriedades/${id}`, payload);
  return data;
}

export async function remover(id: string): Promise<void> {
  await http.delete(`/propriedades/${id}`);
}

export function metaOuPadrao<T>(r: ApiEnvelope<T>): PaginacaoMeta {
  return (
    r.meta ?? {
      pagina: 1,
      por_pagina: Array.isArray(r.data) ? r.data.length : 0,
      total: Array.isArray(r.data) ? r.data.length : 0,
      total_paginas: 1,
    }
  );
}

export { qs };
