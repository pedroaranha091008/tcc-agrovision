# AgroVision — Frontend

Site institucional e painel do cliente da AgroVision (React 18 + Vite + Tailwind 4 + React Router 7).
O layout veio do protótipo no [Figma](https://www.figma.com/design/XMVhlAAMImwHvaWp3032Bo/AgroVision-UI-UX-Prototype).

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se a API não estiver em localhost:3000
npm run dev            # http://localhost:5173
```

O login, o cadastro e o formulário de orçamento precisam do backend rodando (veja `../backend/README.md`).
Sem ele, o site mostra uma mensagem de erro em vez de fingir que deu certo.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o build localmente |
| `npm run typecheck` | verificação de tipos do TypeScript |
| `npm run test:e2e` | testes de ponta a ponta no navegador (veja abaixo) |
| `npm run test:e2e:relatorio` | abre o relatório HTML da última execução |

## Testes de ponta a ponta (E2E)

A pasta `e2e/` tem 32 testes que usam o site como um cliente: cadastro, login e sessão, recuperação de senha, fazendas, envio de imagens, análises, PDF, painel, histórico e as telas no celular.

- Usam o **Chrome instalado na máquina** (não precisa baixar navegador) e a API e o banco de verdade.
- **Pré-requisito:** MySQL/MariaDB no ar e `backend/.env` configurado. A API e o site sobem sozinhos se ainda não estiverem rodando.
- Cada teste cria contas próprias com email `@teste.agrovision.dev`. No final, `npm --prefix ../backend run limpar-testes` apaga essas contas e os arquivos enviados.
- Para rodar a suíte várias vezes seguidas, aumente `LIMITE_TENTATIVAS_AUTH` no `backend/.env` (o limite padrão de 20 logins por 15 minutos bloquearia).

```bash
npm run test:e2e
```

## Sessão

O token de acesso (15 min) fica só na memória da página. A sessão é mantida por um cookie `httpOnly` de renovação, que o JavaScript não lê e que o site usa para pedir um novo token antes de o atual expirar. No navegador fica só o lembrete `agrovision.sessao`, que não é segredo.

## Organização

```
src/
  assets/                 imagens locais (sem depender de links externos)
  app/
    App.tsx               rotas
    lib/                  api.ts (cliente HTTP), auth.tsx (sessão), types.ts (contratos da API), format.ts,
                          useCarregar.ts, site.ts (contatos e listas), validation.ts
    components/           Navbar, Footer, Logo, FarmMap, ProtectedRoute, Modal, Form, Breadcrumbs, Estados...
    components/ui/        componentes shadcn/ui (gerados, não editar à mão)
    pages/
      home/               seções da página inicial
      dashboard/          painel do cliente (carregado sob demanda)
        fazendas/         propriedades, talhões e voos (lista, detalhes, formulários)
      LoginPage, RegisterPage, LegalPage, NotFoundPage
```

## Rotas

| Rota | Acesso |
|---|---|
| `/`, `/privacidade`, `/termos` | público |
| `/login`, `/cadastro` | público (redireciona para o painel se já estiver logado) |
| `/esqueci-senha`, `/redefinir-senha?token=` | público — recuperação de senha pelo link enviado por email |
| `/dashboard` | exige login — painel com dados reais; filtros `?propriedade=` e `?dias=` na URL |
| `/dashboard/analises` | exige login — histórico com filtros e paginação na URL |
| `/dashboard/relatorios` | exige login — lista de relatórios com pré-visualização e download do PDF |
| `/dashboard/agendamentos`, `/configuracoes` | exige login |
| `/dashboard/fazendas`, `/dashboard/fazendas/:id`, `/dashboard/talhoes/:id`, `/dashboard/voos/:id` | exige login — propriedade → talhão → voo |

Contatos exibidos no site (telefone, email, redes sociais) ficam em `src/app/lib/site.ts`.
