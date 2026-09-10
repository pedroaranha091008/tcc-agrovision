# Planejamento do Backend — AgroVision

## 1. Objetivo e estado atual

Este planejamento transforma as funcionalidades essenciais e opcionais do `specs.md` em etapas de implementação para o backend. Ele considera o diagnóstico do `RELATORIO_ANALISE.md` e o código atualmente versionado.

### O que já está pronto

- Projeto Node.js com Express 5 e módulos ES.
- Inicialização do servidor em `src/server.js`.
- Parsing de JSON e formulários URL-encoded.
- Rota `GET /` para verificar o funcionamento da API.
- Resposta JSON para rotas inexistentes.
- Prisma configurado com adapter MariaDB (datasource `mysql`).
- Schema e migration inicial com `Usuario`, `Propriedade`, `Talhao`, `Voo` e `Analise`.
- Relacionamentos encadeados entre usuário, propriedade, talhão, voo e análise.

### O que falta

- Arquitetura interna para rotas, controllers, services, validações e middlewares.
- Autenticação por email/senha e Google, com sessão revogável.
- Autorização por proprietário dos dados.
- Operações reais de banco nas rotas.
- CRUD de propriedades, talhões e voos.
- Recebimento e armazenamento de imagens.
- Cadastro e consulta de análises e problemas encontrados.
- Dashboard, histórico, filtros, recomendações e relatórios PDF.
- Testes automatizados, documentação da API e coleção do Insomnia.
- Correção da rota de status, que hoje traz mensagem de outro projeto ("API de tarefas") e afirma uma arquitetura MVC ainda inexistente.

## 2. Decisões técnicas (padrões adotados)

Estas escolhas são os padrões do projeto. Podem ser trocadas com justificativa, mas ficam definidas aqui para evitar indecisão durante a execução. Express 5, módulos ES e Prisma 7 já estão definidos pelo código atual.

| Área | Escolha | Motivo |
|---|---|---|
| Runner de testes | Vitest + Supertest | ESM nativo, compatível com `type: module`; Supertest exercita as rotas |
| Hash de senha | `bcrypt` (usar `bcryptjs` se o build nativo falhar no Windows) | amplamente documentado e simples |
| Access token | `jsonwebtoken`, JWT de curta duração | validação sem consulta ao banco |
| Refresh token | valor opaco aleatório, gravado como hash na tabela de sessão | permite revogação e logout reais |
| Validação de entrada | `zod` | schemas declarativos, mensagens claras, contrato reutilizável pelo frontend |
| Upload | `multer` | padrão de fato para `multipart/form-data` no Express |
| Limite de requisições | `express-rate-limit` | suficiente para o MVP |
| Cabeçalhos de segurança | `helmet` | defaults seguros |
| CORS | `cors` | origens lidas do ambiente |
| Login Google | `google-auth-library` (`verifyIdToken`) | validação oficial do ID token, incluindo `email_verified` |
| Geração de PDF | `pdfkit` | puro Node, sem navegador headless, saída determinística |
| Logs | `pino` + `pino-http` | JSON estruturado e de baixo overhead |

## 3. Arquitetura e contratos planejados

### Organização da aplicação

Adotar uma estrutura modular por domínio, separando:

- `routes`: definição de URLs, métodos e middlewares;
- `controllers`: entrada HTTP e formação da resposta;
- `services`: regras de negócio e acesso ao Prisma;
- `middlewares`: autenticação, autorização, validação, upload e erros;
- `schemas`: validação dos dados de entrada com `zod`;
- `utils`: funções compartilhadas, incluindo paginação, relatórios e armazenamento.

Toda a API funcional deverá usar o prefixo `/api/v1`. A rota raiz continuará como verificação simples de disponibilidade, com a mensagem corrigida para o contexto do AgroVision.

### Padrão de respostas

- Sucesso: `{ "data": ... }` e, em listas, `{ "data": [...], "meta": { "pagina", "por_pagina", "total" } }`.
- Erro: `{ "error": { "code": "CODIGO", "message": "Mensagem", "details": [...] } }`.
- Usar códigos HTTP coerentes: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `413`, `415`, `422` e `500`.
- Datas em ISO 8601 (UTC); IDs em UUID; valores `Decimal` normalizados como número.

### Convenção de payload

- Os campos usam os nomes do schema Prisma, em snake_case e português (ex.: `nome_fazenda`, `area_total_hectares`, `data_voo`).
- O identificador de cada recurso é exposto como no schema (`id_propriedade`, `id_talhao`, `id_voo`, `id_analise`); chaves estrangeiras acompanham o recurso quando úteis ao frontend.
- `Decimal` vira número, `DateTime` vira string ISO 8601, `Json`/GeoJSON vira objeto.
- Campos sensíveis (`senha_hash`, tokens, segredos, hash de refresh) nunca aparecem em resposta.
- As requisições aceitam os mesmos nomes de campo; campos desconhecidos são rejeitados pelo schema de validação.
- Alternativa considerada e não adotada agora: normalizar tudo para `id` e camelCase. Fica como possível refatoração futura, aplicada nos dois lados e documentada antes.

### Grupos de endpoints

| Grupo | Operações previstas |
|---|---|
| `/api/v1/auth` | registro, login, Google, renovação e encerramento de sessão |
| `/api/v1/usuarios/me` | consulta e atualização do perfil autenticado |
| `/api/v1/propriedades` | listar, criar, consultar, atualizar e excluir propriedades próprias |
| `/api/v1/talhoes` | CRUD de talhões vinculados a propriedades próprias |
| `/api/v1/voos` | CRUD de voos e consulta por talhão/período |
| `/api/v1/voos/:id/imagens` | upload, listagem e exclusão de imagens do voo |
| `/api/v1/analises` | registro, consulta e atualização de análises |
| `/api/v1/dashboard` | indicadores e séries agregadas do usuário |
| `/api/v1/monitoramentos` | histórico com filtros e paginação |
| `/api/v1/relatorios` | geração, consulta e download de relatórios PDF |

### Ajustes no banco de dados

- Tornar `senha_hash` opcional para contas exclusivamente Google.
- Acrescentar a `Usuario`: `provedor_auth` (`local` ou `google`), `google_sub` (identificador estável do Google, único, nunca o email) e `email_verificado` (boolean).
- Criar tabela de sessão/refresh token: `id`, `id_usuario`, `token_hash`, `expira_em`, `revogado_em` (nulo), `user_agent`/`ip` opcionais, `criado_em`; índices em `id_usuario` e `token_hash`. Necessária para logout e para impedir reuso de sessão revogada.
- Criar entidade de imagem do voo: nome original, nome armazenado, MIME type, tamanho, caminho/URL, data e vínculo com `Voo`.
- Criar entidade de relatório: vínculo com `Analise`, caminho do PDF, versão das regras de recomendação, texto da recomendação e data de geração; permite listar, consultar e regenerar de forma determinística.
- Acrescentar status de processamento ao voo ou à análise para diferenciar `pendente`, `em_processamento`, `concluido` e `falhou`.
- Padronizar o campo de criação para `criado_em` também em `Usuario` (hoje `data_criacao`), via `@map` na coluna existente ou migration de rename.
- Preservar os models existentes e criar migrations incrementais; não reescrever a migration inicial.

## 4. Etapas de implementação

As fases seguem em ordem. Dentro de cada fase, as etapas são independentes o suficiente para serem executadas e revisadas uma a uma. Cada etapa indica ação e entregável; o critério de conclusão fecha a fase.

### Fase 1 — Fundação da API

| Etapa | Ação | Entregável |
|---|---|---|
| E1.1 | Criar a estrutura de pastas (`routes`, `controllers`, `services`, `middlewares`, `schemas`, `utils`) e o router principal `/api/v1` com um módulo por domínio (ainda vazio). | App modularizado, router montado, comportamento de status preservado. |
| E1.2 | Completar `.env.example` e criar carga/validação de variáveis na inicialização: `PORT`, `NODE_ENV`, `DATABASE_*`, `CORS_ORIGINS`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`, `REFRESH_SECRET`, `REFRESH_TTL_DAYS`, `GOOGLE_CLIENT_ID`, `UPLOAD_DIR`, `UPLOAD_MAX_FILE_MB`, `UPLOAD_MAX_FILES`, `UPLOAD_ALLOWED_MIME`, `REPORT_DIR`. | `.env.example` atualizado; servidor falha rápido se faltar variável obrigatória. |
| E1.3 | Instalar e configurar middlewares base: `helmet`, `cors` (origens do ambiente), `express-rate-limit` global brando, parsing de JSON com limite de tamanho. | Middlewares aplicados no app. |
| E1.4 | Criar `AppError` (código, status HTTP, detalhes seguros), middleware de erro centralizado e handler 404 no formato padrão, sem stack trace na resposta. | Erros saem sempre como `{ "error": { ... } }`. |
| E1.5 | Criar helper `validate(schema)` com `zod` para body, params e query, retornando `422` com `details`. | Middleware de validação reutilizável. |
| E1.6 | Ajustar `package.json`: scripts `dev`, `start`, `test`, `prisma:generate`, `prisma:migrate`; instalar e configurar Vitest + Supertest com um teste de fumaça do `/health`. | `npm test` roda; scripts documentados. |
| E1.7 | Corrigir a rota `GET /` (mensagem do AgroVision, sem afirmar MVC) e adicionar `GET /api/v1/health` com checagem de conexão ao banco. | Status e health check corretos. |

**Critério de conclusão:** servidor inicia, valida o ambiente, conecta ao banco, responde ao health check e retorna erros no formato padrão sem expor stack trace.

### Fase 2 — Autenticação e segurança

| Etapa | Ação | Entregável |
|---|---|---|
| E2.1 | Migration incremental: `senha_hash` opcional; `provedor_auth`, `google_sub` único, `email_verificado` em `Usuario`; tabela de sessão/refresh token; padronizar `criado_em`. | Migration aplicada, `prisma generate` atualizado. |
| E2.2 | Serviço de hash (`bcrypt`) e util de tokens: gerar/verificar access token JWT e gerar/hashear/validar refresh token opaco. | Módulos `utils/hash` e `utils/tokens` com teste unitário. |
| E2.3 | `POST /auth/registro`: nome, email, senha (mín. 8), telefone opcional; valida email único; grava apenas hash. | Conta criada, resposta sem campos sensíveis. |
| E2.4 | `POST /auth/login`: valida credenciais, emite access + refresh token, cria sessão. | Login tradicional funcional. |
| E2.5 | Middleware de autenticação (Bearer), `GET /usuarios/me` e `PATCH /usuarios/me`. | Perfil autenticado consultável e editável. |
| E2.6 | `POST /auth/google`: valida o ID token com `google-auth-library`, exige `email_verified`, vincula ou cria conta por `google_sub`/email, emite sessão. | Login Google funcional. |
| E2.7 | `POST /auth/refresh` (rotaciona o refresh token) e `POST /auth/logout` (revoga a sessão). | Renovação e logout; sessão revogada não é reutilizável. |
| E2.8 | Rate limit específico nas rotas de `auth`; respostas genéricas que não revelam existência de conta. | Proteção contra força bruta e enumeração. |
| E2.9 | Coleção Insomnia: pasta `Auth` com todos os fluxos e variáveis de ambiente. | Requisições versionadas na coleção. |

**Critério de conclusão:** registro, login tradicional, login Google, renovação, logout e consulta do perfil funcionam; senhas e tokens nunca aparecem em respostas; sessão revogada é rejeitada.

### Fase 3 — Propriedades, talhões e voos

| Etapa | Ação | Entregável |
|---|---|---|
| E3.1 | Middleware de autorização por dono: carrega o recurso e valida a cadeia `usuario → propriedade → talhao → voo`, respondendo `404` para recurso de outro usuário. | Isolamento entre usuários garantido em um só lugar. |
| E3.2 | Schemas `zod` do domínio: UF com duas letras, áreas não negativas, latitude/longitude válidas, GeoJSON válido, `data_voo` coerente. | Validações reutilizáveis por rota. |
| E3.3 | CRUD `/propriedades` (somente do usuário autenticado). | Listar, criar, consultar, atualizar, excluir. |
| E3.4 | CRUD `/talhoes` restrito a propriedades do usuário. | Talhões sempre dentro de propriedade válida. |
| E3.5 | CRUD `/voos` restrito a talhões autorizados, com filtro por talhão e período. | Voos e consulta por talhão/data. |
| E3.6 | Helper de paginação, ordenação e filtros aplicado às listagens, com limites máximos. | `meta` padronizado nas listas. |
| E3.7 | Regra de exclusão segura: recurso com dependentes retorna `409` até existir regra explícita de cascata. | Exclusão previsível. |
| E3.8 | Coleção Insomnia: pastas `Propriedades`, `Talhões` e `Voos`. | Requisições versionadas na coleção. |

**Critério de conclusão:** o fluxo propriedade → talhão → voo pode ser criado e consultado integralmente, com isolamento entre usuários e exclusão sem quebra de integridade.

### Fase 4 — Upload e análises

| Etapa | Ação | Entregável |
|---|---|---|
| E4.1 | Migration: entidade `ImagemVoo` (nome original, nome armazenado, MIME, tamanho, caminho, data, `id_voo`) e status de processamento em voo ou análise. | Schema pronto para imagens e estados. |
| E4.2 | Serviço de storage abstrato com implementação local em `UPLOAD_DIR` (fora de `src`); config de limites de quantidade e tamanho. | Interface trocável por storage externo depois. |
| E4.3 | Middleware de upload com `multer`: limites, filtro por MIME e extensão (JPEG, PNG, TIFF, GeoTIFF), geração de nome seguro, sem permissão de execução. | Upload validado. |
| E4.4 | `POST /voos/:id/imagens` (uma ou várias) em voo autorizado, com registro de metadados no banco. | Imagens vinculadas ao voo. |
| E4.5 | `GET /voos/:id/imagens` e `DELETE` de imagem, removendo arquivo e registro juntos. | Listagem e exclusão controladas. |
| E4.6 | `POST /analises`, `GET /analises/:id`, `PATCH /analises/:id` com tipo, risco, percentual afetado, resultado textual e arquivo resultante. | Análises registráveis e recuperáveis. |
| E4.7 | Download autenticado e autorizado dos arquivos; nunca servir o diretório de upload diretamente. | Acesso a arquivo só pelo dono. |
| E4.8 | Coleção Insomnia: pastas `Imagens` e `Análises`. | Requisições versionadas na coleção. |

**Critério de conclusão:** imagens válidas são armazenadas e vinculadas ao voo; tipos inválidos, excesso de tamanho ou voo não autorizado são rejeitados; análises podem ser registradas e recuperadas com seus resultados.

### Fase 5 — Dashboard e histórico

| Etapa | Ação | Entregável |
|---|---|---|
| E5.1 | `GET /dashboard`: contagem de propriedades, área monitorada, voos, análises e distribuição por nível de risco, no escopo do usuário. | Indicadores agregados. |
| E5.2 | Séries temporais para os gráficos do frontend (por período). | Dados para gráficos, sem constantes fixas. |
| E5.3 | `GET /monitoramentos`: histórico paginado combinando voo, talhão, propriedade e análise. | Tabela de monitoramentos alimentada pela API. |
| E5.4 | Filtros por intervalo de data, propriedade/talhão e tipo de análise, com validação de combinações e resultado vazio tratado. | Filtros confiáveis. |
| E5.5 | Limites máximos de paginação aplicados a todas as consultas agregadas. | Proteção contra consultas caras. |
| E5.6 | Coleção Insomnia: pastas `Dashboard` e `Monitoramentos`. | Requisições versionadas na coleção. |

**Critério de conclusão:** o frontend consegue montar indicadores, gráficos, lista de talhões e tabela de relatórios sem dados fixos.

### Fase 6 — Relatórios e recomendações

| Etapa | Ação | Entregável |
|---|---|---|
| E6.1 | Motor de recomendações por regras versionadas conforme tipo de análise, nível de risco e percentual afetado. | Recomendação determinística e testável. |
| E6.2 | Serviço de geração de PDF com `pdfkit`, saída determinística, contendo propriedade, talhão, voo, tipo, risco, área afetada, resultado e recomendação. | Gerador de PDF reutilizável. |
| E6.3 | `POST /relatorios` (para análise concluída), `GET /relatorios` e `GET /relatorios/:id`. | Relatórios criáveis e consultáveis. |
| E6.4 | `GET /relatorios/:id/download` autenticado e autorizado. | Download restrito ao dono dos dados. |
| E6.5 | Tratar análise incompleta e falha de geração sem deixar arquivo órfão. | Estado consistente em caso de erro. |
| E6.6 | Incluir na resposta a informação de que a recomendação é baseada em regras, não em diagnóstico automático por IA. | Transparência no contrato. |
| E6.7 | Coleção Insomnia: pasta `Relatórios`. | Requisições versionadas na coleção. |

**Critério de conclusão:** uma análise autorizada produz PDF válido e recomendação coerente, acessíveis somente ao dono dos dados.

### Fase 7 — Qualidade e documentação

| Etapa | Ação | Entregável |
|---|---|---|
| E7.1 | Testes unitários de validações, regras de recomendação, autorização e tokens. | Suíte unitária verde. |
| E7.2 | Testes de integração das rotas com banco de testes isolado (migrations aplicadas em setup). | Suíte de integração reproduzível. |
| E7.3 | Cobrir autenticação, isolamento entre usuários, CRUD, filtros, upload e relatório. | Fluxos do MVP testados ponta a ponta. |
| E7.4 | Consolidar e exportar a coleção do Insomnia, com ambientes e exemplos por domínio. | Arquivo de coleção versionado. |
| E7.5 | `README.md` do backend: instalação, variáveis, migrations, execução, testes, upload e contrato de respostas. | Documentação de execução completa. |
| E7.6 | Logs mínimos de inicialização e erros com `pino`, sem credenciais nem tokens. | Observabilidade básica segura. |

**Critério de conclusão:** testes passam de forma reproduzível e todas as rotas do MVP podem ser exercitadas pela coleção e pela documentação.

## 5. Ordem de entrega e dependências

1. Fundação da API.
2. Autenticação e segurança.
3. Propriedades, talhões e voos.
4. Upload e análises.
5. Dashboard e histórico.
6. Relatórios e recomendações.
7. Testes finais e documentação.

O frontend depende do contrato de autenticação após a fase 2, do domínio agrícola após a fase 3, do upload após a fase 4 e dos formatos definitivos de dashboard e relatórios após as fases 5 e 6. Os contratos devem ser documentados antes da integração de cada módulo.

A coleção do Insomnia é construída de forma incremental (etapas E2.9, E3.8, E4.8, E5.6, E6.7) e apenas consolidada na fase 7, porque é um entregável avaliado e hoje está ausente.

## 6. Plano de testes e aceite

- Cadastrar usuário e rejeitar email duplicado ou dados inválidos.
- Autenticar por senha e Google; rejeitar credenciais e tokens inválidos e Google sem `email_verified`.
- Renovar e encerrar sessão sem reutilizar sessão revogada.
- Garantir que usuário A não consulte nem modifique dados do usuário B.
- Criar, listar, atualizar e excluir recursos sem dependências; rejeitar exclusão conflitante com `409`.
- Aceitar imagens permitidas e rejeitar tipo, tamanho ou voo inválido.
- Registrar análise e refletir seus valores no histórico e no dashboard.
- Filtrar histórico por data, área e tipo de análise, incluindo resultados vazios.
- Gerar e baixar PDF válido somente com autenticação e autorização.
- Verificar respostas para banco indisponível, arquivo ausente e erro interno.

## 7. Fora do escopo atual e premissas

- IA para identificar pragas ou doenças, previsão de problemas, aplicativo mobile e integração direta com drones permanecem como roadmap futuro.
- A identificação inicial de problemas será manual ou baseada em resultados já fornecidos ao sistema.
- As recomendações serão determinísticas e baseadas em regras.
- Microsoft e Apple não fazem parte da autenticação atual; apenas email/senha e Google.
- O armazenamento local atende ao desenvolvimento; produção deverá configurar serviço persistente compatível com a abstração criada.
- O plano não define datas ou estimativas porque prazo e capacidade da equipe não foram informados.
