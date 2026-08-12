# Planejamento do Frontend — AgroVision

## 1. Objetivo e estado atual

Este planejamento transforma as funcionalidades essenciais e opcionais do `specs.md` em etapas de implementação para o frontend. Ele usa como base o diagnóstico do `RELATORIO_ANALISE.md`, a interface atual e os contratos esperados do backend.

### O que já está pronto

- Projeto React 18 com Vite, TypeScript e Tailwind CSS.
- Landing page institucional responsiva.
- Telas visuais de login e cadastro.
- Dashboard com cards, mapa ilustrativo, gráficos e tabela.
- Formulário de contato com confirmação local.
- Componentes de interface baseados em Radix/shadcn.
- Recharts para visualização dos indicadores.

### O que falta

- Separação do `App.tsx` em páginas, layouts, componentes e módulos.
- Roteamento real por URL e proteção de páginas autenticadas.
- Cliente HTTP e configuração da URL da API.
- Cadastro, login, Google, sessão e logout reais.
- Telas funcionais para propriedades, talhões, voos e análises.
- Upload de imagens captadas por drone.
- Dashboard e histórico alimentados pelo backend.
- Filtros, recomendações e download de relatórios.
- Estados de carregamento, vazio e erro consistentes.
- Testes automatizados de componentes e fluxos.

## 2. Arquitetura e interfaces planejadas

### Organização da aplicação

Manter TypeScript e reorganizar o código por responsabilidade:

- `pages`: páginas ligadas às rotas;
- `layouts`: estrutura pública e estrutura autenticada;
- `features`: autenticação, propriedades, talhões, voos, análises, dashboard e relatórios;
- `components`: componentes compartilhados e componentes de UI existentes;
- `services`: cliente HTTP e chamadas por domínio;
- `hooks`: sessão, consultas e comportamentos reutilizáveis;
- `types`: contratos de dados da API;
- `utils`: formatação de datas, áreas, percentuais e erros.

### Rotas previstas

| Rota | Acesso | Finalidade |
|---|---|---|
| `/` | público | landing page |
| `/login` | público | login tradicional e Google |
| `/cadastro` | público | criação de conta |
| `/dashboard` | autenticado | visão geral da plantação |
| `/propriedades` | autenticado | lista e cadastro de propriedades |
| `/propriedades/:id` | autenticado | detalhes, talhões e indicadores da propriedade |
| `/talhoes/:id` | autenticado | detalhes e voos do talhão |
| `/voos/:id` | autenticado | imagens e análises do voo |
| `/analises` | autenticado | histórico e filtros |
| `/analises/:id` | autenticado | resultado, risco e recomendação |
| `/relatorios` | autenticado | relatórios disponíveis |
| `*` | público | página não encontrada |

### Integração com a API

- Configurar a base URL por `VITE_API_URL`.
- Centralizar requisições, serialização, cabeçalhos e interpretação de erros.
- Compartilhar tipos de resposta no frontend sem duplicar dados simulados.
- Implementar cancelamento de requisições obsoletas e impedir envios duplicados.
- Usar os formatos `{ data, meta }` e `{ error }` definidos pelo backend.
- Manter sessão de forma segura conforme o mecanismo final do backend; dados sensíveis não devem ser gravados livremente em `localStorage`.

## 3. Fases de implementação

### Fase 1 — Reorganização e roteamento

- Extrair da aplicação atual as páginas Home, Login, Cadastro e Dashboard.
- Separar seções da landing page e componentes específicos do dashboard.
- Adotar React Router para URLs reais e navegação pelo histórico do navegador.
- Criar layouts público e autenticado.
- Criar rota 404 e redirecionamentos previsíveis.
- Preservar a identidade visual, responsividade e conteúdo institucional já existente.
- Remover da navegação autenticada itens sem implementação prevista, como agendamentos, ou marcá-los claramente como futuros sem criar fluxo falso.

**Critério de conclusão:** todas as páginas atuais abrem por URL, recarregam corretamente e não dependem do estado `page` do componente raiz.

### Fase 2 — Cliente HTTP e autenticação

- Criar configuração de ambiente e cliente da API.
- Implementar provider/hook de autenticação com carregamento inicial da sessão.
- Integrar cadastro por email e senha, incluindo confirmação de senha no cliente.
- Integrar login tradicional e substituir os `setTimeout` simulados.
- Implementar botão de login Google pelo fluxo compatível com o backend.
- Implementar logout e proteção das rotas privadas.
- Remover Microsoft e Apple da interface atual, pois não constam no escopo.
- Mostrar mensagens específicas para credenciais inválidas, email duplicado, sessão expirada e indisponibilidade da API.
- Redirecionar usuários autenticados para o dashboard e preservar a rota originalmente solicitada.

**Critério de conclusão:** cadastro, login tradicional, Google, restauração de sessão e logout funcionam contra a API real.

### Fase 3 — Propriedades, talhões e voos

- Criar listagem, cadastro, edição, detalhes e exclusão de propriedades.
- Criar gestão de talhões dentro de uma propriedade.
- Criar gestão de voos dentro de um talhão.
- Validar formulários conforme o contrato do backend: nomes obrigatórios, UF, áreas, coordenadas, cultura e datas.
- Usar confirmação para exclusões e explicar conflitos causados por registros dependentes.
- Criar navegação hierárquica e breadcrumbs para propriedade → talhão → voo.
- Apresentar estados vazios com chamada clara para cadastrar o primeiro item.

**Critério de conclusão:** o usuário consegue criar e percorrer toda a hierarquia agrícola sem manipular URLs ou dados simulados.

### Fase 4 — Upload e análises

- Criar área de upload múltiplo dentro da página do voo.
- Exibir formatos aceitos, limite de tamanho e quantidade fornecidos pela configuração do sistema.
- Validar arquivos antes do envio e mostrar progresso individual.
- Permitir repetir apenas uploads que falharam e impedir duplicação causada por múltiplos cliques.
- Listar imagens do voo com nome, tamanho, tipo, data e ação de remoção.
- Exibir análises ligadas ao voo, incluindo tipo, risco, percentual afetado, resultado e status.
- Diferenciar visualmente resultado saudável, atenção, alto risco e crítico sem depender apenas de cor.

**Critério de conclusão:** imagens podem ser enviadas e consultadas, e análises reais aparecem vinculadas ao voo com feedback completo.

### Fase 5 — Dashboard real e condições da plantação

- Substituir `vegetativeData`, `sectorData`, `pieData` e `recentReports` por dados da API.
- Alimentar cards de área monitorada, voos, análises e problemas detectados.
- Exibir distribuição de risco e evolução temporal nos gráficos existentes.
- Substituir o mapa meramente ilustrativo por uma visualização coerente dos talhões; enquanto não houver mapa geoespacial completo, usar lista/cartões com localização e status reais.
- Permitir seleção de propriedade e período para atualizar o painel.
- Implementar skeleton, estado vazio, erro com nova tentativa e atualização manual.
- Manter filtros sincronizados com a URL para permitir recarregar ou compartilhar a visualização.

**Critério de conclusão:** nenhum indicador operacional do dashboard depende de constante mockada e alterações no backend aparecem após atualização dos dados.

### Fase 6 — Histórico e filtros

- Criar página de histórico de monitoramentos/análises.
- Implementar paginação e filtros por intervalo de data, propriedade/talhão e tipo de análise.
- Exibir filtros ativos e permitir limpeza individual ou completa.
- Abrir detalhes da análise a partir da listagem.
- Tratar resultados vazios sem confundi-los com erro da API.
- Adaptar a tabela para telas pequenas, usando cartões ou rolagem acessível.

**Critério de conclusão:** filtros modificam a consulta enviada à API, persistem na URL e retornam apenas os registros correspondentes.

### Fase 7 — Relatórios e recomendações

- Criar página de relatórios com status, data, propriedade, talhão e tipo.
- Permitir visualizar os dados do relatório antes do download.
- Implementar download autenticado do PDF, com feedback de progresso e falha.
- Exibir recomendações retornadas pela API junto do resultado da análise.
- Informar que recomendações são baseadas em regras e não substituem avaliação de profissional agrícola.
- Ocultar ou desabilitar download enquanto o relatório não estiver disponível.

**Critério de conclusão:** o usuário encontra uma análise, consulta sua recomendação e baixa o PDF real gerado pelo backend.

### Fase 8 — Qualidade, acessibilidade e documentação

- Configurar Vitest, React Testing Library e utilitários de mock da API.
- Testar componentes de formulário, proteção de rotas, filtros, upload e estados de erro.
- Adicionar testes ponta a ponta dos fluxos essenciais.
- Garantir navegação por teclado, labels, foco visível, contraste e anúncios de erro/progresso.
- Testar layout em celular, tablet e desktop.
- Verificar build de produção e documentar variáveis, execução e testes.
- Remover dependências realmente não utilizadas somente após confirmar que nenhum componente as consome.

**Critério de conclusão:** build e testes passam; os fluxos essenciais são utilizáveis por teclado e nas larguras definidas.

## 4. Ordem de entrega e dependências

1. Reorganização e roteamento.
2. Cliente HTTP e autenticação.
3. Propriedades, talhões e voos.
4. Upload e análises.
5. Dashboard real.
6. Histórico e filtros.
7. Relatórios e recomendações.
8. Testes finais, acessibilidade e documentação.

A integração deve avançar por contratos fechados: autenticação depende da fase 2 do backend; gestão agrícola depende da fase 3; upload depende da fase 4; dashboard, histórico e relatórios dependem das fases 5 e 6. Durante o desenvolvimento visual, respostas simuladas devem ficar isoladas no ambiente de testes e não no código de produção.

## 5. Plano de testes e aceite

- Abrir diretamente cada rota e recarregar a página sem perder a navegação.
- Bloquear rota privada sem sessão e retornar à rota solicitada após login.
- Validar cadastro, login, Google, logout e sessão expirada.
- Exibir corretamente erros de validação e da API sem apagar dados úteis do formulário.
- Criar e consultar propriedade, talhão e voo.
- Realizar upload válido; rejeitar arquivo incompatível ou grande demais; recuperar falha parcial.
- Renderizar dashboard com dados, sem dados, carregando e com erro.
- Aplicar filtros isolados e combinados no histórico.
- Visualizar análise e baixar relatório PDF.
- Verificar acesso por teclado, foco, leitores de tela e responsividade.
- Executar testes automatizados e build de produção em ambiente limpo.

## 6. Fora do escopo atual e premissas

- IA para pragas/doenças, previsão de problemas, aplicativo mobile e integração direta com drones permanecem como roadmap futuro.
- A interface consumirá identificação simples de problemas e recomendações baseadas em regras produzidas pelo backend.
- Microsoft e Apple serão retirados do login atual; somente email/senha e Google serão implementados.
- TypeScript será mantido, pois já estrutura o frontend e ajuda a validar os contratos da API.
- Um mapa geoespacial completo só será incluído quando houver dados e biblioteca cartográfica definidos; o MVP deve priorizar informações reais em vez do mapa ilustrativo atual.
- O plano não define datas ou estimativas porque prazo e capacidade da equipe não foram informados.
