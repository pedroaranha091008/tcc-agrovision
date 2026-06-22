# Prompt para Análise Técnica e Avaliativa de Repositórios — AV2 PIS

## INSTRUÇÕES OBRIGATÓRIAS

1. **NÃO escreva, modifique, complete, refatore ou sugira nenhuma linha de código.**
2. **NÃO crie, altere, mova ou exclua arquivos**, com exceção do relatório final solicitado neste prompt.
3. **Apenas leia e analise os arquivos já existentes no repositório.**
4. Não instale dependências, não execute migrations e não realize comandos que alterem o projeto, o banco de dados ou o ambiente.
5. Você pode executar apenas comandos de leitura e inspeção, quando necessários para compreender o repositório.
6. Não exponha senhas, tokens, chaves de API, strings de conexão ou outros dados sensíveis encontrados no projeto.
7. Avalie somente o que puder ser comprovado por evidências presentes no repositório.
8. Quando um critério depender de demonstração externa, acesso ao GitHub, banco de produção, apresentação oral ou outro elemento que não esteja disponível no repositório, registre como **“NÃO VERIFICÁVEL PELO REPOSITÓRIO”**.
9. Sua resposta final deve ser o arquivo `RELATORIO_ANALISE.md`, criado na raiz do projeto.
10. O arquivo final deve conter apenas o relatório, sem mensagens adicionais.

---

## TAREFA

Analise todo o código-fonte e os arquivos de configuração relevantes deste repositório.

Produza um relatório técnico completo e uma avaliação baseada nos critérios da **AV2 — Projeto Integrado de Sistemas (PIS), 2º Bimestre — Estruturação inicial do projeto e início do desenvolvimento**.

A análise deve verificar principalmente:

- organização do repositório;
- qualidade e completude do `README.md`;
- estrutura do frontend e do backend;
- criação e modelagem do banco de dados;
- configuração e uso do Prisma ORM;
- existência e organização das rotas da API;
- arquivo exportado do Insomnia;
- desenvolvimento inicial do frontend com React, JavaScript e Tailwind;
- conexão inicial entre frontend e backend;
- relação entre o que está implementado e o MVP descrito no projeto.

Não presuma que uma funcionalidade está pronta apenas porque existe um arquivo com determinado nome. Verifique o conteúdo e as conexões entre os arquivos.

---

# ESTRUTURA OBRIGATÓRIA DO RELATÓRIO

# 📊 Relatório de Análise do Projeto

## 1. 🏗️ Identificação e visão geral

- **Nome do projeto:** [inferido do README, package.json ou estrutura]
- **Objetivo identificado:** [descrição ou “NÃO IDENTIFICADO”]
- **Problema que o sistema pretende resolver:** [descrição ou “NÃO IDENTIFICADO”]
- **Funcionalidades do MVP descritas:** [lista ou “NÃO IDENTIFICADO”]
- **Tecnologias principais:**
  - [tecnologia]
- **Linguagens utilizadas:**
  - [linguagem]

### Evidências consultadas

- `[caminho/do/arquivo]` — [informação encontrada]

---

## 2. 📂 Organização do repositório

Apresente uma visão organizada da hierarquia principal do projeto, sem listar pastas geradas ou dependências instaladas, como:

- `node_modules`;
- `.git`;
- `dist`;
- `build`;
- `.next`;
- pastas de cache.

```text
[árvore resumida das pastas e arquivos principais]
```

### Responsabilidade das pastas

- `[pasta]` — [responsabilidade]
- `[pasta]` — [responsabilidade]

### Análise da organização

- Separação entre frontend e backend: [adequada/parcial/ausente/não aplicável]
- Nomes de pastas e arquivos: [análise]
- Arquivos de configuração: [análise]
- Organização mínima do projeto: [análise]

---

## 3. 📘 README e documentação inicial

**Localização:** `[caminho]` ou **NÃO IDENTIFICADO**

Verifique se o README apresenta:

| Item esperado | Situação | Evidência |
|---|---|---|
| Nome do projeto | [Atende/Parcial/Não atende] | `[arquivo/trecho]` |
| Problema que o sistema resolve | [Atende/Parcial/Não atende] | `[arquivo/trecho]` |
| Objetivo do projeto | [Atende/Parcial/Não atende] | `[arquivo/trecho]` |
| Funcionalidades do MVP | [Atende/Parcial/Não atende] | `[arquivo/trecho]` |
| Tecnologias utilizadas | [Atende/Parcial/Não atende] | `[arquivo/trecho]` |
| Instruções para execução local | [Atende/Parcial/Não atende] | `[arquivo/trecho]` |
| Divisão entre frontend, backend e banco | [Atende/Parcial/Não atende] | `[arquivo/trecho]` |

### Histórico de commits e participação

- Histórico disponível para análise: [Sim/Não]
- Participação dos integrantes identificável: [Sim/Não/Parcial]
- Evidências: [descrição]

> Não atribua autoria individual sem evidências disponíveis no histórico do repositório.

### Professor como colaborador

**Situação:** NÃO VERIFICÁVEL PELO REPOSITÓRIO

---

## 4. ⚙️ Backend

- **Localização:** `[caminho da pasta]` ou **NÃO IDENTIFICADO**
- **Linguagem:** [linguagem]
- **Framework principal:** [framework]
- **Arquivo de inicialização:** `[caminho]`
- **Servidor configurado:** [Sim/Não/Parcial]

### Estrutura identificada

- `[arquivo ou pasta]` — [responsabilidade]
- `[arquivo ou pasta]` — [responsabilidade]

### Organização interna

Verifique a existência e o uso real de estruturas como:

- rotas;
- controllers;
- services;
- middlewares;
- configuração do banco;
- validações;
- tratamento de erros.

### Funcionalidades implementadas

- [funcionalidade comprovada] — Evidência: `[caminho]`
- [funcionalidade comprovada] — Evidência: `[caminho]`

### Fluxo das requisições

Descreva, com base no código existente:

```text
requisição → rota → controller/função → Prisma → banco de dados → resposta JSON
```

Caso esse fluxo não esteja completo, indique exatamente onde ele é interrompido.

---

## 5. 🗄️ Banco de dados e Prisma ORM

- **Tipo de banco:** [MySQL/PostgreSQL/SQLite/NoSQL/Outro/NÃO IDENTIFICADO]
- **ORM:** [Prisma/Outro/NÃO IDENTIFICADO]
- **Configuração principal:** `[caminho]`
- **Schema Prisma:** `[caminho]` ou **NÃO IDENTIFICADO**
- **Migrations:** [Sim/Não]
- **Localização das migrations:** `[caminho]` ou **NÃO IDENTIFICADO**

### Models ou entidades identificadas

- `[model]` — [finalidade e campos principais]
- `[model]` — [finalidade e campos principais]

### Modelagem

Verifique:

| Elemento | Situação | Evidência |
|---|---|---|
| Models principais definidos | [Atende/Parcial/Não atende] | `[caminho]` |
| Chaves primárias | [Atende/Parcial/Não atende] | `[caminho]` |
| Chaves estrangeiras e relações | [Atende/Parcial/Não atende/Não aplicável] | `[caminho]` |
| Campos coerentes com o domínio | [Atende/Parcial/Não atende] | `[caminho]` |
| Prisma Client utilizado no backend | [Atende/Parcial/Não atende] | `[caminho]` |
| Operação real de banco em rota/controller | [Atende/Parcial/Não atende] | `[caminho]` |

### Operações Prisma encontradas

- `findMany`, `findUnique` ou equivalente: [arquivos]
- `create`: [arquivos]
- `update`: [arquivos]
- `delete`: [arquivos]
- Outras operações: [arquivos]

### Banco no servidor de produção

A existência de arquivos de configuração pode indicar uma preparação para conexão, mas não comprova que o banco foi efetivamente criado no servidor.

**Situação:** [COMPROVADO POR EVIDÊNCIA / PARCIALMENTE EVIDENCIADO / NÃO VERIFICÁVEL PELO REPOSITÓRIO]

Não revele o conteúdo de variáveis sensíveis.

---

## 6. 🌐 Rotas da API e arquivo do Insomnia

### Rotas encontradas no backend

| Método | Endpoint | Arquivo | Operação realizada | Usa Prisma |
|---|---|---|---|---|
| `[GET/POST/etc.]` | `[rota]` | `[caminho]` | [descrição] | [Sim/Não] |

### Adequação das rotas

Analise:

- uso adequado dos métodos HTTP;
- organização por funcionalidade;
- clareza dos nomes;
- existência de parâmetros;
- recebimento de JSON;
- respostas em JSON;
- relação com as funcionalidades essenciais do MVP.

### Arquivo exportado do Insomnia

- **Arquivo encontrado:** `[caminho]` ou **NÃO IDENTIFICADO**
- **Formato:** [JSON/YAML/Outro]
- **Rotas organizadas por funcionalidade:** [Sim/Parcial/Não]
- **Nomes claros nas requisições:** [Sim/Parcial/Não]
- **Exemplos de corpo JSON:** [Sim/Parcial/Não]
- **Parâmetros e variáveis configurados:** [Sim/Parcial/Não]
- **Compatibilidade com as rotas do backend:** [Sim/Parcial/Não]

Não considere arquivos genéricos, vazios ou sem as requisições do projeto como entrega completa.

---

## 7. 🎨 Frontend

- **Localização:** `[caminho]` ou **NÃO IDENTIFICADO**
- **Framework:** [React/Outro]
- **Linguagem:** [JavaScript/TypeScript/Outra]
- **Ferramenta de criação/build:** [Vite/CRA/Outra]
- **Tailwind CSS:** [Configurado/Parcial/Ausente]
- **Roteamento:** [biblioteca ou NÃO IDENTIFICADO]

### Arquivos principais

- `[arquivo]` — [responsabilidade]
- `[arquivo]` — [responsabilidade]

### Páginas e componentes

- `[componente/página]` — [finalidade]
- `[componente/página]` — [finalidade]

### Análise do desenvolvimento inicial

Verifique:

| Elemento | Situação | Evidência |
|---|---|---|
| Projeto React iniciado | [Atende/Parcial/Não atende] | `[caminho]` |
| Uso de JavaScript | [Atende/Parcial/Não atende] | `[caminho]` |
| Tailwind configurado ou utilizado | [Atende/Parcial/Não atende] | `[caminho]` |
| Telas principais iniciadas | [Atende/Parcial/Não atende] | `[caminho]` |
| Componentes organizados | [Atende/Parcial/Não atende] | `[caminho]` |
| Navegação entre páginas | [Atende/Parcial/Não atende/Não aplicável] | `[caminho]` |
| Tela conectada ou preparada para API | [Atende/Parcial/Não atende] | `[caminho]` |

O uso de TypeScript não deve gerar bônus e pode ser registrado apenas como divergência em relação à orientação da atividade.

---

## 8. 🔗 Conexão entre frontend e backend

- **Tipo de comunicação:** [REST/GraphQL/WebSocket/Outro/NÃO IDENTIFICADO]
- **Cliente HTTP:** [Axios/Fetch/Outro/NÃO IDENTIFICADO]
- **Arquivo de configuração da API:** `[caminho]` ou **NÃO IDENTIFICADO**
- **URL base:** [valor sem dados sensíveis e arquivo onde foi encontrada]
- **Variáveis de ambiente:** [arquivos encontrados]
- **CORS no backend:** [Configurado/Parcial/Ausente]
- **Proxy no frontend:** [Configurado/Ausente/Não aplicável]

### Endpoints consumidos pelo frontend

| Endpoint | Método | Componente ou página | Finalidade | Compatível com o backend |
|---|---|---|---|---|
| `[endpoint]` | `[método]` | `[caminho]` | [descrição] | [Sim/Não/Parcial] |

### Fluxos comprovados

- [Ex.: tela lista dados recebidos de uma rota GET]
- [Ex.: formulário envia dados para uma rota POST]

### Estado da integração

Classifique como:

- **Atende:** há uma comunicação identificável e coerente entre frontend e backend;
- **Parcial:** há preparação ou chamadas incompletas, incompatíveis ou sem fluxo completo;
- **Não atende:** não foi identificada comunicação entre as camadas.

Apresente as evidências que justificam a classificação.

---

## 9. ✅ O que já está implementado

### Backend

- [item comprovado]
- [item comprovado]

### Banco de dados

- [item comprovado]
- [item comprovado]

### Frontend

- [item comprovado]
- [item comprovado]

### Integração

- [item comprovado]
- [item comprovado]

Não liste como implementado algo que exista apenas como comentário, protótipo desconectado, arquivo vazio ou função sem uso.

---

## 10. 🚧 O que está incompleto ou em desenvolvimento

- [item]
  - **Evidência:** `[caminho]`
  - **Estado observado:** [descrição objetiva]

- [item]
  - **Evidência:** `[caminho]`
  - **Estado observado:** [descrição objetiva]

Não escreva soluções, trechos de código ou instruções de correção. Apenas descreva o estado encontrado.

---

## 11. 📦 Dependências principais

### Backend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `[pacote]` | `[versão]` | [finalidade] |

### Frontend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `[pacote]` | `[versão]` | [finalidade] |

Diferencie dependências de produção e desenvolvimento quando essa informação estiver disponível.

---

## 12. 🧭 Arquitetura e padrões identificados

- **Arquitetura predominante:** [MVC/camadas/estrutura simples/outra/NÃO IDENTIFICADO]
- **Separação de responsabilidades:** [análise]
- **Padrões identificados:** [descrição]
- **Consistência entre os módulos:** [análise]

Esta seção deve descrever somente padrões observados. Não proponha refatorações.

---

# 13. 📝 Avaliação conforme os critérios da AV2

## Regras de pontuação

Para cada critério:

1. Utilize apenas evidências encontradas no repositório.
2. Atribua uma pontuação entre zero e o valor máximo do critério.
3. Pontuações parciais são permitidas.
4. Justifique objetivamente cada nota.
5. Não desconte pontos por itens que o documento da atividade informa que não são obrigatórios nesta etapa, como:
   - sistema completo;
   - todas as funcionalidades do MVP;
   - autenticação;
   - login funcional;
   - hash de senhas;
   - autorização por tipo de usuário;
   - layout finalizado;
   - deploy completo;
   - documentação final do TCC;
   - uso de TypeScript.
6. Quando parte do critério não puder ser verificada no repositório, separe:
   - a parte comprovada;
   - a parte não verificável.
7. Não atribua pontuação automática a algo apenas porque há um arquivo com o nome esperado.

## Quadro avaliativo

| Critério | Valor máximo | Nota atribuída | Evidências e justificativa |
|---|---:|---:|---|
| Organização do repositório, README e professor como colaborador | 1,5 | [nota] | [justificativa; colaboração deve ser marcada como não verificável] |
| Banco de dados criado e coerente com o MVP | 2,0 | [nota] | [justificativa] |
| Arquivo exportado do Insomnia com as rotas organizadas | 1,5 | [nota] | [justificativa] |
| Backend iniciado com integração ao banco usando Prisma ORM | 2,0 | [nota] | [justificativa] |
| Frontend iniciado em React, JavaScript e Tailwind | 1,5 | [nota] | [justificativa] |
| Conexão inicial entre frontend e backend | 1,0 | [nota] | [justificativa] |
| Clareza na apresentação e divisão de tarefas do grupo | 0,5 | [nota ou “NÃO VERIFICÁVEL”] | [justificativa] |
| **Total verificável no repositório** | **10,0** | **[total]** | |

### Observação sobre o total

Caso algum critério não possa ser avaliado integralmente pelo repositório, informe também:

- **Pontuação obtida nos itens verificáveis:** [valor]
- **Pontos dependentes de apresentação ou verificação externa:** [valor]
- **Nota máxima que pode ser confirmada apenas pelo repositório:** [valor]

Não transforme automaticamente um item não verificável em nota zero. Deixe explícito que a decisão final depende da apresentação ou de verificação externa pelo professor.

---

## 14. 📌 Síntese por critério

### 14.1 Organização do repositório e README — máximo 1,5

- **Situação:** [Atende/Parcial/Não atende]
- **Evidências:** [arquivos]
- **Aspectos comprovados:** [descrição]
- **Aspectos ausentes:** [descrição]
- **Aspectos não verificáveis:** professor como colaborador, quando não houver acesso a essa informação.
- **Nota sugerida:** [nota]/1,5

### 14.2 Banco de dados e coerência com o MVP — máximo 2,0

- **Situação:** [Atende/Parcial/Não atende]
- **Evidências:** [schema, migrations, SQL, README etc.]
- **Models/tabelas principais:** [descrição]
- **Coerência com o MVP:** [descrição]
- **Criação no servidor de produção:** [Comprovada/Não comprovada/Não verificável]
- **Nota sugerida:** [nota]/2,0

### 14.3 Insomnia e organização das rotas — máximo 1,5

- **Situação:** [Atende/Parcial/Não atende]
- **Evidências:** [arquivo]
- **Organização das requisições:** [descrição]
- **Compatibilidade com o backend:** [descrição]
- **Nota sugerida:** [nota]/1,5

### 14.4 Backend com Prisma ORM — máximo 2,0

- **Situação:** [Atende/Parcial/Não atende]
- **Evidências:** [arquivos]
- **Servidor Node.js/Express:** [descrição]
- **Prisma configurado:** [descrição]
- **Operação no banco:** [descrição]
- **Resposta em JSON:** [descrição]
- **Nota sugerida:** [nota]/2,0

### 14.5 Frontend com React, JavaScript e Tailwind — máximo 1,5

- **Situação:** [Atende/Parcial/Não atende]
- **Evidências:** [arquivos]
- **React iniciado:** [descrição]
- **JavaScript:** [descrição]
- **Tailwind:** [descrição]
- **Telas e componentes:** [descrição]
- **Nota sugerida:** [nota]/1,5

### 14.6 Conexão frontend-backend — máximo 1,0

- **Situação:** [Atende/Parcial/Não atende]
- **Evidências:** [arquivos]
- **Fluxo identificado:** [descrição]
- **Compatibilidade das rotas e dados:** [descrição]
- **Nota sugerida:** [nota]/1,0

### 14.7 Apresentação e divisão de tarefas — máximo 0,5

- **Situação:** [Comprovável/Parcialmente comprovável/Não verificável]
- **Evidências no repositório:** [commits, documentação ou “NÃO IDENTIFICADO”]
- **O que precisa ser verificado na apresentação:** [descrição]
- **Nota sugerida:** [nota ou “A DEFINIR”]/0,5

---

## 15. 🔍 Pontos para verificação durante a apresentação

Liste perguntas ou verificações que o professor poderá realizar presencialmente, sem fornecer respostas aos alunos.

- [verificação relacionada ao funcionamento de uma rota]
- [verificação relacionada ao Prisma]
- [verificação relacionada ao banco de produção]
- [verificação relacionada ao frontend]
- [verificação relacionada à integração]
- [verificação relacionada à participação dos integrantes]

As perguntas devem se basear exclusivamente no projeto analisado e nas inconsistências ou pontos não comprovados encontrados.

---

## 16. 📋 Conclusão

Apresente uma síntese objetiva contendo:

- nível atual de estruturação do projeto;
- partes comprovadamente funcionais;
- partes iniciadas, mas incompletas;
- entregáveis não encontrados;
- itens que dependem de demonstração;
- nota sugerida com base apenas nas evidências disponíveis.

Não escreva código e não apresente instruções técnicas de implementação.

---

# REGRAS DE EXECUÇÃO

1. Leia todos os arquivos relevantes para cada seção.
2. Ignore arquivos gerados automaticamente e dependências instaladas, salvo quando forem necessários para identificar configurações.
3. Analise arquivos ocultos relevantes, como `.gitignore` e `.env.example`.
4. Não exponha o conteúdo de `.env` ou outros arquivos com credenciais.
5. Utilize caminhos precisos, como `backend/src/controllers/UsuarioController.js`.
6. Quando algo não for encontrado, escreva **“NÃO IDENTIFICADO”**.
7. Quando algo não puder ser confirmado somente pela análise do repositório, escreva **“NÃO VERIFICÁVEL PELO REPOSITÓRIO”**.
8. Diferencie claramente:
   - arquivo existente;
   - configuração existente;
   - funcionalidade parcialmente implementada;
   - funcionalidade integrada;
   - funcionalidade comprovadamente utilizada.
9. Não escreva sugestões de código.
10. Não inclua exemplos de implementação.
11. Não altere nenhum arquivo do projeto, exceto o relatório final.
12. Ao final, crie `RELATORIO_ANALISE.md` na raiz do projeto.
13. O arquivo deve conter apenas o relatório.
14. Não apresente comentários fora do arquivo.

---

# COMANDO FINAL

Execute a análise completa do repositório conforme as regras e os critérios avaliativos apresentados.

Crie o arquivo `RELATORIO_ANALISE.md` na raiz do projeto.

**NÃO ESCREVA, MODIFIQUE OU SUGIRA CÓDIGO. APENAS LEIA, ANALISE, AVALIE E RELATE.**
