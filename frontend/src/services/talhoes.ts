import type { ListaQuery, Talhao, TalhaoPayload } from "@/types/dominio";
import { http } from "./http";
import { metaOuPadrao, qs, type Lista } from "./propriedades";

export async function listar(query: ListaQuery, signal?: AbortSignal): Promise<Lista<Talhao>> {
  const r = await http.get<Talhao[]>(`/talhoes${qs(query)}`, { signal });
  return { itens: r.data, meta: metaOuPadrao(r) };
}

export async function obter(id: string, signal?: AbortSignal): Promise<Talhao> {
  const { data } = await http.get<Talhao>(`/talhoes/${id}`, { signal });
  return data;
}

export async function criar(payload: TalhaoPayload): Promise<Talhao> {
  const { data } = await http.post<Talhao>("/talhoes", payload);
  return data;
}

export async function atualizar(
  id: string,
  payload: Partial<Omit<TalhaoPayload, "id_propriedade">>,
): Promise<Talhao> {
  const { data } = await http.patch<Talhao>(`/talhoes/${id}`, payload);
  return data;
}

export async function remover(id: string): Promise<void> {
  await http.delete(`/talhoes/${id}`);
}
