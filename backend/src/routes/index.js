import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import usuariosRoutes from "../modules/usuarios/usuarios.routes.js";
import orcamentosRoutes from "../modules/orcamentos/orcamentos.routes.js";

const router = Router();

// Cada domínio registra suas rotas aqui; próximos: propriedades, talhões, voos, análises...

router.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/orcamentos", orcamentosRoutes);

export default router;
