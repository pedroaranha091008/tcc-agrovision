import { z } from "zod";
import { areaHectares, paginacaoQuery, uf } from "./comum.js";

export const criarPropriedadeSchema = z.object({
  nome_fazenda: z.string().trim().min(2, "nome da fazenda obrigatorio").max(200),
  estado: uf,
  cidade: z.string().trim().min(2, "cidade obrigatoria").max(150),
  area_total_hectares: areaHectares.nullable().optional(),
});

export const atualizarPropriedadeSchema = criarPropriedadeSchema.partial().refine(
  (d) => Object.keys(d).length > 0,
  { message: "nenhum campo para atualizar" },
);

export const listarPropriedadesQuery = paginacaoQuery.extend({
  estado: uf.optional(),
  busca: z.string().trim().max(200).optional(),
});
