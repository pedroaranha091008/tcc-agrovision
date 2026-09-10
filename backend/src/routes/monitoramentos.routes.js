import { Router } from "express";
import * as ctrl from "../controllers/monitoramento.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { historicoQuery } from "../schemas/monitoramento.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: historicoQuery }), ctrl.historico);

export default router;
