import { z } from "zod";
import { paginacaoQuery } from "./comum.js";

const TIPOS = ["NDVI", "RGB", "termico", "multispectral", "outro"];

export const historicoQuery = paginacaoQuery
  .extend({
    data_inicio: z.coerce.date().optional(),
    data_fim: z.coerce.date().optional(),
    id_propriedade: z.string().uuid().optional(),
    id_talhao: z.string().uuid().optional(),
    tipo_analise: z.enum(TIPOS).optional(),
  })
  .refine(
    (q) => !(q.data_inicio && q.data_fim) || q.data_inicio <= q.data_fim,
    { message: "data_inicio deve ser anterior ou igual a data_fim", path: ["data_inicio"] },
  );

export const dashboardQuery = z
  .object({
    id_propriedade: z.string().uuid().optional(),
    data_inicio: z.coerce.date().optional(),
    data_fim: z.coerce.date().optional(),
  })
  .refine(
    (q) => !(q.data_inicio && q.data_fim) || q.data_inicio <= q.data_fim,
    { message: "data_inicio deve ser anterior ou igual a data_fim", path: ["data_inicio"] },
  );
