id: RN-0002
titulo: O jogo responde só no endereço configurado
situacao: vigente
substituida_por:
origem: "#13"
criada_em: 2026-10-06

## Descrição

O jogo e a sua API ficam num endereço próprio dentro do domínio, por exemplo `/snake-3310` em produção e
`/snake-3310-hom` em homologação. A página do jogo abre nesse endereço. Um endereço que só começa com o mesmo texto
não é o jogo e responde "não encontrado".

## Exemplos

- Dado o jogo configurado em `/snake-3310-hom`, quando alguém abre `/snake-3310-hom/`, então vê a página do jogo.
- Dado o jogo configurado em `/snake-3310-hom`, quando alguém abre `/snake-3310-hom-x/`, então recebe "não
  encontrado" (404).

## Exceções

Nenhuma.

## Testes que cobrem

- tests/aceite/13-esqueleto-andante/esqueleto.test.ts (CA-5)

- [CA-1 do bootstrap](../../../tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs): preservação de URLs na etapa F5 sem artefato; prova histórica dos PRs #59/#61, complementar às respostas HTTP da app.
