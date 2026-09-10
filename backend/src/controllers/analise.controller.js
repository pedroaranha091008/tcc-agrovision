import * as service from "../services/analise.service.js";
import { criado, ok, semConteudo } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const listar = handler(async (req, res) => {
  const { itens, meta } = await service.listar(req.usuario.id_usuario, req.consulta);
  ok(res, itens, meta);
});

export const consultar = handler(async (req, res) => {
  ok(res, req.analise);
});

export const criar = handler(async (req, res) => {
  const analise = await service.criar(req.usuario.id_usuario, req.body);
  criado(res, analise);
});

export const atualizar = handler(async (req, res) => {
  const analise = await service.atualizar(req.analise, req.body);
  ok(res, analise);
});

export const remover = handler(async (req, res) => {
  await service.remover(req.analise);
  semConteudo(res);
});
