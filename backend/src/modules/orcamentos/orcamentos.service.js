import { prisma } from "../../config/prisma.js";

export async function criar(dados) {
  const solicitacao = await prisma.solicitacaoOrcamento.create({
    data: { ...dados, mensagem: dados.mensagem || null }
  });
  return {
    id_solicitacao: solicitacao.id_solicitacao,
    status: solicitacao.status,
    criado_em: solicitacao.criado_em
  };
}
