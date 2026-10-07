id: RN-0003
titulo: O sistema informa se está vivo e se está pronto
situacao: vigente
substituida_por:
origem: "#13"
criada_em: 2026-10-06

## Descrição

Regra aprovada no [épico #13](https://github.com/BrunodosSantosVaz/snake-3310/issues/13): `/api/health` informa
que o servidor está vivo; `/api/ready` depende do banco e responde 503 sem detalhes internos quando indisponível.
O bootstrap #55 configura a esteira para verificar readiness; não altera essas respostas nem entrega a API.

## Testes que cobrem

- [CA-1 do bootstrap](../../../tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs): caminho de
  readiness na configuração. As provas HTTP completas pertencem à release do épico #13.
