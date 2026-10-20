import { AppError } from "../utils/AppError.js";

/** Valida req.body com um schema zod e substitui pelo valor já limpo/convertido. */
export function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body ?? {});
    if (!resultado.success) {
      const details = resultado.error.issues.flatMap((issue) =>
        issue.code === "unrecognized_keys"
          ? issue.keys.map((chave) => ({ campo: chave, mensagem: "Campo não permitido." }))
          : [{ campo: issue.path.join(".") || "body", mensagem: issue.message }]
      );
      return next(new AppError("Alguns campos estão inválidos. Confira e tente novamente.", 422, "DADOS_INVALIDOS", details));
    }
    req.body = resultado.data;
    next();
  };
}
