import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import usuariosRoutes from "../modules/usuarios/usuarios.routes.js";
import orcamentosRoutes from "../modules/orcamentos/orcamentos.routes.js";
import propriedadesRoutes from "../modules/propriedades/propriedades.routes.js";
import talhoesRoutes from "../modules/talhoes/talhoes.routes.js";
import voosRoutes from "../modules/voos/voos.routes.js";
import imagensRoutes from "../modules/imagens/imagens.routes.js";
import analisesRoutes from "../modules/analises/analises.routes.js";

const router = Router();

// Cada domínio registra suas rotas aqui; próximos: dashboard, histórico e relatórios.

router.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/orcamentos", orcamentosRoutes);
router.use("/propriedades", propriedadesRoutes);
router.use("/talhoes", talhoesRoutes);
router.use("/voos", voosRoutes);
router.use("/imagens", imagensRoutes);
router.use("/analises", analisesRoutes);

export default router;
