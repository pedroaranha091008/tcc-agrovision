import { z } from "zod";

const senha = z.string().min(8, "senha deve ter ao menos 8 caracteres").max(200);

export const registroSchema = z.object({
  nome: z.string().trim().min(2, "nome obrigatorio").max(150),
  email: z.string().trim().toLowerCase().email("email invalido").max(255),
  senha,
  telefone: z.string().trim().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("email invalido"),
  senha: z.string().min(1, "senha obrigatoria"),
});

export const googleSchema = z.object({
  id_token: z.string().min(1, "id_token do Google obrigatorio"),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, "refresh_token obrigatorio"),
});

export const atualizarPerfilSchema = z
  .object({
    nome: z.string().trim().min(2).max(150).optional(),
    telefone: z.string().trim().max(20).nullable().optional(),
    senha: senha.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "nenhum campo para atualizar" });
