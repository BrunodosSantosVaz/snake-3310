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
servidor sob `BASE_PATH`, saúde, prontidão, migrações e listagem do ranking. Ainda não há release publicada;
a tela do jogo e a entrega do ambiente continuam pendentes.

<!-- Depois da primeira release: a versão em produção, o que ela já faz e o que vem a seguir, em duas ou três frases. -->

## Para que serve

(a preencher) — o problema que o sistema resolve, para quem, em linguagem de quem usa (de `PRODUTO.md`).

## Recursos

- API pública de leitura `GET <BASE_PATH>/api/placares`: no máximo dez placares, por pontos decrescentes e, em
  empate, pelo envio mais antigo (RN-0001). Sem placares, retorna `{ "scores": [] }`.
- Servidor Fastify com `/api/health`, `/api/ready` e migrações Postgres, sempre sob `BASE_PATH`.

## Instalação

(a preencher) — como conseguir e instalar a versão de produção (download, endereço, requisitos por plataforma).

## Como usar

Para consultar o ranking local depois de configurar o banco, aplicar as migrações e iniciar o servidor, faça
`GET <BASE_PATH>/api/placares`. A resposta contém só `nickname` e `points`; datas e IDs ficam no servidor.
A rota não aceita parâmetros de consulta: campos desconhecidos recebem 400. O contrato está em
[docs/api/openapi.yaml](docs/api/openapi.yaml). A interface jogável ainda não está disponível.

## Para desenvolvedores

- Instruções para IAs: `AGENTS.md`. O que o sistema é: `PRODUTO.md`. A stack: `STACK.md`. O design: `DESIGN.md`.
- O processo de trabalho: `.bigbang/processo/`. Pegadinhas: `docs/memoria.md`.
- Requisitos: Node.js 22 ou mais novo (a imagem de produção usa o Node 24) e npm.
- Comandos: `npm ci` (instala), `npm run lint`, `npm run typecheck`, `npm test` (unidade),
  `npm run test:acceptance` (aceite), `npm run test:architecture` (camadas), `npm run test:coverage`,
  `npm run test:migracoes` e `npm run build`. Depois do build: `npm run migrar` (aplica as migrações) e `npm start`.
- Os testes usam um Postgres em memória (PGlite, ADR-0002); não é preciso instalar banco para desenvolver.
- Variáveis de ambiente do servidor (os valores ficam só no servidor): `BASE_PATH` (endereço do jogo, por exemplo
  `/snake-3310`), `DATABASE_URL`, `PORT` (padrão 8080), `WEB_DIR` (padrão `dist/web`) e, para `npm run migrar`, `MIGRATIONS_DIR` (padrão
  `migrations`).

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
