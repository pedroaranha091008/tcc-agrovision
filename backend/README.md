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
   npm run limpar-testes    # apaga contas e arquivos de teste (@teste.agrovision.dev)
   ```

## Endpoints disponíveis

Prefixo: `/api/v1`. Respostas de sucesso vêm em `{ "data": ... }` e erros em
`{ "error": { "code", "message", "details" } }`, onde `details` lista `{ campo, mensagem }` em erros de validação (422).

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/status` | — | verificação de funcionamento |
| POST | `/auth/cadastro` | — | cria conta (`nome`, `email`, `senha`, `tipo_usuario`, `lembrar?`), devolve `{ token, usuario }` e grava o cookie de renovação |
| POST | `/auth/login` | — | `email`, `senha`, `lembrar?`; devolve `{ token, usuario }` e grava o cookie de renovação |
| POST | `/auth/esqueci-senha` | — | `email`; sempre responde igual (não revela contas) e envia o link de redefinição |
| POST | `/auth/redefinir-senha` | — | `token` (do link) e `senha` nova; o link vale 1 hora e uma única vez, e encerra todas as sessões |
| POST | `/auth/renovar` | cookie | troca o cookie de renovação por um novo (rotação) e devolve novo `{ token, usuario }` |
| POST | `/auth/sair` | cookie | encerra a sessão no servidor e apaga o cookie |
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
| GET / PATCH / DELETE | `/voos/:id` | Bearer | detalhes (com imagens e análises), edição, exclusão (409 se tiver imagens ou análises) |
| POST | `/voos/:id/imagens` | Bearer | envia imagens (`multipart/form-data`, campo `imagens`; JPEG, PNG ou TIFF) |
| GET | `/imagens/configuracao` | Bearer | formatos aceitos e limites de tamanho/quantidade |
| GET | `/imagens/:id/arquivo` | Bearer | baixa a imagem (`?miniatura=1` devolve JPEG reduzido) |
| DELETE | `/imagens/:id` | Bearer | apaga a imagem e o arquivo |
| POST | `/voos/:id/analises/automatica` | Bearer | analisa as imagens do voo pelo índice de verde (ExG) e gera um mapa por imagem |
| POST | `/voos/:id/analises` | Bearer | registra análise manual (`tipo_analise`, `nivel_risco`, `percentual_area_afetada?`, `resultado`) |
| GET | `/analises/:id` | Bearer | detalhe da análise com propriedade, talhão, voo e recomendação (pré-visualização do relatório) |
| GET | `/analises/:id/relatorio` | Bearer | relatório em PDF (gerado na hora, sempre igual para a mesma análise) |
| GET | `/analises/:id/mapas/:indice` | Bearer | mapa PNG da análise automática |
| DELETE | `/analises/:id` | Bearer | apaga a análise e seus mapas |
| GET | `/dashboard` | Bearer | indicadores do painel: totais, situação de cada talhão (análise do voo mais recente), talhões por risco, série mensal e últimas análises. Filtros: `id_propriedade`, `dias` (30, 90, 180 ou 365) |
| GET | `/monitoramentos` | Bearer | histórico paginado de análises. Filtros: `data_inicio`, `data_fim` (AAAA-MM-DD, pela data do voo), `id_propriedade`, `id_talhao`, `tipo_analise`, `nivel_risco`, `pagina`, `por_pagina` (máx. 50). Devolve `{ data, meta: { total, pagina, por_pagina, total_paginas } }` |

Autenticação: header `Authorization: Bearer <token>`, com JWT de curta duração (`ACCESS_TOKEN_MINUTOS`, padrão 15). A sessão continua por meio do cookie `httpOnly` `agrovision_renovacao` (`SameSite=Lax`, `Secure` em produção, restrito a `/api/v1/auth`). No banco fica só o hash SHA-256 desse token, que é trocado a cada renovação. Se um token já trocado for reutilizado, todas as sessões do usuário são encerradas. Com "manter conectado" a sessão dura `REFRESH_TOKEN_DIAS` (padrão 30); sem a opção, dura até fechar o navegador (máx. 1 dia).
As rotas de login/cadastro e de orçamento têm limite de tentativas por IP.
Cada usuário só enxerga os próprios dados: acessar o ID de outro usuário responde 404.

### Emails (recuperação de senha)

Com `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` no `.env`, os emails são enviados de verdade (nodemailer). Sem SMTP, **em desenvolvimento** o email aparece no terminal e é salvo em `backend/emails-enviados/` (fora do git), para abrir o link sem provedor de email. Em produção sem SMTP, o envio falha e um erro é registrado no log.

### Uploads e análise automática

- Os arquivos ficam em `UPLOAD_DIR` (padrão `backend/uploads/`, fora do git), com nomes aleatórios. O tipo é conferido pela extensão e pelo MIME, e o conteúdo é aberto com o `sharp` para recusar arquivos disfarçados.
- A análise automática calcula o **Índice de Excesso de Verde (ExG = 2g − r − b)** em cada pixel de fotos RGB. Ela classifica as áreas em vegetação vigorosa, atenção e pouca/nenhuma vegetação, e calcula a área afetada e o nível de risco. O método mede **cobertura vegetal**: não identifica pragas ou doenças, e o texto do resultado avisa isso ao usuário. Os limiares ficam em `src/modules/analises/indiceVerde.js`.

### Recomendações e relatórios

- As recomendações vêm de **regras versionadas** em `src/modules/relatorios/recomendacoes.js`, combinando nível de risco, tipo de análise e área afetada. A versão aparece no PDF, e a resposta sempre traz o aviso de que não é diagnóstico automático.
- O PDF (`pdfkit`) é montado a cada download, com identificação, risco, cobertura vegetal, resultado, recomendação e mapas. Como nada é guardado, não há arquivo desatualizado nem órfão.

## Organização

```
src/
  app.js, server.js
  config/        env.js (valida variáveis), prisma.js
  middlewares/   auth, validate (zod), rateLimit, upload (multer), errorHandler
  modules/       auth/, usuarios/, orcamentos/, propriedades/, talhoes/, voos/, imagens/, analises/, dashboard/, relatorios/
                 cada um: routes → controller → service (+ schemas)
  utils/         AppError, serializers, armazenamento (arquivos em disco)
prisma/          schema.prisma e migrations
test/            testes de integração (node:test)
```

Próximos passos (ver `PLANEJAMENTO_BACKEND.md`): login com Google, recuperação de senha e renovação de sessão.
