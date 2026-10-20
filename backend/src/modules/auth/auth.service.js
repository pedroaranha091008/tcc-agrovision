import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { usuarioPublico } from "../../utils/serializers.js";
import * as sessoes from "./sessoes.service.js";

const CUSTO_HASH = 10;
// Hash usado quando o email não existe, para o tempo de resposta não revelar quais contas existem.
const HASH_FALSO = bcrypt.hashSync("senha-inexistente", CUSTO_HASH);

async function iniciarSessao(usuario, opcoes) {
  const { token: renovacao, sessao } = await sessoes.criar(usuario.id_usuario, opcoes);
  return {
    token: sessoes.gerarTokenAcesso(usuario.id_usuario),
    renovacao,
    lembrar: opcoes.lembrar,
    expiraEm: sessao.expira_em,
    usuario: usuarioPublico(usuario)
  };
}

export async function cadastrar({ nome, email, senha, telefone, tipo_usuario }, opcoes) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new AppError("Já existe uma conta com este email. Tente entrar.", 409, "EMAIL_JA_CADASTRADO", [
      { campo: "email", mensagem: "Já existe uma conta com este email." }
    ]);
  }

  const usuario = await prisma.usuario.create({
    data: { nome, email, telefone: telefone || null, tipo_usuario, senha_hash: await bcrypt.hash(senha, CUSTO_HASH) }
  });
  return iniciarSessao(usuario, opcoes);
}

export async function login({ email, senha }, opcoes) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaConfere = await bcrypt.compare(senha, usuario?.senha_hash ?? HASH_FALSO);

  if (!usuario || !senhaConfere) {
    throw new AppError("Email ou senha incorretos.", 401, "CREDENCIAIS_INVALIDAS");
  }
  return iniciarSessao(usuario, opcoes);
}

export async function renovar(tokenRenovacao, userAgent) {
  const { token, idUsuario, lembrar, expiraEm } = await sessoes.renovar(tokenRenovacao, userAgent);
  const usuario = await prisma.usuario.findUnique({ where: { id_usuario: idUsuario } });
  if (!usuario) throw new AppError("Conta não encontrada. Entre novamente.", 401, "SESSAO_INVALIDA");
  return { token: sessoes.gerarTokenAcesso(idUsuario), renovacao: token, lembrar, expiraEm, usuario: usuarioPublico(usuario) };
}

export const sair = (tokenRenovacao) => sessoes.revogar(tokenRenovacao);
