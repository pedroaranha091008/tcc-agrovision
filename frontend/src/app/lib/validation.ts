export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

/** Telefone brasileiro com DDD: 10 (fixo) ou 11 (celular) dígitos. */
export function telefoneValido(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  return digitos.length === 10 || digitos.length === 11;
}

/** Formata enquanto o usuário digita: (16) 99999-0000 */
export function mascaraTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const SENHA_MINIMA = 8;
