import { Router } from "express";
import * as ctrl from "../controllers/analise.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { carregarAnalise } from "../middlewares/autorizacao.js";
import { validate } from "../middlewares/validate.js";
import { idParam } from "../schemas/comum.js";
import {
  atualizarAnaliseSchema,
  criarAnaliseSchema,
  listarAnalisesQuery,
} from "../schemas/analise.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: listarAnalisesQuery }), ctrl.listar);
router.post("/", validate({ body: criarAnaliseSchema }), ctrl.criar);
router.get("/:id", validate({ params: idParam }), carregarAnalise(), ctrl.consultar);
router.patch(
  "/:id",
  validate({ params: idParam, body: atualizarAnaliseSchema }),
  carregarAnalise(),
  ctrl.atualizar,
);
router.delete("/:id", validate({ params: idParam }), carregarAnalise(), ctrl.remover);

export default router;
