import type { HistoricoFiltros, MonitoramentoItem } from "@/types/monitoramento";
import { http } from "./http";
import { metaOuPadrao, qs, type Lista } from "./propriedades";

export async function historico(filtros: HistoricoFiltros, signal?: AbortSignal): Promise<Lista<MonitoramentoItem>> {
  const r = await http.get<MonitoramentoItem[]>(`/monitoramentos${qs(filtros)}`, { signal });
  return { itens: r.data, meta: metaOuPadrao(r) };
}
