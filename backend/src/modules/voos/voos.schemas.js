import { z } from "zod";
import { numeroOpcional, textoOpcional, uuid } from "../../utils/schemas.js";

const campos = {
  data_voo: z.coerce
    .date({ required_error: "Informe a data do voo.", invalid_type_error: "Data do voo inválida." })
    .refine((d) => d.getFullYear() >= 2000, "Data do voo inválida.")
    .refine((d) => d.getTime() <= Date.now() + 365 * 24 * 60 * 60 * 1000, "A data do voo não pode passar de um ano no futuro."),
  altitude_metros: numeroOpcional(
    z.number({ invalid_type_error: "Informe a altitude em metros." }).positive("A altitude deve ser maior que zero.").max(1000, "Altitude acima de 1000 m — confira o valor.")
  ),
  modelo_drone: textoOpcional(100),
  operador: textoOpcional(150),
  observacoes: textoOpcional(2000)
};

export const criarVooSchema = z.object({ id_talhao: uuid("o talhão"), ...campos }).strict("Campo não permitido.");
export const atualizarVooSchema = z.object(campos).partial().strict("Campo não permitido.");
