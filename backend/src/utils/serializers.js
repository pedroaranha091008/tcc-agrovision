/** Remove campos sensíveis do usuário antes de enviar ao cliente. */
export function usuarioPublico(usuario) {
  const { senha_hash, atualizado_em, ...resto } = usuario;
  return resto;
}
