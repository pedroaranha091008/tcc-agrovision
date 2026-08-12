# Planejamento do Backend — AgroVision

## 1. Objetivo e estado atual

Este planejamento transforma as funcionalidades essenciais e opcionais do `specs.md` em etapas de implementação para o backend. Ele considera o diagnóstico do `RELATORIO_ANALISE.md` e o código atualmente versionado.

### O que já está pronto

- Projeto Node.js com Express 5 e módulos ES.
- Inicialização do servidor em `src/server.js`.
- Parsing de JSON e formulários URL-encoded.
- Rota `GET /` para verificar o funcionamento da API.
- Resposta JSON para rotas inexistentes.
- Prisma configurado com MariaDB/MySQL.
- Schema e migration inicial com `Usuario`, `Propriedade`, `Talhao`, `Voo` e `Analise`.
- Relacionamentos encadeados entre usuário, propriedade, talhão, voo e análise.

### O que falta

- Arquitetura interna para rotas, controllers, services, validações e middlewares.
- Autenticação por email/senha e Google.
- Autorização por proprietário dos dados.
- Operações reais de banco nas rotas.
- CRUD de propriedades, talhões e voos.
- Recebimento e armazenamento de imagens.
- Cadastro e consulta de análises e problemas encontrados.
- Dashboard, histórico, filtros, recomendações e relatórios PDF.
- Testes automatizados, documentação da API e coleção do Insomnia.

## 2. Arquitetura e contratos planejados

### Organização da aplicação

Adotar uma estrutura modular por domínio, separando:

- `routes`: definição de URLs, métodos e middlewares;
- `controllers`: entrada HTTP e formação da resposta;
- `services`: regras de negócio e acesso ao Prisma;
- `middlewares`: autenticação, autorização, validação, upload e erros;
- `schemas`: validação dos dados de entrada;
- `utils`: funções compartilhadas, incluindo relatórios e armazenamento.

Toda a API funcional deverá usar o prefixo `/api/v1`. A rota raiz poderá continuar como verificação simples de disponibilidade.

### Padrão de respostas

- Sucesso: `{ "data": ... }` e, em listas, `{ "data": [...], "meta": { ... } }`.
- Erro: `{ "error": { "code": "CODIGO", "message": "Mensagem", "details": [...] } }`.
- Usar códigos HTTP coerentes: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `413`, `415`, `422` e `500`.
- Datas serão transmitidas em ISO 8601; IDs continuarão como UUID; valores decimais serão normalizados como números nas respostas.

### Grupos de endpoints

| Grupo | Operações previstas |
|---|---|
| `/api/v1/auth` | cadastro, login, Google, renovação e encerramento de sessão |
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

- Evoluir `Usuario` para suportar senha opcional quando a conta for exclusivamente Google.
- Registrar provedor e identificador externo da conta social, garantindo unicidade.
- Criar entidade de imagem do voo com nome original, nome armazenado, MIME type, tamanho, URL/caminho, data e vínculo com `Voo`.
- Se necessário, acrescentar status de processamento ao voo ou análise para diferenciar `pendente`, `em_processamento`, `concluido` e `falhou`.
- Preservar os models existentes e criar migrations incrementais; não reescrever a migration inicial.

## 3. Fases de implementação

### Fase 1 — Fundação da API

- Separar o app em módulos sem alterar o comportamento atual da rota de status.
- Criar router principal em `/api/v1` e módulos por domínio.
- Configurar CORS com origens vindas do ambiente.
- Implementar validação de entrada e tratamento centralizado de erros.
- Criar erro de aplicação com código, status HTTP e detalhes seguros.
- Acrescentar scripts de execução, geração do Prisma Client e testes.
- Atualizar `.env.example` com porta, origens permitidas, segredos de autenticação, Google e armazenamento.

**Critério de conclusão:** servidor inicia, conecta ao banco, responde ao health check e retorna erros no formato padrão sem expor stack trace.

### Fase 2 — Autenticação e segurança

- Implementar cadastro com nome, email, senha e telefone opcional.
- Validar email único e senha com no mínimo oito caracteres.
- Armazenar somente hash da senha.
- Implementar login por email/senha e emissão de access token e refresh token.
- Implementar autenticação Google validando o token no servidor e vinculando contas pelo email.
- Criar middleware de autenticação e rota de perfil.
- Implementar renovação e encerramento de sessão.
- Aplicar limite de tentativas nas rotas de autenticação e evitar exposição de existência de contas.

**Critério de conclusão:** cadastro, login tradicional, login Google, renovação, logout e consulta do perfil funcionam; senhas nunca aparecem em respostas.

### Fase 3 — Propriedades, talhões e voos

- Implementar CRUD de propriedades autenticadas.
- Implementar CRUD de talhões somente dentro de propriedades do usuário.
- Implementar CRUD de voos somente dentro de talhões autorizados.
- Validar estado com duas letras, áreas não negativas, coordenadas válidas, GeoJSON válido e data do voo.
- Impedir leitura ou alteração de recursos pertencentes a outro usuário.
- Definir exclusão segura: recursos com dependentes devem retornar conflito até que a aplicação possua uma regra explícita de exclusão em cascata.
- Adicionar paginação, ordenação e filtros úteis às listagens.

**Critério de conclusão:** o fluxo propriedade → talhão → voo pode ser criado e consultado integralmente, com isolamento entre usuários.

### Fase 4 — Upload e análises

- Receber uma ou várias imagens por `multipart/form-data` em um voo autorizado.
- Aceitar inicialmente JPEG, PNG, TIFF e GeoTIFF, com limite de quantidade e tamanho configurável.
- Validar MIME type e extensão, gerar nome seguro e impedir execução de arquivos enviados.
- Usar diretório local fora de `src` no desenvolvimento e abstrair o serviço para permitir storage externo depois.
- Registrar os metadados de cada imagem no banco.
- Implementar listagem e exclusão controlada das imagens.
- Permitir registrar uma análise com tipo, risco, percentual afetado, resultado textual e arquivo resultante.
- Representar a identificação simples de problemas por meio do resultado, risco e percentual de área afetada, sem prometer classificação automática por IA.

**Critério de conclusão:** imagens válidas são armazenadas e vinculadas ao voo; análises podem ser registradas e recuperadas com seus resultados.

### Fase 5 — Dashboard e histórico

- Criar endpoint agregado com propriedades, área monitorada, voos, análises e distribuição por risco.
- Fornecer séries temporais para os gráficos do frontend.
- Criar histórico paginado de monitoramentos combinando voo, talhão, propriedade e análise.
- Permitir filtros por intervalo de data, propriedade/talhão e tipo de análise.
- Validar combinações de filtros e adotar paginação com limites máximos.

**Critério de conclusão:** o frontend consegue montar indicadores, gráficos, mapa/lista de talhões e tabela de relatórios sem dados fixos.

### Fase 6 — Relatórios e recomendações

- Gerar PDF para uma análise concluída, contendo identificação da propriedade e do talhão, voo, tipo, risco, área afetada, resultado e recomendação.
- Armazenar ou regenerar o relatório de maneira determinística e oferecer download autenticado.
- Implementar recomendações por regras versionadas conforme tipo de análise, risco e percentual afetado.
- Informar na resposta que a recomendação é baseada em regras, não em diagnóstico automático por IA.
- Tratar análises incompletas e falhas na geração sem deixar arquivos órfãos.

**Critério de conclusão:** uma análise autorizada produz PDF válido e recomendação coerente, acessíveis somente ao dono dos dados.

### Fase 7 — Qualidade e documentação

- Criar testes unitários para validações, regras de recomendação e autorização.
- Criar testes de integração para rotas usando banco isolado de testes.
- Cobrir autenticação, isolamento entre usuários, CRUD, filtros, upload e relatório.
- Produzir coleção do Insomnia com ambientes e exemplos por domínio.
- Documentar instalação, variáveis, migrations, execução, testes, upload e contrato de respostas.
- Adicionar logs mínimos de inicialização e erros, sem credenciais ou tokens.

**Critério de conclusão:** testes passam de forma reproduzível e todas as rotas do MVP podem ser exercitadas pela coleção e pela documentação.

## 4. Ordem de entrega e dependências

1. Fundação da API.
2. Autenticação e autorização.
3. Propriedades, talhões e voos.
4. Upload e análises.
5. Dashboard e histórico.
6. Relatórios e recomendações.
7. Testes finais e documentação.

O frontend depende do contrato de autenticação após a fase 2, do domínio agrícola após a fase 3, do upload após a fase 4 e dos formatos definitivos de dashboard e relatórios após as fases 5 e 6. Os contratos devem ser documentados antes da integração de cada módulo.

## 5. Plano de testes e aceite

- Cadastrar usuário e rejeitar email duplicado ou dados inválidos.
- Autenticar por senha e Google; rejeitar credenciais e tokens inválidos.
- Renovar e encerrar sessão sem reutilizar sessão revogada.
- Garantir que usuário A não consulte nem modifique dados do usuário B.
- Criar, listar, atualizar e excluir recursos sem dependências; rejeitar exclusão conflitante.
- Aceitar imagens permitidas e rejeitar tipo, tamanho ou voo inválido.
- Registrar análise e refletir seus valores no histórico e dashboard.
- Filtrar histórico por data, área e tipo de análise, incluindo resultados vazios.
- Gerar e baixar PDF válido somente com autenticação e autorização.
- Verificar respostas para banco indisponível, arquivo ausente e erro interno.

## 6. Fora do escopo atual e premissas

- IA para identificar pragas ou doenças, previsão de problemas, aplicativo mobile e integração direta com drones permanecem como roadmap futuro.
- A identificação inicial de problemas será manual ou baseada em resultados já fornecidos ao sistema.
- As recomendações serão determinísticas e baseadas em regras.
- Microsoft e Apple não fazem parte da autenticação atual; apenas email/senha e Google.
- O armazenamento local atende desenvolvimento; produção deverá configurar serviço persistente compatível com a abstração criada.
- O plano não define datas ou estimativas porque prazo e capacidade da equipe não foram informados.
