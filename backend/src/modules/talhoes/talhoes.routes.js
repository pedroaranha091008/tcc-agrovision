import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validate, validateId } from "../../middlewares/validate.js";
import { atualizarTalhaoSchema, criarTalhaoSchema } from "./talhoes.schemas.js";
import * as talhoesController from "./talhoes.controller.js";

const router = Router();

router.use(requireAuth);

// A listagem de talhões vem dentro de GET /propriedades/:id.
router.post("/", validate(criarTalhaoSchema), talhoesController.criar);
router.get("/:id", validateId, talhoesController.buscar);
router.patch("/:id", validateId, validate(atualizarTalhaoSchema), talhoesController.atualizar);
router.delete("/:id", validateId, talhoesController.excluir);

export default router;
