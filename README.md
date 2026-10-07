<p align="center"><img src="docs/design/icone.svg" alt="" width="96"></p>

# Snake 3310

<!-- README do sistema (DOC-15). Escrito pela IA e mantido em dia a CADA épico e release: depois da primeira release
     publicada, a CI reprova este arquivo se faltar uma das seções obrigatórias, se ainda disser que está na Fundação
     ou se sobrar algum "(a preencher)". Troque cada "(a preencher)" pelo conteúdo real e apague estes comentários. -->

[![CI](https://github.com/BrunodosSantosVaz/snake-3310/actions/workflows/bb-ci.yml/badge.svg)](https://github.com/BrunodosSantosVaz/snake-3310/actions/workflows/bb-ci.yml)
[![Produção](https://img.shields.io/github/v/release/BrunodosSantosVaz/snake-3310?label=produ%C3%A7%C3%A3o&color=success)](https://github.com/BrunodosSantosVaz/snake-3310/releases/latest)
[![Homologação](https://img.shields.io/github/v/release/BrunodosSantosVaz/snake-3310?include_prereleases&label=homologa%C3%A7%C3%A3o&color=orange)](https://github.com/BrunodosSantosVaz/snake-3310/releases)

Sistema em construção com o [Big Bang](.bigbang/README.md), um framework para uma pessoa e suas IAs planejarem,
construírem e manterem sistemas profissionais.

<!-- Logo da primeira release: uma imagem real do sistema (print da tela principal, em docs/imagens/), com texto
     alternativo que descreve o que ela mostra. -->

## Índice

- [Estado atual](#estado-atual)
- [Para que serve](#para-que-serve)
- [Recursos](#recursos)
- [Instalação](#instalação)
- [Como usar](#como-usar)
- [Para desenvolvedores](#para-desenvolvedores)
- [Versões e releases](#versões-e-releases)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Limitações conhecidas](#limitações-conhecidas)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Estado atual

O épico [#13](https://github.com/BrunodosSantosVaz/snake-3310/issues/13) está em implementação. O código já tem
servidor sob `BASE_PATH`, saúde, prontidão, migrações e listagem do ranking. A tela do aparelho já permite navegar
no menu e consultar os cinco maiores placares. Ainda não há release publicada; a partida e a entrega do ambiente
continuam pendentes.

![Menu do Snake 3310 na tela de um aparelho azul, com teclas numéricas clicáveis](docs/imagens/menu-3310.png)

<!-- Depois da primeira release: a versão em produção, o que ela já faz e o que vem a seguir, em duas ou três frases. -->

## Para que serve

(a preencher) — o problema que o sistema resolve, para quem, em linguagem de quem usa (de `PRODUTO.md`).

## Recursos

- API pública de leitura `GET <BASE_PATH>/api/placares`: no máximo dez placares, por pontos decrescentes e, em
  empate, pelo envio mais antigo (RN-0001). Sem placares, retorna `{ "scores": [] }`.
- Servidor Fastify com `/api/health`, `/api/ready` e migrações SQLite, sempre sob `BASE_PATH`.
- Aparelho 3310 responsivo com menu, instruções e ranking conectado à API, operado por teclado ou pelas teclas
  clicáveis. Trata carregando, vazio, erro e nova tentativa; a opção Jogar ainda informa “Em breve”.

## Instalação

(a preencher) — como conseguir e instalar a versão de produção (download, endereço, requisitos por plataforma).

## Como usar

Para consultar o ranking local depois de configurar o banco, aplicar as migrações e iniciar o servidor, faça
`GET <BASE_PATH>/api/placares`. A resposta contém só `nickname` e `points`; datas e IDs ficam no servidor.
A rota não aceita parâmetros de consulta: campos desconhecidos recebem 400. O contrato está em
[docs/api/openapi.yaml](docs/api/openapi.yaml). Na tela, use 2/8, setas ou W/S para selecionar, OK/Enter para abrir e
C/Esc para voltar. No ranking, OK repete a consulta. A partida ainda não está disponível; veja o
[guia da interface](docs/guias/interface.md).

## Para desenvolvedores

- Instruções para IAs: `AGENTS.md`. O que o sistema é: `PRODUTO.md`. A stack: `STACK.md`. O design: `DESIGN.md`.
- O processo de trabalho: `.bigbang/processo/`. Pegadinhas: `docs/memoria.md`.
- Requisitos: Node.js 24.18.1 e npm, conforme a stack e o runtime da imagem.
- Comandos: `npm ci` (instala), `npm run lint`, `npm run typecheck`, `npm test` (unidade),
  `npm run test:acceptance` (aceite), `npm run test:architecture` (camadas), `npm run test:coverage`,
  `npm run test:migracoes` e `npm run build`. Depois do build: `npm run migrar` (aplica as migrações) e `npm start`.
- `npm run dev` abre o Vite para a interface e encaminha `/api` para o servidor local na porta 8080;
  `npm run build` compila servidor e front em `dist/server` e `dist/web`, com caminhos relativos no front.
- `npm run test:ui` serve o build real sob a CSP do Fastify e valida teclado, cinco linhas, contraste/acessibilidade
  com axe, layout em 360 px e texto ampliado em 200% no Chromium.
  Instale o navegador de teste com `npx playwright install chromium` antes de executar esse comando. Os testes DOM
  e de semântica com axe também rodam em `npm test` na CI.
- Os testes usam SQLite nativo real, isolado em memória e em arquivo temporário (ADR-0003); não é preciso instalar banco nem fornecer credenciais.
- Variáveis de ambiente do servidor (os valores ficam só no servidor): `BASE_PATH` (endereço do jogo, por exemplo
  `/snake-3310`), `SQLITE_PATH` (arquivo persistente, padrão `data/snake-3310.sqlite`, fora de `dist`), `PORT` (padrão 8080), `WEB_DIR` (padrão `dist/web`) e, para `npm run migrar`, `MIGRATIONS_DIR` (padrão
  `migrations`).
- Para rodar localmente: `npm ci`, `npm run build`, `npm run migrar` e `npm start`. O ranking persiste no arquivo mesmo após reiniciar o processo; o diretório `data/` é ignorado pelo Git.
- Produção precisa de volume persistente por ambiente e uma réplica; arquivo efêmero perde placares. A imagem e o startup com migração antes de listen serão entregues pela tarefa #19. Nunca copie só o arquivo principal para backup enquanto WAL estiver ativo. Veja [ADR-0003](docs/decisoes/ADR-0003-sqlite-embutido.md).
- Migrações executam o lote SQL completo em transação, inclusive se começar com SELECT; consultas preparadas aceitam uma única instrução. Caminhos como `dist/..cache/scores.sqlite` também são recusados.
- `NODE_ENV=production` ativa HSTS por um ano. CSP restrita ao próprio site, proteção contra frames, nosniff,
  política de referrer e bloqueio de câmera/microfone/localização são enviados em todas as respostas.

(a preencher) — estrutura do repositório, como rodar a partir do código, testes e build (comandos de
`bigbang.toml` `[comandos]`), variáveis de ambiente sem valores.

## Versões e releases

(a preencher) — onde ficam as versões (Releases), o que é homologação e produção, onde está o `CHANGELOG.md`.

## Segurança e privacidade

(a preencher) — que dados o sistema trata, o que nunca sai do aparelho/servidor, como relatar uma falha de segurança.

## Limitações conhecidas

(a preencher) — o que o sistema não faz ou faz com ressalvas (de `PRODUTO.md`, fora do escopo).

## Contribuindo

Pedidos e bugs pelas issues, nos formulários do repositório. O trabalho segue a esteira do Big Bang
(`.bigbang/processo/`): toda mudança chega por PR revisado.

## Licença

(a preencher) — a licença do sistema (arquivo `LICENSE`) e avisos de componentes de terceiros.
