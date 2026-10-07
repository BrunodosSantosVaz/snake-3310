# Conferência documental — tarefa #34, épico #28

Estado em 07/10/2026: partida #31/PR44, backend #32/PR47 e modal #33/PR49 mesclados no épico. A base #13,
SQLite #27 e empacotamento/Flash #19/#36 permanecem preservados. A primeira candidata conjunta #13+#28,
homologação e publicação ainda aguardam a integração; este documento não é um recibo de produção.

## Mapa dos 13 critérios

| Épico/critério | Regra | Teste congelado | Tarefa e PR de implementação |
| --- | --- | --- | --- |
| #13 CA-1: saúde independente do banco | RN-0003 | `tests/aceite/13-esqueleto-andante/esqueleto.test.ts` CA-1 | #15/PR23 |
| #13 CA-2: prontidão 200/503 | RN-0003 | mesmo arquivo, CA-2 | #16/PR24; adaptador SQLite #27/PR29 |
| #13 CA-3: top dez e desempate | RN-0001 | mesmo arquivo, CA-3 | #17/PR25 |
| #13 CA-4: ranking vazio | RN-0001 | mesmo arquivo, CA-4 | #17/PR25 |
| #13 CA-5: prefixo exato e página | RN-0002 | mesmo arquivo, CA-5 | #15/PR23; interface #18/PR26 |
| #28 CA-1: mover, comer e crescer | RN-0004 | `tests/aceite/28-partida-completa/game.test.ts` CA-1 | #31/PR44 |
| #28 CA-2: inversão, colisão e grade cheia | RN-0004 | mesmo arquivo, CA-2 | #31/PR44 |
| #28 CA-3: teclado/toque, pausa/blur e reinício | RN-0004 | `tests/aceite/28-partida-completa/ui.test.ts` CA-3 | #31/PR44 |
| #28 CA-4: POST, UTC e GET real | RN-0001/RN-0005 | `tests/aceite/28-partida-completa/scores.test.ts` CA-4 | #32/PR47 |
| #28 CA-5: entrada inválida não grava | RN-0005 | mesmo arquivo, CA-5 | #32/PR47 |
| #28 CA-6: limite, proxy e IP independente | RN-0006 | mesmo arquivo, CA-6 | #32/PR47 |
| #28 CA-7: loading, sucesso/erro/429 e resposta antiga | RN-0005/RN-0006 | `tests/aceite/28-partida-completa/ui.test.ts` CA-7 | #33/PR49 |
| #28 CA-8: build real, 360 px/texto a 200%, foco, toque e axe | RN-0004/RN-0005, DESIGN | `tests/aceite/28-partida-completa/browser.test.ts` CA-8 | #33/PR49 |

As RN-0004/5/6 estão em [regras](../negocio/regras/RN-0004-partida.md),
[envio](../negocio/regras/RN-0005-envio-placar.md) e [limite](../negocio/regras/RN-0006-limite-envios.md).
A base documental do esqueleto está na [conferência #20](documentacao-20.md).

## Testes antes da implementação e prova final

O teste #30/[PR35](https://github.com/BrunodosSantosVaz/snake-3310/pull/35) fixou os oito critérios do épico #28
antes das tarefas #31/#32/#33. Somente `bb aceite liberar` retirou as respectivas marcas; os cenários permanecem
congelados. Unidade também precedeu código: #31 `3cfe70a`, #32 `3485659`/`61c6288` e #33 `7452d9e`/`80fdd7d`.
Os PRs registram o estado vermelho observado antes da implementação, incluindo o adaptador de fetch que
perdia método/corpo/AbortSignal e foi corrigido na #33.

A [CI do PR49](https://github.com/BrunodosSantosVaz/snake-3310/actions/runs/37581589449), no SHA exato
`a0b9324ade86dc9d827b3a07ed659a48e8821654`, executou 135 testes de unidade/integração, os 13 CA sem pendentes e
128 testes na rodada de cobertura, com 100% nas quatro métricas dos módulos incluídos. Lint, tipos, arquitetura,
build e scanners do mesmo SHA ficaram verdes. A alteração #34 é documental; reutiliza essa evidência de runtime
e conserva sua própria CI no SHA documental, sem suíte local repetida por hábito.

O script `scripts/check-game-ui.mjs` comprovou adicionalmente em Chromium: movimento/pixels, pausa, Enter →
POST 201 único, SQLite isolado persistido → GET do ranking, reinício/foco, CSP, axe, 360 px, texto a 200% e toque de 44 px.
A captura [partida](../imagens/partida-3310.png) é real, com canvas em execução; a captura
[menu](../imagens/menu-3310.png) foi preservada. Verificação automática de acessibilidade não equivale a uma
certificação completa de WCAG, e execução local/CI não comprova o ambiente remoto.

## Checklist 9.4

| Item | Conferência e documento |
| --- | --- |
| RN novas/alteradas | RN-0004/5/6 descrevem motor, POST e limite; RN-0001/2/3 continuam vigentes |
| Glossário | [PT ↔ EN](../produto/glossario.md): partida, direção, comida, estado, envio, proxy e limite |
| C4/arc42 | [Arquitetura](../arquitetura/README.md), contexto e contêineres incluem motor/front, POST e mapa temporário |
| Contrato API | [OpenAPI](../api/openapi.yaml): health/ready/GET/POST, tipos/status, UTC, 429 e limite de corpo |
| Inventário LGPD | [Inventário](../dados/inventario.md): apelido público, UTC/ID, IP temporário e logs, backup local com 14 dias de retenção; sem promessa de anonimato |
| Runbooks | [Operação](README.md): CI, deploy, rollback, backup/restauração, incidente e rotação; primeira operação ainda requer recibos |
| Guia e imagem | [Interface](../guias/interface.md): teclado/toque, pausa, modal, erros, ranking e screenshot real |
| ADR | ADR-0003/0004 preservadas; RN materializam o protótipo aprovado, sem nova decisão de stack/produto/design nesta tarefa |
| Changelog | [Rascunho não publicado](../../CHANGELOG.md); versão/data serão preenchidas na integração |
| README | [README](../../README.md) completo: estado, recursos, instalação local, uso, variáveis, privacidade e limitações |
| Checklist produção | [Portões](checklist-producao.md): evidências executáveis e itens inaplicáveis com motivo; não marcar deploy/restauração como feitos |

Não se aplicam novos ADR de tecnologia ou modelo de autenticação: nenhuma dependência, login ou privilégio novo
foi introduzido no épico #28. As decisões de grade, pontos, modal e limite constam do refinamento aprovado e das RN.
O artefato, framework e testes congelados não são alterados pela tarefa #34.

## Evidências ainda necessárias na entrega

A integração conjunta precisa gerar candidata e registrar SHA/digest de origem, resultado de staging/scans/smoke/ZAP,
evento de importação Tsuru e imagem interna, URLs verificadas, PVC/UID/réplica, saneamento do cabeçalho do NPM e
peer confiado. A prova de persistência exige enviar/consultar placar controlado e verificar após reinício; backup
exige snapshot íntegro de cada app e restauração/quick_check registrados. Usar somente dados de teste e não
publicar tokens, chaves, IPs de visitantes ou apelidos reais nos recibos.

Ainda não há release anterior para um rollback real da primeira versão. Backup/chave locais com retenção de
14 dias não resolvem perda total do host; cópia independente/custódia externa continuam pendentes. As receitas
não autorizam afirmar que recuperação remota, DR ou produção já foram concluídos.
