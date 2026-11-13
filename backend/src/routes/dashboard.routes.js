import { Router } from "express";
import * as ctrl from "../controllers/dashboard.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { dashboardQuery, painelQuery } from "../schemas/monitoramento.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: dashboardQuery }), ctrl.resumo);
router.get("/painel", validate({ query: painelQuery }), ctrl.painel);

export default router;
