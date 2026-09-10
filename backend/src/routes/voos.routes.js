import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/voo.controller.js";
import { autenticar } from "../middlewares/auth.js";
import { carregarVoo } from "../middlewares/autorizacao.js";
import { validate } from "../middlewares/validate.js";
import { receberImagens } from "../middlewares/upload.js";
import { idParam } from "../schemas/comum.js";
import {
  atualizarVooSchema,
  criarVooSchema,
  listarVoosQuery,
} from "../schemas/voo.schema.js";

const router = Router();

router.use(autenticar);

router.get("/", validate({ query: listarVoosQuery }), ctrl.listar);
router.post("/", validate({ body: criarVooSchema }), ctrl.criar);
router.get("/:id", validate({ params: idParam }), carregarVoo(), ctrl.consultar);
router.patch(
  "/:id",
  validate({ params: idParam, body: atualizarVooSchema }),
  carregarVoo(),
  ctrl.atualizar,
);
router.delete("/:id", validate({ params: idParam }), carregarVoo(), ctrl.remover);

// Imagens do voo
const imagemParam = z.object({
  id: z.string().uuid("id invalido"),
  idImagem: z.string().uuid("idImagem invalido"),
});

router.get(
  "/:id/imagens",
  validate({ params: idParam }),
  carregarVoo(),
  ctrl.listarImagens,
);
router.post(
  "/:id/imagens",
  validate({ params: idParam }),
  carregarVoo(),
  receberImagens,
  ctrl.enviarImagens,
);
router.delete(
  "/:id/imagens/:idImagem",
  validate({ params: imagemParam }),
  carregarVoo(),
  ctrl.removerImagem,
);

export default router;
