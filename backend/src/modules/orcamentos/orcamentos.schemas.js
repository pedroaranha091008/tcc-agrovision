import { z } from "zod";

export const CULTURAS = ["Soja", "Milho", "Cana-de-açúcar", "Café", "Algodão", "Citros", "Eucalipto", "Outro"];
export const SERVICOS = [
  "NDVI / Saúde vegetativa",
  "Falhas de plantio",
  "Plantas daninhas",
  "Contagem de árvores",
  "Monitoramento completo",
  "Relatório personalizado"
];

export const criarOrcamentoSchema = z.object({
  nome: z.string({ required_error: "Informe seu nome." }).trim().min(3, "Informe seu nome completo.").max(150),
  email: z.string({ required_error: "Informe o email." }).trim().toLowerCase().email("Informe um email válido.").max(255),
  telefone: z
    .string({ required_error: "Informe o telefone." })
    .trim()
    .max(20)
    .refine((t) => [10, 11].includes(t.replace(/\D/g, "").length), "Informe o telefone com DDD."),
  cidade: z.string({ required_error: "Informe a cidade." }).trim().min(3, "Informe a cidade e o estado.").max(150),
  cultura: z.enum(CULTURAS, { errorMap: () => ({ message: "Selecione uma cultura da lista." }) }),
  area_hectares: z.coerce
    .number({ invalid_type_error: "Informe a área em hectares." })
    .positive("Informe uma área maior que zero.")
    .max(1_000_000, "Área muito grande — confira o valor."),
  servico: z.enum(SERVICOS, { errorMap: () => ({ message: "Selecione um serviço da lista." }) }),
  mensagem: z.string().trim().max(2000, "Mensagem muito longa (máx. 2000 caracteres).").optional()
});
