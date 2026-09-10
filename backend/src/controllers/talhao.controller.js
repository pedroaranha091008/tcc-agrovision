import * as service from "../services/talhao.service.js";
import { criado, ok, semConteudo } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const listar = handler(async (req, res) => {
  const { itens, meta } = await service.listar(req.usuario.id_usuario, req.consulta);
  ok(res, itens, meta);
});

export const consultar = handler(async (req, res) => {
  ok(res, req.talhao);
});

export const criar = handler(async (req, res) => {
  const talhao = await service.criar(req.usuario.id_usuario, req.body);
  criado(res, talhao);
});

export const atualizar = handler(async (req, res) => {
  const talhao = await service.atualizar(req.talhao, req.body);
  ok(res, talhao);
});

export const remover = handler(async (req, res) => {
  await service.remover(req.talhao);
  semConteudo(res);
});
