# Bootstrap da Fundação Flash/Tsuru — épico #55

A Fundação configura a esteira para Tsuru antes da primeira promoção do jogo. O bootstrap é sem release:
conserva os sete caminhos originais do artefato e os comandos originais; não acrescenta runtime, pacote,
migração, Dockerfile, scripts do jogo ou recursos de design. A decisão é a já autorizada na
[tarefa #36](https://github.com/BrunodosSantosVaz/snake-3310/issues/36#issuecomment-6030577155), registrada no
[ADR-0004](../decisoes/ADR-0004-flash-tsuru-ci.md).

## Estado e rastreio

A implementação foi mesclada no [PR #61](https://github.com/BrunodosSantosVaz/snake-3310/pull/61), após o
[aceite #59](https://github.com/BrunodosSantosVaz/snake-3310/pull/59). Integração e publicação sem release
aguardam a conclusão da documentação #58 e seus portões. A produção do jogo é uma etapa posterior da release.

| Critério | Regras existentes | Prova | Implementação |
| --- | --- | --- | --- |
| CA-1: Flash/Tsuru, OCI ARM64, readiness, URLs e Fundação sem artefato | [RN-0002](../negocio/regras/RN-0002-endereco-do-jogo.md), [RN-0003](../negocio/regras/RN-0003-disponibilidade.md) | [CA nativo congelado](../../tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs), parser e gerados oficiais | #57, PR #61 |

Teste antes do código (TST-03): commit `8d94f33322e3a9a5114e3fb20c3e1941efd5ee5b` no PR #59; a execução
sem a marca estrita falhou em `padrao !== flash`. A implementação `d53c0a2f54a946daa0f2c1db725b9865ba20689e`
no PR #61 retirou somente a pendência da #57, por `bb aceite liberar 57`, e passou CA-1 (1/1). CI, regras,
segurança e CodeQL desse SHA passaram. O gerador simulou e aplicou exatamente cinco arquivos: candidata,
produção, rollback, AGENTS e bloco de STACK.

## Executar e interpretar a prova

Com Node 24 e Python 3.11 ou superior, na Fundação sem artefato:

```sh
node --test tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs
python3 .bigbang/bin/bb.py verificar
python3 .bigbang/bin/bb.py esteira documentacao
```

O CA usa o parser oficial e verifica modo, alvo, formato, imagem, ARM64, serviços, readiness, URLs, versão
1.5.2, gerados e ausência de artefato. Ele é uma prova da configuração da Fundação, fora do glob Vitest da app.
A execução explícita não equivale a testar o jogo ou suas respostas HTTP.

A CI oficial e `bb testes --completo` reconhecem a Fundação sem artefato (F5); comandos npm ausentes são
pulados pelo framework. A suíte interna de desenvolvimento do Big Bang pertence ao repositório do framework:
uma execução adicional no consumidor apresentou falhas de fixtures, com um caso reproduzido na base intacta
73babe5. O [recibo do PR #61](https://github.com/BrunodosSantosVaz/snake-3310/pull/61#issuecomment-6033860383)
preserva esse resultado. Não houve alteração de framework ou dispensa de checks canônicos.

## Integrar e publicar a configuração

1. Conferir merge dos três PRs, revisão independente e CI verde nos respectivos SHAs. Liberar posses pela CLI
   oficial antes de remover worktrees limpas.
2. Rodar **Integrar release** com `epico=55` e `simular=true`; o plano deve reconhecer o épico sem release e
   integrar sua configuração em develop. Após conferir o plano, executar `simular=false` e aguardar CI da ponta.
3. Rodar **Publicar sem release** com `simular=true`. O portão exige main ancestral de develop, CI verde na
   ponta e nenhuma diferença nos caminhos do artefato lidos da main.
4. Somente com ordem explícita do dono, executar `simular=false`, entregar o link do run e aprovar o ambiente
   `producao` após o portão. O fluxo oficial avança main por fast-forward e conclui o épico sem release.
5. Conferir SHA e configuração efetiva da main, workflows Tsuru regenerados, fechamento e limpeza. Se houver
   conflito na promoção da release, resolvê-lo por PR normal com revisão e CI; não mesclar ou promover manualmente.

A aprovação do ambiente está no fluxo **Review deployments → producao → Approve and deploy**. O comando
`bash .bigbang/esteira/nucleo/scripts/link-aprovacao.sh bb-publicar-sem-release.yml` fornece link e passos.
Tokens e valores dos ambientes protegidos nunca devem aparecer nos documentos ou logs (SEG-IA-04).

## Relação com a promoção do jogo

`testes-producao.sh` resolve o SHA imutável de `origin/release/<versão>` e faz checkout antes de instalar ou
testar. A promoção executa, portanto, a configuração e os comandos completos da release homologada. O
bootstrap não precisa copiar os scripts do jogo para a Fundação e não cria imagem ou tag do jogo.

A evidência de homologação deve corresponder ao digest exato da candidata vigente. SBOM com hash verificado
não deve ser descrito como atestado sem uma atestação própria. Produção exige seus próprios evento, saúde,
volume, persistência e backup real após migração; não declarar esses resultados neste bootstrap.

## Checklist documental 9.4

| Item | Aplicação neste épico |
| --- | --- |
| RNs e critérios | RN-0002/RN-0003 existentes; CA-1 mapeado acima, sem regra nova |
| Glossário | Bootstrap: preparação da configuração inicial; sem release: alteração sem artefato nem versão; readiness: verificação de prontidão dependente do banco |
| C4/arc42 | Não há alteração das camadas/runtime; alvo operacional explicado no STACK e ADR-0004 |
| API | Nenhum contrato ou endpoint alterado; prova HTTP pertence à release |
| LGPD | Nenhum dado ou tratamento novo; nenhum segredo versionado |
| Runbook | Procedimento e portões documentados nesta página |
| Guia/telas/imagem real | Nenhuma mudança de UI; protótipo e recursos de design preservados. Imagens do jogo pertencem à documentação da release |
| ADR | ADR-0004 aplica a decisão existente #36 à Fundação |
| Changelog | Entrada sem versão em Não publicado, a concluir pelo fluxo sem release |
| README/memória | Estado e alcance do bootstrap registrados, sem alegar produção do jogo |
| Checklist de produção | Nota separa publicação sem release dos portões da release do jogo |
