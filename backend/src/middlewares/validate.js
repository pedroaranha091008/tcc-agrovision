import { ZodError } from "zod";
import { erros } from "../utils/AppError.js";

/**
 * Valida partes da requisicao contra schemas zod.
 * Uso: validate({ body: schema, params: schema, query: schema })
 *
 * body/params sao substituidos pelo resultado parseado. Em Express 5
 * req.query e somente-leitura, entao o resultado vai para req.consulta.
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
        const consulta = schemas.query.parse(req.query);
        Object.defineProperty(req, "consulta", {
          value: consulta,
          writable: true,
          configurable: true,
        });
      }
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const details = e.issues.map((i) => ({
          campo: i.path.join("."),
          mensagem: i.message,
        }));
        return next(erros.validacao(details));
      }
      next(e);
    }
  };
}
