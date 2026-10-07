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
- 2026-10-06 (#27): ADR-0003 substitui PostgreSQL/pg/PGlite por SQLite nativo, Node 24.18.1 (API Release Candidate).
  Runtime e testes usam o mesmo adaptador. `SQLITE_PATH` é durável, padrão `data/snake-3310.sqlite`; não use `dist`, URI ou memória na configuração de execução.
- 2026-10-06 (#27): `$n` é binding nativo, sem interpolação; transações serializam todas as operações da conexão.
  WAL + FULL + timeout 5000 ms + BEGIN IMMEDIATE protegem migrações idempotentes e sobreposição de processos.
- 2026-10-06 (#27): ordene o instante UTC com `julianday(created_at)`, usando o índice correspondente; comparar texto mistura datas com/sem milissegundos e muda o empate. Datas são UTC com Z; ID desempata instantes iguais.
- 2026-10-06 (#27): a migração inicial foi adaptada antes da primeira release publicada. Nunca altere uma migração publicada; próximas alterações são expansivas e compatíveis com a versão anterior.
- 2026-10-06 (#27): #19 precisa migrar a mesma conexão/arquivo antes de listen no Tsuru. Job independente não compartilha PVC. Exceções ARQ-07/DAD-03 aprovadas estão em docs/padroes/excecoes.md; uma réplica e volume separado por ambiente.
- 2026-10-07 (#27, revisão PR #29): migrações usam `tx.exec(sql)` explicitamente, nunca inferem lote pelo primeiro resultado. `query` prepara uma instrução só e recusa cauda SQL antes de executar; literais com ponto e vírgula e comentários continuam válidos.
- 2026-10-07 (#27, revisão PR #29): ao verificar caminho fora de `dist`, distinga o segmento `..` de nomes como `..cache`; testes cobrem o arquivo persistido e reaberto e o rollback de lote iniciado por SELECT.
