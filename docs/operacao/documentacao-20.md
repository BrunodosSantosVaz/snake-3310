# Conferência documental — tarefa #20, épico #13

Base: SQLite #27/PR29, ranking #17/PR25, interface #18/PR26, empacotamento #19/PR40, Flash/Tsuru #36/PR41 e
atualização oficial do framework PR37/39. Produção depende da candidata conjunta com a partida do épico #28.

| Critério | Regra/documento | Aceite | Implementação |
| --- | --- | --- | --- |
| Saúde e prontidão | RN-0003 | esqueleto.test.ts CA-1/CA-2 | #15/PR23, #16/PR24, SQLite #27/PR29 |
| Ranking, empate e vazio | RN-0001 | esqueleto.test.ts CA-3/CA-4 | #17/PR25 |
| Prefixo exato | RN-0002 | esqueleto.test.ts CA-5 | #15/PR23 |
| Menu/ranking acessível | Design e guia | UI, axe e Chromium | #18/PR26 |
| Banco durável, startup e ARM64 | ADR-0003, empacotamento | Unidade, migração e empacotamento | #27/PR29, #19/PR40 |
| Flash e Tsuru | ADR-0004, CI/runbook | Tooling, seletor e CI estrutural | #36/PR41 |

Os cinco CA congelados estão em `tests/aceite/13-esqueleto-andante/esqueleto.test.ts`; testes do épico #28 pertencem
às suas tarefas e não foram liberados nem reescritos nesta documentação. CI não é homologação no Tsuru.

Checklist 9.4: RN/glossário conferidos, C4/arc42 atualizados, OpenAPI para leitura/health/ready,
inventário/retenção/exclusão descritos, runbooks criados, guia e screenshot real preservados, ADR-0002 substituída
por ADR-0003, ADR-0004 Flash e README completo. Changelog é rascunho sem versão; integração preencherá a versão real.
O checklist de produção mantém verificações executáveis e itens inaplicáveis com motivo. Migrações usam a evidência
do portão de testes completos, onde já estão incluídas, evitando outra execução idêntica por hábito.

A [conferência #34](documentacao-34.md) consolida os 13 CA e a documentação da partida/envio do épico #28.
