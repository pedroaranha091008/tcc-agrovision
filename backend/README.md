# AgroVision — Backend

API REST do AgroVision: plataforma de analise agricola a partir de imagens captadas por drone.
Node.js + Express 5 + Prisma 7 (MySQL/MariaDB).

## Requisitos

- Node.js 24.x (faixa fixada em engines)
- MySQL 8 ou MariaDB 10.6+
- npm 10+

## Instalacao

```bash
cd backend
npm install
cp .env.example .env   # e preencha os valores
npm run prisma:generate
```

## Variaveis de ambiente

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `PORT` | nao (3000) | porta HTTP |
| `NODE_ENV` | nao | `development` \| `production` \| `test` |
| `CORS_ORIGINS` | nao | origens liberadas, separadas por virgula |
| `DATABASE_URL` | sim | string de conexao MySQL usada pelas migrations |
| `DATABASE_HOST` / `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` / `DATABASE_PORT` | sim | usados pelo adapter MariaDB em runtime |
| `JWT_ACCESS_SECRET` | sim | segredo do access token |
| `JWT_ACCESS_TTL` | nao (15m) | validade do access token |
| `REFRESH_SECRET` | sim | segredo para derivar o hash do refresh token |
| `REFRESH_TTL_DAYS` | nao (30) | validade do refresh token, em dias |
| `GOOGLE_CLIENT_ID` | nao | client id OAuth do Google; sem ele, `/auth/google` responde 400 |
| `STORAGE_PROVIDER` | nao (`local`) | `supabase` para arquivos persistentes sem disco pago no Render |
| `SUPABASE_URL` | com Supabase | URL HTTPS do projeto |
| `SUPABASE_SECRET_KEY` | com Supabase | chave secreta do projeto, somente no backend |
| `SUPABASE_STORAGE_BUCKET` | nao (`agrovision-arquivos`) | nome do bucket privado |
| `UPLOAD_DIR` | nao (`./uploads`) | pasta de imagens (fora de `src`) |
| `UPLOAD_MAX_FILE_MB` | nao (25) | tamanho maximo por arquivo |
| `UPLOAD_MAX_FILES` | nao (20) | quantidade maxima por requisicao |
| `UPLOAD_ALLOWED_MIME` | nao | MIME types aceitos |
| `REPORT_DIR` | nao (`./relatorios`) | pasta dos PDFs gerados |

A aplicacao valida o ambiente na inicializacao e encerra se faltar variavel obrigatoria.

## Banco de dados e migrations

```bash
# aplica todas as migrations em um banco novo
npm run prisma:deploy

# durante o desenvolvimento (cria/aplica migration a partir do schema)
npm run prisma:migrate
```

Migrations versionadas em `prisma/migrations/`:

1. `20260618135012_init` — usuarios, propriedades, talhoes, voos, analises.
2. `20260910120000_auth_provedor_sessao` — senha opcional, provedor Google, `email_verificado`, tabela `sessoes`.
3. `20260910120100_imagens_status_relatorio` — `imagens_voo`, `relatorios`, status de processamento em voo/analise.

Para drift, revise o historico e o schema antes de qualquer acao. O deploy usa apenas `npm run prisma:deploy`, apos backup.

## Execucao

```bash
npm run dev     # nodemon
npm start       # producao
```

- `GET /` — disponibilidade.
- `GET /health` — liveness sem consulta ao banco.
- `GET /api/v1/health` — status da API + conexao com o banco (503 se o banco estiver fora).

## Testes

```bash
npm test         # unitarios (nao precisam de banco)
npm run test:int # integracao (precisam de um banco de testes com as migrations aplicadas)
```

Os testes de integracao sao **pulados automaticamente** se o banco em `DATABASE_URL` nao estiver acessivel.
Use um banco dedicado de testes (ex.: `agrovision_test`) — as suites limpam as tabelas antes e depois.

## Colecao do Insomnia

`insomnia/AgroVision.insomnia.json` — importe em *Application → Preferences → Data → Import Data*.
Ambiente `Base`: preencha `access_token` / `refresh_token` (do retorno de `/auth/login`) e os `id_*` conforme for criando recursos.

## Contrato de respostas

- Sucesso: `{ "data": ... }`; em listas, `{ "data": [...], "meta": { "pagina", "por_pagina", "total", "total_paginas" } }`.
- Erro: `{ "error": { "code": "CODIGO", "message": "...", "details": [...] } }`.
- Campos seguem o schema Prisma (snake_case, portugues). `Decimal` → numero; datas → ISO 8601 (UTC).
- Campos sensiveis (`senha_hash`, hashes de token) nunca aparecem nas respostas.
- Codigos HTTP usados: 200, 201, 204, 400, 401, 403, 404, 409, 413, 415, 422, 500, 503.

### Autenticacao

`Authorization: Bearer <access_token>` nas rotas protegidas.
Fluxo: `registro`/`login` → `access_token` (curto) + `refresh_token` (opaco, 1 uso — rotacionado no `refresh`).
`logout` revoga a sessao; um refresh token revogado ou expirado retorna 401.

## Upload de imagens

`POST /api/v1/voos/:id/imagens` com `multipart/form-data`, campo `imagens` (1..N arquivos).
Aceita JPEG, PNG e TIFF por padrao. Valida MIME + extensao, grava com nome aleatorio e sem permissao de execucao,
e registra os metadados em `imagens_voo`. Os arquivos ficam no bucket privado Supabase quando `STORAGE_PROVIDER=supabase`,
ou em `UPLOAD_DIR` no modo local. Nenhuma URL publica de arquivo e criada. PDFs sao baixados pela API autenticada.

## Estrutura

```
src/
  app.js            app Express (middlewares, router, erros)
  server.js         bootstrap (conexao, listen, shutdown)
  config/           env, logger, prisma
  routes/           uma rota por dominio + index (/api/v1)
  controllers/      entrada HTTP, montagem da resposta
  services/         regras de negocio + acesso ao Prisma
  middlewares/      auth, autorizacao (posse), validate, upload, rateLimit, erro
  schemas/          validacao de entrada (zod)
  utils/            AppError, resposta, paginacao, hash, tokens, storage, pdf, recomendacao
prisma/             schema + migrations
tests/unit/         testes sem banco
tests/integration/  testes com banco (auto-skip se indisponivel)
insomnia/           colecao exportada
```

## Fora do escopo (roadmap)

IA para pragas/doencas, previsao de problemas, app mobile e integracao direta com drones.
A identificacao de problemas e as recomendacoes sao **baseadas em regras versionadas** (`src/utils/recomendacao.js`), sem diagnostico automatico por IA.

## Deploy

Consulte a [configuração completa de Render, banco, TLS e persistência](../README.md#deploy).
Produção exige CORS com origens HTTPS sem caminho, senha de banco não vazia e dois segredos distintos com pelo menos 32 caracteres.
`DATABASE_SSL` e `DATABASE_SSL_CA` configuram TLS do adapter; configure separadamente TLS na URL da CLI Prisma.
Build: `npm ci --include=dev && npm run prisma:generate`. Start: `npm start`. Root Directory: `backend`.
Migrations manuais: `npm run prisma:deploy`. Nunca execute os testes de integração no banco de produção.

Para arquivos no plano gratuito, siga [Supabase Storage](STORAGE.md). A integracao usa apenas Storage;
nao migra o MySQL, nao altera o login e nao exige migration de banco.
