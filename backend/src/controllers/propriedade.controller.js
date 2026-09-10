import * as service from "../services/propriedade.service.js";
import { criado, ok, semConteudo } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const listar = handler(async (req, res) => {
  const { itens, meta } = await service.listar(req.usuario.id_usuario, req.consulta);
  ok(res, itens, meta);
});

export const consultar = handler(async (req, res) => {
  ok(res, req.propriedade);
});

export const criar = handler(async (req, res) => {
  const propriedade = await service.criar(req.usuario.id_usuario, req.body);
  criado(res, propriedade);
});

export const atualizar = handler(async (req, res) => {
  const propriedade = await service.atualizar(req.propriedade, req.body);
  ok(res, propriedade);
});

export const remover = handler(async (req, res) => {
  await service.remover(req.propriedade);
  semConteudo(res);
});
