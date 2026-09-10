import { z } from "zod";
import { paginacaoQuery } from "./comum.js";

export const gerarRelatorioSchema = z.object({
  id_analise: z.string().uuid("id_analise invalido"),
});

export const listarRelatoriosQuery = paginacaoQuery.extend({
  id_analise: z.string().uuid().optional(),
});
