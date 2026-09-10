import type { ListaQuery, Voo, VooPayload } from "@/types/dominio";
import { http } from "./http";
import { metaOuPadrao, qs, type Lista } from "./propriedades";

export async function listar(query: ListaQuery, signal?: AbortSignal): Promise<Lista<Voo>> {
  const r = await http.get<Voo[]>(`/voos${qs(query)}`, { signal });
  return { itens: r.data, meta: metaOuPadrao(r) };
}

export async function obter(id: string, signal?: AbortSignal): Promise<Voo> {
  const { data } = await http.get<Voo>(`/voos/${id}`, { signal });
  return data;
}

export async function criar(payload: VooPayload): Promise<Voo> {
  const { data } = await http.post<Voo>("/voos", payload);
  return data;
}

export async function atualizar(
  id: string,
  payload: Partial<Omit<VooPayload, "id_talhao">>,
): Promise<Voo> {
  const { data } = await http.patch<Voo>(`/voos/${id}`, payload);
  return data;
}

export async function remover(id: string): Promise<void> {
  await http.delete(`/voos/${id}`);
}
