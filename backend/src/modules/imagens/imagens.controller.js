import { env } from "../../config/env.js";
import { FORMATOS_IMAGEM } from "../../middlewares/upload.js";
import { AppError } from "../../utils/AppError.js";
import * as imagensService from "./imagens.service.js";

export function configuracao(req, res) {
  res.json({
    data: {
      formatos: ["JPEG", "PNG", "TIFF"],
      extensoes: Object.values(FORMATOS_IMAGEM).flat(),
      tipos_mime: Object.keys(FORMATOS_IMAGEM),
      tamanho_max_mb: env.uploads.tamanhoMaxMb,
      max_arquivos_por_envio: env.uploads.maxArquivos
    }
  });
}

export async function enviar(req, res) {
  if (!req.files?.length) throw new AppError("Selecione ao menos uma imagem.", 422, "NENHUM_ARQUIVO");
  const resultado = await imagensService.registrar(req.params.id, req.files);
  if (resultado.enviadas.length === 0) {
    throw new AppError("Nenhuma imagem válida foi enviada.", 422, "IMAGEM_INVALIDA",
      resultado.recusadas.map((r) => ({ campo: r.nome, mensagem: r.motivo })));
  }
  res.status(201).json({ data: resultado });
}

export async function arquivo(req, res) {
  const { tipo, caminho, nome } = await imagensService.arquivo(req.params.id, req.usuarioId, req.query.miniatura === "1");
  res.setHeader("Content-Type", tipo);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(nome)}`);
  res.sendFile(caminho);
}

export async function excluir(req, res) {
  await imagensService.excluir(req.params.id, req.usuarioId);
  res.status(204).end();
}
