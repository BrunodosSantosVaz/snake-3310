id: RN-0002
titulo: O jogo responde só no endereço configurado
situacao: vigente
substituida_por:
origem: "#13"
criada_em: 2026-10-06

## Descrição

Regra aprovada no [épico #13](https://github.com/BrunodosSantosVaz/snake-3310/issues/13): jogo e API usam um
endereço próprio, `/snake-3310` em produção e `/snake-3310-hom` em homologação. Um endereço que apenas começa
com o mesmo texto responde 404. O bootstrap #55 conserva as URLs existentes; não acrescenta runtime à Fundação.

## Testes que cobrem

- [CA-1 do bootstrap](../../../tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs): preservação das
  URLs na configuração. Não comprova respostas HTTP; essas provas pertencem à release do épico #13.
