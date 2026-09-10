import { Router } from "express";
import { prisma } from "../config/prisma.js";
import authRoutes from "./auth.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import propriedadesRoutes from "./propriedades.routes.js";
import talhoesRoutes from "./talhoes.routes.js";
import voosRoutes from "./voos.routes.js";
import analisesRoutes from "./analises.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import monitoramentosRoutes from "./monitoramentos.routes.js";
import relatoriosRoutes from "./relatorios.routes.js";

const router = Router();

router.get("/health", async (_req, res) => {
  let banco = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    banco = "indisponivel";
  }
  const saudavel = banco === "ok";
  res.status(saudavel ? 200 : 503).json({
    data: { status: saudavel ? "ok" : "degradado", banco, versao: "v1" },
  });
});

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/propriedades", propriedadesRoutes);
router.use("/talhoes", talhoesRoutes);
router.use("/voos", voosRoutes);
router.use("/analises", analisesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/monitoramentos", monitoramentosRoutes);
router.use("/relatorios", relatoriosRoutes);

export default router;
