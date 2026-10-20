import "dotenv/config";
import path from "node:path";

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
  producao: process.env.NODE_ENV === "production",
  // Token de acesso curto (fica só na memória do navegador) + token de renovação longo em cookie httpOnly.
  acessoMinutos: Number(process.env.ACCESS_TOKEN_MINUTOS) || 15,
  renovacaoDias: Number(process.env.REFRESH_TOKEN_DIAS) || 30,
  // Tentativas de login/cadastro por IP a cada 15 minutos (aumente só em ambiente de testes).
  limiteTentativasAuth: Number(process.env.LIMITE_TENTATIVAS_AUTH) || 20,
  uploads: {
    // Pasta fora de src/, para arquivos enviados nunca serem tratados como código.
    diretorio: path.resolve(process.env.UPLOAD_DIR || "uploads"),
    tamanhoMaxMb: Number(process.env.UPLOAD_MAX_MB) || 25,
    maxArquivos: Number(process.env.UPLOAD_MAX_ARQUIVOS) || 20
  }
};
