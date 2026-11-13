import { z } from "zod";

// Mesmas opcoes oferecidas no formulario da pagina inicial.
export const CULTURAS = ["Soja", "Milho", "Cana-de-açúcar", "Café", "Algodão", "Citros", "Eucalipto", "Outro"];
export const SERVICOS = [
  "NDVI / Saúde vegetativa",
  "Falhas de plantio",
  "Plantas daninhas",
  "Contagem de árvores",
  "Monitoramento completo",
  "Relatório personalizado",
];

export const criarOrcamentoSchema = z.object({
  nome: z.string().trim().min(3, "informe o nome completo").max(150),
  email: z.string().trim().toLowerCase().email("email invalido").max(255),
  telefone: z
    .string()
    .trim()
    .max(20)
    .refine((t) => [10, 11].includes(t.replace(/\D/g, "").length), "informe o telefone com DDD"),
  cidade: z.string().trim().min(3, "informe a cidade e o estado").max(150),
  cultura: z.enum(CULTURAS, { message: "selecione uma cultura da lista" }),
  area_hectares: z.coerce
    .number({ message: "informe a area em hectares" })
    .positive("a area deve ser maior que zero")
    .max(1_000_000, "area muito grande — confira o valor"),
  servico: z.enum(SERVICOS, { message: "selecione um servico da lista" }),
  mensagem: z.string().trim().max(2000, "mensagem muito longa (max. 2000 caracteres)").optional(),
});
