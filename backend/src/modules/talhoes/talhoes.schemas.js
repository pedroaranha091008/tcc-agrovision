import { z } from "zod";
import { numeroOpcional, textoOpcional, uuid } from "../../utils/schemas.js";

const campos = {
  nome_talhao: z.string({ required_error: "Informe o nome do talhão." }).trim().min(1, "Informe o nome do talhão.").max(150, "Nome muito longo."),
  cultura: textoOpcional(100),
  area_hectares: numeroOpcional(
    z.number({ invalid_type_error: "Informe a área em hectares." }).positive("A área deve ser maior que zero.").max(1_000_000, "Área muito grande — confira o valor.")
  ),
  latitude: numeroOpcional(z.number({ invalid_type_error: "Latitude inválida." }).min(-90, "Latitude entre -90 e 90.").max(90, "Latitude entre -90 e 90.")),
  longitude: numeroOpcional(z.number({ invalid_type_error: "Longitude inválida." }).min(-180, "Longitude entre -180 e 180.").max(180, "Longitude entre -180 e 180.")),
  status: z.enum(["ativo", "inativo", "em_analise"], { errorMap: () => ({ message: "Status inválido." }) }).optional()
};

export const criarTalhaoSchema = z.object({ id_propriedade: uuid("a propriedade"), ...campos }).strict("Campo não permitido.");
export const atualizarTalhaoSchema = z.object(campos).partial().strict("Campo não permitido.");
