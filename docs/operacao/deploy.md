# Deploy no Tsuru existente

## Pré-condições

Tsuru existente pronto, apps `snake-3310-hom`/`snake-3310`, prefixos separados, um PVC gravável por UID/GID 1000
em `/data`, planoSQLite Retain e uma réplica permanente. Configure variáveis de runtime do README e, no GitHub,
`TSURU_TARGET`, `TSURU_APP`, `TSURU_MIGRACAO=inicializacao` e `TSURU_TOKEN` restrito à app do ambiente.
A imagem de origem precisa ser legível pelo builder Tsuru; publicar no GHCR não prova acesso do servidor.

## Publicação

1. Conclua tarefas e docs do épico, revisões independentes e CI verde no SHA exato.
2. Rode *Integrar release* com os épicos prontos, primeiro em simulação. Para a primeira entrega, integre #13 e #28
   juntos: a base de menu sozinha não satisfaz o jogo pedido pelo dono.
3. Aguarde candidata e staging: construção ARM64, scannerHIGH/CRITICAL, SBOM/atestação, migração/startup,
   health/readiness, smoke e ZAP. Se um portão falhar, corrija a causa; não desative o check.
4. Confira comportamento do jogo/ranking no endereço de homologação e registre evidência/decisão do dono.
5. Execute *Publicar em produção* conforme os inputs do workflow. Aguarde suíte completa e aprovação do ambiente
   pelo dono. A ordem ampla atual do dono já autoriza esta entrega; o recibo deve registrar a frase e as provas reais.
6. Confira URL, eventos, imagem de origem e interna do Tsuru, um PVC por app, anotação do ingress e réplica desejada de 1.
7. Execute smoke remoto e backup, confira restauro/quick_check e publique os recibos sem credenciais.

## Identidade da versão

Não rebuildar para produção. O Tsuru pode atribuir outra referência interna; conserve SHA da release, digestOCI
de origem e evento de cada importação. `api/health` prova processo; `api/ready` prova banco respondendo. Preserve
imagem/candidata anterior para rollback. Primeiro deploy pode partir de unidadesvazias; não declarar persistência
até gravar/consultar dados controlados e reiniciar de forma verificada.

[Adaptador oficial](../../.bigbang/docs/deploy-tsuru.md), [Checklist](checklist-producao.md).
