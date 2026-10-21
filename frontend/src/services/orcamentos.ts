import { http } from "./http";

export interface OrcamentoPayload {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  cultura: string;
  area_hectares: number;
  servico: string;
  mensagem?: string;
}

export interface OrcamentoCriado {
  id_solicitacao: string;
  status: "novo";
  criado_em: string;
}

/** Envia o formulário "Solicite seu orçamento" da página inicial (não exige login). */
export async function solicitarOrcamento(payload: OrcamentoPayload): Promise<OrcamentoCriado> {
  const { data } = await http.post<OrcamentoCriado>("/orcamentos", payload, { auth: false });
  return data;
}
