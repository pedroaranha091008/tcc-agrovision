import { Router } from "express";
import * as ctrl from "../controllers/dashboard.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { dashboardQuery } from "../schemas/monitoramento.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: dashboardQuery }), ctrl.resumo);

export default router;
