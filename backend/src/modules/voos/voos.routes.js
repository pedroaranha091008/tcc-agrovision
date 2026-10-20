import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validate, validateId } from "../../middlewares/validate.js";
import { atualizarVooSchema, criarVooSchema } from "./voos.schemas.js";
import * as voosController from "./voos.controller.js";

const router = Router();

router.use(requireAuth);

// A listagem de voos vem dentro de GET /talhoes/:id.
router.post("/", validate(criarVooSchema), voosController.criar);
router.get("/:id", validateId, voosController.buscar);
router.patch("/:id", validateId, validate(atualizarVooSchema), voosController.atualizar);
router.delete("/:id", validateId, voosController.excluir);

export default router;
