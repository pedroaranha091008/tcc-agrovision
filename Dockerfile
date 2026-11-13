# Imagem unica do AgroVision para hospedagem: o servidor Node entrega a API
# (/api/v1) e o site React compilado no mesmo endereco.
#
# Variaveis no provedor: ver DEPLOY.md. Arquivos enviados (fotos, mapas, PDFs)
# ficam em /data — monte um volume persistente nessa pasta.

# ─── 1. Site (React + Vite) ─────────────────────────────────────────────────
FROM node:22-bookworm-slim AS site
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# O Client ID do Google entra no build do site (e publico); vazio esconde o botao.
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_API_URL=/api/v1 \
    VITE_API_MOCK=false \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# ─── 2. Servidor (Express + Prisma) ─────────────────────────────────────────
FROM node:22-bookworm-slim
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
# Inclui as devDependencies: o CLI do Prisma roda as migrations ao subir.
RUN npm ci
COPY backend/ ./
# O generate nao conecta no banco, mas o prisma.config.ts exige a variavel.
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" npx prisma generate
COPY --from=site /app/frontend/dist /app/frontend/dist

ENV NODE_ENV=production \
    PORT=3000 \
    FRONTEND_DIST=/app/frontend/dist \
    UPLOAD_DIR=/data/uploads \
    REPORT_DIR=/data/relatorios
EXPOSE 3000

# Aplica as migrations pendentes e sobe o servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
