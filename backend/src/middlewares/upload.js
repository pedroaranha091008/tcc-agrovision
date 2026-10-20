import crypto from "node:crypto";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { garantirPasta } from "../utils/armazenamento.js";
import { AppError } from "../utils/AppError.js";

export const FORMATOS_IMAGEM = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/tiff": [".tif", ".tiff"]
};

/**
 * Recebe imagens do campo "imagens" e grava em uploads/voos/<id do voo>/ com nome aleatório.
 * O tipo é conferido pelo MIME e pela extensão; o conteúdo é conferido depois com o sharp.
 */
export function uploadImagensVoo() {
  const armazenamento = multer.diskStorage({
    destination: (req, file, cb) => {
      garantirPasta("voos", req.params.id).then((pasta) => cb(null, pasta), cb);
    },
    filename: (req, file, cb) => {
      cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    }
  });

  const recebedor = multer({
    storage: armazenamento,
    limits: { fileSize: env.uploads.tamanhoMaxMb * 1024 * 1024, files: env.uploads.maxArquivos },
    fileFilter: (req, file, cb) => {
      // Navegadores mandam o nome em latin1; converte para não estragar acentos.
      file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
      const extensoes = FORMATOS_IMAGEM[file.mimetype];
      const extensao = path.extname(file.originalname).toLowerCase();
      if (!extensoes || !extensoes.includes(extensao)) {
        return cb(new AppError(`"${file.originalname}" não é uma imagem aceita. Envie JPEG, PNG ou TIFF.`, 415, "FORMATO_NAO_SUPORTADO"));
      }
      cb(null, true);
    }
  }).array("imagens");

  return (req, res, next) => {
    recebedor(req, res, (erro) => {
      if (!erro) return next();
      if (erro instanceof multer.MulterError) {
        if (erro.code === "LIMIT_FILE_SIZE") {
          return next(new AppError(`Arquivo maior que ${env.uploads.tamanhoMaxMb} MB.`, 413, "ARQUIVO_MUITO_GRANDE"));
        }
        if (erro.code === "LIMIT_FILE_COUNT") {
          return next(new AppError(`Envie no máximo ${env.uploads.maxArquivos} arquivos por vez.`, 413, "ARQUIVOS_DEMAIS"));
        }
        return next(new AppError("Não foi possível receber os arquivos.", 400, "UPLOAD_INVALIDO"));
      }
      next(erro);
    });
  };
}
