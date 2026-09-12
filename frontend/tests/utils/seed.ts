import * as authService from "@/services/auth";
import * as propriedadeService from "@/services/propriedades";
import * as talhaoService from "@/services/talhoes";
import * as vooService from "@/services/voos";
import * as analiseService from "@/services/analises";
import type { TipoAnalise, NivelRisco } from "@/types/dominio";

/** Cria usuário + propriedade + talhão + voo + análise via os serviços (mock), para testes de integração. */
export async function semearAnalise(opts: {
  tipo_analise?: TipoAnalise;
  nivel_risco?: NivelRisco;
} = {}) {
  const email = `seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@teste.local`;
  await authService.registrar({ nome: "Produtor Teste", email, senha: "senhaForte123" });

  const propriedade = await propriedadeService.criar({
    nome_fazenda: "Fazenda Teste",
    estado: "SP",
    cidade: "Ribeirão Preto",
  });
  const talhao = await talhaoService.criar({
    id_propriedade: propriedade.id_propriedade,
    nome_talhao: "Talhão A",
    status: "ativo",
  });
  const voo = await vooService.criar({
    id_talhao: talhao.id_talhao,
    data_voo: "2026-02-01",
  });
  const analise = await analiseService.criar({
    id_voo: voo.id_voo,
    tipo_analise: opts.tipo_analise ?? "NDVI",
    nivel_risco: opts.nivel_risco ?? "alto",
    percentual_area_afetada: 20,
    resultado: "Falha detectada na porção norte.",
    status: "concluido",
  });

  return { propriedade, talhao, voo, analise };
}
