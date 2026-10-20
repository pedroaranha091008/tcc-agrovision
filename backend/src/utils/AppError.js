export class AppError extends Error {
  constructor(message, statusCode = 500, code = "ERRO_INTERNO", details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
