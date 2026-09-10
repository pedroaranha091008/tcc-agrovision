import { z } from "zod";
import { areaHectares, latitude, longitude, paginacaoQuery } from "./comum.js";

const geojson = z
  .object({ type: z.string("geojson.type obrigatorio") })
  .catchall(z.unknown());

export const criarTalhaoSchema = z.object({
  id_propriedade: z.string().uuid("id_propriedade invalido"),
  nome_talhao: z.string().trim().min(2, "nome do talhao obrigatorio").max(150),
  cultura: z.string().trim().max(100).nullable().optional(),
  area_hectares: areaHectares.nullable().optional(),
  latitude: latitude.nullable().optional(),
  longitude: longitude.nullable().optional(),
  geojson: geojson.nullable().optional(),
  status: z.enum(["ativo", "inativo", "em_analise"]).optional(),
});

export const atualizarTalhaoSchema = criarTalhaoSchema
  .omit({ id_propriedade: true })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "nenhum campo para atualizar" });

export const listarTalhoesQuery = paginacaoQuery.extend({
  id_propriedade: z.string().uuid().optional(),
  status: z.enum(["ativo", "inativo", "em_analise"]).optional(),
  cultura: z.string().trim().max(100).optional(),
});
