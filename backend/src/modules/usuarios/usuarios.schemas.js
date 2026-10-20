import { z } from "zod";

export const atualizarPerfilSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo.").max(150, "Nome muito longo.").optional(),
    telefone: z
      .string()
      .trim()
      .max(20, "Telefone muito longo.")
      .refine((t) => [10, 11].includes(t.replace(/\D/g, "").length), "Informe o telefone com DDD.")
      .nullable()
      .optional(),
    tipo_usuario: z.enum(["produtor", "agronomo", "empresa"]).optional()
  })
  .strict("Campo não permitido.");
