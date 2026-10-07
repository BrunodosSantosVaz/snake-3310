<p align="center"><img src="docs/design/icone.svg" alt="" width="96"></p>

# Snake 3310

[![CI](https://github.com/BrunodosSantosVaz/snake-3310/actions/workflows/bb-ci.yml/badge.svg)](https://github.com/BrunodosSantosVaz/snake-3310/actions/workflows/bb-ci.yml)
[![Produção](https://img.shields.io/github/v/release/BrunodosSantosVaz/snake-3310?label=produ%C3%A7%C3%A3o&color=success)](https://github.com/BrunodosSantosVaz/snake-3310/releases/latest)
[![Homologação](https://img.shields.io/github/v/release/BrunodosSantosVaz/snake-3310?include_prereleases&label=homologa%C3%A7%C3%A3o&color=orange)](https://github.com/BrunodosSantosVaz/snake-3310/releases)

Jogo da cobrinha para navegador, com visual do Nokia 3310 e ranking público. Construído com o
[Big Bang](https://github.com/BrunodosSantosVaz/big-bang), no modo Flash.

A esteira usa a distribuição oficial Big Bang v1.5.1, com modo Flash e alvo Tsuru.

## Estado atual

A base do épico [#13](https://github.com/BrunodosSantosVaz/snake-3310/issues/13) implementa menu, consulta ao ranking,
API, SQLite e imagem ARM64 para o Tsuru existente. Esta revisão ainda não declara uma release publicada:
a partida e o envio de placares serão integrados pelo épico #28 antes da primeira entrega conjunta.

![Menu real do Snake 3310, com moldura azul, tela verde e teclado numérico clicável](docs/imagens/menu-3310.png)

## Para que serve

Uma vitrine do portfólio de Bruno dos Santos Vaz: abrir o endereço e jogar no PC ou no celular, sem instalar
aplicativo nem criar conta. O objetivo inclui demonstrar uma entrega completa pela esteira do Big Bang.

## Recursos

- Aparelho responsivo com menu, instruções e ranking; teclado físico e teclas clicáveis.
- Ranking com carregamento, lista vazia, falha e nova tentativa; cinco linhas visíveis na tela do aparelho.
- API pública de leitura com até dez placares, por pontos decrescentes e envio mais antigo no desempate (RN-0001).
- API e página sob o prefixo exato do ambiente (RN-0002), com verificações de saúde e prontidão (RN-0003).
- SQLite embutido no Node, arquivo persistente e migrações transacionais antes de abrir HTTP.
- Imagem única ARM64, configuração por ambiente e promoção pelo digest, sem servidor de banco adicional.

## Instalação

O jogo é acessado pelo navegador; não precisa de instalação. Endereços configurados para a entrega:
[produção](https://tsuru.frontzap.com.br/snake-3310/) e
[homologação](https://tsuru.frontzap.com.br/snake-3310-hom/).
A disponibilidade da primeira versão será confirmada pelos recibos da publicação e pela Release; endereço
configurado não é prova de que a publicação já ocorreu.

Para executar o código localmente, use Node.js **24.18.1** e npm:

```bash
npm ci
npm run build
npm start
```

Abra `http://localhost:8080/`. A inicialização cria/aplica as migrações no arquivo local de SQLite. Para executar
sob um prefixo, configure `BASE_PATH` antes de iniciar. Não é preciso instalar PostgreSQL, Docker ou outro banco.
O helper opcional de Docker está em [Empacotamento](docs/operacao/empacotamento.md).

## Como usar

Selecione com 2/8, setas ou W/S, confirme com OK/Enter e volte com C/Esc. Abra Ranking para ler os placares;
OK repete a consulta. Na base deste épico, Jogar apresenta “Em breve”; a partida é a entrega do épico #28.
Veja o [guia da interface](docs/guias/interface.md).

## Para desenvolvedores

Leia `AGENTS.md`, `PRODUTO.md`, `STACK.md`, `DESIGN.md`, `bigbang.toml` e [memória](docs/memoria.md).
O [índice de documentação](docs/README.md) reúne arquitetura, API, regras, guias e operação.

| Área | Pasta |
| --- | --- |
| Regras independentes de infraestrutura | `src/dominio/` |
| Casos de uso e portas | `src/aplicacao/` |
| SQLite e configuração | `src/infra/` |
| HTTP e inicializadores | `src/interface/` |
| Interface do aparelho | `src/web/` |
| Migrações e aceites congelados | `migrations/`, `tests/aceite/` |

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Vite com proxy `/api` para o servidor local na porta 8080 |
| `npm run lint`, `npm run typecheck` | Estilo e tipos |
| `npm test` | Tooling nativo, unidade, integração, migrações e empacotamento |
| `npm run test:acceptance` | Aceites do épico |
| `npm run test:architecture` | Dependências entre camadas |
| `npm run test:coverage` | Cobertura mínima de 80% de domínio/aplicação |
| `npm run test:ui` | Build real com CSP, Chromium, axe, teclado, 360px e texto a 200% |
| `npm run build` | `dist/server/` e `dist/web/` |
| `npm start` | Migra o mesmo arquivo/conexão e inicia o servidor |
| `npm run migrar` | Migração opcional explícita no checkout local |
| `BB_URL=https://endereco/prefixo npm run test:smoke` | Saúde, prontidão, HTML/cabeçalhos e ranking remoto, sem escrever dados |

Antes de `test:ui`, instale Chromium com `npx playwright install chromium`. Os testes de SQLite usam o motor
real em memória e arquivos temporários, sem credencial ou banco externo. O runtime da CI vem de
`scripts/install-ci.sh`, que confere o download oficial por SHA-256 antes de instalar dependências.

No Flash, escreva testes antes do código e execute os afetados quando a alteração estiver concluída, com
`python3.11 .bigbang/bin/bb.py testes --base <base>`. A seleção lê o arquivo JSON em `BB_ARQUIVOS_ALTERADOS` e inclui
as dependências; produção, primeira entrega, estrutura e versões major/minor exigem a suíte completa.
Ausência de grafo confiável também executa tudo. Reutilize a CI verde do mesmo SHA; veja [CI](docs/operacao/ci.md).

Variáveis do servidor, sem valores de ambiente ou segredos:

| Nome | Finalidade |
| --- | --- |
| `NODE_ENV` | Modo de produção e HSTS |
| `BASE_PATH` | Prefixo exato da página e API |
| `PORT` | Porta HTTP |
| `WEB_DIR` | Diretório absoluto do front compilado |
| `SQLITE_PATH` | Arquivo durável fora de `dist`; banco/WAL/SHM devem compartilhar o volume |
| `MIGRATIONS_DIR` | Diretório de migrações usado pelo startup e pela CLI |

A imagem executa como UID/GID 1000, `umask 077`, sem npm/npx/yarn no runtime. A CLI embarcada é
`node /app/dist/server/interface/migrate.js`. Cada ambiente precisa de volume gravável próprio e uma réplica.
No Tsuru, `TSURU_MIGRACAO=inicializacao` migra dentro da app, com seu volume; um job separado não monta esse PVC.
Configuração e dados são descritos em [Operação](docs/operacao/README.md).

## Versões e releases

Consulte [Releases](https://github.com/BrunodosSantosVaz/snake-3310/releases) e [CHANGELOG](CHANGELOG.md).
Candidatas passam por staging, scans, smoke e homologação. Produção promove a mesma imagem verificada,
com aprovação do ambiente e testes completos. Mudanças entram por tarefa, PR revisado e integração de release;
nunca por push direto na branch principal.

## Segurança e privacidade

O ranking é público; a resposta de leitura expõe apenas apelido e pontos. Não há conta, senha, e-mail, analytics
ou câmera. Não use nome real ou dados pessoais como apelido. O navegador acessa só a API, nunca o banco.
SQLite, WAL e backups não são servidos em HTTP. Confira [inventário de dados](docs/dados/inventario.md).

A API aplica CSP da própria origem, bloqueio de frames, nosniff, política de referrer e permissões restritas;
HSTS é ativado em produção. Falhas retornam Problem Details sem mensagens internas. Siga [SECURITY](SECURITY.md)
para relato privado. Tokens de deploy pertencem aos ambientes do GitHub, não ao código ou ao front.

## Limitações conhecidas

- Esta base ainda não implementa partida nem envio; eles pertencem ao épico #28 e impedem declarar o pedido entregue.
- API `node:sqlite` em Stability 1.2 (Release Candidate); runtime fixado e testes com o mesmo motor (ADR-0003).
- Uma réplica por ambiente; o arquivo SQLite não é banco distribuído.
- Sem login, modo offline, sons, velocidade progressiva ou paredes atravessáveis.
- O backup preparado é cifrado, horário e local ao mesmo host, com retenção de 14 dias; perda do host e da chave
  exige uma cópia independente, que ainda não foi providenciada. A restauração real das apps será conferida após o deploy.

## Contribuindo

Use os formulários de issues e [CONTRIBUTING](CONTRIBUTING.md). Cada tarefa tem branch/PR próprio, aceites congelados
não são reescritos e a revisão é independente. Consulte [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md).

## Licença

[MIT](LICENSE). Componentes de terceiros mantêm suas licenças próprias. A referência visual ao Nokia 3310 não
implica vínculo com a fabricante.
