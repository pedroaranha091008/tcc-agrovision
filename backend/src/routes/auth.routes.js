import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { limiteAuth, limiteSessao } from "../middlewares/rateLimit.js";
import {
  esqueciSenhaSchema,
  googleSchema,
  loginSchema,
  refreshSchema,
  redefinirSenhaSchema,
  registroSchema,
} from "../schemas/auth.schema.js";

const router = Router();

// Limite estrito (anti forca-bruta) so onde se testa credencial. A renovacao
// acontece a cada abertura de pagina e a cada 15 min; se dividisse o mesmo
// limite de 20, quem recarregasse a pagina algumas vezes seria deslogado.
router.post("/registro", limiteAuth, validate({ body: registroSchema }), ctrl.registrar);
router.post("/login", limiteAuth, validate({ body: loginSchema }), ctrl.login);
router.post("/google", limiteAuth, validate({ body: googleSchema }), ctrl.google);
router.post("/esqueci-senha", limiteAuth, validate({ body: esqueciSenhaSchema }), ctrl.esqueciSenha);
router.post("/redefinir-senha", limiteAuth, validate({ body: redefinirSenhaSchema }), ctrl.redefinirSenha);
router.post("/refresh", limiteSessao, validate({ body: refreshSchema }), ctrl.renovar);
router.post("/logout", limiteSessao, validate({ body: refreshSchema }), ctrl.logout);

export default router;
