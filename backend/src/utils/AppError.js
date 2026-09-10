/**
 * Erro de aplicacao com codigo estavel, status HTTP e detalhes seguros
 * (sem stack trace, sem dados internos) para retornar ao cliente.
 */
export class AppError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toResponse() {
    const error = { code: this.code, message: this.message };
    if (this.details !== undefined) error.details = this.details;
    return { error };
  }
}

export const erros = {
  naoAutenticado: (msg = "Autenticacao necessaria") =>
    new AppError(401, "NAO_AUTENTICADO", msg),
  naoAutorizado: (msg = "Acesso negado") => new AppError(403, "NAO_AUTORIZADO", msg),
  naoEncontrado: (msg = "Recurso nao encontrado") =>
    new AppError(404, "NAO_ENCONTRADO", msg),
  conflito: (msg = "Conflito com o estado atual do recurso", details) =>
    new AppError(409, "CONFLITO", msg, details),
  validacao: (details, msg = "Dados invalidos") =>
    new AppError(422, "VALIDACAO", msg, details),
  requisicaoInvalida: (msg = "Requisicao invalida", details) =>
    new AppError(400, "REQUISICAO_INVALIDA", msg, details),
  credenciaisInvalidas: (msg = "Credenciais invalidas") =>
    new AppError(401, "CREDENCIAIS_INVALIDAS", msg),
  arquivoGrande: (msg = "Arquivo excede o tamanho permitido") =>
    new AppError(413, "ARQUIVO_GRANDE", msg),
  tipoNaoSuportado: (msg = "Tipo de arquivo nao suportado") =>
    new AppError(415, "TIPO_NAO_SUPORTADO", msg),
  interno: (msg = "Erro interno") => new AppError(500, "ERRO_INTERNO", msg),
};
