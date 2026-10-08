# Deploy no Tsuru existente

## Pré-condições

Tsuru existente pronto, apps `snake-3310-hom`/`snake-3310`, prefixos separados, um PVC gravável por UID/GID 1000
em `/data`, plano SQLite Retain e uma réplica permanente. Configure variáveis de runtime do README e, no GitHub,
`TSURU_TARGET`, `TSURU_APP`, `TSURU_MIGRACAO=inicializacao` e `TSURU_TOKEN` restrito à app do ambiente.
As apps preparadas usam `SQLITE_PATH=/data/snake.sqlite`, correspondente à fonte do script de backup; o
padrão da imagem é `/data/scores.sqlite`. Confirme a configuração da app, nunca restaure em um segundo arquivo
que o processo não está usando.

Configure `TRUSTED_PROXY_IPS` com IPs individuais do último peer real observado. O NPM deve sobrescrever
`X-Snake-Client-IP` com a origem saneada, sem aceitar o cabeçalho fornecido pelo visitante. A API só aceita um
IP válido desse peer exato, normaliza IPv4 mapeado e usa o peer se o valor faltar/for inválido. Não habilite
trustProxy global, CIDRs privados nem X-Forwarded-For como chave do limite. Confira o comportamento em staging:
clientes distintos mantêm contadores próprios e cabeçalho forjado não permite contornar 429.

A imagem de origem precisa ser legível pelo builder Tsuru; publicar no GHCR não prova acesso do servidor.

## Publicação

1. Conclua tarefas e docs do épico, revisões independentes e CI verde no SHA exato.
2. Rode *Integrar release* com os épicos prontos, primeiro em simulação. Para a primeira entrega, integre #13 e #28
   juntos: a base de menu sozinha não satisfaz o jogo pedido pelo dono.
3. Aguarde candidata e staging: construção ARM64, scanner HIGH/CRITICAL, SBOM/atestação, migração/startup,
   health/readiness, smoke e ZAP. Se um portão falhar, corrija a causa; não desative o check.
4. Confira comportamento do jogo/ranking no endereço de homologação e registre evidência/decisão do dono.
5. Execute *Publicar em produção* conforme os inputs do workflow. Aguarde suíte completa e aprovação do ambiente
   pelo dono. A ordem ampla atual do dono já autoriza esta entrega; o recibo deve registrar a frase e as provas reais.
6. Confira URL, eventos, imagem de origem e interna do Tsuru, um PVC por app, anotação do ingress e réplica desejada de 1.
7. Execute smoke remoto. Com dados de teste, confirme partida/modal/POST e GET, foco/teclado/toque, prefixo e
   permanência do placar após reinício controlado. Registre o saneamento do cabeçalho e o peer exato.
8. Execute backup, confira restauração/quick_check e publique recibos sem credenciais ou dados pessoais. A cópia
   local cifrada de 14 dias não comprova recuperação de desastre; a custódia externa continua pendente.

## Identidade da versão

Não rebuildar para produção. O Tsuru pode atribuir outra referência interna; conserve SHA da release, digest OCI
de origem e evento de cada importação. `api/health` prova processo; `api/ready` prova banco respondendo. Preserve
imagem/candidata anterior para rollback. Primeiro deploy pode partir de unidades vazias; não declarar persistência
até gravar/consultar dados controlados e reiniciar de forma verificada.

[Adaptador oficial](../../.bigbang/docs/deploy-tsuru.md), [Checklist](checklist-producao.md).

## Evidência executada

A [produção v0.1.0](producao-010.md) registra os ensaios reais de ambos ambientes,
persistência após reinício, execução do daemon cron e restauração local dos snapshots cifrados.
