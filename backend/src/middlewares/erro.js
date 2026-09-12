import { MulterError } from "multer";
import prismaPkg from "../../generated/prisma/client.js";
import { AppError, erros } from "../utils/AppError.js";
import logger from "../config/logger.js";

const { PrismaClientKnownRequestError } = prismaPkg;

// P2002 (unique constraint) e P2003 (violacao de FK) acontecem em corridas
// legitimas (ex.: dois cadastros com o mesmo email quase simultaneos, ou um
// registro criado no instante entre a checagem de dependentes e o delete) e
// devem virar 409, nao 500. P2025 (registro esperado nao encontrado) vira 404.
function daPrisma(err) {
  if (!(err instanceof PrismaClientKnownRequestError)) return null;
  if (err.code === "P2002") {
    const campos = err.meta?.target;
    return erros.conflito("Já existe um registro com esses dados", { campos });
  }
  if (err.code === "P2003") {
    return erros.conflito("Operação conflita com um registro relacionado");
  }
  if (err.code === "P2025") {
    return erros.naoEncontrado("Registro não encontrado");
  }
  return null;
}

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

  if (err?.type === "entity.too.large") {
    appError = erros.arquivoGrande("Corpo da requisição excede o tamanho permitido");
  }

  const errPrisma = daPrisma(err);
  if (errPrisma) appError = errPrisma;

  if (!(appError instanceof AppError)) {
    logger.error({ err }, "Erro nao tratado");
    appError = erros.interno();
  } else if (appError.status >= 500) {
    logger.error({ err }, "Erro interno");
  }

  res.status(appError.status).json(appError.toResponse());
}
