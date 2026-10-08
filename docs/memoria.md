# Memória do projeto

## Atualização oficial para Big Bang v1.5.1

O PR #45 atualizou a distribuição por `bb atualizar`, conferindo hash e atestação. A sincronização da
develop para o épico #13 preserva Flash, alvo Tsuru, inicialização SQLite e as tarefas já revisadas.
`bb gerar` confirmou que a camada gerada está em dia. A versão corrige revisão de PRs com mais de 300 arquivos.

Pegadinhas que a próxima sessão precisa saber. Uma linha por item, com a data e o PR de origem.

- 2026-10-07 (#32): POST usa Ajv com `coerceTypes: false` e `removeAdditional: false` (SEG-07), mais regra de
  domínio. Strings numéricas, campos extras/data do cliente e caracteres proibidos recebem 400 sem gravar.
  Timestamp vem de `SubmitScore` e INSERT usa bindings (SEG-08); limite de corpo de 1024 bytes.
- 2026-10-07 (#32): `TRUSTED_PROXY_IPS` é lista explícita de IPs individuais, default vazia. Só o socket confiado
  pode fornecer `X-Snake-Client-IP` único e válido; NPM deve sobrescrevê-lo. Não usar XFF nem `trustProxy: true`.
  IPv4 mapeado e IPv6 canônico são normalizados; peer e fallback de cabeçalho inválido compartilham contador seguro.
- 2026-10-07 (#32): `ScoreLimit` usa janela fixa de 60 s e cinco tentativas (inclui inválidas), máximo de 4.096 entradas;
  saturação recusa novos IPs sem expulsar os bloqueados. Expira sob demanda e reset após reinício; uma réplica.
  O filtro é local sem caixa/acentos, pode ter falsos positivos; pontos plausíveis forjados continuam limitação.

- 2026-10-07 (#36): `BB_ARQUIVOS_ALTERADOS` aponta para arquivo JSON, nunca array inline. Seleção usa o grafo
  estático Vitest e mapa de CA dinâmicos; desconhecido/deletado/grafo incerto executa completo. Cobertura Flash
  inclui somente módulos domínio/aplicação afetados e dependências transitivas, com os mesmos quatro limites80.
- 2026-10-07 (#36): Node24.18.1 é instalado antes de npmci com hash oficial fixado e GITHUB_PATH. Chromium
  pertence ao preparo de aceite, não ao instalador. `npm test` inclui `test:tooling` com node:test; esses arquivos
  usam sufixo `.native.mjs` para não serem coletados novamente pelo Vitest.

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
- 2026-10-07 (#30, revisão): o prehook `prepare-acceptance.mjs` valida Chromium e compila antes do aceite.
  Falta de tooling/build não pode ser mascarada por `test.fails`. CA-3 verifica direção passada ao motor em
  todos os aliases físicos/toque e foco no reinício; CA-7 também verifica Enviando e GET/ranking depois do POST.

- 2026-10-07 (#31): motor puro em `src/web/game.ts`; cabeça/pescoço guardam a direção do último passo e impedem
  reversão por dois comandos rápidos antes do tick. Comida é sorteada numa lista finita de células livres;
  grade cheia não chama RNG. Colisão inclui a cauda, seguindo o protótipo aprovado.
- 2026-10-07 (#31): o canvas copia os pixels 4×4 e a comida do protótipo; cores vêm de `getComputedStyle` dos
  tokens. O placar fica em HTML. Saída, pausa, blur e destroy cancelam o timer; retomada cria um período completo
  de 180 ms. O diálogo básico `game-end` tem reinício/menu; a tarefa #33 amplia este diálogo com envio.

- 2026-10-06 (#27): ADR-0003 substitui PostgreSQL/pg/PGlite por SQLite nativo, Node 24.18.1 (API Release Candidate).
  Runtime e testes usam o mesmo adaptador. `SQLITE_PATH` é durável, padrão `data/snake-3310.sqlite`; não use `dist`, URI ou memória na configuração de execução.
- 2026-10-06 (#27): `$n` é binding nativo, sem interpolação; transações serializam todas as operações da conexão.
  WAL + FULL + timeout 5000 ms + BEGIN IMMEDIATE protegem migrações idempotentes e sobreposição de processos.
- 2026-10-06 (#27): ordene o instante UTC com `julianday(created_at)`, usando o índice correspondente; comparar texto mistura datas com/sem milissegundos e muda o empate. Datas são UTC com Z; ID desempata instantes iguais.
- 2026-10-06 (#27): a migração inicial foi adaptada antes da primeira release publicada. Nunca altere uma migração publicada; próximas alterações são expansivas e compatíveis com a versão anterior.
- 2026-10-06 (#27): #19 precisa migrar a mesma conexão/arquivo antes de listen no Tsuru. Job independente não compartilha PVC. Exceções ARQ-07/DAD-03 aprovadas estão em docs/padroes/excecoes.md; uma réplica e volume separado por ambiente.
- 2026-10-07 (#27, revisão PR #29): migrações usam `tx.exec(sql)` explicitamente, nunca inferem lote pelo primeiro resultado. `query` prepara uma instrução só e recusa cauda SQL antes de executar; literais com ponto e vírgula e comentários continuam válidos.
- 2026-10-07 (#27, revisão PR #29): ao verificar caminho fora de `dist`, distinga o segmento `..` de nomes como `..cache`; testes cobrem o arquivo persistido e reaberto e o rollback de lote iniciado por SELECT.
- 2026-10-07 (#19): `startServer` migra a mesma conexão/arquivo antes de buildApp/listen; erro fecha recursos e não abre HTTP. main/CLI usam `umask 077`; imagem USER node, UID 1000, /data700, SQLITE_PATH=/data/scores.sqlite e PORT8888.
- 2026-10-07 (#19): Dockerfile copia docs/design/tokens.css (whitelist em .dockerignore). Dependências puramente JS são instaladas no builder; o guard recusa .node para não copiar ABI/arquitetura errada ao alvo ARM64.
- 2026-10-07 (#19): smoke é só Node/fetch, aceita BB_URL ou SMOKE_URL, não precisa npm ci nem Playwright. Compose opcional tem app+migrar com mesmo volume, sem Postgres. Tsuru precisa startup na própria app com PVC de UID/GID1000, nunca job independente para o arquivo SQLite.
- 2026-10-07 (#19): scan da base oficial encontrou OpenSSL antigo e dependências npm HIGH/CRITICAL. Docker atualiza libcrypto3/libssl3 para 3.5.9-r0 e remove npm/yarn no runtime, sem ignorar vulnerabilidades. Migração no contêiner via `node /app/dist/server/interface/migrate.js`, não npm.

- 2026-10-07 (#33): o modal valida apelido com regex Unicode L/N de 3–12 pontos de código; não use maxlength
  HTML para contar letras fora do BMP, pois ele conta unidades UTF-16. POST exige 201 para sucesso, sem
  renderizar detalhes de erro do servidor; submit pendente/sucesso fica bloqueado.
- 2026-10-07 (#33): restart/menu/cancel/destroy abortam o fetch e incrementam a geração; respostas antigas
  não mudam uma partida nova. AbortController não reverte uma gravação do servidor: sem chave de idempotência,
  repetir após falha de rede pode duplicar. Enter no campo usa submit nativo; Space em botão usa ativação nativa.
- 2026-10-07 (#33): check-game-ui usa SQLite real isolado, verifica POST201 único e GET posterior, foco no campo
  e reinício, 360 px, texto200%, toque44px, axe/CSP. Captura docs/imagens/partida-3310.png com canvas em execução,
  preservando a captura do menu; isso é evidência local, não anúncio de produção publicada.
- 2026-10-07 (#33): main.ts precisa repassar o segundo argumento de fetch; descartar options transforma
  POST em GET e perde o sinal de cancelamento. src/web/main.test.ts reproduziu a falha antes da correção.
- #20 confere a documentação do esqueleto #13. Runbooks e README descrevem código/runtime/infra preparada; a primeira produção só será registrada após candidata conjunta #13+#28, com recibos reais. Backup local não equivale a recuperação de desastre externa.

- 2026-10-07 (#34): os 13 CA passaram no SHA a0b9324 do PR49; CI 37581589449 registrou 135 unidade/integração,
  13 aceites e 128 na cobertura. Mapa e checklist em docs/operacao/documentacao-34.md; runtime/aceite não mudam
  no PR documental. Capturas reais de menu e partida foram preservadas.
- 2026-10-07 (#34): a imagem usa padrão /data/scores.sqlite, mas as apps Tsuru preparadas têm
  SQLITE_PATH=/data/snake.sqlite para coincidir com backup-snake-tsuru.py. Confirme configuração efetiva antes
  de backup/restauração; não proteja um arquivo que o processo não está usando.
- 2026-10-07 (#34): IP do limite vive no mapa por janela de 60 s, removido sob demanda, máximo de 4.096 entradas e reset no
  processo; logs Fastify/proxy podem conter IP/metadados. Não prometa anonimato nem ausência de logs.
- 2026-10-07 (#34): documentação/CI local não são recibos de candidata/deploy/persistência/restauração remotos.
  A primeira entrega é conjunta #13+#28. Backup age local com 14 dias de retenção precisa de cópia/custódia externa para desastre.

## Registro histórico do bootstrap da Fundação


## Bootstrap Flash/Tsuru — épico #55, teste #56

A tarefa #57 seleciona Flash/Tsuru/readiness usando o Big Bang oficial 1.5.2 e preserva os sete caminhos
originais do artefato e os comandos originais. Nenhum runtime do jogo entra em develop/main neste épico sem release.

O CA nativo fica em `tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs`, fora do glob Vitest da app,
e usa o parser oficial do framework. Rodar com Node 24: `node --test tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs`.
Antes da implementação, `BB_BOOTSTRAP_ENFORCE=1` demonstra a falha sem a marca estrita de pendente. Configuração
inválida falha antes de registrar o teste; a marca pendente aceita somente AssertionError e rejeita XPASS.

A CI oficial reconhece Fundação sem artefato e não executa comandos npm ausentes (F5). A prova nativa é executada
explicitamente e acompanha o PR; não declarar testes da app executados nesse estado. Não alterar comandos da
Fundação para copiar scripts ainda pertencentes à release. `testes-producao.sh` carrega o SHA imutável da release
antes de instalar e testar, usando a configuração da própria release.

## Evidência de configuração #57

O aceite #56 foi mesclado pelo PR #59 antes da implementação. `bb aceite liberar 57` retirou apenas a marca
da tarefa. `bb gerar --simular` previu cinco arquivos gerados; `bb gerar` alterou esses cinco: candidata,
publicação em produção, rollback, AGENTS e bloco de STACK. O framework permanece intacto; nenhuma chamada
à infraestrutura ocorre na geração. A tarefa mantém os comandos originais e a lista de caminhos do artefato.

Os gerados agora fornecem as variáveis e o token Tsuru dos ambientes protegidos, sem valores no repositório.
Este estado apenas prepara a Fundação; a produção do jogo continua aguardando bootstrap e portões da release.

## Documentação #58 e publicação do bootstrap

O [runbook do épico #55](operacao/bootstrap-sem-release-55.md) mapeia CA-1, RN-0002/RN-0003, PR #59 antes do
código e PR #61, com procedimento Integrar/Publicar sem release. Aprovação independente e CI no SHA exato
continuam obrigatórias. O bootstrap preserva comandos, caminhos e artefato; a produção deve carregar a release.
A documentação não exige nova suíte da app em uma Fundação sem runtime. O teste nativo já passou na #57 e a
CI canônica exata é reutilizada; não executar novamente a suíte interna do framework no consumidor.

O CA #55 verifica a etapa histórica F5 sem artefato, nos commits dos PRs #59/#61. Após a integração do jogo,
os caminhos adicionais e o runtime passam a existir por decisão já aprovada #36/#19; as provas da app continuam
nos 13 CA Vitest. Para reproduzir a prova nativa da Fundação, use o SHA histórico `d53c0a2f54a946daa0f2c1db725b9865ba20689e`
em checkout isolado, preservando a suíte congelada. Não apresentar essa prova histórica como execução da app.

## Conferência pós-produção #65

- Plano #66 precede atualização #67 e conferência #68. Produção v0.1.0 já publicada;
  preservar runtime, seis RN,13CA,framework153 e a imagem. Três PRs documentais sem novo build.
  Não executar CA55 histórico contra o jogo final nem criar testes que espelham textos.
