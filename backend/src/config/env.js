import "dotenv/config";

const obrigatorias = ["DATABASE_HOST", "DATABASE_USER", "DATABASE_NAME", "JWT_SECRET"];
const faltando = obrigatorias.filter((nome) => !process.env[nome]);

if (faltando.length > 0) {
  console.error(`Variáveis de ambiente ausentes: ${faltando.join(", ")}. Copie o .env.example para .env e preencha.`);
  process.exit(1);
}

export const env = {
  porta: Number(process.env.PORT) || 3000,
  corsOrigens: (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiraEm: process.env.JWT_EXPIRES_IN || "7d"
};
