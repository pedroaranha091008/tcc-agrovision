# Relatório de Testes — Visão do Cliente (AgroVision)

**Data:** 16/10/2026
**Método:** teste exploratório no navegador (Chrome automatizado com Playwright), simulando um produtor rural que conhece o site, pede um orçamento, cria uma conta e usa o dashboard. Também foram feitos testes em tela de celular (390×844), checagens básicas de acessibilidade/SEO e uma tentativa de subir o backend.
**Versão testada:** `main` (commit `905e78b`) + alterações locais não commitadas no backend.

---

> **Atualização 20/10/2026:** as Partes 0, 1, 2 e 3 do planejamento foram implementadas e retestadas. Veja a [seção 7](#7-atualização--20102026-correções-aplicadas) para o status de cada erro.

## 1. Resumo executivo

O site **tem uma vitrine (landing page) bonita e bem resolvida visualmente**, mas **tudo que vem depois do primeiro clique é protótipo**: não existe integração com backend, login, cadastro, orçamento e dashboard são simulados, e a maior parte dos botões do painel não faz nada.

| Área | Situação |
|---|---|
| Landing page (visual, textos, rolagem) | ✅ Funciona, com problemas pontuais |
| Formulário de orçamento | ⚠️ Mostra "Solicitação recebida!", mas **nada é enviado** |
| Login / cadastro / login social | ❌ Simulados — qualquer email/senha entra |
| Dashboard | ❌ Dados fixos ("João Silva"), menus e botões sem ação |
| Upload de imagens de drone, relatórios PDF, histórico | ❌ Não existem |
| Rotas / URL | ❌ Não existem (tudo em `/`, F5 volta para a home) |
| Celular | ⚠️ Home ok; dashboard quebrado |
| Backend | ❌ Não sobe (sem dependências, sem `.env`, sem banco); só tem `/api/v1/status` |

Das 7 funcionalidades **essenciais** do `specs.md`, **nenhuma está funcional de ponta a ponta** hoje.

---

## 2. Jornada do cliente (o que eu, como cliente, vivi)

1. **Entrei no site** → a aba mostra *"AgroVision UI/UX Prototype"*, e a foto principal do topo **não carrega** (aparece o texto "Drone sobrevoando plantação agrícola" no canto superior esquerdo).
2. **Naveguei pelo menu** → Início/Sobre/Serviços/Dashboard/Contato rolam corretamente. 👍
3. **Cliquei em "Saiba mais"** em um serviço → nada acontece (nos 6 cards).
4. **Pedi um orçamento** com nome "a", email "x@y", telefone "abc" e área "-5 ha" → o site aceitou e disse *"Solicitação recebida! Nossa equipe entrará em contato em até 2 horas"*. **Nenhum dado foi enviado a lugar nenhum.** Um cliente real ficaria esperando um contato que nunca vai chegar.
5. **Tentei ligar/mandar email** → telefone e email não são clicáveis; ícones de Instagram/Twitter/LinkedIn/YouTube não têm link.
6. **Rodapé** → links "Início, Sobre, Serviços…", "Privacidade" e "Termos de Uso" não fazem nada.
7. **Cliquei em "Ver Dashboard"** sem estar logado → entrei direto no painel de outra pessoa ("João Silva").
8. **Fiz login** com email inexistente e senha "1" → entrei. Os botões Google/Microsoft/Apple e "Esqueci a senha" não fazem nada.
9. **Criei conta** com senha "123" e confirmação "999999" → conta "criada", e o painel continuou dizendo "Bem-vindo, João!".
10. **No dashboard** → todos os itens do menu lateral (Análises, Relatórios, Fazendas, Agendamentos, Configurações) mantêm a mesma tela "Visão Geral". "Nova Análise", "Filtrar", "Ver todos", "Ampliar", busca, sino de notificações e botão de download **não fazem nada**. Não há onde enviar imagens do drone.
11. **Apertei F5** no dashboard → voltei para a home. Não existe URL `/dashboard`, `/login` etc.
12. **No celular** → o dashboard fica com o menu lateral ocupando 240 px de 390 px, cortando cards e textos; o menu mobile da home não tem o item "Dashboard"; o formulário de orçamento fica espremido em 2 colunas de 130 px.

---

## 3. Lista de erros encontrados

Severidade: 🔴 Crítico (bloqueia o uso / engana o cliente) · 🟠 Alto · 🟡 Médio · ⚪ Baixo

### 3.1 Funcionalidade e integração

| # | Sev. | Problema | Onde |
|---|---|---|---|
| F1 | 🔴 | Formulário de orçamento mostra sucesso mas não envia nada (só `setSubmitted(true)`) | [App.tsx:581-584](frontend/src/app/App.tsx#L581-L584) |
| F2 | 🔴 | Login aceita qualquer email/senha; é só um `setTimeout` que abre o dashboard | [App.tsx:778-782](frontend/src/app/App.tsx#L778-L782) |
| F3 | 🔴 | Cadastro não valida senha = confirmação, nem tamanho mínimo de 8 caracteres anunciado no placeholder; não cria usuário | [App.tsx:915-919](frontend/src/app/App.tsx#L915-L919) |
| F4 | 🔴 | Dashboard acessível sem login (botões "Ver Dashboard" e "Acessar Dashboard Completo") | [App.tsx:207](frontend/src/app/App.tsx#L207), [App.tsx:523](frontend/src/app/App.tsx#L523) |
| F5 | 🔴 | Dashboard com dados 100% fixos (usuário "João Silva", fazenda, gráficos, tabela) | [App.tsx:24-54](frontend/src/app/App.tsx#L24-L54), [App.tsx:1059](frontend/src/app/App.tsx#L1059) |
| F6 | 🔴 | Não existe upload de imagens de drone (funcionalidade essencial do `specs.md`) | — |
| F7 | 🔴 | Não existe geração/download de relatório PDF; botão de download sem ação | [App.tsx:1269](frontend/src/app/App.tsx#L1269) |
| F8 | 🟠 | Menu lateral do dashboard só muda o destaque, não troca o conteúdo | [App.tsx:1016](frontend/src/app/App.tsx#L1016) |
| F9 | 🟠 | Botões sem ação: Nova Análise, Filtrar (x2), Ver todos, Ampliar, sino, busca | [App.tsx:1074](frontend/src/app/App.tsx#L1074), [1109](frontend/src/app/App.tsx#L1109), [1137](frontend/src/app/App.tsx#L1137), [1238-1241](frontend/src/app/App.tsx#L1238-L1241) |
| F10 | 🟠 | Login social (Google/Microsoft/Apple) e "Esqueci a senha" sem ação. O `specs.md` pede login com Google | [App.tsx:843-856](frontend/src/app/App.tsx#L843-L856), [877](frontend/src/app/App.tsx#L877) |
| F11 | 🟠 | "Sair" não encerra sessão (não há sessão) | [App.tsx:1026](frontend/src/app/App.tsx#L1026) |
| F12 | 🟡 | "Saiba mais" dos 6 serviços sem ação | [App.tsx:378](frontend/src/app/App.tsx#L378) |
| F13 | 🟡 | Links do rodapé, Privacidade, Termos e redes sociais sem ação/link | [App.tsx:713-746](frontend/src/app/App.tsx#L713-L746) |
| F14 | 🟡 | Validação fraca no orçamento: aceita email "x@y", telefone "abc", área negativa | [App.tsx:632-648](frontend/src/app/App.tsx#L632-L648) |
| F15 | ⚪ | Barra de "Contagem árvores" calcula `parseFloat("1.847")` = 1,847 → barra com 0,09% (deveria ~92%) | [App.tsx:1179](frontend/src/app/App.tsx#L1179) |

### 3.2 Navegação e rotas

| # | Sev. | Problema |
|---|---|---|
| N1 | 🟠 | Sem roteamento: tudo fica em `/`. F5 no dashboard volta para a home; não dá para compartilhar link de login/dashboard; botão Voltar do navegador sai do site. O `react-router` já está instalado mas não é usado. |
| N2 | 🟡 | Qualquer URL inexistente mostra a home (sem página 404). |
| N3 | 🟡 | Navbar transparente com texto branco aparece por cima da tela de cadastro (fundo claro) — links ficam invisíveis e sobrepostos ao logo da página ([App.tsx:103](frontend/src/app/App.tsx#L103) só esconde a navbar no dashboard). |
| N4 | ⚪ | Menu mobile não tem o item "Dashboard" que existe no desktop ([App.tsx:151](frontend/src/app/App.tsx#L151)). |

### 3.3 Visual, conteúdo e responsividade

| # | Sev. | Problema |
|---|---|---|
| V1 | 🟠 | 2 imagens do Unsplash retornam **404** (foto do topo da home e mapa do dashboard): `photo-1586771107445…` e `photo-1560493676…`. O texto alternativo aparece sobre o hero. Além disso, depender de imagens externas é frágil — usar arquivos próprios em `src/assets`. |
| V2 | 🟠 | Dashboard no celular: sidebar fixa de 240 px, cards e títulos cortados. |
| V3 | 🟡 | Formulário de orçamento no celular com 2 colunas de 130 px (`grid-cols-2` sem breakpoint). |
| V4 | 🟡 | Números inconsistentes: hero diz "+500 hectares analisados", seção Sobre diz "50k ha área mapeada" e "500+ clientes". |
| V5 | ⚪ | Título da aba "AgroVision UI/UX Prototype"; `lang="en"` em site em português; sem favicon (gera erro 404 no console); `meta robots="noindex, nofollow"` impede o Google de indexar. |

### 3.4 Acessibilidade

| # | Sev. | Problema |
|---|---|---|
| A1 | 🟡 | 8 campos sem `<label for>`/`id` associado (leitores de tela não leem o rótulo). |
| A2 | 🟡 | 5 botões só com ícone sem `aria-label` (menu mobile, redes sociais). |
| A3 | ⚪ | Fontes definidas com `style={{ fontFamily }}` repetido centenas de vezes, em vez de classes/tema. |

### 3.5 Backend e infraestrutura

| # | Sev. | Problema |
|---|---|---|
| B1 | 🔴 | Backend não sobe: `Cannot find package 'express'` (sem `node_modules`), sem `.env`, sem client Prisma gerado (`generated/`), sem MySQL local. |
| B2 | 🔴 | Só existe a rota `GET /api/v1/status`. Faltam autenticação, propriedades, talhões, voos, análises, uploads, relatórios e orçamentos. |
| B3 | 🟠 | Não há tabela para **solicitações de orçamento** (nem para tipo de usuário produtor/agrônomo/empresa que o cadastro coleta). |
| B4 | 🟡 | `server.js` chama `app.listen` sem esperar o `prisma.$connect()` — o servidor "sobe" e depois morre se o banco falhar. |
| B5 | ⚪ | Mensagem da rota raiz diz *"API de tarefas funcionando!"* (texto copiado de outro projeto) — [backend/src/app.js:24](backend/src/app.js#L24). |
| B6 | 🟡 | `frontend/node_modules` estava incompleto (sem `vite`) — `npm run build` falhava até rodar `npm install`. Projeto não tem `tsconfig` nem TypeScript instalado, então erros de tipo não são verificados. |
| B7 | ⚪ | Bundle de 648 kB (aviso do Vite); várias libs instaladas sem uso (MUI, react-dnd, react-slick…). |
| B8 | ⚪ | Nenhum teste automatizado em frontend ou backend. |

---

## 4. O que está bom

- Identidade visual forte e consistente (paleta verde, tipografia, cartões, gráficos Recharts).
- Rolagem suave do menu da home funcionando no desktop.
- Home sem rolagem horizontal no celular.
- Build de produção do frontend funciona (após `npm install`).
- Modelo de dados no Prisma (Usuário → Propriedade → Talhão → Voo → Análise) é coerente com o produto.
- Backend já tem padrão de erro (`AppError` + `errorHandler`) e CORS configurável.

---

## 5. Planejamento por partes

A ordem prioriza **parar de enganar o cliente** primeiro, depois **ter um fluxo real de ponta a ponta** (cadastro → fazenda → upload → análise → relatório), e por fim polimento. Cada parte é entregável e testável sozinha. As partes se encaixam nas fases já descritas em [PLANEJAMENTO_BACKEND.md](backend/PLANEJAMENTO_BACKEND.md) e [PLANEJAMENTO_FRONTEND.md](frontend/PLANEJAMENTO_FRONTEND.md).

### Parte 0 — Correções rápidas (1–2 dias) · só frontend
Objetivo: o que já existe na tela não pode parecer quebrado.
- [ ] Trocar as 2 imagens 404 e salvar todas as imagens em `src/assets` (V1).
- [ ] `index.html`: título "AgroVision — Mapeamento com Drones", `lang="pt-BR"`, favicon, remover `noindex` (V5).
- [ ] Esconder a navbar também em login/cadastro (N3); adicionar "Dashboard" no menu mobile (N4).
- [ ] `grid-cols-1 sm:grid-cols-2` no formulário de orçamento (V3).
- [ ] Corrigir cálculo da barra de árvores (F15) e alinhar números da landing (V4).
- [ ] Links reais: `mailto:`, `tel:`, WhatsApp, redes sociais; rodapé rolando para as seções (F13).
- [ ] Botões ainda sem função: esconder ou mostrar aviso "Em breve" (toast `sonner`, já instalado) — nunca deixar botão mudo.
- [ ] `label htmlFor`/`id` e `aria-label` nos botões de ícone (A1, A2).

**Aceite:** nenhum erro no console; todos os botões visíveis têm uma reação.

### Parte 1 — Base do frontend: rotas e organização (2–3 dias)
- [ ] Separar o `App.tsx` (1.300 linhas) em `pages/` e `components/` (Home, Login, Register, Dashboard, layout).
- [ ] `react-router` com rotas `/`, `/login`, `/cadastro`, `/dashboard/*`, página 404 (N1, N2).
- [ ] Sub-rotas do dashboard para cada item do menu (`/dashboard/fazendas`, `/relatorios`…), mesmo que inicialmente com estado vazio (F8).
- [ ] Sidebar recolhível/drawer no celular (V2).
- [ ] Adicionar `typescript` + `tsconfig.json` e script `npm run typecheck` (B6).

**Aceite:** F5 mantém a página; voltar do navegador funciona; dashboard usável em 390 px.

### Parte 2 — Backend rodando + autenticação real (3–5 dias)
- [ ] Documentar setup: `npm install`, `.env` a partir do `.env.example`, MySQL (ou Docker), `prisma generate` e `prisma migrate dev` (B1).
- [ ] `server.js`: só escutar a porta após conectar no banco (B4); corrigir mensagem (B5).
- [ ] `POST /auth/cadastro`, `POST /auth/login`, `GET /auth/me` com bcrypt + JWT; validação com zod (senha ≥ 8, email válido).
- [ ] Adicionar campo `tipo_usuario` (produtor/agrônomo/empresa) no `Usuario` (B3).
- [ ] Frontend: cliente HTTP (`VITE_API_URL`), contexto de autenticação, rota protegida, logout real, mensagens de erro (F2, F3, F4, F11).
- [ ] Nome/iniciais reais do usuário no topo do dashboard (F5).

**Aceite:** login com senha errada é recusado; dashboard sem login redireciona para `/login`; nome do usuário aparece correto.

### Parte 3 — Orçamentos (1–2 dias)
- [ ] Tabela `SolicitacaoOrcamento` + `POST /orcamentos` com validação (B3, F14).
- [ ] Formulário envia para a API, mostra carregando/erro e só exibe sucesso após resposta 201 (F1).
- [ ] (Opcional) envio de email de aviso para a equipe.

**Aceite:** a solicitação enviada aparece no banco; com backend fora do ar o cliente vê uma mensagem de erro.

### Parte 4 — Fazendas, talhões e voos (3–4 dias)
- [ ] CRUD de propriedades e talhões (backend + telas em `/dashboard/fazendas`).
- [ ] Registro de voos por talhão.
- [ ] Estado vazio amigável: "Cadastre sua primeira fazenda".

### Parte 5 — Upload de imagens e análises (4–6 dias)
- [ ] `POST /voos/:id/imagens` com `multer` (limite de tamanho, só JPG/PNG/TIFF), armazenamento local em `uploads/` (F6).
- [ ] Tela "Nova Análise": escolher fazenda → talhão → voo → enviar imagens, com barra de progresso.
- [ ] Registro de `Analise` (tipo, nível de risco, % afetado). Para o TCC, a identificação de problemas pode começar com cálculo simples (ex.: índice de verde/VARI em imagem RGB) ou entrada manual do agrônomo.

### Parte 6 — Dashboard real, histórico e filtros (3–4 dias)
- [ ] `GET /dashboard/resumo` alimentando cards, pizza, NDVI e falhas por setor (F5).
- [ ] `/dashboard/analises`: histórico com filtros por data, fazenda/talhão e tipo de análise; busca funcional (F9).
- [ ] Notificações básicas (ex.: análise com risco alto/crítico).

### Parte 7 — Relatórios PDF e recomendações (3–4 dias)
- [ ] Geração de PDF (ex.: `pdfkit` no backend) com dados da análise, gráficos e recomendações (F7).
- [ ] Botão de download e tela `/dashboard/relatorios`.
- [ ] Recomendações por regra simples (ex.: risco alto de falhas → sugerir replantio).

### Parte 8 — Login social, recuperação de senha e qualidade (3–5 dias)
- [ ] Login com Google (OAuth) — exigido no `specs.md`; remover Microsoft/Apple se não forem implementados (F10).
- [ ] "Esqueci a senha" com token por email.
- [ ] Páginas de Privacidade e Termos (LGPD).
- [ ] Testes: Vitest + Supertest nas rotas da API; Playwright repetindo esta jornada do cliente.
- [ ] Remover dependências não usadas e dividir o bundle (B7, B8).

### Visão geral da ordem

```
Parte 0 ─► Parte 1 ─┐
                    ├─► Parte 3 (orçamentos)
Parte 2 ────────────┤
                    └─► Parte 4 ─► Parte 5 ─► Parte 6 ─► Parte 7 ─► Parte 8
```

Partes 0/1 (frontend) e Parte 2 (backend) podem andar em paralelo por pessoas diferentes.
Estimativa total: **~5 a 7 semanas** com 2–3 pessoas.

---

## 6. Como repetir este teste

1. `cd frontend && npm install && npx vite`
2. Abrir `http://localhost:5173` e seguir a jornada da seção 2.
3. O roteiro automatizado usado (Playwright) pode virar a base dos testes E2E da Parte 8.

---

## 7. Atualização — 20/10/2026: correções aplicadas

Foram concluídas as **Partes 0, 1, 2 e 3** do planejamento. O reteste no navegador (mesma jornada da seção 2, em desktop e celular) passou em **53 de 54 verificações**. A única restante é um aviso esperado no console: o `401` da tentativa de login com senha errada. O backend ganhou **11 testes de integração**, todos passando (`npm test`).

### Status de cada erro

| # | Status | O que foi feito |
|---|---|---|
| F1 | ✅ | Orçamento é enviado para `POST /api/v1/orcamentos` e salvo na tabela `solicitacoes_orcamento`; a confirmação só aparece após resposta 201. Se a API estiver fora, o cliente vê o erro e os contatos diretos. |
| F2 | ✅ | Login real (bcrypt + JWT). Senha errada e email inexistente dão a mesma mensagem, para não revelar quais contas existem. |
| F3 | ✅ | Cadastro valida nome, email, senha (≥ 8 caracteres, letras e números) e confirmação, exige aceite dos termos, salva o tipo de usuário e recusa email repetido. |
| F4 | ✅ | `/dashboard/*` exige login; sem sessão vai para `/login` e volta para a página pedida depois de entrar. |
| F5 | ⚠️ Parcial | Nome, iniciais e tipo do usuário são reais. Os gráficos continuam com dados de exemplo, agora com o aviso **"Dados de demonstração"**. Os dados reais dependem das Partes 4–6. |
| F6, F7 | ⏳ | Upload e PDF ficam para as Partes 5 e 7. O download na tabela de exemplo explica que é demonstração. |
| F8 | ✅ | Cada item do menu tem rota própria. Análises, Relatórios, Fazendas e Agendamentos mostram uma página "Em desenvolvimento" que diz o que virá ali. Configurações já funciona (editar nome, telefone e tipo). |
| F9 | ✅ | Nova Análise e Ver todos levam às páginas certas; o sino abre o painel de notificações. Os botões sem função (Filtrar, Ampliar, busca) foram removidos até existirem dados reais. |
| F10 | ⚠️ Parcial | Google aparece desabilitado com o selo "Em breve"; Microsoft e Apple foram removidos; "Esqueci a senha" orienta a escrever para o email de contato. O OAuth fica para a Parte 8. |
| F11 | ✅ | "Sair" apaga a sessão e volta para a home. |
| F12 | ✅ | "Saiba mais" abre os detalhes do serviço; "Solicitar este serviço" já preenche o formulário. |
| F13 | ✅ | Os links do rodapé navegam; Privacidade e Termos têm páginas próprias; email e telefone são clicáveis. Os ícones de redes sociais só aparecem quando houver URL em `lib/site.ts`. |
| F14 | ✅ | Validação por campo (no navegador e na API), com máscara de telefone. |
| F15 | ✅ | A barra de árvores mostra 92%. |
| N1–N4 | ✅ | React Router com URLs reais, F5 e Voltar funcionando, página 404, navbar sólida fora da home e escondida em login/cadastro, item "Dashboard" no menu mobile. |
| V1 | ✅ | As imagens agora ficam em `src/assets`. O mapa da fazenda virou um SVG próprio, com talhões coloridos por saúde. |
| V2, V3 | ✅ | No celular, o menu do painel virou gaveta e o formulário de orçamento ficou em 1 coluna. |
| V4 | ✅ | Números da landing ficaram consistentes ("50 mil ha"). Frases impossíveis de comprovar ("IA", "AES-256", "app") foram suavizadas. |
| V5 | ✅ | Título por página, `lang="pt-BR"`, favicon e remoção do `noindex`. |
| A1–A3 | ✅ | Todos os campos têm `<label>`, os botões de ícone têm `aria-label` e as fontes saíram do `style` inline para classes do tema (`font-display`). |
| B1 | ✅ | O backend sobe com o MariaDB do XAMPP; o passo a passo está em `backend/README.md`. |
| B2, B3 | ⚠️ Parcial | Já existem as rotas de autenticação, perfil e orçamentos, além da coluna `tipo_usuario` e da tabela de orçamentos (migration incremental). Os outros domínios ficam para as Partes 4–7. |
| B4, B5 | ✅ | O servidor só aceita requisições depois de conectar ao banco, e a mensagem da rota raiz foi corrigida. |
| B6 | ✅ | O frontend tem `tsconfig`, TypeScript e o script `npm run typecheck` (sem erros). |
| B7 | ✅ | 12 dependências sem uso foram removidas (MUI, emotion, react-dnd, react-slick…). O painel carrega sob demanda: o pacote inicial caiu de **687 kB para 297 kB**. |
| B8 | ⚠️ Parcial | O backend tem testes de integração. Os testes de interface (E2E) ficam para a Parte 8. |

### Próximos passos

1. **Parte 4 — Fazendas e talhões:** é o que destrava os dados reais do painel.
2. **Parte 5 — Upload de imagens e análises.**
3. **Parte 6 — Painel com dados reais** e remoção do aviso de demonstração.
4. **Parte 7 — Relatórios em PDF.**
5. **Parte 8:** login com Google, recuperação de senha, refresh token e testes E2E no repositório.

Antes de publicar, ainda é preciso **substituir os contatos fictícios** (telefone `99999-0000`, email e redes) em `frontend/src/app/lib/site.ts` e **gerar um `JWT_SECRET` forte** no `.env` do servidor.
