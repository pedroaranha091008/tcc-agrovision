import { Router } from "express";
import * as ctrl from "../controllers/relatorio.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParam } from "../schemas/comum.js";
import {
  gerarRelatorioSchema,
  listarRelatoriosQuery,
} from "../schemas/relatorio.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: listarRelatoriosQuery }), ctrl.listar);
router.post("/", validate({ body: gerarRelatorioSchema }), ctrl.gerar);
router.get("/:id", validate({ params: idParam }), ctrl.consultar);
router.get("/:id/download", validate({ params: idParam }), ctrl.baixar);
router.delete("/:id", validate({ params: idParam }), ctrl.remover);

export default router;
