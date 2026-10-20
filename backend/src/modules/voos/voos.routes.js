import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validate, validateId } from "../../middlewares/validate.js";
import { uploadImagensVoo } from "../../middlewares/upload.js";
import { atualizarVooSchema, criarVooSchema } from "./voos.schemas.js";
import { criarAnaliseManualSchema } from "../analises/analises.schemas.js";
import * as voosController from "./voos.controller.js";
import * as voosService from "./voos.service.js";
import * as imagensController from "../imagens/imagens.controller.js";
import * as analisesController from "../analises/analises.controller.js";

const router = Router();

router.use(requireAuth);

/** Confere o dono do voo antes de aceitar arquivos, para não gravar nada em disco à toa. */
async function donoDoVoo(req, res, next) {
  await voosService.garantirDono(req.params.id, req.usuarioId);
  next();
}

// A listagem de voos vem dentro de GET /talhoes/:id.
router.post("/", validate(criarVooSchema), voosController.criar);
router.get("/:id", validateId, voosController.buscar);
router.patch("/:id", validateId, validate(atualizarVooSchema), voosController.atualizar);
router.delete("/:id", validateId, voosController.excluir);

router.post("/:id/imagens", validateId, donoDoVoo, uploadImagensVoo(), imagensController.enviar);
router.post("/:id/analises", validateId, validate(criarAnaliseManualSchema), analisesController.criarManual);
router.post("/:id/analises/automatica", validateId, analisesController.criarAutomatica);

export default router;
