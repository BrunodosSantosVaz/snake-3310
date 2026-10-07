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
| Prontidão | `CheckReadiness` | Banco respondendo;503 impede considerar a app pronta. |
| Prefixo do ambiente | `basePath`, `BASE_PATH` | Caminho exato da página/API, separado por ambiente. |
| Migração | `migrate`, `schema_migrations` | Lote SQL transacional/idempotente antes de HTTP. |
| Arquivo do ranking | `SQLITE_PATH` | SQLite durável, junto deWAL/SHM; nunca artefato do front. |
| Candidata | RC | Imagem testada/homologada antes da promoção pelo mesmo digest. |
