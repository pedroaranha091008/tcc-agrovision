import type { DashboardFiltros, DashboardResumo, Painel } from "@/types/dashboard";
import { http } from "./http";
import { qs } from "./propriedades";

export async function obterResumo(filtros: DashboardFiltros, signal?: AbortSignal): Promise<DashboardResumo> {
  const { data } = await http.get<DashboardResumo>(`/dashboard${qs(filtros)}`, { signal });
  return data;
}

export async function obterPainel(
  filtros: { id_propriedade?: string; dias?: number },
  signal?: AbortSignal,
): Promise<Painel> {
  const { data } = await http.get<Painel>(`/dashboard/painel${qs(filtros)}`, { signal });
  return data;
}
