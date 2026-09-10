/**
 * Erro normalizado da camada de API. Todo erro (HTTP, rede, parse) chega
 * a UI como uma instancia de ApiError com um `code` estavel.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status = 0, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static rede() {
    return new ApiError(
      "REDE",
      "Não foi possível conectar à API. Verifique sua conexão e tente novamente.",
    );
  }

  static sessaoExpirada() {
    return new ApiError("SESSAO_EXPIRADA", "Sua sessão expirou. Entre novamente.", 401);
  }
}

/** Mensagem amigavel por codigo, com fallback para a mensagem do servidor. */
export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    switch (erro.code) {
      case "CREDENCIAIS_INVALIDAS":
        return "Email ou senha incorretos.";
      case "CONFLITO":
        return "Não foi possível concluir: já existe um registro com esses dados.";
      case "VALIDACAO":
        return "Alguns campos estão inválidos. Revise o formulário.";
      case "SESSAO_EXPIRADA":
      case "NAO_AUTENTICADO":
        return "Sua sessão expirou. Entre novamente.";
      case "REDE":
        return erro.message;
      default:
        return erro.message || "Ocorreu um erro inesperado.";
    }
  }
  return "Ocorreu um erro inesperado.";
}
