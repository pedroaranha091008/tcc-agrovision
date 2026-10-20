import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { rateLimit } from "../../middlewares/rateLimit.js";
import { criarOrcamentoSchema } from "./orcamentos.schemas.js";
import * as orcamentosController from "./orcamentos.controller.js";

const router = Router();

// Rota pública (formulário da home); o limite evita spam automatizado.
const limiteOrcamentos = rateLimit({
  janelaMs: 60 * 60 * 1000,
  maximo: 10,
  mensagem: "Recebemos muitas solicitações deste endereço. Tente novamente mais tarde ou fale conosco por telefone."
});

router.post("/", limiteOrcamentos, validate(criarOrcamentoSchema), orcamentosController.criar);

export default router;
