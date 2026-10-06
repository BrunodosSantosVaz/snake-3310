# ADR-0002: Testes de aceite e de integração com PGlite

- **Situação:** proposta (aguarda a decisão do dono, registrada com `bb decisao`)
- **Data:** 2026-10-06
- **Decisores:** Claude (proposta); o dono decide

## Contexto e problema

O `STACK.md` previa os testes de aceite com "Postgres real em contêiner". A CI do Big Bang (`bb-ci.yml`, gerado e
não editável) não sobe um serviço de banco, e a sessão de desenvolvimento na nuvem não tem Docker. Sem banco, os
testes de aceite que dependem do Postgres não rodariam na CI.

## Fatores de decisão

- Rodar os testes de aceite e de integração em toda CI, sem mudar a esteira gerada.
- Comportamento de Postgres de verdade (SQL, tipos, índices, transações, advisory locks), e não um banco falso.
- Testes rápidos e isolados (um banco novo por teste).

## Opções consideradas

1. **PGlite** (`@electric-sql/pglite`, dependência de desenvolvimento): Postgres compilado para WebAssembly, em
   memória, dentro do processo do teste.
2. **Testcontainers** com Postgres 18: exige Docker na CI e na máquina de quem desenvolve.
3. **Banco falso em memória**: não testa o SQL de verdade.

## Decisão e justificativa

Proposta a **opção 1, PGlite**. Ela roda o mesmo motor do Postgres, sem Docker, e cria um banco isolado por teste
em milissegundos.

## Consequências

### Positivas

- Os testes de aceite e de integração rodam em toda CI e em qualquer máquina.

### Negativas

- A versão do PGlite pode ficar atrás do Postgres 18 de produção. Recurso muito novo do Postgres precisa ser
  conferido antes de usar.
- O PGlite tem uma conexão só, então problemas de concorrência entre conexões não aparecem nos testes. Por isso as
  migrações usam transação explícita por conexão e `pg_advisory_xact_lock`, testadas no código e na revisão.
- O primeiro deploy no staging (candidata) é o teste contra o Postgres 18 real.

## Referências

- PR #24 (revisão que apontou a divergência)
- https://github.com/electric-sql/pglite
