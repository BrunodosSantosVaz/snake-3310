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
- 2026-10-06 (#15): o servidor usa `trustProxy: false`. Atrás do NPM, `request.ip` é o IP do proxy. A tarefa do
  limite de envios (SEG-IA-05) precisa configurar `trustProxy` com o endereço do proxy, senão todos os jogadores caem
  no mesmo balde.
- 2026-10-06 (#15): todo erro da API sai em Problem Details (`src/interface/http/problem.ts`), com título controlado.
  Só os 4xx mantêm o status; o resto vira 500.
- 2026-10-06 (#16): as migrações são SQL puro em `migrations/NNNN_nome.sql`, aplicadas em ordem e uma vez só
  (`schema_migrations`). Nunca altere uma migração já publicada: crie outra (DAD-02, expandir e contrair).
- 2026-10-06 (#16): o "não pronto" do `/api/ready` usa `UNAVAILABLE` (503). O `problemFor` transforma tudo que não
  é 4xx em 500, de propósito, para erros inesperados.
