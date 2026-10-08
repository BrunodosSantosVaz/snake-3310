<p align="center"><img src="docs/design/icone.svg" alt="" width="96"></p>

# Snake 3310

[![CI](https://github.com/BrunodosSantosVaz/snake-3310/actions/workflows/bb-ci.yml/badge.svg)](https://github.com/BrunodosSantosVaz/snake-3310/actions/workflows/bb-ci.yml)
[![Produção](https://img.shields.io/github/v/release/BrunodosSantosVaz/snake-3310?label=produ%C3%A7%C3%A3o&color=success)](https://github.com/BrunodosSantosVaz/snake-3310/releases/latest)
[![Homologação](https://img.shields.io/github/v/release/BrunodosSantosVaz/snake-3310?include_prereleases&label=homologa%C3%A7%C3%A3o&color=orange)](https://github.com/BrunodosSantosVaz/snake-3310/releases)

Jogo da cobrinha para navegador, com visual do Nokia 3310 e ranking público. Construído com o
[Big Bang](https://github.com/BrunodosSantosVaz/big-bang), no modo Flash.

A esteira usa a distribuição oficial Big Bang v1.5.3, com modo Flash e alvo Tsuru.
O [bootstrap da Fundação](docs/operacao/bootstrap-sem-release-55.md) prepara esses portões na `main` antes da primeira promoção.

## Estado atual

A **v0.1.0 está em produção** desde 08/10/2026:
[jogar](https://tsuru.frontzap.com.br/snake-3310/) e
[homologação](https://tsuru.frontzap.com.br/snake-3310-hom/).
A [Release](https://github.com/BrunodosSantosVaz/snake-3310/releases/tag/v0.1.0) e o
[recibo completo](docs/operacao/producao-010.md) registram candidata, revisão, CI, promoção da mesma imagem,
ensaios reais, persistência e restauração dos backups dos dois ambientes.

Os épicos [#13](https://github.com/BrunodosSantosVaz/snake-3310/issues/13) e
[#28](https://github.com/BrunodosSantosVaz/snake-3310/issues/28) têm o código revisado: partida em canvas,
controles por teclado/toque, pausa, reinício, modal de envio e ranking público persistente. A API valida apelidos
Unicode e pontos, filtra vocabulário e limita tentativas por IP. SQLite migra antes de HTTP na imagem ARM64.

Os 13 testes de aceite passaram na fonte exata antes da promoção, com suíte completa no portão de produção.
Chromium confirmou partida, modal e ranking nos dois ambientes; SQLite persistiu após reinício e os snapshots
cifrados gerados pelo cron foram restaurados com integridade. Veja o [mapa dos critérios](docs/operacao/documentacao-34.md)
e o [plano de conferência documental](docs/validacao/65-producao-010.md).
A [conferência final](docs/operacao/documentacao-68.md) reúne o checklist e a preservação do artefato.

![Partida do Snake 3310 com cobra, comida, pontuação e controles no aparelho azul](docs/imagens/partida-3310.png)

![Menu real do Snake 3310, com moldura azul, tela verde e teclado numérico clicável](docs/imagens/menu-3310.png)

## Para que serve

Uma vitrine do portfólio de Bruno dos Santos Vaz: abrir o endereço e jogar no PC ou no celular, sem instalar
aplicativo nem criar conta. O objetivo inclui demonstrar uma entrega completa pela esteira do Big Bang.

## Recursos

- Partida em pixels na grade 21×13: três segmentos iniciais, passo de 180 ms, crescimento e sete pontos por comida,
  colisões, pausa manual ou ao perder foco e diálogo de fim com reinício. Inversões de 180 graus são ignoradas,
  inclusive quando há vários comandos antes do próximo passo. A grade cheia termina com 1.890 pontos.
- Aparelho 3310 responsivo com menu, instruções e ranking conectado à API, operado por teclado ou pelas teclas
  clicáveis. Trata carregando, vazio, erro e nova tentativa.
- Modal de fim com foco no apelido, pontos finais, estado Enviando…, confirmação e erros controlados.
  Um placar confirmado só é enviado uma vez por partida; reinício/saída cancelam a espera e ignoram respostas antigas.
- API pública de leitura `GET <BASE_PATH>/api/placares`: no máximo dez placares, por pontos decrescentes e, em
  empate, pelo envio mais antigo (RN-0001). Sem placares, retorna `{ "scores": [] }`.
- API pública de envio `POST <BASE_PATH>/api/placares`: apelido de 3 a 12 letras Unicode/números e pontos inteiros
  de 0 a 1.890, múltiplos de sete. Filtra vocabulário ofensivo sem distinguir caixa/acentos, grava UTC no servidor
  e responde 201. Tipos ou campos inválidos recebem 400 sem gravação; corpo limitado a 1 KiB.
- No máximo cinco tentativas de envio em 60 segundos por IP, inclusive inválidas. O sexto recebe 429 com
  `Retry-After` de 1 a 60 segundos. Os contadores expiram, ocupam no máximo 4.096 entradas e reiniciam com o processo.
- Servidor Fastify com `/api/health`, `/api/ready` e migrações SQLite, sempre sob `BASE_PATH`.

## Instalação

O jogo é acessado pelo navegador; não precisa de instalação. Endereços publicados:
[produção](https://tsuru.frontzap.com.br/snake-3310/) e
[homologação](https://tsuru.frontzap.com.br/snake-3310-hom/).
A primeira versão foi publicada pelo [workflow oficial](https://github.com/BrunodosSantosVaz/snake-3310/actions/runs/37766740098),
com aprovação delegada pela autorização explícita do dono e portões preservados.

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

Para consultar o ranking local depois de configurar o banco, aplicar as migrações e iniciar o servidor, faça
`GET <BASE_PATH>/api/placares`. A resposta contém só `nickname` e `points`; datas e IDs ficam no servidor.
A rota não aceita parâmetros de consulta: campos desconhecidos recebem 400. O contrato está em
[docs/api/openapi.yaml](docs/api/openapi.yaml). Na tela, use 2/8, setas ou W/S para selecionar, OK/Enter para abrir e
C/Esc para voltar. No ranking, OK repete a consulta. Em Jogar, use setas, WASD ou 2/4/6/8 para mover e espaço/5
para pausar e retomar. Perder o foco pausa; C/Esc volta ao menu. Após a partida, Jogar de novo começa com zero
pontos e devolve o foco à arena. No diálogo de fim, preencha um apelido público de 3 a 12 letras/números e escolha
Enviar placar. Durante Enviando… aguarde; após Placar enviado!, volte ao menu e abra Ranking. Apelido recusado,
limite de envios e falha de rede têm mensagens próprias e permitem nova tentativa. Veja o
[guia da interface](docs/guias/interface.md).

Para usar a API de envio diretamente, envie JSON com somente `nickname` e `points`, por exemplo
`{"nickname":"ANA","points":70}`. O sucesso retorna os mesmos campos públicos. 400 indica entrada recusada;
429 pede aguardar o `Retry-After`; 413 indica corpo grande demais. O servidor define a data de envio e não aceita
data ou privilégios enviados pelo cliente. A chamada bem-sucedida aparece na próxima leitura do ranking.

## Para desenvolvedores

- Instruções para IAs: `AGENTS.md`. O que o sistema é: `PRODUTO.md`. A stack: `STACK.md`. O design: `DESIGN.md`.
- O processo de trabalho: `.bigbang/processo/`. Pegadinhas: `docs/memoria.md`.
- Requisitos: Node.js 24.18.1 e npm, conforme a stack e o runtime da imagem.
- CI: `bash scripts/install-ci.sh` verifica o download oficial de Node 24.18.1 por SHA-256 antes de `npm ci`;
  localmente exige essa versão. No modo Flash, `npm run test:affected` lê o arquivo JSON apontado por
  `BB_ARQUIVOS_ALTERADOS`, seleciona unidade/integração/aceite por dependência e conserva cobertura de 80%
  nos módulos afetados de domínio/aplicação. Configuração estrutural, produção ou grafo incerto recebem a suíte
  completa. Veja [CI e testes afetados](docs/operacao/ci.md) e [ADR-0004](docs/decisoes/ADR-0004-flash-tsuru-ci.md).
- Comandos: `npm ci` (instala), `npm run lint`, `npm run typecheck`, `npm test` (unidade),
  `npm run test:acceptance` (aceite), `npm run test:architecture` (camadas), `npm run test:coverage`,
  `npm run test:migracoes` e `npm run build`. Depois do build: `npm start` aplica migrações antes de abrir HTTP; `npm run migrar` é a CLI opcional para o mesmo arquivo.
- `npm run dev` abre o Vite para a interface e encaminha `/api` para o servidor local na porta 8080;
  `npm run build` compila servidor e front em `dist/server` e `dist/web`, com caminhos relativos no front.
- `npm run test:ui` serve o build real sob a CSP do Fastify e valida teclado, cinco linhas, contraste/acessibilidade
  com axe, layout em 360 px e texto ampliado em 200% no Chromium.
  Instale o navegador de teste com `npx playwright install chromium` antes de executar esse comando.
  `npm run test:acceptance` prepara o build antes do Vitest e, na CI, instala Chromium/dependências;
  falta de navegador ou erro de build falha fora das marcas de pendente. Os testes DOM
  e de semântica com axe também rodam em `npm test` na CI.
- Depois do build, `node scripts/check-game-ui.mjs` verifica o movimento real do canvas, pausa, reinício,
  POST 201 único, consulta do placar persistido em SQLite isolado, foco, área de toque, layout de 360 px e texto
  a 200%, com axe em Chromium sob a CSP do servidor. A cobertura inclui
  o motor puro do navegador, além das camadas de domínio e aplicação. O script gera
  `docs/imagens/partida-3310.png`.
- Os testes usam SQLite nativo real, isolado em memória e em arquivo temporário (ADR-0003); não é preciso instalar banco nem fornecer credenciais.
- Variáveis de ambiente do servidor (os valores ficam só no servidor): `BASE_PATH` (endereço do jogo, por exemplo
  `/snake-3310`), `SQLITE_PATH` (arquivo persistente, padrão `data/snake-3310.sqlite`, fora de `dist`), `PORT` (padrão 8080), `WEB_DIR` (padrão `dist/web`) e `MIGRATIONS_DIR` (startup e CLI; padrão
  `migrations`).
- `TRUSTED_PROXY_IPS` é uma lista separada por vírgulas de IPs individuais do último salto; vazia por padrão.
  Só essas conexões podem informar um único IP válido em `X-Snake-Client-IP`, sobrescrito/saneado pelo proxy.
  IPv4 e IPv6 mapeado são equivalentes. `X-Forwarded-For`, faixas de rede e cabeçalhos de peers não confiados
  não mudam a identidade do limite. Cabeçalho ausente ou inválido usa o próprio peer.
- Para rodar localmente: `npm ci`, `npm run build`, `npm start`. O ranking persiste no arquivo mesmo após reiniciar o processo; o diretório `data/` é ignorado pelo Git.
- Produção precisa de volume persistente por ambiente e uma réplica; arquivo efêmero perde placares. A imagem inicia como usuário `node` (UID/GID 1000), com `umask 077`, e aplica migrações na mesma conexão antes de listen. Falha impede abrir HTTP. Nunca copie só o arquivo principal para backup enquanto WAL estiver ativo. Veja [ADR-0003](docs/decisoes/ADR-0003-sqlite-embutido.md).
- Migrações executam o lote SQL completo em transação, inclusive se começar com SELECT; consultas preparadas aceitam uma única instrução. Caminhos como `dist/..cache/scores.sqlite` também são recusados.
- A imagem expõe a porta 8888, guarda SQLite em `/data/scores.sqlite` e inclui os tokens do design no build. O helper `deploy/compose.yaml` compartilha volume e não instala banco externo. Veja [empacotamento](docs/operacao/empacotamento.md) para build, permissões do volume e inicialização no Tsuru.
- `npm run test:smoke` usa fetch nativo contra `BB_URL` ou `SMOKE_URL`, sem instalar dependências de teste; verifica saúde, prontidão, página, CSP e ranking.
- `NODE_ENV=production` ativa HSTS por um ano. CSP restrita ao próprio site, proteção contra frames, nosniff,
  política de referrer e bloqueio de câmera/microfone/localização são enviados em todas as respostas.

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
| `npm run test:ui` | Build real com CSP, Chromium, axe, teclado, 360 px e texto a 200% |
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
| `TRUSTED_PROXY_IPS` | Lista estrita de IPs individuais do último peer, separada por vírgulas; vazia por padrão |

A imagem executa como UID/GID 1000, `umask 077`, sem npm/npx/yarn no runtime. A CLI embarcada é
`node /app/dist/server/interface/migrate.js`. Cada ambiente precisa de volume gravável próprio e uma réplica.
No Tsuru, `TSURU_MIGRACAO=inicializacao` migra dentro da app, com seu volume; um job separado não monta esse PVC.
A imagem tem padrão `/data/scores.sqlite`; as apps Tsuru preparadas usam `/data/snake.sqlite` por configuração,
alinhada ao script de backup. Configuração e dados são descritos em [Operação](docs/operacao/README.md).

## Versões e releases

Consulte [Releases](https://github.com/BrunodosSantosVaz/snake-3310/releases) e [CHANGELOG](CHANGELOG.md).
Candidatas passam por staging, scans, smoke e homologação. Produção promove a mesma imagem verificada,
com aprovação do ambiente e testes completos. Mudanças entram por tarefa, PR revisado e integração de release;
nunca por push direto na branch principal.

## Segurança e privacidade

O ranking é público; a resposta de leitura expõe apenas apelido e pontos. Não há conta, senha, e-mail, analytics
ou câmera. Não use nome real ou dados pessoais como apelido. O navegador acessa só a API, nunca o banco.
SQLite, WAL e backups não são servidos em HTTP. O IP temporário do limite fica em memória; logs da aplicação
e do proxy podem conter IP/metadados e precisam de acesso/retenção operacional. Apelido público não garante
anonimato. Confira [inventário de dados](docs/dados/inventario.md).

A API aplica CSP da própria origem, bloqueio de frames, nosniff, política de referrer e permissões restritas;
HSTS é ativado em produção. Falhas retornam Problem Details sem mensagens internas. Siga [SECURITY](SECURITY.md)
para relato privado. Tokens de deploy pertencem aos ambientes do GitHub, não ao código ou ao front.

## Limitações conhecidas

Não há autenticação nem prova criptográfica da partida: um cliente pode forjar pontos que respeitem os limites
plausíveis de 0 a 1.890 e múltiplos de sete. O filtro local usa uma lista de termos e pode recusar apelidos que
contenham um trecho bloqueado ou deixar passar outras ofensas. O limite é por processo, com uma réplica; reiniciar
zera os contadores. Se todas as 4.096 entradas estiverem ativas, novos IPs recebem 429 até uma delas expirar.
Jogadores que compartilham um IP também compartilham o limite. Reiniciar ou sair cancela a espera pelo envio e
ignora respostas antigas; isso não desfaz uma gravação que o servidor já concluiu. Uma falha de rede pode ocorrer
após a gravação, portanto uma nova tentativa pode criar outro placar; a API não possui chave de idempotência.

- API `node:sqlite` em Stability 1.2 (Release Candidate); runtime fixado e testes com o mesmo motor (ADR-0003).
- Uma réplica por ambiente; o arquivo SQLite não é banco distribuído.
- Sem login, modo offline, sons, velocidade progressiva ou paredes atravessáveis.
- O backup é cifrado, horário e local ao mesmo host, com retenção de 14 dias; perda do host e da chave
  exige uma cópia independente, que ainda não foi providenciada. A restauração local dos dois ambientes foi validada; isso não demonstra recuperação após perda total do host.

## Contribuindo

Use os formulários de issues e [CONTRIBUTING](CONTRIBUTING.md). Cada tarefa tem branch/PR próprio, aceites congelados
não são reescritos e a revisão é independente. Consulte [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md).

## Licença

[MIT](LICENSE). Componentes de terceiros mantêm suas licenças próprias. A referência visual ao Nokia 3310 não
implica vínculo com a fabricante.
