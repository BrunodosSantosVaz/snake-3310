# ADR-0001: Stack TypeScript com Fastify e Postgres, e entrega pela ponte vps-docker até o alvo Tsuru

- **Situação:** proposta
- **Data:** 2026-10-06
- **Decisores:** Bruno dos Santos Vaz (dono); Claude (pesquisa e proposta)

## Contexto e problema

O Snake 3310 é um jogo da cobrinha no navegador, com ranking público por apelido e ASVS L1
([PRODUTO.md](../../PRODUTO.md)). É preciso escolher linguagem, frameworks, banco, ferramentas de qualidade e onde
publicar. O dono quer o jogo no Tsuru do `vm-oracle`, em `https://tsuru.frontzap.com.br/snake-3310`, com custo
extra de R$ 0. O Big Bang v1.4.0 só implementa o alvo de deploy `vps-docker`.

## Fatores de decisão

- Custo extra de R$ 0, usando o servidor `vm-oracle` (ARM64, 4 vCPU, 24 GB de RAM).
- O dono pediu que a IA escolha a stack mais apropriada.
- Padrões do Big Bang: camadas com teste de arquitetura (ARQ-01), processo sem estado (ARQ-07), validação no
  backend (SEG-IA-02), limite de requisições com teste de 429 (SEG-IA-05) e cobertura de 80%.
- Uma só imagem, por digest, em staging e produção, sob caminhos diferentes.
- O objetivo principal é validar a esteira até produção agora.
- Manutenção ativa e licença permissiva.

## Opções consideradas

1. **A · TypeScript ponta a ponta:** Vite e Canvas, Fastify 5 em Node 24, Postgres, Vitest, Playwright, ESLint e
   dependency-cruiser.
2. **B · Python com front em TypeScript:** FastAPI, Postgres, front em TS/Vite, pytest, ruff, mypy e import-linter.
3. **C · TypeScript mínimo:** Hono com SQLite num volume.

Para a entrega:

1. `vps-docker` no `vm-oracle`, como está no framework.
2. Tsuru direto, depois de um épico no framework que crie o alvo.
3. **Ponte:** `vps-docker` agora, na URL final, e Tsuru quando o alvo existir.

Comparação completa e fontes: [pesquisa de 2026-10-06](../pesquisa/2026-10-06-stack.md).

## Decisão e justificativa

Escolhida a **opção A, com entrega pela ponte (3)**.

- **Por que a opção A:** uma linguagem e uma cadeia de ferramentas, peças maduras com releases em
  setembro e outubro de 2026, e limite de requisições oficial do Fastify. O Postgres já roda no servidor e mantém
  a app sem estado. A opção B dobra a manutenção e depende do `slowapi`, pouco mantido. A opção C exige volume,
  o que fere o ARQ-07 e complica o Tsuru.
- **Por que a ponte:** só o `vps-docker` funciona hoje, e o jogo nasce pronto para o Tsuru: sem estado, com
  `BASE_PATH` lido na execução, Postgres externo, migração como comando separado e imagem `linux/arm64`. O
  roteador do Tsuru já aceita rota por caminho (`--router-opts route=/snake-3310`).

## Consequências

### Positivas

- O primeiro deploy real valida a esteira e ajuda a fechar a #99 e o E9 do framework.
- A URL pública fica igual na troca para o Tsuru.
- Uma única linguagem para o jogo, a API e os testes.

### Negativas

- **TypeScript fixo em 6.0.x** até o typescript-eslint aceitar a versão 7. O Dependabot vai propor a 7, e ela
  deve ser recusada até lá.
- **Dois alvos até a migração.** Isso exige um épico no `BrunodosSantosVaz/big-bang` para o alvo Tsuru, com
  publicar por digest, saúde, voltar versão e migração. Hoje não há passo nativo de migração única no Tsuru, e o
  `tsuru job` ainda é hipótese.
- **Rota no NPM:** na troca para o Tsuru, a rota (*custom location*) muda. O dono configura uma rota por
  ambiente.
- **IP real no limite de envios:** a cadeia Cloudflare → NPM → app exige `trustProxy` restrito aos saltos
  conhecidos.
- **Homologação em `/snake-3310-hom`**, por decisão do dono, e não em `/staging/snake-3310`, que era o que a
  pesquisa sugeria. O endereço `/snake-3310` é prefixo de `/snake-3310-hom`. O proxy escolhe o prefixo mais
  longo, e a app só aceita rotas em `BASE_PATH` exato ou `BASE_PATH/`, com teste.
- **Placar falso:** o servidor não vê a partida. A validação cobre faixa, plausibilidade e tempo mínimo de partida.
  Um placar falso, mas plausível, é risco aceito para um jogo de portfólio.
- **Filtro de palavrões em português:** não há biblioteca madura, então a lista é própria, no domínio e testada.

## Referências

- [Pesquisa de stack, 2026-10-06](../pesquisa/2026-10-06-stack.md)
- [Issue #5 (F2)](https://github.com/BrunodosSantosVaz/snake-3310/issues/5)
- `.bigbang/esteira/perfis/deploy/alvos/vps-docker/README.md`
- Big Bang [#91 (E9)](https://github.com/BrunodosSantosVaz/big-bang/issues/91) e
  [#99](https://github.com/BrunodosSantosVaz/big-bang/issues/99)
