import { prisma } from "../config/prisma.js";
import logger from "../config/logger.js";

/** Registra um pedido de orcamento vindo do site. Devolve so o necessario para confirmar ao visitante. */
export async function criar(dados) {
  const solicitacao = await prisma.solicitacaoOrcamento.create({
    data: { ...dados, mensagem: dados.mensagem || null },
  });
  // Log para a equipe acompanhar enquanto nao houver painel/aviso por email dos pedidos.
  logger.info(
    { id_solicitacao: solicitacao.id_solicitacao, servico: solicitacao.servico, cidade: solicitacao.cidade },
    "Nova solicitacao de orcamento",
  );
  return {
    id_solicitacao: solicitacao.id_solicitacao,
    status: solicitacao.status,
    criado_em: solicitacao.criado_em,
  };
}
