import path from "node:path";
import multer from "multer";
import env from "../config/env.js";
import { erros } from "../utils/AppError.js";

const EXTENSOES_OK = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff"]);

/**
 * Upload em memoria (o buffer e persistido pela camada de storage).
 * Valida MIME e extensao; limites de tamanho e quantidade vem do ambiente.
 * Arquivos sao gravados sem permissao de execucao pela camada de storage.
 */
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.upload.maxFileBytes,
    files: env.upload.maxFiles,
  },
  fileFilter(_req, file, cb) {
    const mimeOk = env.upload.allowedMime.includes(file.mimetype);
    const extOk = EXTENSOES_OK.has(path.extname(file.originalname).toLowerCase());
    if (mimeOk && extOk) return cb(null, true);
    cb(erros.tipoNaoSuportado(`Arquivo "${file.originalname}" tem tipo nao permitido`));
  },
});

export const receberImagens = uploader.array("imagens", env.upload.maxFiles);
