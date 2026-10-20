import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validateQuery } from "../../middlewares/validate.js";
import { monitoramentosSchema, resumoSchema } from "./dashboard.schemas.js";
import * as dashboardController from "./dashboard.controller.js";

export const dashboardRoutes = Router();
dashboardRoutes.get("/", requireAuth, validateQuery(resumoSchema), dashboardController.resumo);

export const monitoramentosRoutes = Router();
monitoramentosRoutes.get("/", requireAuth, validateQuery(monitoramentosSchema), dashboardController.monitoramentos);
