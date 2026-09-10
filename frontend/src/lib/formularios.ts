import { z } from "zod";

export type ErrosCampo = Record<string, string>;

/**
 * Valida `valores` com um schema zod. Retorna os dados parseados
 * ou um mapa campo -> mensagem para exibir inline.
 */
export function validarCom<S extends z.ZodTypeAny>(
  schema: S,
  valores: unknown,
): { ok: true; dados: z.output<S> } | { ok: false; erros: ErrosCampo } {
  const r = schema.safeParse(valores);
  if (r.success) return { ok: true, dados: r.data };
  const erros: ErrosCampo = {};
  for (const issue of r.error.issues) {
    const campo = issue.path.join(".") || "_";
    if (!erros[campo]) erros[campo] = issue.message;
  }
  return { ok: false, erros };
}

/** Converte "" -> undefined; number-string -> number. Util para inputs opcionais. */
export const numeroOpcional = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isNaN(n) ? NaN : n;
  })
  .pipe(z.number({ invalid_type_error: "valor numérico inválido" }).optional());

export const textoOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();
