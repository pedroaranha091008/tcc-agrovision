import { z } from "zod";
import { NIVEIS_RISCO, TIPOS_ANALISE } from "../analises/analises.schemas.js";

const vazioParaUndefined = (v) => (v === "" ? undefined : v);
const data = (campo) =>
  z.preprocess(vazioParaUndefined, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${campo}: use o formato AAAA-MM-DD.`).optional());

export const resumoSchema = z.object({
  id_propriedade: z.preprocess(vazioParaUndefined, z.string().uuid("Propriedade inválida.").optional()),
  dias: z.preprocess(vazioParaUndefined, z.coerce.number().int().refine((d) => [30, 90, 180, 365].includes(d), "Período inválido.").optional())
});

export const monitoramentosSchema = z
  .object({
    data_inicio: data("Data inicial"),
    data_fim: data("Data final"),
    id_propriedade: z.preprocess(vazioParaUndefined, z.string().uuid("Propriedade inválida.").optional()),
    id_talhao: z.preprocess(vazioParaUndefined, z.string().uuid("Talhão inválido.").optional()),
    tipo_analise: z.preprocess(vazioParaUndefined, z.enum(TIPOS_ANALISE, { errorMap: () => ({ message: "Tipo de análise inválido." }) }).optional()),
    nivel_risco: z.preprocess(vazioParaUndefined, z.enum(NIVEIS_RISCO, { errorMap: () => ({ message: "Nível de risco inválido." }) }).optional()),
    pagina: z.preprocess(vazioParaUndefined, z.coerce.number().int().min(1, "Página inválida.").default(1)),
    por_pagina: z.preprocess(vazioParaUndefined, z.coerce.number().int().min(1).max(50, "No máximo 50 por página.").default(10))
  })
  .refine((f) => !f.data_inicio || !f.data_fim || f.data_inicio <= f.data_fim, {
    message: "A data inicial deve ser anterior à final.",
    path: ["data_fim"]
  });
