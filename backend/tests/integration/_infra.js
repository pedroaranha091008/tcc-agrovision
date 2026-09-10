import { prisma } from "../../src/config/prisma.js";

/**
 * Testes de integracao precisam de um MySQL/MariaDB real com as migrations
 * aplicadas (use um BANCO DE TESTES dedicado via DATABASE_URL).
 * Se o banco nao estiver acessivel, as suites sao puladas em vez de falhar.
 */
export let bancoDisponivel = false;
try {
  await prisma.$queryRaw`SELECT 1`;
  bancoDisponivel = true;
} catch {
  bancoDisponivel = false;

  console.warn(
    "[integration] Banco indisponivel - suites de integracao serao puladas. " +
      "Configure DATABASE_URL para um banco de testes e rode as migrations.",
  );
}

export function emailUnico(prefixo = "user") {
  return `${prefixo}+${Date.now()}-${Math.random().toString(16).slice(2, 8)}@teste.local`;
}

export async function limpar() {
  // Ordem respeita as FKs.
  await prisma.relatorio.deleteMany();
  await prisma.imagemVoo.deleteMany();
  await prisma.analise.deleteMany();
  await prisma.voo.deleteMany();
  await prisma.talhao.deleteMany();
  await prisma.propriedade.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.usuario.deleteMany();
}
