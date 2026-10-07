# Memória do projeto

Pegadinhas que a próxima sessão precisa saber. Uma linha por item, com a data e o PR de origem.

- 2026-10-06 (#18): front em `src/web`, build separado do servidor, Vite com `base: './'`. A API é relativa à URL
  da página; não fixe `/api` no front, ou o `BASE_PATH` deixará de funcionar.
- 2026-10-06 (#18): a API retorna dez placares, mas a tela desenhada comporta os cinco primeiros (DESIGN.md).
  Nunca injete o apelido como HTML: as células usam `textContent` (SEG-09).
- 2026-10-06 (#18): Enter/espaço em botão usam ativação nativa, sem processamento duplicado. A navegação restaura
  foco ao menu. Respostas antigas do ranking são ignoradas após sair/reabrir ou repetir a consulta.
- 2026-10-06 (#18): testes DOM/axe rodam no Vitest/CI. `npm run test:ui` precisa de Chromium instalado pelo Playwright
  e verifica o build real servido pelo Fastify/CSP, layout, texto200%, contraste de foco, área de toque e axe em
  navegador real; cria `docs/imagens/menu-3310.png`.
- 2026-10-06 (#18): `registerSecurityHeaders` deve ser registrado antes dos plugins para que HTML, API e erros
  recebam a mesma CSP (SEG-10). HSTS só com `NODE_ENV=production`; a política não inclui subdomínios do proxy.
- 2026-10-06 (#18): não fixe a altura das camadas da tela; conteúdo em fluxo + altura mínima baseada nos controles permitem
  texto200% sem corte. Nomes/pontos quebram linha; o foco na tela usa dupla borda com tokens aprovados.
- 2026-10-06 (#18): a opção Jogar ainda é “Em breve”: a partida está fora do épico #13; o protótipo jogável continua
  referência para o próximo épico, sem envio real de placar.

- 2026-10-06 (#17): `GET <BASE_PATH>/api/placares` retorna `{ scores: [{ nickname, points }] }`, limitado a dez,
  por pontos decrescentes e data crescente (RN-0001). A consulta usa o índice existente; nenhuma migração nova.
- 2026-10-06 (#17): a listagem não recebe parâmetros; campos extras de consulta recebem 400 antes do banco
  (SEG-07). O Fastify usa `removeAdditional: false` para rejeitar extras em vez de apagá-los silenciosamente.
- 2026-10-06 (#17): nesta máquina, Node 24.18.1 está em `~/.local/share/mise/installs/node/24.18.1/bin`;
  use esse diretório no PATH para validar com o runtime da stack.

- 2026-10-06 (#10, PR #22): a marca de pendente é `test.fails` (Vitest). O `testes.padrao_teste` precisa reconhecê-la,
  senão a rastreabilidade do `regras` não enxerga os testes de aceite pendentes.
- 2026-10-06 (#15): no Fastify, o `setErrorHandler` vale só para os plugins registrados **depois** dele. Registre-o
  antes das rotas, ou o erro interno vaza na resposta.
- 2026-10-06 (#15): o `@fastify/static` exige `root` absoluto. A configuração resolve `WEB_DIR` com `path.resolve`.
- 2026-10-06 (#14): os testes de aceite carregam os módulos com `import()` dinâmico. Assim, um teste de tarefa ainda
  não feita falha sozinho, sem quebrar o `tsc` nem o arquivo inteiro.
- 2026-10-06 (#9): esta sessão na nuvem não tem `gh` autenticado. Os passos de admin rodam por workflow temporário com
  o `PROJETO_TOKEN`, sempre com a autorização do dono na conversa.
- 2026-10-06 (#15): o servidor usa `trustProxy: false`. Atrás do NPM, `request.ip` é o IP do proxy. A tarefa do
  limite de envios (SEG-IA-05) precisa configurar `trustProxy` com o endereço do proxy, senão todos os jogadores caem
  no mesmo balde.
- 2026-10-06 (#15): todo erro da API sai em Problem Details (`src/interface/http/problem.ts`), com título controlado.
  Só os 4xx mantêm o status; o resto vira 500.
- 2026-10-06 (#16): as migrações são SQL puro em `migrations/NNNN_nome.sql`, aplicadas em ordem e uma vez só
  (`schema_migrations`). Nunca altere uma migração já publicada: crie outra (DAD-02, expandir e contrair).
- 2026-10-06 (#16): o "não pronto" do `/api/ready` usa `UNAVAILABLE` (503). O `problemFor` transforma tudo que não
  é 4xx em 500, de propósito, para erros inesperados.
- 2026-10-06 (#16): o pool do `pg` precisa de ouvinte no evento `error` (`listenForErrors`), senão uma conexão parada
  que cai derruba o processo. Nunca logue o pool: ele carrega a connection string com a senha.
- 2026-10-06 (#16): transação no `pg` só com cliente dedicado (`pool.connect()`); `pool.query` pode trocar de conexão a
  cada comando. Use `db.transaction(...)`.

- 2026-10-07 (#30): aceite #28 usa motor puro `src/web/game.ts` (`newGame`, `stepGame`, `turnGame`) e estado
  `{snake, food, direction, points, status}`; web não importa camadas do servidor. RN-0004/5/6 originam-se do
  produto/protótipo e refinamento autorizado. O POST precisa rejeitar pontos string: não permita coerção JSON.
- 2026-10-07 (#30): CA-8 testa Chromium/build real, não JSDOM; execute build e instale Chromium antes do aceite.
  Identificadores acessíveis do jogo: `game-score`, `game-status`, canvas com nome/role img, modal dialog e formulário
  de apelido com label. Pendências referenciam apenas #31/#32/#33; libere com `bb aceite liberar`.
