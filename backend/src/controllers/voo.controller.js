import * as service from "../services/voo.service.js";
import * as imagemService from "../services/imagem.service.js";
import { criado, ok, semConteudo } from "../utils/resposta.js";
import { handler } from "../utils/assincrono.js";

export const listar = handler(async (req, res) => {
  const { itens, meta } = await service.listar(req.usuario.id_usuario, req.consulta);
  ok(res, itens, meta);
});

export const consultar = handler(async (req, res) => {
  ok(res, req.voo);
});

export const criar = handler(async (req, res) => {
  const voo = await service.criar(req.usuario.id_usuario, req.body);
  criado(res, voo);
});

export const atualizar = handler(async (req, res) => {
  const voo = await service.atualizar(req.voo, req.body);
  ok(res, voo);
});

export const remover = handler(async (req, res) => {
  await service.remover(req.voo);
  semConteudo(res);
});

// --- Imagens do voo ---

export const listarImagens = handler(async (req, res) => {
  const imagens = await imagemService.listarDoVoo(req.voo.id_voo);
  ok(res, imagens);
});

export const enviarImagens = handler(async (req, res) => {
  const imagens = await imagemService.anexarAoVoo(req.voo, req.files);
  criado(res, imagens);
});

export const removerImagem = handler(async (req, res) => {
  await imagemService.removerImagem(req.voo.id_voo, req.params.idImagem);
  semConteudo(res);
});
