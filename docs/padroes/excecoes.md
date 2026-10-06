# Exceções aprovadas dos padrões

| Regra | Exceção e controle | Decisão |
| --- | --- | --- |
| ARQ-07 | SQLite é estado no PVC; uma réplica por ambiente, volumes separados, backup/restauração e mesmo artefato por digest | ADR-0003, decisão do dono em #27 |
| DAD-03 | Entrega #19 migrará na inicialização da própria app, na mesma conexão/arquivo, antes de listen; erro impede prontidão. Job independente não compartilha PVC | ADR-0003, decisão do dono em #27 |

As demais regras permanecem aplicáveis. [ADR-0003](../decisoes/ADR-0003-sqlite-embutido.md) registra a autorização,
limitações, controles e diferenças em relação ao banco anterior.
