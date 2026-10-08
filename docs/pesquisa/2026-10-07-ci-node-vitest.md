# Runtime da CI e grafo de testes

Pesquisa para #36, em 2026-10-07.

- [Distribuição oficial Node 24.18.1](https://nodejs.org/dist/v24.18.1/): hashes fixados para os arquivos Linux
  x64 (`d6c664df3f3f61458e8c277585571328522d705166723a7c7823a9253a4d15a0`) e ARM64
  (`7201e3a09dc825bac57867c81913e2b8f0ef87d04cb9082af4cda82f6ff3d88c`).
- [CLI do Vitest](https://vitest.dev/guide/cli): `related` trabalha com imports estáticos e não resolve
  `import(variable)`. Aceites com esses imports precisam de mapeamento explícito ou suíte completa.
- [API do Vitest](https://vitest.dev/api/advanced/vitest): `createVitest` e
  `getRelevantTestSpecifications` permitem obter os testes relacionados sem executá-los. A implementação
  usa o grafo SSR do Vite já transformado para as dependências e a inclusão de cobertura.

Foi verificado com o Vitest 5.0.3 do lockfile: mudança em `src/aplicacao/health.ts` seleciona sua unidade e
integração HTTP, mas exclui `src/aplicacao/ranking.test.ts`. Mudança em `src/aplicacao/ranking.ts` inclui
na cobertura o próprio módulo e `src/dominio/ranking.ts`.
