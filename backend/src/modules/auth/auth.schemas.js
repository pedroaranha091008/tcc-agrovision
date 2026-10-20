import { z } from "zod";

const email = z
  .string({ required_error: "Informe o email." })
  .trim()
  .toLowerCase()
  .email("Informe um email válido.")
  .max(255, "Email muito longo.");

export const cadastroSchema = z.object({
  nome: z.string({ required_error: "Informe o nome." }).trim().min(3, "Informe seu nome completo.").max(150, "Nome muito longo."),
  email,
  senha: z
    .string({ required_error: "Informe a senha." })
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A senha pode ter no máximo 72 caracteres.")
    .regex(/[A-Za-z]/, "Use letras e números na senha.")
    .regex(/\d/, "Use letras e números na senha."),
  telefone: z.string().trim().max(20).optional(),
  tipo_usuario: z.enum(["produtor", "agronomo", "empresa"]).default("produtor"),
  lembrar: z.boolean().default(false)
});

export const loginSchema = z.object({
  email,
  senha: z.string({ required_error: "Informe a senha." }).min(1, "Informe a senha."),
  lembrar: z.boolean().default(false)
});
