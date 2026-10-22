# AgroVision — Backend

API REST do AgroVision: plataforma de analise agricola a partir de imagens captadas por drone.
Node.js + Express 5 + Prisma 7 (MySQL/MariaDB).

## Requisitos

- Node.js 20+ (testado com 24)
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
| `DATABASE_HOST` / `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` / `DATABASE_PORT` | nao | conexao do adapter em runtime; sem elas, saem do `DATABASE_URL` |
| `JWT_ACCESS_SECRET` | sim | segredo do access token |
| `JWT_ACCESS_TTL` | nao (15m) | validade do access token |
| `REFRESH_SECRET` | sim | segredo para derivar o hash do refresh token |
| `REFRESH_TTL_DAYS` | nao (30) | validade do refresh token, em dias |
| `GOOGLE_CLIENT_ID` | nao | client id OAuth do Google; sem ele, `/auth/google` responde 400 |
| `UPLOAD_DIR` | nao (`./uploads`) | pasta de imagens (fora de `src`) |
| `UPLOAD_MAX_FILE_MB` | nao (25) | tamanho maximo por arquivo |
| `UPLOAD_MAX_FILES` | nao (20) | quantidade maxima por requisicao |
| `UPLOAD_ALLOWED_MIME` | nao | MIME types aceitos |
| `REPORT_DIR` | nao (`./relatorios`) | pasta dos PDFs gerados |
| `FRONTEND_DIST` | nao | pasta do site compilado (`frontend/dist`); definida, o servidor entrega o site no mesmo endereco da API (hospedagem, ver `DEPLOY.md`) |
| `FRONTEND_URL` | nao (1a origem do CORS) | endereco do site, usado no link de redefinicao de senha |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | nao | envio de email; sem `SMTP_HOST`, os emails ficam em `emails-enviados/` |

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
4. `20261021151848_solicitacoes_orcamento` — pedidos de orcamento do formulario do site.
5. `20261021152544_redefinicao_senha` — links de redefinicao de senha (`redefinicoes_senha`).
6. `20261022133706_analise_automatica` — `origem` (manual/automatica) e `detalhes` (JSON) em `analises`.

> Se `prisma migrate dev` acusar drift em um banco de desenvolvimento descartavel, rode `npx prisma migrate reset`.

## Execucao

```bash
npm run dev     # nodemon
npm start       # producao
```

- `GET /` — disponibilidade.
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

**Esqueci a senha.** `POST /auth/esqueci-senha` (`{ email }`) responde sempre a mesma mensagem, exista ou nao
a conta, e envia um link `FRONTEND_URL/redefinir-senha?token=...` valido por 60 minutos e de uso unico.
Pedir de novo invalida o link anterior. `POST /auth/redefinir-senha` (`{ token, senha }`) troca a senha e
encerra todas as sessoes abertas; link invalido, usado ou expirado responde 400.
Sem `SMTP_HOST` configurado (desenvolvimento), o email nao e enviado: vai para o log e para a pasta
`emails-enviados/`.

## Solicitacoes de orcamento

`POST /api/v1/orcamentos` (publica, sem login) recebe o formulario "Solicite seu orcamento" da pagina inicial:
`nome`, `email`, `telefone` (com DDD), `cidade`, `cultura`, `area_hectares`, `servico`, `mensagem?`.
Os pedidos ficam na tabela `solicitacoes_orcamento` com `status` (`novo`, `em_contato`, `concluido`, `cancelado`)
e aparecem no log do servidor. Limite de 10 pedidos por hora por IP (anti-spam).

## Analise automatica (indice de verde)

`POST /api/v1/voos/:id/analisar` le todas as imagens do voo e calcula, pixel a pixel, o indice de excesso de verde
(ExG = 2g - r - b, com r, g, b normalizados). Cada pixel vira *vegetacao vigorosa* (ExG >= 0,10), *atencao*
(>= 0,03) ou *pouca/nenhuma vegetacao*. Area afetada = pouca vegetacao + metade da atencao; nivel de risco:
< 15% baixo, < 30% medio, < 50% alto, senao critico (`src/utils/indiceVerde.js`).

Grava uma analise `RGB` com `origem: automatica`, os percentuais por imagem em `detalhes` e um mapa colorido
de cada imagem em `UPLOAD_DIR/mapas/` (`GET /api/v1/analises/:id/mapas/:indice`). O voo passa por
`em_processamento` e termina `concluido` (ou `falhou`); enviar imagens novas o volta a `pendente`.
Mede cobertura vegetal em fotos RGB comuns: nao identifica pragas ou doencas, e o texto do resultado diz isso.

## Upload de imagens

`POST /api/v1/voos/:id/imagens` com `multipart/form-data`, campo `imagens` (1..N arquivos).
Aceita JPEG, PNG e TIFF por padrao. Valida MIME + extensao, grava com nome aleatorio e sem permissao de execucao,
e registra os metadados em `imagens_voo`. Os arquivos ficam em `UPLOAD_DIR` e sao servidos apenas por rotas autenticadas.

Alem do MIME e da extensao (informados pelo cliente), cada arquivo e aberto com o `sharp` antes de ser gravado:
um arquivo que nao e imagem de verdade (ex.: texto renomeado para `.jpg`) e recusado com 422 e nada e salvo.

`GET /api/v1/voos/:id/imagens/:idImagem/arquivo` devolve a imagem; com `?miniatura=1`, um JPEG de ate 480px
(gerado na primeira vez em `UPLOAD_DIR/miniaturas/`), usado nas miniaturas da tela — o navegador nao exibe TIFF.

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
