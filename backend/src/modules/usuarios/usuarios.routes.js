import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { atualizarPerfilSchema } from "./usuarios.schemas.js";
import * as usuariosController from "./usuarios.controller.js";

const router = Router();

router.get("/me", requireAuth, usuariosController.perfil);
router.patch("/me", requireAuth, validate(atualizarPerfilSchema), usuariosController.atualizarPerfil);

export default router;
