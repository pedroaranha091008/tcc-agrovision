# AgroVision

Plataforma de análise agrícola de precisão a partir de imagens capturadas por drone: mapeamento por talhão,
identificação simples de problemas, dashboard, histórico de monitoramentos e relatórios em PDF com
recomendações baseadas em regras.

Trabalho de Conclusão de Curso (TCC).

## Estrutura do repositório

```
tcc-agrovision/
├── backend/     API REST — Node.js, Express 5, Prisma 7, MySQL/MariaDB
├── frontend/    Interface web — React 18, TypeScript, Vite, React Router, Tailwind CSS
├── specs.md                    escopo funcional (essencial/opcional/futuro)
├── RELATORIO_ANALISE.md        diagnóstico do estado do repositório numa etapa anterior
└── PROMPT_ANALISE_REPOSITORIO_AV2_PIS.md
```

Cada camada tem seu próprio planejamento de implementação, faseado e com critérios de conclusão:

- [`backend/PLANEJAMENTO_BACKEND.md`](backend/PLANEJAMENTO_BACKEND.md)
- [`frontend/PLANEJAMENTO_FRONTEND.md`](frontend/PLANEJAMENTO_FRONTEND.md)

E cada camada tem seu próprio README com instruções de instalação, variáveis de ambiente, execução e testes:

- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)

## Início rápido

O frontend pode rodar sozinho, sem o backend, em **modo mock** (configure `VITE_API_MOCK=true` no ambiente local): um
backend simulado em memória/`localStorage` reproduz o contrato real da API, o suficiente para demonstrar toda
a aplicação — cadastro, login, propriedades, talhões, voos, upload de imagens, análises, dashboard, histórico
e relatórios.

```bash
cd frontend
npm install
cp .env.example .env.development
npm run dev
```

Para rodar com o backend real (necessário para persistência de verdade e para gerar o PDF definitivo):

```bash
# 1. Backend — precisa de um MySQL/MariaDB acessível
cd backend
npm install
cp .env.example .env      # preencha com as credenciais do seu banco
npm run prisma:generate
npm run prisma:deploy     # aplica as migrations
npm run dev                # sobe em http://localhost:3000

# 2. Frontend apontando para o backend real
cd ../frontend
# no .env: VITE_API_MOCK=false, VITE_API_URL=http://localhost:3000/api/v1
npm run dev
```

## Testes

```bash
cd backend  && npm test          # unitários (sem banco) + npm run test:int (com banco de testes)
cd frontend && npm test          # unitários, componentes e fluxo ponta a ponta (Vitest + Testing Library)
```

## Coleção do Insomnia

[`backend/insomnia/AgroVision.insomnia.json`](backend/insomnia/AgroVision.insomnia.json) — todas as rotas da
API organizadas por domínio, prontas para importar.

## Escopo

- **Essenciais**: cadastro/login (e-mail/senha e Google), visualização das condições da plantação, dashboard,
  identificação simples de problemas, histórico de monitoramentos, geração de relatórios, upload de imagens.
- **Opcionais**: filtros por data/área/tipo de análise, recomendações baseadas em regras.
- **Fora do escopo atual**: IA para identificação automática de pragas/doenças, previsão de problemas,
  aplicativo mobile, integração direta com drones — ver `specs.md` e a seção "Fora do escopo" de cada
  planejamento.

## Deploy

Use Node **24.x** nos dois projetos. Cada diretório possui `package.json` e lockfile próprios.
O deploy é manual: esta preparação não publica arquivos, não cria serviços e não faz commit/push.
O caminho público informado é **`/tecti/2026/gpec06/`**. O domínio Hostinger é `https://www.startnet.app.br`; a URL Render precisa ser preenchida após criar o serviço.

### Frontend — Hostinger / Apache

Diretório: `frontend/`. Instale com `npm install` (ou `npm ci` para reproduzir o lockfile).
Copie `frontend/.env.production.example` para `frontend/.env.production` e preencha:

```dotenv
VITE_API_URL=<URL_HTTPS_REAL_DO_RENDER>/api/v1
VITE_API_MOCK=false
VITE_GOOGLE_CLIENT_ID=
```

Os valores entre `<...>` são instruções de preenchimento, não URLs utilizáveis. O Client ID Google é opcional e público.
Não inclua segredos em `VITE_*`. As variáveis são incorporadas na build; o Apache não lê `.env.production` em runtime.
Confira também variáveis exportadas no terminal e `.env.production.local`, que podem sobrepor o arquivo.
A build rejeita URL ausente, HTTP, localhost, caminho sem `/api/v1` e mock ativo.

```bash
cd frontend
npm install
npm run build
npm run preview
```

Saída: `frontend/dist/`. Preview: `http://localhost:4173/tecti/2026/gpec06/`.
`vite.config.ts` define `base: '/tecti/2026/gpec06/'`. O `BrowserRouter` usa `import.meta.env.BASE_URL` como `basename`.
`public/.htaccess` é copiado para `dist/.htaccess` e configura fallback das rotas para `index.html`.
Se o caminho mudar, ajuste **tanto o `base` quanto o `RewriteBase`**, gere uma nova build e teste uma rota interna.

> Transfira o CONTEÚDO da pasta `dist` para a pasta correspondente ao projeto no servidor Apache.

No FileZilla, abra `frontend/dist/` no lado local e a pasta correspondente a `/tecti/2026/gpec06/` no lado remoto
(dentro da raiz pública do domínio; confirme a raiz física no painel da hospedagem).
Envie `index.html`, `assets/`, `.htaccess` e todos os demais arquivos gerados. Habilite a exibição de arquivos ocultos.
Não crie uma camada `dist/` no servidor. Não envie `.env*`, código-fonte, `.git`, `node_modules` ou backend.
O Apache precisa permitir `.htaccess`, `mod_rewrite` e `Options -MultiViews` nessa pasta.
Teste `https://www.startnet.app.br/tecti/2026/gpec06/` e `/tecti/2026/gpec06/login`, inclusive atualizando a segunda URL.

### Backend — Render

Configuração exata do Web Service:

```text
Service Type: Web Service
Repository: https://github.com/pedroaranha091008/tcc-agrovision
Branch: main (confirme que é a branch de produção)
Root Directory: backend
Runtime: Node
Build Command: npm ci --include=dev && npm run prisma:generate
Start Command: npm start
Health Check Path: /health
Auto Deploy: desabilitado no primeiro deploy; habilitar após validar testes e migrations
```

Não há compilação de TypeScript no backend. `--include=dev` instala a CLI Prisma necessária à geração e às migrations,
mesmo com `NODE_ENV=production`. O start usa `node src/server.js`, nunca nodemon. O servidor escuta em `0.0.0.0`.
Não crie `PORT` manualmente: o Render fornece a porta, lida pela configuração; localmente o padrão é 3000.
`trust proxy=1` já estava configurado para o proxy do serviço.

Environment Variables (substitua os campos descritivos):

```dotenv
NODE_ENV=production
NODE_VERSION=24
CORS_ORIGINS=https://www.startnet.app.br
DATABASE_URL=<CONEXAO_MYSQL_DO_PROVEDOR_PARA_PRISMA_CLI>
DATABASE_HOST=<HOST_EXTERNO_MYSQL>
DATABASE_PORT=<PORTA_MYSQL>
DATABASE_USER=<USUARIO_MYSQL>
DATABASE_PASSWORD=<SENHA_NOVA_DO_BANCO>
DATABASE_NAME=<NOME_DO_BANCO>
DATABASE_SSL=<true_SE_O_PROVEDOR_EXIGIR_TLS>
JWT_ACCESS_SECRET=<SEGREDO_ALEATORIO_INDEPENDENTE_DE_PELO_MENOS_32_CARACTERES>
REFRESH_SECRET=<OUTRO_SEGREDO_ALEATORIO_DE_PELO_MENOS_32_CARACTERES>
STORAGE_PROVIDER=supabase
SUPABASE_URL=<URL_HTTPS_DO_PROJETO_SUPABASE>
SUPABASE_SECRET_KEY=<CHAVE_SECRETA_SOMENTE_BACKEND>
SUPABASE_STORAGE_BUCKET=agrovision-arquivos
```

Opcionais: `DATABASE_SSL_CA` (CA PEM, se fornecida pelo provedor; aceita `\n`), `GOOGLE_CLIENT_ID` (para login Google).
TTL e limites de upload mantêm os padrões de `backend/.env.example` e não precisam ser configurados no painel.
Para Google, use o mesmo Client ID no frontend/backend e autorize a **origem** Hostinger no console OAuth.

**CORS usa origem, não URL completa da página:** protocolo + domínio + porta se houver; não inclua `/tecti/2026/gpec06/`.
São aceitas várias origens separadas por vírgula. Produção exige HTTPS. A autenticação existente usa Bearer token
e refresh token no corpo; não é necessário alterar o fluxo para cookies.

**Arquivos no plano gratuito:** use Supabase Storage com um bucket privado e as quatro variáveis acima.
Não é necessário Persistent Disk no Render nessa configuração. Imagens e PDFs são enviados pelo backend ao Supabase;
o MySQL continua armazenando metadados e referências. O download de PDF continua autenticado pela API existente.
Consulte o [passo a passo do armazenamento gratuito](backend/STORAGE.md) para criar o bucket e obter a chave.

Para desenvolvimento, `STORAGE_PROVIDER=local` mantém arquivos em `UPLOAD_DIR` e `REPORT_DIR`.
Se optar por disco local em produção, ainda será necessário um Persistent Disk pago; disco efêmero não preserva uploads.
Arquivos antigos não são migrados automaticamente. Guarde cópias antes de mudar o armazenamento.

`GET /health` responde `{"status":"ok"}` sem consultar o banco. `GET /api/v1/health` faz `SELECT 1` e retorna
200 se o banco estiver disponível ou 503 se estiver indisponível. A inicialização do adapter sozinha não comprova a conexão.
Depois do deploy, teste ambas as rotas e confira logs, CORS e endpoints autenticados.

### Banco

Prisma 7, provider `mysql`, runtime com `@prisma/adapter-mariadb`. `DATABASE_URL` configura a CLI;
`DATABASE_HOST/PORT/USER/PASSWORD/NAME` configuram o runtime. **Ambas devem apontar para o mesmo banco.**
Use senha codificada por percent-encoding na URL (não nas variáveis separadas).
TLS do runtime: `DATABASE_SSL=true` e CA opcional; a validação de certificado permanece ativada.
TLS da CLI: configure os parâmetros próprios do Prisma na `DATABASE_URL`, conforme o certificado/provedor.
Não suponha que `DATABASE_SSL` configure a CLI. Se precisar de arquivo de CA, disponibilize-o como Secret File e use seu caminho na URL.
Permita acesso externo a partir do Render e da máquina que executará migrations; verifique firewall e permissões do usuário.

Há três migrations versionadas: `20260618135012_init`, `20260910120000_auth_provedor_sessao` e
`20260910120100_imagens_status_relatorio`. Não há seed configurado.
Após backup e revisão do SQL, execute manualmente em ambiente com as credenciais de produção:

```bash
cd backend
npm ci --include=dev
npm run prisma:generate
npx prisma validate
npx prisma migrate status
npm run prisma:deploy
npx prisma migrate status
```

`npm run prisma:deploy` equivale a `prisma migrate deploy`; não está acoplado ao build/start.
Execute antes de liberar tráfego, preferencialmente da máquina administrativa com acesso ao MySQL.
Se o banco já tiver tabelas sem histórico Prisma, reconcilie/baseline manualmente após backup; não marque migrations como aplicadas sem conferir o schema.
Não use reset ou seeds de testes em produção. Os testes de integração limpam tabelas e só podem usar um banco dedicado descartável.

**Credenciais expostas:** `backend/.env` esteve no histórico (commits `f4cdaf5` e `fe29c17`; removido em `9e375f3`).
Rotacione/revogue as credenciais históricas e qualquer reutilização antes de publicar. A exclusão do arquivo não remove cópias do histórico.
Nenhum valor real foi reproduzido nesta documentação. Uma eventual limpeza coordenada do histórico é uma ação manual posterior à rotação.

Referências: [Node no Render](https://render.com/docs/node-version), [discos persistentes](https://render.com/docs/disks),
[requisitos Prisma](https://docs.prisma.io/docs/orm/reference/system-requirements).

### Validação desta preparação (26/10/2026)

- `npm install` funcionou nas duas camadas; os lockfiles foram atualizados e `npm ci --dry-run` confirmou sua consistência.
- Dependências com avisos de segurança foram atualizadas; `npm audit` terminou sem vulnerabilidades reportadas nas duas camadas.
- Frontend: 44 testes passaram com um worker; a primeira execução paralela teve timeout no teste de login.
- Backend: 42 testes passaram, incluindo a regressão do tratamento de erros Prisma; geração do Client e validação do schema passaram.
- Build e preview passaram. Página inicial, `/login`, JS e CSS responderam 200 na subpasta; `.htaccess` foi copiado corretamente.
- `npm start` foi validado também em `NODE_ENV=production`, usando `PORT=3107`; `/health` retornou 200. CORS permitido/bloqueado e JSON inválido foram verificados.
- Imports locais foram conferidos contra os nomes versionados sem divergências de maiúsculas/minúsculas; não houve execução real em Linux ou Apache.
- O banco local respondeu como indisponível (503 no health da API); `prisma migrate status` falhou. Não foram aplicadas migrations nem executadas suites de integração que limpam dados.
- A validação do frontend foi HTTP e por testes de componentes, sem inspeção visual/Console em navegador real. Verifique isso após publicar.

**A `dist` local desta auditoria é apenas de teste:** foi gerada com `https://api.invalid/api/v1`, endereço reservado e sem serviço.
**Não envie essa build por FTP.** Após criar o Render, preencha `.env.production` com a URL real e execute `npm run build` novamente.
A tentativa de build sem configurar a URL é rejeitada intencionalmente. Persistem avisos não bloqueantes de tamanho do bundle e comentários de uma dependência.
