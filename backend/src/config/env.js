import "dotenv/config";

/**
 * Carrega e valida as variaveis de ambiente uma unica vez na inicializacao.
 * Falha rapido (throw) se faltar variavel obrigatoria.
 */

function obrigatoria(nome) {
  const valor = process.env[nome];
  if (valor === undefined || valor === "") {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${nome}`);
  }
  return valor;
}

function opcional(nome, padrao) {
  const valor = process.env[nome];
  return valor === undefined || valor === "" ? padrao : valor;
}

function inteiro(nome, padrao) {
  const bruto = opcional(nome, String(padrao));
  const n = Number.parseInt(bruto, 10);
  if (Number.isNaN(n)) {
    throw new Error(`Variavel de ambiente ${nome} deve ser um numero inteiro`);
  }
  return n;
}

function lista(nome, padrao = "") {
  return opcional(nome, padrao)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const env = {
  nodeEnv: opcional("NODE_ENV", "development"),
  port: inteiro("PORT", 3000),
  corsOrigins: lista("CORS_ORIGINS", "http://localhost:5173"),

  databaseUrl: obrigatoria("DATABASE_URL"),
  db: {
    host: obrigatoria("DATABASE_HOST"),
    user: obrigatoria("DATABASE_USER"),
    password: obrigatoria("DATABASE_PASSWORD"),
    name: obrigatoria("DATABASE_NAME"),
    port: inteiro("DATABASE_PORT", 3306),
  },

  auth: {
    accessSecret: obrigatoria("JWT_ACCESS_SECRET"),
    accessTtl: opcional("JWT_ACCESS_TTL", "15m"),
    refreshSecret: obrigatoria("REFRESH_SECRET"),
    refreshTtlDays: inteiro("REFRESH_TTL_DAYS", 30),
  },

  // Tentativas de login/registro por IP a cada 15 min (aumente so em ambiente de testes).
  limiteTentativasAuth: inteiro("LIMITE_TENTATIVAS_AUTH", 20),

  google: {
    clientId: opcional("GOOGLE_CLIENT_ID", ""),
  },

  // Endereco do site, usado nos links enviados por email (ex.: redefinir senha).
  get frontendUrl() {
    return opcional("FRONTEND_URL", this.corsOrigins[0] ?? "http://localhost:5173").replace(/\/$/, "");
  },

  // Envio de email. Sem SMTP_HOST, em desenvolvimento o email vai para o log
  // e para a pasta emails-enviados/ (ver src/utils/email.js).
  email: {
    host: opcional("SMTP_HOST", ""),
    porta: inteiro("SMTP_PORT", 587),
    usuario: opcional("SMTP_USER", ""),
    senha: opcional("SMTP_PASS", ""),
    remetente: opcional("SMTP_FROM", "AgroVision <nao-responda@agrovision.com.br>"),
  },

  upload: {
    dir: opcional("UPLOAD_DIR", "./uploads"),
    maxFileBytes: inteiro("UPLOAD_MAX_FILE_MB", 25) * 1024 * 1024,
    maxFiles: inteiro("UPLOAD_MAX_FILES", 20),
    allowedMime: lista("UPLOAD_ALLOWED_MIME", "image/jpeg,image/png,image/tiff"),
  },

  report: {
    dir: opcional("REPORT_DIR", "./relatorios"),
  },

  get isProd() {
    return this.nodeEnv === "production";
  },
  get isTest() {
    return this.nodeEnv === "test";
  },
};

export default env;
