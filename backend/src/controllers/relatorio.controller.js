import * as service from "../services/relatorio.service.js";
import { criado, ok, semConteudo } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

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

export const baixar = handler(async (req, res) => {
  const { conteudo, nome_arquivo } = await service.caminhoDownload(
    req.usuario.id_usuario,
    req.params.id,
  );
  res.set("Cache-Control", "private, no-store");
  res.attachment(nome_arquivo).type("application/pdf").send(conteudo);
});

export const remover = handler(async (req, res) => {
  await service.remover(req.usuario.id_usuario, req.params.id);
  semConteudo(res);
});
