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
  voos: (Voo & { total_analises: number })[];
};

export type Analise = {
  id_analise: string;
  tipo_analise: "NDVI" | "RGB" | "termico" | "multispectral" | "outro";
  nivel_risco: "baixo" | "medio" | "alto" | "critico" | null;
  percentual_area_afetada: number | null;
  resultado: string | null;
  url_arquivo: string | null;
  data_analise: string;
};

export type VooDetalhe = Voo & {
  talhao: Pick<Talhao, "id_talhao" | "nome_talhao" | "cultura" | "area_hectares"> & {
    propriedade: Pick<Propriedade, "id_propriedade" | "nome_fazenda">;
  };
  analises: Analise[];
};
