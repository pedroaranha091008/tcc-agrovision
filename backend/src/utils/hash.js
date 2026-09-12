import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function gerarHashSenha(senha) {
  return bcrypt.hash(senha, ROUNDS);
}

export function conferirSenha(senha, hash) {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(senha, hash);
}

// Hash valido e fixo, so para gastar a mesma CPU de um bcrypt.compare real
// quando nao ha usuario/senha para comparar de fato (login com email
// inexistente ou conta exclusivamente Google). Sem isso, essas respostas
// voltam quase instantaneas enquanto uma senha errada numa conta real leva o
// tempo do bcrypt — a diferenca de tempo denuncia quais emails existem.
export const HASH_FANTASMA = bcrypt.hashSync("nenhuma-conta-com-este-email", ROUNDS);
