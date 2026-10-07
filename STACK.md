# Snake 3310 — Stack

> Escrito na Fundação (F2). Só muda com decisão do dono registrada em ADR. Este arquivo é zona sensível: todo PR
> que o altera tem revisão humana.

## Resumo da decisão

TypeScript ponta a ponta. O front é um jogo em Canvas feito com Vite. A API usa Fastify em Node 24 e guarda o
ranking em Postgres. Uma imagem `linux/arm64` serve as duas partes sob um prefixo de caminho configurável
(`/snake-3310`). A entrega começa pelo alvo `vps-docker` no `vm-oracle`, na URL final, e passa para o Tsuru
quando o framework tiver esse alvo.

Decisão registrada em [ADR-0001](docs/decisoes/ADR-0001-stack.md).

## Linguagens, frameworks e versões

| Item | Escolha | Versão |
| --- | --- | --- |
| Linguagem | TypeScript | `~6.0.3`, fixa: o typescript-eslint 8.71 aceita só `<6.1.0` |
| Runtime | Node.js LTS | 24.x (imagem `node:24-alpine`) |
| Framework (API) | Fastify | 5.x |
| Front-end | Canvas 2D com Vite, sem framework de UI | Vite 8.x |
| Gerenciador de pacotes | npm (com `package-lock.json`) | o do Node 24 |

## Banco de dados

Postgres 18 no servidor que já existe, com banco e usuário próprios do Snake 3310 em cada ambiente. O driver é o
`pg`. As migrações são arquivos SQL numerados em `migrations/`, aplicados por um comando próprio
(`npm run migrar`), que é o serviço `migrar` do deploy. Só a API acessa o banco (SEG-IA-01).

## Tipo de entrega e alvo

- **Perfil:** `deploy`.
- **Alvo:** `vps-docker` no `vm-oracle` (ARM64), com imagem `linux/arm64` no GHCR, publicada pelo digest.
- **URLs:** produção em `https://tsuru.frontzap.com.br/snake-3310` e staging em
  `https://tsuru.frontzap.com.br/snake-3310-hom`. O NPM manda cada caminho para o contêiner do ambiente
  (*custom location*).
- **Prefixo de caminho:** a variável `BASE_PATH` é lida na execução, e o Vite usa `base: './'`. A mesma imagem
  roda em qualquer caminho (ARQ-07).
- **Próximo alvo:** Tsuru, por um épico no framework `big-bang`. A URL e a imagem não mudam. Ver o ADR-0001.

## Arquitetura

```mermaid
C4Container
  title Contêineres — Snake 3310
  Person(jogador, "Jogador", "Visitante do portfólio")
  System_Boundary(sistema, "Snake 3310") {
    Container(web, "Jogo", "TypeScript, Canvas, Vite", "Desenha o 3310, roda a partida e chama a API")
    Container(api, "API", "TypeScript, Fastify, Node 24", "Valida e guarda placares, lista o ranking e serve o jogo")
    ContainerDb(banco, "Banco", "Postgres 18", "Placares do ranking")
  }
  Rel(jogador, web, "Joga", "HTTPS")
  Rel(web, api, "Envia placar e lê ranking", "HTTPS/JSON em <BASE_PATH>/api")
  Rel(api, banco, "Lê e grava", "SQL")
```

| Camada | Pasta | Pode depender de |
| --- | --- | --- |
| Domínio | `src/dominio/` | nada |
| Aplicação | `src/aplicacao/` | domínio |
| Infraestrutura | `src/infra/` | aplicação, domínio |
| Interface (API/UI) | `src/interface/` (API Fastify e *composition root*) e `src/web/` (jogo) | aplicação. O `src/web/` não importa nada do servidor e fala só pela API |

## Ferramentas de qualidade

| Para quê | Ferramenta | Comando (`[comandos]` no `bigbang.toml`) |
| --- | --- | --- |
| Testes | Vitest 5 | `npm test` |
| Testes de aceite | Vitest 5, com a API via `fastify.inject` e Postgres real em contêiner | `npm run test:acceptance` |
| Fumaça (smoke) | Playwright 1.63, contra a URL do ambiente | `npm run test:smoke` |
| Lint e formatação | ESLint 10 com typescript-eslint 8 | `npm run lint` |
| Tipos | `tsc --noEmit` | `npm run typecheck` |
| Arquitetura | dependency-cruiser 18 | `npm run test:architecture` |
| Cobertura | @vitest/coverage-v8 | `npm run test:coverage` |

## Cobertura mínima

80% nas camadas de domínio e aplicação.

## Configuração da esteira

<!-- bb:config:inicio -->
<!-- Gerado pelo Big Bang v1.5.0 a partir de bigbang.toml. Não edite: personalize em bigbang.toml. -->

**Perfil de entrega:** `deploy` · **Alvo:** `vps-docker`

**Caminhos do artefato** (mudança aqui exige release):

- `src/`
- `migrations/`
- `Dockerfile`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`

**Zonas sensíveis** (revisão humana):

- `migrations/**`
- `src/interface/http/seguranca/**`
- `src/dominio/apelido/**`
- Sempre: `.github/**`, `tests/aceite/**`, `STACK.md`, `DESIGN.md`, `PRODUTO.md`, `bigbang.toml`, `flags.toml` e os arquivos de dependência da stack.

<!-- bb:config:fim -->

## Dependências de execução permitidas

Toda dependência **direta de execução** precisa estar nesta tabela (a *Guarda da stack* lê esta tabela).
Dependências de desenvolvimento são livres. Linha nova só com ADR e pelo portão de tecnologia (`bb-nova-tecnologia`).

<!-- bb:dependencias:inicio -->
| Pacote | Ecossistema | Faixa de versão | Para quê | ADR |
| --- | --- | --- | --- | --- |
| `fastify` | npm | `^5.12.0` | Servidor HTTP da API e do jogo | ADR-0001 |
| `@fastify/rate-limit` | npm | `^11.2.0` | Limite de envios de placar (SEG-IA-05) | ADR-0001 |
| `@fastify/static` | npm | `^10.1.0` | Servir o jogo compilado sob `BASE_PATH` | ADR-0001 |
| `pg` | npm | `^8.23.0` | Acesso ao Postgres e migrações | ADR-0001 |
<!-- bb:dependencias:fim -->

## Histórico de mudanças

| Data | O que mudou | ADR |
| --- | --- | --- |
| 06/10/2026 | Versão inicial (Fundação F2) | ADR-0001 |
