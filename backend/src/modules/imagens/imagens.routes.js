import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validateId } from "../../middlewares/validate.js";
import * as imagensController from "./imagens.controller.js";

// O envio (POST /voos/:id/imagens) fica nas rotas de voos, porque depende do voo.
const router = Router();

router.use(requireAuth);

router.get("/configuracao", imagensController.configuracao);
router.get("/:id/arquivo", validateId, imagensController.arquivo);
router.delete("/:id", validateId, imagensController.excluir);

export default router;
