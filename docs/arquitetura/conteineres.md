# Snake 3310 — Contêineres (C4, nível 2)

O jogo fala só com a API da própria aplicação (ARQ-06, SEG-IA-01). O diagrama mostra o sistema do produto;
os épicos #13/#28 implementam menu, partida, POST e ranking. A publicação da primeira candidata ainda
precisa dos portões e recibos remotos.

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
| API | TypeScript, Fastify 5, Node 24 | Validação do placar, filtro de apelido, limite de envios, ranking, saúde em `<BASE_PATH>/api/health` | Imagem `linux/arm64` no `vm-oracle`: Tsuru existente, imagem ARM64 e uma réplica por ambiente |
| Banco de dados | SQLite nativo | Placares (apelido, pontos, data UTC) | Arquivo `SQLITE_PATH` no volume persistente da API; uma réplica por ambiente, ADR-0003 |

SQLite substitui o servidor PostgreSQL por decisão explícita do dono (ADR-0003). Não é um contêiner separado: o mesmo processo da API acessa o arquivo. A tarefa #19 valida a imagem e o startup local; PVC, permissões, backup e restauração das apps precisam de comprovação na entrega real.

O limitador mantém um mapa temporário na memória da API; não é um serviço externo nem uma tabela de IPs.
NPM sobrescreve `X-Snake-Client-IP`, e só o último peer configurado em `TRUSTED_PROXY_IPS` pode informar essa
origem. A API mantém `trustProxy: false` e nunca usa X-Forwarded-For para decidir o limite.
