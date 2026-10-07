id: RN-0003
titulo: O sistema informa se está vivo e se está pronto
situacao: vigente
substituida_por:
origem: "#13"
criada_em: 2026-10-06

## Descrição

O sistema tem duas verificações para quem opera o servidor. "Vivo" diz que está tudo bem sempre que o servidor está
de pé, mesmo sem o banco de dados. "Pronto" só diz que está tudo bem quando o banco de dados responde; quando não
está pronto, avisa que está indisponível, sem mostrar detalhes do erro.

## Exemplos

- Dado o servidor de pé e o banco fora, quando a operação pede `/api/health` (vivo), então recebe 200 com
  `{"status":"ok"}`.
- Dado o banco no ar, quando a operação pede `/api/ready` (pronto), então recebe 200.
- Dado o banco fora, quando a operação pede `/api/ready`, então recebe 503, sem a mensagem do erro.

## Exceções

Nenhuma.

## Testes que cobrem

- tests/aceite/13-esqueleto-andante/esqueleto.test.ts (CA-1 e CA-2)

- [CA-1 do bootstrap](../../../tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs): preservação de readiness na etapa F5 sem artefato; prova histórica dos PRs #59/#61, complementar às respostas HTTP da app.
