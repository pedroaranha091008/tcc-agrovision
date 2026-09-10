import * as service from "../services/relatorio.service.js";
import { criado, ok, semConteudo } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";
import { erros } from "../utils/AppError.js";

export const listar = handler(async (req, res) => {
  const { itens, meta } = await service.listar(req.usuario.id_usuario, req.consulta);
  ok(res, itens, meta);
});

export const consultar = handler(async (req, res) => {
  const relatorio = await service.obter(req.usuario.id_usuario, req.params.id);
  ok(res, relatorio);
});

export const gerar = handler(async (req, res) => {
  const { relatorio, recomendacao } = await service.gerar(
    req.usuario.id_usuario,
    req.body.id_analise,
  );
  criado(res, { relatorio, recomendacao });
});

export const baixar = handler(async (req, res, next) => {
  const { caminho_absoluto, nome_arquivo } = await service.caminhoDownload(
    req.usuario.id_usuario,
    req.params.id,
  );
  res.download(caminho_absoluto, nome_arquivo, (err) => {
    if (err && !res.headersSent) {
      next(erros.naoEncontrado("Arquivo do relatorio indisponivel"));
    }
  });
});

export const remover = handler(async (req, res) => {
  await service.remover(req.usuario.id_usuario, req.params.id);
  semConteudo(res);
});
