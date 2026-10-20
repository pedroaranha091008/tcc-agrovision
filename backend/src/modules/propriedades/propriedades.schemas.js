import { z } from "zod";
import { numeroOpcional, UFS } from "../../utils/schemas.js";

const campos = {
  nome_fazenda: z.string({ required_error: "Informe o nome da fazenda." }).trim().min(2, "Informe o nome da fazenda.").max(200, "Nome muito longo."),
  estado: z
    .string({ required_error: "Informe o estado." })
    .trim()
    .toUpperCase()
    .refine((uf) => UFS.includes(uf), "Selecione um estado válido."),
  cidade: z.string({ required_error: "Informe a cidade." }).trim().min(2, "Informe a cidade.").max(150, "Nome muito longo."),
  area_total_hectares: numeroOpcional(
    z.number({ invalid_type_error: "Informe a área em hectares." }).positive("A área deve ser maior que zero.").max(1_000_000, "Área muito grande — confira o valor.")
  )
};

export const criarPropriedadeSchema = z.object(campos).strict("Campo não permitido.");
export const atualizarPropriedadeSchema = z.object(campos).partial().strict("Campo não permitido.");
