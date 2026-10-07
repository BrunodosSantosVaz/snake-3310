# Snake 3310 — Contêineres (C4, nível 2)

O jogo fala só com a API da própria aplicação (ARQ-06, SEG-IA-01).

```mermaid
C4Container
  title Contêineres — Snake 3310
  Person(jogador, "Jogador")
  System_Boundary(sistema, "Snake 3310") {
    Container(web, "Jogo", "TypeScript, Canvas, Vite", "Desenha o 3310, roda a partida e chama a API")
    Container(api, "API", "TypeScript, Fastify 5, Node 24", "Valida e guarda placares, lista o ranking e serve o jogo")
    ContainerDb(banco, "Banco de dados", "SQLite do Node 24.18.1", "Placares do ranking")
  }
  Rel(jogador, web, "Joga", "HTTPS")
  Rel(web, api, "Envia placar e lê ranking", "HTTPS/JSON em <BASE_PATH>/api")
  Rel(api, banco, "Lê e grava", "SQL")
```

| Contêiner | Tecnologia | Responsabilidade | Onde roda |
| --- | --- | --- | --- |
| Jogo | TypeScript, Canvas 2D, Vite 8 | Tela e teclado do 3310, laço da partida e envio do placar | Navegador; arquivos servidos pela API |
| API | TypeScript, Fastify 5, Node 24 | Validação do placar, filtro de apelido, limite de envios, ranking, saúde em `<BASE_PATH>/api/health` | Imagem `linux/arm64` no `vm-oracle`: Docker Compose (`vps-docker`) agora, Tsuru depois |
| Banco de dados | SQLite nativo | Placares (apelido, pontos, data UTC) | Arquivo `SQLITE_PATH` no volume persistente da API; uma réplica por ambiente, ADR-0003 |

SQLite substitui o servidor PostgreSQL por decisão explícita do dono (ADR-0003). Não é um contêiner separado: o mesmo processo da API acessa o arquivo. A imagem/PVC e inicialização que migra antes de listen serão validados na entrega #19.
