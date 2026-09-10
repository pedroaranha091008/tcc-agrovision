import { Router } from "express";
import * as ctrl from "../controllers/usuario.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { atualizarPerfilSchema } from "../schemas/auth.schema.js";

const router = Router();

router.use(autenticar);

router.get("/me", ctrl.meuPerfil);
router.patch("/me", validate({ body: atualizarPerfilSchema }), ctrl.atualizarMeuPerfil);

export default router;
