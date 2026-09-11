import type { Analise, AnalisePayload, ListaQuery } from "@/types/dominio";
import { http } from "./http";
import { metaOuPadrao, qs, type Lista } from "./propriedades";

export async function listar(query: ListaQuery, signal?: AbortSignal): Promise<Lista<Analise>> {
  const r = await http.get<Analise[]>(`/analises${qs(query)}`, { signal });
  return { itens: r.data, meta: metaOuPadrao(r) };
}

export async function obter(id: string, signal?: AbortSignal): Promise<Analise> {
  const { data } = await http.get<Analise>(`/analises/${id}`, { signal });
  return data;
}

export async function criar(payload: AnalisePayload): Promise<Analise> {
  const { data } = await http.post<Analise>("/analises", payload);
  return data;
}

export async function atualizar(id: string, payload: Partial<Omit<AnalisePayload, "id_voo">>): Promise<Analise> {
  const { data } = await http.patch<Analise>(`/analises/${id}`, payload);
  return data;
}

export async function remover(id: string): Promise<void> {
  await http.delete(`/analises/${id}`);
}
