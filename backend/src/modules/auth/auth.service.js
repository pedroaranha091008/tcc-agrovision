import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { usuarioPublico } from "../../utils/serializers.js";

const CUSTO_HASH = 10;
// Hash usado quando o email não existe, para o tempo de resposta não revelar quais contas existem.
const HASH_FALSO = bcrypt.hashSync("senha-inexistente", CUSTO_HASH);

function gerarToken(idUsuario) {
  return jwt.sign({}, env.jwtSecret, { subject: idUsuario, expiresIn: env.jwtExpiraEm });
}

export async function cadastrar({ nome, email, senha, telefone, tipo_usuario }) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new AppError("Já existe uma conta com este email. Tente entrar.", 409, "EMAIL_JA_CADASTRADO", [
      { campo: "email", mensagem: "Já existe uma conta com este email." }
    ]);
  }

  const usuario = await prisma.usuario.create({
    data: { nome, email, telefone: telefone || null, tipo_usuario, senha_hash: await bcrypt.hash(senha, CUSTO_HASH) }
  });

  return { token: gerarToken(usuario.id_usuario), usuario: usuarioPublico(usuario) };
}

export async function login({ email, senha }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaConfere = await bcrypt.compare(senha, usuario?.senha_hash ?? HASH_FALSO);

  if (!usuario || !senhaConfere) {
    throw new AppError("Email ou senha incorretos.", 401, "CREDENCIAIS_INVALIDAS");
  }

  return { token: gerarToken(usuario.id_usuario), usuario: usuarioPublico(usuario) };
}
