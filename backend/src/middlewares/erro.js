import { MulterError } from "multer";
import { AppError, erros } from "../utils/AppError.js";
import logger from "../config/logger.js";

export function naoEncontrado(req, res) {
  res.status(404).json({
    error: {
      code: "ROTA_NAO_ENCONTRADA",
      message: "Rota nao encontrada",
      details: { metodo: req.method, url: req.originalUrl },
    },
  });
}

// eslint-disable-next-line no-unused-vars -- Express identifica o handler de erro pela aridade 4
export function tratadorErros(err, req, res, _next) {
  let appError = err;

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") appError = erros.arquivoGrande();
    else if (err.code === "LIMIT_FILE_COUNT")
      appError = erros.requisicaoInvalida("Quantidade de arquivos acima do limite");
    else appError = erros.requisicaoInvalida(`Falha no upload: ${err.code}`);
  }

  if (err?.type === "entity.parse.failed") {
    appError = erros.requisicaoInvalida("JSON invalido no corpo da requisicao");
  }

  if (!(appError instanceof AppError)) {
    logger.error({ err }, "Erro nao tratado");
    appError = erros.interno();
  } else if (appError.status >= 500) {
    logger.error({ err }, "Erro interno");
  }

  res.status(appError.status).json(appError.toResponse());
}
