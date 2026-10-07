# Arquitetura — arc42 enxuto

## Objetivo e qualidade

Jogo público de portfólio, sem conta, visual3310. Prioridades: uso imediato, interface acessível, limites de abuso,
ranking persistente e release rastreável. [Produto](../../PRODUTO.md) e [Design](../../DESIGN.md) definem o escopo.

## Restrições

Tsuru existente ARM64, sem custo extra e sem servidor de banco adicional. TypeScript/Fastify/Canvas/Vite;
SQLite embutido Node 24.18.1, uma réplica, volume persistente por ambiente. [Stack](../../STACK.md) e ADR-0003/0004.

## Contexto e contêineres

[C4 nível1](contexto.md) descreve jogador, dono e proxy; [nível2](conteineres.md) descreve página, API e arquivo SQLite.
API e front compartilham origem/prefixo; não há CORS, login ou acesso direto do navegador ao banco.

## Estrutura

Domínio puro, aplicação com portas, infraestruturaSQLite e interfaceHTTP são separados por dependency-cruiser.
O front não importa servidor. A raiz de composição constrói repositório e prontidão; OpenAPI documenta as rotas.

## Execução

Startup: abrir arquivo → migrar em transação na mesma conexão → registrar API/front → listen. Erro antes de listen
fecha o banco; falha de prontidão retorna 503. Leitura do ranking usa consulta preparada, até 10 entradas por pontos
DESC e data/idASC; interface mostra cinco linhas. SIGTERM fecha HTTP e banco antes de sair.

## Implantação

Uma imagem OCI contém servidor/front. CandidataARM64 vai a staging, recebe scans/SBOM/atestação/smoke/ZAP;
produção promove a identidade da imagem já homologada. Tsuru importa para seu registry interno, cujo nome/digest
pode ser diferente; o recibo mantém origem e evento. Apps/PVCs separados, migração na inicialização e health em
`<BASE_PATH>/api/ready`. [Runbooks](../operacao/README.md).

## Conceitos transversais e decisões

Configuração por ambiente, SQL preparado, respostas Problem Details sem internals, cabeçalhos restritos, logs
sem credenciais e aceites congelados. [ADR-0001](../decisoes/ADR-0001-stack.md),
[ADR-0003](../decisoes/ADR-0003-sqlite-embutido.md) substitui PostgreSQL/PGlite e
[ADR-0004](../decisoes/ADR-0004-flash-tsuru-ci.md) adota Flash/Tsuru/runtime da CI.

## Riscos e dívida

SQLite/node:sqlite em RC requer runtime fixo e mesma engine em teste. PV local com Retain não é recuperação de desastre:
backup/chave são locais e precisam de cópia externa. Rollout pode sobrepor pods antigos/novos no mesmo volume;
migrações devem ser compatíveis. Testes/empacotamento aprovados não substituem evidência real do primeiro deploy.

## Vocabulário

[Glossário PT↔EN](../produto/glossario.md). A implementação da partida e do envio é rastreada ao épico #28.
