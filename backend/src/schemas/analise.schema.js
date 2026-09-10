import { z } from "zod";
import { paginacaoQuery, percentual } from "./comum.js";

const TIPOS = ["NDVI", "RGB", "termico", "multispectral", "outro"];
const RISCOS = ["baixo", "medio", "alto", "critico"];
const STATUS = ["pendente", "em_processamento", "concluido", "falhou"];

export const criarAnaliseSchema = z.object({
  id_voo: z.string().uuid("id_voo invalido"),
  tipo_analise: z.enum(TIPOS),
  nivel_risco: z.enum(RISCOS).nullable().optional(),
  percentual_area_afetada: percentual.nullable().optional(),
  resultado: z.string().trim().max(10000).nullable().optional(),
  url_arquivo: z.string().trim().url().max(500).nullable().optional(),
  status: z.enum(STATUS).optional(),
});

export const atualizarAnaliseSchema = criarAnaliseSchema
  .omit({ id_voo: true })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "nenhum campo para atualizar" });

export const listarAnalisesQuery = paginacaoQuery.extend({
  id_voo: z.string().uuid().optional(),
  tipo_analise: z.enum(TIPOS).optional(),
  nivel_risco: z.enum(RISCOS).optional(),
  status: z.enum(STATUS).optional(),
});
