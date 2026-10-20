// Contratos de dados devolvidos pela API (datas chegam como string ISO).

export type StatusTalhao = "ativo" | "inativo" | "em_analise";

export type Propriedade = {
  id_propriedade: string;
  nome_fazenda: string;
  estado: string;
  cidade: string;
  area_total_hectares: number | null;
  criado_em: string;
};

export type PropriedadeResumo = Propriedade & { total_talhoes: number; area_talhoes_hectares: number };

export type Talhao = {
  id_talhao: string;
  id_propriedade: string;
  nome_talhao: string;
  cultura: string | null;
  area_hectares: number | null;
  latitude: number | null;
  longitude: number | null;
  status: StatusTalhao;
  criado_em: string;
};

export type TalhaoResumo = Talhao & { total_voos: number; ultimo_voo: string | null };

export type PropriedadeDetalhe = Propriedade & { talhoes: TalhaoResumo[] };

export type Voo = {
  id_voo: string;
  id_talhao: string;
  data_voo: string;
  altitude_metros: number | null;
  modelo_drone: string | null;
  operador: string | null;
  observacoes: string | null;
  criado_em: string;
};

export type TalhaoDetalhe = Talhao & {
  propriedade: Pick<Propriedade, "id_propriedade" | "nome_fazenda" | "cidade" | "estado">;
  voos: (Voo & { total_analises: number; total_imagens: number })[];
};

export type TipoAnalise = "NDVI" | "RGB" | "termico" | "multispectral" | "outro";
export type NivelRisco = "baixo" | "medio" | "alto" | "critico";

export type ResultadoImagem = { id_imagem: string; nome: string; saudavel: number; atencao: number; critico: number; exg_medio: number; mapa: string };

export type Analise = {
  id_analise: string;
  id_voo: string;
  tipo_analise: TipoAnalise;
  nivel_risco: NivelRisco | null;
  percentual_area_afetada: number | null;
  resultado: string | null;
  url_arquivo: string | null;
  origem: "automatica" | "manual";
  detalhes: {
    metodo: "ExG";
    resumo: { saudavel: number; atencao: number; critico: number; afetada: number; nivel: NivelRisco };
    por_imagem: ResultadoImagem[];
  } | null;
  data_analise: string;
};

export type ImagemVoo = {
  id_imagem: string;
  id_voo: string;
  nome_original: string;
  mime_type: string;
  tamanho_bytes: number;
  largura: number | null;
  altura: number | null;
  criado_em: string;
};

export type ConfiguracaoUpload = { formatos: string[]; extensoes: string[]; tipos_mime: string[]; tamanho_max_mb: number; max_arquivos_por_envio: number };

export type VooDetalhe = Voo & {
  talhao: Pick<Talhao, "id_talhao" | "nome_talhao" | "cultura" | "area_hectares"> & {
    propriedade: Pick<Propriedade, "id_propriedade" | "nome_fazenda">;
  };
  analises: Analise[];
  imagens: ImagemVoo[];
};

export type ResumoAnalise = {
  id_analise: string;
  id_voo: string;
  nivel_risco: NivelRisco | null;
  percentual_area_afetada: number | null;
  tipo_analise: TipoAnalise;
  data_voo: string;
};

export type Painel = {
  periodo_dias: number;
  totais: {
    propriedades: number; talhoes: number; area_monitorada_hectares: number; voos: number; voos_periodo: number;
    imagens: number; analises_periodo: number; areas_criticas: number;
  };
  risco_talhoes: Record<NivelRisco | "sem_analise", number>;
  talhoes: {
    id_talhao: string; nome_talhao: string; cultura: string | null; area_hectares: number | null; status: StatusTalhao;
    propriedade: { id_propriedade: string; nome_fazenda: string };
    total_voos: number;
    ultima_analise: ResumoAnalise | null;
  }[];
  serie_mensal: { mes: string; voos: number; area_afetada_media: number | null }[];
  ultimas_analises: (ResumoAnalise & { data_analise: string; talhao: string; id_talhao: string; propriedade: string })[];
};

export type Monitoramento = {
  id_analise: string;
  tipo_analise: TipoAnalise;
  nivel_risco: NivelRisco | null;
  percentual_area_afetada: number | null;
  origem: "automatica" | "manual";
  data_analise: string;
  voo: {
    id_voo: string;
    data_voo: string;
    talhao: { id_talhao: string; nome_talhao: string; cultura: string | null; propriedade: { id_propriedade: string; nome_fazenda: string } };
  };
};

export type Paginacao = { total: number; pagina: number; por_pagina: number; total_paginas: number };
