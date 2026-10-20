// Apaga do banco e do disco tudo o que pertence a contas de teste (email terminado em @teste.agrovision.dev).
// Uso: npm run limpar-testes   (a suíte E2E do frontend chama isto automaticamente ao terminar)
import { prisma } from "../src/config/prisma.js";
import { remover } from "../src/utils/armazenamento.js";

const DOMINIO = "@teste.agrovision.dev";
const deTeste = { usuario: { email: { endsWith: DOMINIO } } };
const vooDeTeste = { talhao: { propriedade: deTeste } };

try {
  const voos = await prisma.voo.findMany({ where: vooDeTeste, select: { id_voo: true } });
  const analises = await prisma.analise.findMany({ where: { voo: vooDeTeste }, select: { detalhes: true } });

  await prisma.analise.deleteMany({ where: { voo: vooDeTeste } });
  await prisma.imagemVoo.deleteMany({ where: { voo: vooDeTeste } });
  await prisma.voo.deleteMany({ where: vooDeTeste });
  await prisma.talhao.deleteMany({ where: { propriedade: deTeste } });
  await prisma.propriedade.deleteMany({ where: deTeste });
  await prisma.sessao.deleteMany({ where: deTeste });
  const usuarios = await prisma.usuario.deleteMany({ where: { email: { endsWith: DOMINIO } } });
  const orcamentos = await prisma.solicitacaoOrcamento.deleteMany({ where: { email: { endsWith: DOMINIO } } });

  for (const { id_voo } of voos) await remover("voos", id_voo);
  for (const { detalhes } of analises) for (const img of detalhes?.por_imagem ?? []) await remover("analises", img.mapa);

  console.log(`Removidos: ${usuarios.count} usuário(s) de teste, ${voos.length} voo(s), ${orcamentos.count} orçamento(s).`);
} finally {
  await prisma.$disconnect();
}
