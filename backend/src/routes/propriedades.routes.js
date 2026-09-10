import { Router } from "express";
import * as ctrl from "../controllers/propriedade.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { carregarPropriedade } from "../middlewares/autorizacao.js";
import { validate } from "../middlewares/validate.js";
import { idParam } from "../schemas/comum.js";
import {
  atualizarPropriedadeSchema,
  criarPropriedadeSchema,
  listarPropriedadesQuery,
} from "../schemas/propriedade.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: listarPropriedadesQuery }), ctrl.listar);
router.post("/", validate({ body: criarPropriedadeSchema }), ctrl.criar);
router.get("/:id", validate({ params: idParam }), carregarPropriedade(), ctrl.consultar);
router.patch(
  "/:id",
  validate({ params: idParam, body: atualizarPropriedadeSchema }),
  carregarPropriedade(),
  ctrl.atualizar,
);
router.delete("/:id", validate({ params: idParam }), carregarPropriedade(), ctrl.remover);

export default router;
