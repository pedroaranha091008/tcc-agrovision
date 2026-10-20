import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validate, validateId } from "../../middlewares/validate.js";
import { atualizarPropriedadeSchema, criarPropriedadeSchema } from "./propriedades.schemas.js";
import * as propriedadesController from "./propriedades.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", propriedadesController.listar);
router.post("/", validate(criarPropriedadeSchema), propriedadesController.criar);
router.get("/:id", validateId, propriedadesController.buscar);
router.patch("/:id", validateId, validate(atualizarPropriedadeSchema), propriedadesController.atualizar);
router.delete("/:id", validateId, propriedadesController.excluir);

export default router;
