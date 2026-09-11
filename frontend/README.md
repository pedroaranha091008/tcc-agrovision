# AgroVision — Frontend

Interface web do AgroVision: plataforma de análise agrícola a partir de imagens captadas por drone.
React 18 + TypeScript + Vite + React Router + Tailwind CSS.

## Requisitos

- Node.js 20+ (testado com 24)
- npm 10+

## Instalação

```bash
npm install
cp .env.example .env   # ajuste se necessário
npm run dev
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | sim | URL base da API do backend (ex.: `http://localhost:3000/api/v1`) |
| `VITE_API_MOCK` | não (`false`) | quando `true`, o cliente HTTP responde com um backend simulado em memória/`localStorage` (`src/services/mock/`), sem precisar do backend real no ar |
| `VITE_GOOGLE_CLIENT_ID` | não | client ID OAuth do Google; sem ele, o botão de login Google fica desabilitado (ou em modo demo, se `VITE_API_MOCK=true`) |

O `.env` do repositório vem com `VITE_API_MOCK=true` para permitir demonstrar a aplicação inteira sem o backend rodando. Para integrar com o backend real, aponte `VITE_API_URL` para ele e mude para `VITE_API_MOCK=false`.

## Execução

```bash
npm run dev        # servidor de desenvolvimento (Vite)
npm run build       # typecheck + build de produção em dist/
npm run preview     # serve o build de produção localmente
npm run typecheck   # apenas checagem de tipos
```

## Testes

```bash
npm test          # roda toda a suíte (Vitest + Testing Library) uma vez
npm run test:watch
```

Os testes rodam sempre em modo mock (`VITE_API_MOCK=true`, configurado em `vitest.config.ts`), então não dependem do backend nem de rede. Cobrem:

- **Lógica pura** (`tests/unit/`): validação de formulário (`validarCom`), formatação, tradução de erros da API, validação de upload.
- **Componentes** (`tests/componentes/`): proteção de rotas (`RequireAuth`/`RedirectIfAuth`), validação de formulário (cadastro), estados de erro da API (login), filtros do histórico, upload rejeitando arquivo inválido, estados vazio/erro reutilizáveis.
- **Fluxo essencial** (`tests/e2e/`): cadastro → sessão restaurada → dashboard autenticado → logout → volta à landing page; acesso direto a rota protegida sem sessão.

## Modo mock

Com `VITE_API_MOCK=true`, `src/services/http.ts` desvia toda requisição para `src/services/mock/`, que reimplementa em JavaScript puro o contrato do backend (mesmos endpoints, mesmos códigos de erro, mesma paginação, mesmas regras de recomendação). Propriedades/talhões/voos ficam em `localStorage` (sobrevivem ao reload); imagens e análises ficam só em memória (bytes de arquivo não cabem em `localStorage`); o PDF baixado em modo mock é um arquivo de demonstração, não o PDF real gerado pelo backend com `pdfkit`.

## Contrato com o backend

- Envelopes: sucesso `{ data, meta? }`; erro `{ error: { code, message, details? } }` (`src/services/erros.ts` traduz os códigos para mensagens amigáveis).
- Campos em snake_case/português, iguais ao schema Prisma do backend (`src/types/`).
- Sessão: `Authorization: Bearer <access_token>`; access token só em memória, refresh token em `localStorage` (único dado sensível persistido, usado apenas para renovar a sessão); renovação automática em uma única tentativa quando uma requisição autenticada recebe 401.

## Estrutura

```
src/
  app/App.tsx         árvore de rotas
  main.tsx            bootstrap (Router + AuthProvider)
  pages/              uma pasta/arquivo por rota
  components/
    landing/          seções da página institucional
    layout/           PublicLayout, DashboardLayout
    comum/            Modal, Form, Estados, Paginação, Badges, PageHeader...
  features/
    auth/             AuthContext, RequireAuth, GoogleLoginButton
    dominio/           formulários e schemas de propriedade/talhão/voo/análise
    voos/              upload de imagens e análises do voo
    relatorios/        recomendação + download de PDF
  services/            cliente HTTP + um módulo por domínio + mock/
  hooks/               useQuery, useMutation
  types/               contratos da API
  lib/                 formatação, validação de formulário
tests/
  unit/, componentes/, e2e/, setup.ts, utils/
```

## Acessibilidade

- Todo input de formulário tem `<label htmlFor>` associado (gerado automaticamente pelo componente `Campo`, que também liga `aria-describedby`/`aria-invalid` a dicas e erros).
- Erros de formulário e da API usam `role="alert"`; barras de progresso de upload/download usam `role="progressbar"` com `aria-valuenow`.
- Modais (`components/comum/Modal.tsx`) prendem o foco (Tab não escapa), movem o foco para dentro ao abrir e devolvem ao elemento que os abriu ao fechar; Esc fecha.
- Toda cor de status (risco, processamento) é acompanhada de ícone e texto, nunca só cor.
- Layout responsivo: menu lateral colapsável, tabelas com rolagem horizontal ou substituídas por cartões empilhados em telas pequenas, grids `grid-cols-2` → `lg:grid-cols-4`, barra de filtros com `flex-wrap`.

## Limitações conhecidas

- O bundle de produção passa de 500 kB (aviso do Vite); não há code-splitting por rota ainda — aceitável para o escopo do TCC, mas seria o próximo passo de performance.
- Não há mapa geoespacial real: a visão de talhões usa cartões com status e localização textual, como definido no planejamento.
- O PDF em modo mock é só uma demonstração do fluxo de download; o PDF real é gerado pelo backend.
