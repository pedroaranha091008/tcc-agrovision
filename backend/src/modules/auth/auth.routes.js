import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.js";
import { rateLimit } from "../../middlewares/rateLimit.js";
import { env } from "../../config/env.js";
import { cadastroSchema, esqueciSenhaSchema, loginSchema, redefinirSenhaSchema } from "./auth.schemas.js";
import * as authController from "./auth.controller.js";
import * as usuariosController from "../usuarios/usuarios.controller.js";

const router = Router();

const limiteAuth = rateLimit({
  janelaMs: 15 * 60 * 1000,
  maximo: env.limiteTentativasAuth,
  mensagem: "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente."
});

// A renovação acontece a cada abertura de página e a cada 15 minutos; o limite é mais folgado.
const limiteRenovacao = rateLimit({
  janelaMs: 15 * 60 * 1000,
  maximo: 300,
  mensagem: "Muitas renovações de sessão. Aguarde alguns minutos."
});

router.post("/cadastro", limiteAuth, validate(cadastroSchema), authController.cadastrar);
router.post("/login", limiteAuth, validate(loginSchema), authController.login);
router.post("/esqueci-senha", limiteAuth, validate(esqueciSenhaSchema), authController.esqueciSenha);
router.post("/redefinir-senha", limiteAuth, validate(redefinirSenhaSchema), authController.redefinirSenha);
router.post("/renovar", limiteRenovacao, authController.renovar);
router.post("/sair", authController.sair);
router.get("/me", requireAuth, usuariosController.perfil);

export default router;
