import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function gerarHashSenha(senha) {
  return bcrypt.hash(senha, ROUNDS);
}

export function conferirSenha(senha, hash) {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(senha, hash);
}
