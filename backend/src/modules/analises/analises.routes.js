import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validateId } from "../../middlewares/validate.js";
import * as analisesController from "./analises.controller.js";

// A criação (POST /voos/:id/analises...) fica nas rotas de voos, porque depende do voo.
const router = Router();

router.use(requireAuth);

router.get("/:id/mapas/:indice", validateId, analisesController.mapa);
router.delete("/:id", validateId, analisesController.excluir);

export default router;
