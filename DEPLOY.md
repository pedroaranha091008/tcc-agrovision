# Publicar o AgroVision na internet

O `Dockerfile` da raiz gera **um único serviço**: o servidor Node entrega a API (`/api/v1`) e o site React
no mesmo endereço. Ao subir, ele aplica as migrations do banco sozinho.

O serviço precisa de três coisas:

1. um banco **MySQL 8** ou MariaDB;
2. um **disco permanente** montado em `/data`, onde ficam as fotos, os mapas e os PDFs (sem ele, tudo some a cada nova versão);
3. as **variáveis de ambiente** da tabela abaixo.

## Railway (recomendado)

1. Crie uma conta em <https://railway.com> entrando com o GitHub que tem acesso ao repositório.
2. **New Project → Deploy from GitHub repo** → escolha `tcc-agrovision`.
   - Em *Settings → Source*, escolha a branch publicada (por enquanto `finalizacao`; depois do merge, `main`).
   - O Railway encontra o `Dockerfile` da raiz sozinho.
3. No projeto, **+ New → Database → MySQL**.
4. No serviço do site, **+ New → Volume** (ou clique com o botão direito no serviço → *Attach volume*), com o caminho de montagem `/data`.
5. No serviço do site, em *Variables*, cadastre as variáveis da tabela abaixo.
6. Em *Settings → Networking*, clique em **Generate Domain**. O site fica em `https://<nome>.up.railway.app`.
7. Abra `https://<endereço>/api/v1/health`. A resposta deve ser `{"data":{"status":"ok","banco":"ok",...}}`.

Para gerar os segredos, rode `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` uma vez para cada um.

## Variáveis de ambiente

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `${{MySQL.MYSQL_URL}}` no Railway (referência ao banco); em outro provedor, `mysql://usuario:senha@host:3306/banco` |
| `JWT_ACCESS_SECRET` | segredo aleatório (comando acima) |
| `REFRESH_SECRET` | outro segredo aleatório, diferente do primeiro |
| `FRONTEND_URL` | endereço público, ex.: `https://agrovision.up.railway.app` (vai nos emails de redefinição de senha) |
| `CORS_ORIGINS` | o mesmo endereço público |
| `GOOGLE_CLIENT_ID` | opcional: Client ID do Google para o botão "Entrar com Google" |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | opcionais, mas sem eles o "Esqueci a senha" não envia email (ex.: Gmail: `smtp.gmail.com`, `465`, o email e uma [senha de app](https://myaccount.google.com/apppasswords)) |

O `Dockerfile` já define `NODE_ENV=production`, `PORT=3000`, `UPLOAD_DIR=/data/uploads` e `REPORT_DIR=/data/relatorios`.

**Login com Google:** o Client ID também precisa entrar na compilação do site. No Railway, crie a variável
`VITE_GOOGLE_CLIENT_ID` com o mesmo valor; ela é repassada ao build como `ARG`. No Google Cloud Console,
cadastre o endereço público em *Authorized JavaScript origins*.

## Atualizar

Cada `git push` na branch configurada gera uma nova versão automaticamente. O banco e o volume `/data` continuam
como estavam, e as migrations novas rodam ao subir.

## Rodar a imagem localmente (opcional)

```bash
docker build -t agrovision .
docker run -p 3000:3000 -v agrovision-dados:/data \
  -e DATABASE_URL="mysql://usuario:senha@host.docker.internal:3306/agrovision_main" \
  -e JWT_ACCESS_SECRET=troque -e REFRESH_SECRET=troque2 \
  -e FRONTEND_URL=http://localhost:3000 -e CORS_ORIGINS=http://localhost:3000 \
  agrovision
```
