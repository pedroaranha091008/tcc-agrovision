import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "ROTA_NAO_ENCONTRADA",
      message: `A rota ${req.method} ${req.originalUrl} não existe.`,
      details: null
    }
  });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // JSON malformado no corpo da requisição (lançado pelo express.json()).
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "JSON_INVALIDO", message: "O corpo da requisição não é um JSON válido.", details: null }
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: { code: "CORPO_MUITO_GRANDE", message: "A requisição é grande demais.", details: null }
    });
  }

  console.error(err);

  return res.status(500).json({
    error: {
      code: "ERRO_INTERNO",
      message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      details: null
    }
  });
}
