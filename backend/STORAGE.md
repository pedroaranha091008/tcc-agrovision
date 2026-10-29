# Arquivos no Supabase Storage — plano gratuito

O frontend permanece na Hostinger, a API no Render e os registros no MySQL.
O Supabase e usado somente para imagens enviadas e PDFs gerados. Nao e necessario migrar o banco nem usar Supabase Auth.

## Limites consultados em 29/10/2026

O plano Free inclui 1 GB de arquivos, 5 GB de egress sem cache e 5 GB de egress com cache por mes,
com limite de 50 MB por arquivo no plano. A aplicacao conserva seu limite de 25 MB por imagem.
O download privado via backend consome trafego do Supabase e do Render; monitore o painel Usage.
O plano gratuito pode pausar projetos com baixa atividade por um periodo de 7 dias. Confira o projeto antes das demonstracoes.
Nao e armazenamento ilimitado: ao atingir quotas, reveja o uso/remova arquivos dispensaveis pela aplicacao ou avalie outro plano.
Mantenha uma copia dos arquivos importantes. Nao habilite um plano pago para executar este guia.

Fontes: [precos](https://supabase.com/pricing), [egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress),
[pausa de projetos](https://supabase.com/docs/guides/platform/free-project-pausing).

## 1. Criar o projeto e o bucket

1. Acesse https://supabase.com/dashboard e crie um projeto em uma organizacao Free.
2. O Supabase pode solicitar senha para o PostgreSQL do proprio projeto: ela NAO e a senha MySQL nem a chave usada nesta integracao.
3. Em Storage, crie um bucket chamado `agrovision-arquivos`.
4. Deixe **Public bucket desativado**. Nao crie politicas que permitam acesso anonimo aos objetos.
5. Se configurar limite no bucket, use pelo menos 25 MB para preservar o limite atual da aplicacao.
6. Se restringir MIME types, permita `image/jpeg`, `image/png`, `image/tiff` e `application/pdf`.

As pastas `imagens/` e `relatorios/` sao criadas como prefixos automaticamente. Nao precisa cria-las manualmente.
O projeto/bucket nao sao criados pelo codigo da aplicacao.

## 2. Obter as credenciais

No dialogo Connect/configuracoes do projeto, copie a Project URL.
Em Settings > API Keys, obtenha uma **Secret key** (`sb_secret_...`).
Ela permite acesso administrativo ao storage: guarde apenas no ambiente do backend.
Nao use publishable/anon key; nao coloque a chave em `VITE_*`, GitHub, frontend ou mensagens de chat.

Referencia: [chaves Supabase](https://supabase.com/docs/guides/api/api-keys).

## 3. Configurar o Render

Em Environment do Web Service do backend, adicione:

```dotenv
STORAGE_PROVIDER=supabase
SUPABASE_URL=<PROJECT_URL_HTTPS_COPIADA_DO_SUPABASE>
SUPABASE_SECRET_KEY=<SECRET_KEY_DO_PROJETO>
SUPABASE_STORAGE_BUCKET=agrovision-arquivos
```

Substitua os campos entre `<...>`. Use a URL base do projeto, sem `/storage/v1`.
Salve e faca deploy manualmente da versao do backend com esta integracao.
Os comandos continuam:

```text
Root Directory: backend
Build Command: npm ci --include=dev && npm run prisma:generate
Start Command: npm start
```

Nao adicione Persistent Disk. `UPLOAD_DIR` e `REPORT_DIR` nao sao usados para novas gravacoes no modo Supabase.
Se ja existir disco ou arquivos locais importantes, nao os remova antes de fazer backup/migrar.
As variaveis MySQL, JWT, CORS e Google permanecem como antes. O frontend nao recebe credenciais Supabase e nao precisa mudar por esta integracao.

## 4. Desenvolvimento e testes

Para continuar salvando no computador:

```dotenv
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
REPORT_DIR=./relatorios
```

Para testar com Supabase localmente, use as quatro variaveis do Render no `backend/.env` e reinicie o servidor.
Os testes unitarios usam doubles do SDK e pastas temporarias; nao enviam dados ao seu projeto Supabase.

```bash
cd backend
npm ci --include=dev
npm run prisma:generate
npm test
npm start
```

## 5. Validacao apos configurar a conta

1. Entre na aplicacao com uma conta de teste e crie/abra um voo.
2. Envie JPEG, PNG ou TIFF de teste e confirme o objeto em `imagens/` no painel Storage.
3. Gere um relatorio de uma analise concluida e confira `relatorios/`.
4. Baixe o PDF pela aplicacao e confirme que abre normalmente.
5. Confirme que o download sem login e recusado; outra conta nao deve obter o relatorio.
6. Faca um redeploy do Render. Liste as imagens e baixe novamente o PDF.
7. Exclua uma imagem e um relatorio de teste pela aplicacao e confirme a remocao no bucket e na listagem.
8. Consulte Usage e logs. `/health` nao verifica Supabase; esses testes de gravacao/leitura sao necessarios.

## Como funciona e arquivos anteriores

- O navegador envia o upload autenticado para a API; a API envia os bytes ao bucket privado.
- O MySQL armazena referencias como `supabase://agrovision-arquivos/imagens/<nome>`, nao URLs publicas nem chaves.
- PDFs sao gerados em memoria e enviados ao bucket; o download verifica a posse do relatorio antes de buscar os bytes.
- Em falha do Supabase, a operacao falha explicitamente; nao ha fallback silencioso para o disco efemero.
- Nao ha nova migration: os campos existentes de caminho continuam sendo strings.
- Registros antigos com caminho local nao sao convertidos automaticamente. Eles so funcionam enquanto o arquivo e o diretorio local original existirem.
  Antes de descartar o ambiente anterior, copie os arquivos e migre suas referencias com backup, ou reenvie imagens/regenere PDFs pela aplicacao.
- Nao exclua objetos manualmente no painel sem reconciliar seus registros MySQL; prefira a exclusao pela aplicacao.
- A interface atual lista os metadados das imagens; esta mudanca de armazenamento nao adiciona uma galeria publica.

Integracao preparada localmente; a validacao com um projeto real depende da configuracao acima. Nenhum recurso remoto e criado automaticamente.
