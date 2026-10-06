# Snake 3310 — Contexto (C4, nível 1)

```mermaid
C4Context
  title Contexto — Snake 3310
  Person(jogador, "Jogador", "Visitante do portfólio; joga e manda o placar com um apelido")
  Person(dono, "Dono", "Publica versões e cuida do ranking")
  System(sistema, "Snake 3310", "Jogo da cobrinha do Nokia 3310 no navegador, com ranking público")
  System_Ext(borda, "Cloudflare e Nginx Proxy Manager", "HTTPS e rota de tsuru.frontzap.com.br/snake-3310")
  Rel(jogador, borda, "Acessa", "HTTPS")
  Rel(borda, sistema, "Encaminha", "HTTP")
  Rel(dono, sistema, "Publica pela esteira do GitHub")
```

| Elemento | Responsabilidade |
| --- | --- |
| Jogador | Joga no PC ou no celular e manda o placar ao ranking com um apelido |
| Dono | Aprova as publicações em produção e cuida do ranking |
| Cloudflare e Nginx Proxy Manager | Terminam o HTTPS e mandam cada caminho (`/snake-3310`, `/snake-3310-hom`) ao ambiente certo |
