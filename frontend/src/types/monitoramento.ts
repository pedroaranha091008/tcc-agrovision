import type { NivelRisco, StatusProcessamento, TipoAnalise } from "./dominio";

export interface MonitoramentoItem {
  id_analise: string;
  tipo_analise: TipoAnalise;
  nivel_risco: NivelRisco | null;
  percentual_area_afetada: number | null;
  status: StatusProcessamento;
  data_analise: string;
  voo: { id_voo: string; data_voo: string };
  talhao: { id_talhao: string; nome_talhao: string; cultura: string | null };
  propriedade: { id_propriedade: string; nome_fazenda: string; cidade: string; estado: string };
}

export interface HistoricoFiltros {
  pagina?: number;
  por_pagina?: number;
  data_inicio?: string;
  data_fim?: string;
  id_propriedade?: string;
  id_talhao?: string;
  tipo_analise?: TipoAnalise;
  [extra: string]: string | number | undefined;
}
