/**
 * Normaliza valores vindos do Prisma para o contrato da API:
 * - Decimal -> number
 * - Date -> string ISO 8601 (UTC)
 * - remove campos sensiveis conhecidos
 * Aplica recursivamente em objetos e arrays.
 */

const CAMPOS_SENSIVEIS = new Set([
  "senha_hash",
  "senha",
  "token_hash",
  "refresh_token",
  "access_token",
]);

function ehDecimalPrisma(valor) {
  return (
    valor !== null &&
    typeof valor === "object" &&
    typeof valor.toFixed === "function" &&
    typeof valor.toNumber === "function"
  );
}

export function serializar(valor) {
  if (valor === null || valor === undefined) return valor;
  if (valor instanceof Date) return valor.toISOString();
  if (ehDecimalPrisma(valor)) return valor.toNumber();
  if (Array.isArray(valor)) return valor.map(serializar);
  if (typeof valor === "object") {
    const saida = {};
    for (const [chave, v] of Object.entries(valor)) {
      if (CAMPOS_SENSIVEIS.has(chave)) continue;
      saida[chave] = serializar(v);
    }
    return saida;
  }
  return valor;
}

export function enviar(res, status, data, meta) {
  const corpo = { data: serializar(data) };
  if (meta !== undefined) corpo.meta = meta;
  return res.status(status).json(corpo);
}

export const ok = (res, data, meta) => enviar(res, 200, data, meta);
export const criado = (res, data) => enviar(res, 201, data);
export const semConteudo = (res) => res.status(204).end();
