import { z } from "zod";
import { numeroOpcional, textoOpcional } from "@/lib/formularios";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const propriedadeFormSchema = z.object({
  nome_fazenda: z.string().trim().min(2, "Informe o nome da fazenda").max(200),
  estado: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => (UFS as readonly string[]).includes(v), "UF inválida"),
  cidade: z.string().trim().min(2, "Informe a cidade").max(150),
  area_total_hectares: numeroOpcional.pipe(
    z.number().nonnegative("A área não pode ser negativa").optional(),
  ),
});

export const talhaoFormSchema = z.object({
  nome_talhao: z.string().trim().min(2, "Informe o nome do talhão").max(150),
  cultura: textoOpcional,
  area_hectares: numeroOpcional.pipe(
    z.number().nonnegative("A área não pode ser negativa").optional(),
  ),
  latitude: numeroOpcional.pipe(
    z.number().min(-90, "Latitude entre -90 e 90").max(90, "Latitude entre -90 e 90").optional(),
  ),
  longitude: numeroOpcional.pipe(
    z
      .number()
      .min(-180, "Longitude entre -180 e 180")
      .max(180, "Longitude entre -180 e 180")
      .optional(),
  ),
  status: z.enum(["ativo", "inativo", "em_analise"]),
});

export const vooFormSchema = z.object({
  data_voo: z
    .string()
    .min(1, "Informe a data do voo")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida")
    .refine(
      (v) => Date.parse(v) <= Date.now() + 24 * 60 * 60 * 1000,
      "A data não pode estar no futuro",
    ),
  altitude_metros: numeroOpcional.pipe(
    z.number().positive("Altitude deve ser positiva").max(10000).optional(),
  ),
  modelo_drone: textoOpcional,
  operador: textoOpcional,
  observacoes: textoOpcional,
});

export const analiseFormSchema = z.object({
  tipo_analise: z.enum(["NDVI", "RGB", "termico", "multispectral", "outro"]),
  nivel_risco: z.enum(["baixo", "medio", "alto", "critico", ""]).transform((v) => (v === "" ? undefined : v)),
  percentual_area_afetada: numeroOpcional.pipe(
    z.number().min(0, "Entre 0 e 100").max(100, "Entre 0 e 100").optional(),
  ),
  resultado: textoOpcional,
  status: z.enum(["pendente", "em_processamento", "concluido", "falhou"]),
});

export const ESTADOS_UF = UFS;
export type PropriedadeForm = z.infer<typeof propriedadeFormSchema>;
export type TalhaoForm = z.infer<typeof talhaoFormSchema>;
export type VooForm = z.infer<typeof vooFormSchema>;
export type AnaliseForm = z.infer<typeof analiseFormSchema>;
