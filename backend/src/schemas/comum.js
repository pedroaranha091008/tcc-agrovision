import { z } from "zod";

export const idParam = z.object({ id: z.string().uuid("id invalido") });

export const paginacaoQuery = z.object({
  pagina: z.coerce.number().int().min(1).optional(),
  por_pagina: z.coerce.number().int().min(1).max(100).optional(),
  ordenar_por: z.string().optional(),
  ordem: z.enum(["asc", "desc"]).optional(),
});

export const uf = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, "UF deve ter duas letras");

export const latitude = z.coerce.number().min(-90).max(90);
export const longitude = z.coerce.number().min(-180).max(180);
export const areaHectares = z.coerce.number().nonnegative("area nao pode ser negativa");
export const percentual = z.coerce.number().min(0).max(100);
