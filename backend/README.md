# AgroVision — Backend

API REST da AgroVision (Node.js + Express 5 + Prisma 7 + MySQL/MariaDB).

## Como rodar

1. **Banco de dados** — qualquer MySQL 8 / MariaDB 10.4+. Com XAMPP, basta iniciar o MySQL no painel e criar o banco:
   ```sql
   CREATE DATABASE agrovision CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. **Configuração**
   ```bash
   npm install
   cp .env.example .env     # preencha usuário/senha do banco e um JWT_SECRET longo
   npx prisma migrate dev   # cria as tabelas e gera o Prisma Client
   ```
3. **Executar**
   ```bash
   npm run dev              # http://localhost:3000 (reinicia ao salvar)
   npm test                 # testes de integração (o banco precisa estar no ar)
   ```

## Endpoints disponíveis

Prefixo: `/api/v1`. Respostas de sucesso vêm em `{ "data": ... }` e erros em
`{ "error": { "code", "message", "details" } }`, onde `details` lista `{ campo, mensagem }` em erros de validação (422).

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/status` | — | verificação de funcionamento |
| POST | `/auth/cadastro` | — | cria conta (`nome`, `email`, `senha`, `tipo_usuario`) e devolve `{ token, usuario }` |
| POST | `/auth/login` | — | devolve `{ token, usuario }` |
| GET | `/auth/me` | Bearer | dados do usuário logado |
| GET | `/usuarios/me` | Bearer | idem |
| PATCH | `/usuarios/me` | Bearer | atualiza `nome`, `telefone`, `tipo_usuario` |
| POST | `/orcamentos` | — | registra solicitação de orçamento do site |
| GET | `/propriedades` | Bearer | lista as propriedades do usuário (com total de talhões e área) |
| POST | `/propriedades` | Bearer | cria propriedade (`nome_fazenda`, `cidade`, `estado`, `area_total_hectares?`) |
| GET / PATCH / DELETE | `/propriedades/:id` | Bearer | detalhes (com talhões), edição, exclusão (409 se tiver talhões) |
| POST | `/talhoes` | Bearer | cria talhão (`id_propriedade`, `nome_talhao`, `cultura?`, `area_hectares?`, `latitude?`, `longitude?`, `status?`) |
| GET / PATCH / DELETE | `/talhoes/:id` | Bearer | detalhes (com voos), edição, exclusão (409 se tiver voos) |
| POST | `/voos` | Bearer | registra voo (`id_talhao`, `data_voo`, `altitude_metros?`, `modelo_drone?`, `operador?`, `observacoes?`) |
| GET / PATCH / DELETE | `/voos/:id` | Bearer | detalhes (com análises), edição, exclusão (409 se tiver análises) |

Autenticação: header `Authorization: Bearer <token>` (JWT, validade em `JWT_EXPIRES_IN`).
As rotas de login/cadastro e de orçamento têm limite de tentativas por IP.
Cada usuário só enxerga os próprios dados: acessar o ID de outro usuário responde 404.

## Organização

```
src/
  app.js, server.js
  config/        env.js (valida variáveis), prisma.js
  middlewares/   auth, validate (zod), rateLimit, errorHandler
  modules/       auth/, usuarios/, orcamentos/, propriedades/, talhoes/, voos/
                 cada um: routes → controller → service (+ schemas)
  utils/         AppError, serializers
prisma/          schema.prisma e migrations
test/            testes de integração (node:test)
```

Próximos módulos previstos (ver `PLANEJAMENTO_BACKEND.md`): upload de imagens, análises, dashboard e relatórios.
