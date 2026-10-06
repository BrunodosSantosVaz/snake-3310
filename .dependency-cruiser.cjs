// Architecture test (ARQ-01, ARQ-02, ARQ-06): dependencies point inwards.
//   dominio  -> nothing (no packages, no node built-ins)
//   aplicacao -> dominio
//   infra    -> aplicacao, dominio
//   interface -> aplicacao, dominio, infra (composition root)
//   web      -> nothing on the server side
module.exports = {
  forbidden: [
    {
      name: 'dominio-isolado',
      severity: 'error',
      from: { path: '^src/dominio' },
      to: { path: '^src/(aplicacao|infra|interface|web)' },
    },
    {
      name: 'dominio-sem-pacotes',
      severity: 'error',
      from: { path: '^src/dominio' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'core'] },
    },
    {
      name: 'aplicacao-so-dominio',
      severity: 'error',
      from: { path: '^src/aplicacao' },
      to: { path: '^src/(infra|interface|web)' },
    },
    {
      name: 'aplicacao-sem-pacotes',
      severity: 'error',
      from: { path: '^src/aplicacao' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer'] },
    },
    {
      name: 'infra-sem-interface',
      severity: 'error',
      from: { path: '^src/infra' },
      to: { path: '^src/(interface|web)' },
    },
    {
      name: 'web-sem-servidor',
      severity: 'error',
      from: { path: '^src/web' },
      to: { path: '^src/(dominio|aplicacao|infra|interface)' },
    },
    {
      name: 'servidor-sem-web',
      severity: 'error',
      from: { path: '^src/(dominio|aplicacao|infra|interface)' },
      to: { path: '^src/web' },
    },
    {
      name: 'sem-ciclos',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: { path: '\\.test\\.ts$' },
  },
};
