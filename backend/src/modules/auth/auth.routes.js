import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.js";
import { rateLimit } from "../../middlewares/rateLimit.js";
import { cadastroSchema, loginSchema } from "./auth.schemas.js";
import * as authController from "./auth.controller.js";
import * as usuariosController from "../usuarios/usuarios.controller.js";

const router = Router();

const limiteAuth = rateLimit({
  janelaMs: 15 * 60 * 1000,
  maximo: 20,
  mensagem: "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente."
});

router.post("/cadastro", limiteAuth, validate(cadastroSchema), authController.cadastrar);
router.post("/login", limiteAuth, validate(loginSchema), authController.login);
router.get("/me", requireAuth, usuariosController.perfil);

export default router;
