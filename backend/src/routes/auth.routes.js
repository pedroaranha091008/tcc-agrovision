import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { limiteAuth } from "../middlewares/rateLimit.js";
import {
  googleSchema,
  loginSchema,
  refreshSchema,
  registroSchema,
} from "../schemas/auth.schema.js";

const router = Router();

router.use(limiteAuth);

router.post("/registro", validate({ body: registroSchema }), ctrl.registrar);
router.post("/login", validate({ body: loginSchema }), ctrl.login);
router.post("/google", validate({ body: googleSchema }), ctrl.google);
router.post("/refresh", validate({ body: refreshSchema }), ctrl.renovar);
router.post("/logout", validate({ body: refreshSchema }), ctrl.logout);

export default router;
