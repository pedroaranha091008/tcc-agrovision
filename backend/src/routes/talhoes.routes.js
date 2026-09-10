import { Router } from "express";
import * as ctrl from "../controllers/talhao.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { carregarTalhao } from "../middlewares/autorizacao.js";
import { validate } from "../middlewares/validate.js";
import { idParam } from "../schemas/comum.js";
import {
  atualizarTalhaoSchema,
  criarTalhaoSchema,
  listarTalhoesQuery,
} from "../schemas/talhao.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: listarTalhoesQuery }), ctrl.listar);
router.post("/", validate({ body: criarTalhaoSchema }), ctrl.criar);
router.get("/:id", validate({ params: idParam }), carregarTalhao(), ctrl.consultar);
router.patch(
  "/:id",
  validate({ params: idParam, body: atualizarTalhaoSchema }),
  carregarTalhao(),
  ctrl.atualizar,
);
router.delete("/:id", validate({ params: idParam }), carregarTalhao(), ctrl.remover);

export default router;
