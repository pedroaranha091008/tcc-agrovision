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

O frontend roda sozinho, sem o backend, em **modo mock** (`VITE_API_MOCK=true` no `.env` já vem assim): um
backend simulado em memória/`localStorage` reproduz o contrato real da API, o suficiente para demonstrar toda
a aplicação — cadastro, login, propriedades, talhões, voos, upload de imagens, análises, dashboard, histórico
e relatórios.

```bash
cd frontend
npm install
npm run dev
```

Para rodar com o backend real (necessário para persistência de verdade e para gerar o PDF definitivo):

```bash
# 1. Backend — precisa de um MySQL/MariaDB acessível
cd backend
npm install
cp .env.example .env      # preencha com as credenciais do seu banco
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
