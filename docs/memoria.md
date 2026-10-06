# Memória do projeto

Pegadinhas que a próxima sessão precisa saber. Uma linha por item, com a data e o PR de origem.

- 2026-10-06 (#10, PR #22): a marca de pendente é `test.fails` (Vitest). O `testes.padrao_teste` precisa reconhecê-la,
  senão a rastreabilidade do `regras` não enxerga os testes de aceite pendentes.
- 2026-10-06 (#15): no Fastify, o `setErrorHandler` vale só para os plugins registrados **depois** dele. Registre-o
  antes das rotas, ou o erro interno vaza na resposta.
- 2026-10-06 (#15): o `@fastify/static` exige `root` absoluto. A configuração resolve `WEB_DIR` com `path.resolve`.
- 2026-10-06 (#14): os testes de aceite carregam os módulos com `import()` dinâmico. Assim, um teste de tarefa ainda
  não feita falha sozinho, sem quebrar o `tsc` nem o arquivo inteiro.
- 2026-10-06 (#9): esta sessão na nuvem não tem `gh` autenticado. Os passos de admin rodam por workflow temporário com
  o `PROJETO_TOKEN`, sempre com a autorização do dono na conversa.
