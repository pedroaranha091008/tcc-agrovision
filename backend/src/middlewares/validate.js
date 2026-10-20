import { AppError } from "../utils/AppError.js";

function detalhes(error) {
  return error.issues.flatMap((issue) =>
    issue.code === "unrecognized_keys"
      ? issue.keys.map((chave) => ({ campo: chave, mensagem: "Campo não permitido." }))
      : [{ campo: issue.path.join(".") || "body", mensagem: issue.message }]
  );
}

/** Valida req.body com um schema zod e substitui pelo valor já limpo/convertido. */
export function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body ?? {});
    if (!resultado.success) {
      return next(new AppError("Alguns campos estão inválidos. Confira e tente novamente.", 422, "DADOS_INVALIDOS", detalhes(resultado.error)));
    }
    req.body = resultado.data;
    next();
  };
}

/** Valida req.query (filtros de listagem) e guarda o resultado em req.filtros. */
export function validateQuery(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.query ?? {});
    if (!resultado.success) {
      return next(new AppError("Filtros inválidos.", 422, "FILTROS_INVALIDOS", detalhes(resultado.error)));
    }
    req.filtros = resultado.data;
    next();
  };
}

/** IDs de URL que não são UUID nunca existem: responde 404 sem consultar o banco. */
export function validateId(req, res, next) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    return next(new AppError("Registro não encontrado.", 404, "NAO_ENCONTRADO"));
  }
  next();
}
