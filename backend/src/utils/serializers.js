/** Remove campos sensíveis do usuário antes de enviar ao cliente. */
export function usuarioPublico(usuario) {
  const { senha_hash, atualizado_em, ...resto } = usuario;
  return resto;
}

/**
 * Converte Decimals do Prisma em number (eles iriam para o JSON como string)
 * percorrendo objetos e listas aninhados.
 */
export function normalizar(valor) {
  if (valor === null || valor === undefined) return valor;
  if (Array.isArray(valor)) return valor.map(normalizar);
  if (valor instanceof Date) return valor;
  if (typeof valor === "object") {
    if (typeof valor.toNumber === "function") return valor.toNumber();
    return Object.fromEntries(Object.entries(valor).map(([chave, v]) => [chave, normalizar(v)]));
  }
  return valor;
}
