import type { Talhao } from "@/types/dominio";
import { mockDb } from "./db";
import { agora, dominio } from "./dominioStore";

/**
 * Dados de demonstracao do modo `npm run demo` (VITE_DEMO_SEED=true).
 * Cria a conta demo e uma fazenda com tres talhoes, para a apresentacao
 * funcionar em qualquer computador sem banco nem backend. So roda se a conta
 * ainda nao existir neste navegador, entao o que for criado na demo e mantido.
 */

export const CONTA_DEMO = { email: "demo@agrovision.dev", senha: "agrovision2026" };

export function semearDemo() {
  if (mockDb.acharPorEmail(CONTA_DEMO.email)) return;

  const usuario = mockDb.criarUsuario({
    nome: "João da Silva",
    email: CONTA_DEMO.email,
    senha: CONTA_DEMO.senha,
    telefone: "(16) 99999-0000",
    provedor_auth: "local",
  });

  const id_propriedade = crypto.randomUUID();
  dominio.propriedades.push({
    id_propriedade,
    id_usuario: usuario.id_usuario,
    nome_fazenda: "Fazenda Boa Vista",
    estado: "SP",
    cidade: "Ribeirão Preto",
    area_total_hectares: 300,
    criado_em: agora(),
    atualizado_em: agora(),
  });

  const talhao = (nome_talhao: string, cultura: string, area_hectares: number): Talhao => ({
    id_talhao: crypto.randomUUID(),
    id_propriedade,
    nome_talhao,
    cultura,
    area_hectares,
    latitude: null,
    longitude: null,
    geojson: null,
    status: "ativo",
    criado_em: agora(),
    atualizado_em: agora(),
  });
  dominio.talhoes.push(
    talhao("Talhão Norte", "Café", 85),
    talhao("Talhão Sul", "Soja", 120),
    talhao("Talhão Leste", "Milho", 60),
  );

  dominio.salvar("propriedades");
  dominio.salvar("talhoes");
}
