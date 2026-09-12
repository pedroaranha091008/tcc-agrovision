import { z } from "zod";
import { paginacaoQuery } from "./comum.js";

// z.coerce.date() aceita null/boolean/[] e os converte via `new Date(...)`
// (null e false viram epoch, [] vira epoch, etc.), passando por cima da
// obrigatoriedade do campo. O preprocess barra qualquer valor que nao seja
// string/number/Date antes da coercao, entao null cai como "campo obrigatorio"
// em vez de virar silenciosamente 1970-01-01.
const dataVoo = z.preprocess(
  (v) => (typeof v === "string" || typeof v === "number" || v instanceof Date ? v : undefined),
  z.coerce.date({ error: "data_voo invalida" }),
).refine((d) => d.getTime() <= Date.now() + 24 * 60 * 60 * 1000, {
  message: "data_voo nao pode estar muito no futuro",
});

export const criarVooSchema = z.object({
  id_talhao: z.string().uuid("id_talhao invalido"),
  data_voo: dataVoo,
  altitude_metros: z.coerce.number().positive().max(10000).nullable().optional(),
  modelo_drone: z.string().trim().max(100).nullable().optional(),
  operador: z.string().trim().max(150).nullable().optional(),
  observacoes: z.string().trim().max(5000).nullable().optional(),
  status_processamento: z
    .enum(["pendente", "em_processamento", "concluido", "falhou"])
    .optional(),
});

export const atualizarVooSchema = criarVooSchema
  .omit({ id_talhao: true })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "nenhum campo para atualizar" });

export const listarVoosQuery = paginacaoQuery.extend({
  id_talhao: z.string().uuid().optional(),
  data_inicio: z.coerce.date().optional(),
  data_fim: z.coerce.date().optional(),
  status_processamento: z
    .enum(["pendente", "em_processamento", "concluido", "falhou"])
    .optional(),
});
