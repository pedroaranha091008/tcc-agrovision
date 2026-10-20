import { z } from "zod";
import { numeroOpcional } from "../../utils/schemas.js";

export const TIPOS_ANALISE = ["NDVI", "RGB", "termico", "multispectral", "outro"];
export const NIVEIS_RISCO = ["baixo", "medio", "alto", "critico"];

/** Análise registrada à mão (ex.: laudo do agrônomo ou resultado de outro software). */
export const criarAnaliseManualSchema = z
  .object({
    tipo_analise: z.enum(TIPOS_ANALISE, { errorMap: () => ({ message: "Selecione o tipo de análise." }) }),
    nivel_risco: z.enum(NIVEIS_RISCO, { errorMap: () => ({ message: "Selecione o nível de risco." }) }),
    percentual_area_afetada: numeroOpcional(
      z.number({ invalid_type_error: "Informe o percentual como número." }).min(0, "O percentual vai de 0 a 100.").max(100, "O percentual vai de 0 a 100.")
    ),
    resultado: z.string({ required_error: "Descreva o resultado." }).trim().min(3, "Descreva o resultado.").max(5000, "Texto muito longo.")
  })
  .strict("Campo não permitido.");
