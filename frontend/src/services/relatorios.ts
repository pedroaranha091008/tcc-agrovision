import type { GerarRelatorioResposta, Relatorio } from "@/types/relatorio";
import { baixarArquivo, http, salvarBlobComoArquivo, type OpcoesUpload } from "./http";
import { metaOuPadrao, qs, type Lista } from "./propriedades";

export async function listar(
  query: { id_analise?: string; pagina?: number; por_pagina?: number },
  signal?: AbortSignal,
): Promise<Lista<Relatorio>> {
  const r = await http.get<Relatorio[]>(`/relatorios${qs(query)}`, { signal });
  return { itens: r.data, meta: metaOuPadrao(r) };
}

export async function obter(id: string, signal?: AbortSignal): Promise<Relatorio> {
  const { data } = await http.get<Relatorio>(`/relatorios/${id}`, { signal });
  return data;
}

/** Gera (ou regenera, se ja existir) o relatorio de uma analise concluida. */
export async function gerar(idAnalise: string): Promise<GerarRelatorioResposta> {
  const { data } = await http.post<GerarRelatorioResposta>("/relatorios", { id_analise: idAnalise });
  return data;
}

export async function remover(id: string): Promise<void> {
  await http.delete(`/relatorios/${id}`);
}

/** Baixa o PDF e dispara o salvamento no navegador. */
export async function baixar(id: string, idAnalise: string, opts: OpcoesUpload = {}): Promise<void> {
  const blob = await baixarArquivo(`/relatorios/${id}/download`, opts);
  salvarBlobComoArquivo(blob, `relatorio-${idAnalise}.pdf`);
}
