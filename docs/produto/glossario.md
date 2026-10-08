# Glossário

| Termo de negócio | Nome no código | Significado |
| --- | --- | --- |
| Placar | `Score` | Apelido, pontos e data de envio guardados no banco. |
| Ranking | `ListRanking`, `RankingEntry` | Os dez maiores placares públicos; empate favorece o mais antigo (RN-0001). |
| Apelido | `nickname` | Texto público escolhido pelo jogador; não é uma identidade de acesso. |
| Pontos | `points` | Inteiro de 0 a 1.890, múltiplo de sete, no envio público (RN-0005). |
| Enviado em | `createdAt`, `created_at` | Data em UTC usada no desempate; não aparece na resposta pública. |
| Enviar placar | `SubmitScore`, `ScoreWriter` | Valida dados públicos e registra pontos com data do servidor. |
| Envio válido | `validSubmission`, `ScoreSubmission` | Apelido de 3–12 letras/números Unicode, sem termo bloqueado, e pontos plausíveis. |
| Limite de envios | `ScoreLimit` | Cinco tentativas por IP em 60 segundos; novos IPs também são bloqueados se a capacidade local estiver cheia. |
| IP do jogador | `scoreClientIp` | Peer real, ou IP único no cabeçalho dedicado de um peer explicitamente confiado. |
| Prontidão | `CheckReadiness` | Banco respondendo; 503 impede considerar a app pronta. |
| Prefixo do ambiente | `basePath`, `BASE_PATH` | Caminho exato da página/API, separado por ambiente. |
| Migração | `migrate`, `schema_migrations` | Lote SQL transacional/idempotente antes de HTTP. |
| Arquivo do ranking | `SQLITE_PATH` | SQLite durável, junto de WAL/SHM; nunca artefato do front. |
| Candidata | RC | Imagem testada/homologada antes da promoção pelo mesmo digest. |
| Partida | `GameState`, `newGame` | Cobra, comida, direção, pontos e estado de uma grade 21×13. |
| Cobra e comida | `snake`, `food` | Segmentos ordenados; comida sempre em célula livre, ou null na grade cheia. |
| Direção | `Direction`, `turnGame` | Movimento por passo; reversão imediata ignorada, inclusive com comandos rápidos. |
| Passo | `stepGame`, `tickMilliseconds` | Avanço de 180 ms; comida acrescenta um segmento e sete pontos. |
| Pausa e fim | `paused`, `ended` | Pausa congela o timer; colisão/grade cheia encerra e abre o modal. |
| Estado do envio | `sendState` | `idle`, `sending` ou `sent`; envio confirmado bloqueado nessa partida. |
| Resposta antiga | `sendRequestId`, `AbortController` | Geração e cancelamento da espera impedem alterar uma nova partida. |
| Proxy confiado | `TRUSTED_PROXY_IPS`, `trustedPeers` | IPs individuais do último peer; só eles podem informar o cabeçalho saneado. |
