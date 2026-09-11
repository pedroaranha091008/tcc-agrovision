import type { DashboardFiltros, DashboardResumo } from "@/types/dashboard";
import { http } from "./http";
import { qs } from "./propriedades";

export async function obterResumo(filtros: DashboardFiltros, signal?: AbortSignal): Promise<DashboardResumo> {
  const { data } = await http.get<DashboardResumo>(`/dashboard${qs(filtros)}`, { signal });
  return data;
}
