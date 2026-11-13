import { Router } from "express";
import * as ctrl from "../controllers/orcamento.controller.js";
import { validate } from "../middlewares/validate.js";
import { limiteOrcamentos } from "../middlewares/rateLimit.js";
import { criarOrcamentoSchema } from "../schemas/orcamento.schema.js";

// Rota publica: o formulario da pagina inicial nao exige conta.
const router = Router();

router.post("/", limiteOrcamentos, validate({ body: criarOrcamentoSchema }), ctrl.criar);

export default router;
