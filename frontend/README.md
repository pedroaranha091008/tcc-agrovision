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
| `/dashboard`, `/dashboard/analises`, `/relatorios`, `/agendamentos`, `/configuracoes` | exige login |
| `/dashboard/fazendas`, `/dashboard/fazendas/:id`, `/dashboard/talhoes/:id`, `/dashboard/voos/:id` | exige login — propriedade → talhão → voo |

Contatos exibidos no site (telefone, email, redes sociais) ficam em `src/app/lib/site.ts`.
