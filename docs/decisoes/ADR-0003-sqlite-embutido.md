# ADR-0003: Ranking em SQLite embutido no Node

- **Situação:** aprovada pelo dono em 2026-10-06; revisão independente pela IA autorizada em #27.
- **Data:** 2026-10-06
- **Decisores:** Bruno dos Santos Vaz (dono); Codex (implementação)
- **Substitui:** a escolha de banco do ADR-0001 e o ADR-0002 inteiro. As outras decisões do ADR-0001 continuam.

## Contexto e autorização

O ranking público é pequeno e não precisa de um servidor de banco. O dono rejeitou PostgreSQL:

> caralho um postgree pra um ranking? ta usando um tanque pra fazer compra, precisa de tudo isso não, coloca um banquinho medricre e levinho lá

Depois autorizou a execução necessária até produção, inclusive a mudança de stack e a revisão por IA:

> Seguinte eu vou precisar dormir, ja estamos codando o dia inteiro e não termina, conecta no tsuru instala o que for necessario, conecta no bigbang e termina tudo necessario em produção, conecta no snake-3310 e termina tudo que for necessario eu autoriso tudo, me entrega tudo em produç̃ão sem questionar nada

As frases estão registradas por `bb decisao dono:revisao-ia 27`. Nenhuma release ou base de placares foi publicada
até esta decisão; a migração inicial ainda não publicada é adaptada para SQLite. Não se apaga banco em execução
nem se faz migração destrutiva de dados PostgreSQL. Se existir uma base externa anterior, sua importação exigirá
uma tarefa própria antes da promoção.

## Alternativas e decisão

| Opção | Custo e manutenção | Risco e segurança | Decisão |
| --- | --- | --- | --- |
| PostgreSQL com pg/PGlite | Serviço externo, credenciais, conexões, testes com outro empacotamento | Motor maduro, mas operação desnecessária para este ranking | Rejeitado pelo dono |
| SQLite via pacote nativo terceiro | Sem serviço; dependência, compilação e ABI adicionais | Mais atualizações e superfície de supply chain | Desnecessário |
| SQLite via node:sqlite | Sem pacote npm de execução ou serviço; licença permissiva do Node e SQLite em domínio público | API em Release Candidate, consultas síncronas; volume durável obrigatório | Escolhido |

Usar **Node 24.18.1**, sem flag, e seu `node:sqlite` nativo, com a mesma implementação nos testes. A API está em
**Stability 1.2 — Release Candidate**, não estável; o runtime da imagem será fixado em 24.18.1 na tarefa #19.
Consultar a [pesquisa](../pesquisa/2026-10-06-sqlite.md) antes de atualizar o runtime.

## Comportamento e garantias

- `SQLITE_PATH` aponta para arquivo durável fora de `dist`; padrão local `data/snake-3310.sqlite`.
  URI, memória e arquivo dentro de `dist` são recusados pela configuração do processo. Nos testes, `:memory:` é
  permitido diretamente no adaptador, com um banco novo por cenário; testes de persistência usam diretório temporário.
- Só o servidor acessa o banco (SEG-IA-01). Valores `$n` são parâmetros nativos, nunca interpolados no SQL (SEG-07).
  Extensões estão desativadas e o modo defensivo fica ativo.
- WAL, `synchronous=FULL`, espera de bloqueio de 5000 ms e transação `BEGIN IMMEDIATE` coordenam gravações.
  Uma fila por conexão evita que consultas fora de uma transação participem dela por acidente.
- Migrações executam lotes por `exec` explícito; consultas com parâmetros aceitam uma instrução só e recusam cauda SQL antes de executar.
- Migrações SQL numeradas são aplicadas em ordem, em transação com o registro `schema_migrations`. Repetir não
  altera o banco; falha desfaz tanto o esquema quanto a marca. O escritor da versão anterior pode completar sua
  transação durante a espera de um processo novo, com teste de sobreposição entre processos.
- Datas são texto UTC com sufixo Z, padrão ISO 8601. O índice e a consulta ordenam pelo instante SQLite
  (`julianday`), preservando empate por envio antigo com ou sem milissegundos; ID desempata instantes iguais.
- Ranking público, limite de dez, readiness e BASE_PATH conservam os contratos dos testes de aceite congelados.

## Exceções aprovadas e operação

**ARQ-07:** o arquivo SQLite é estado persistente. Produção terá uma réplica por ambiente, PVC montado na app,
sem replicação horizontal e sem banco em diretório efêmero. O mesmo artefato ainda é promovido por digest;
configuração continua no ambiente e logs na saída padrão. Homologação e produção precisam de volumes separados.

**DAD-03:** na entrega #19, a inicialização aplicará migrações na mesma conexão e arquivo antes de abrir a porta
HTTP. Um job manual independente não compartilha o PVC do contêiner da app no alvo Tsuru e, portanto, não pode
migrar esse arquivo. Falha na migração impede listen/saúde; não há migração silenciosa após a app estar pronta.
WAL e a trava de escrita permitem a sobreposição transitória da versão antiga e nova no mesmo nó ARM64.
Migrações futuras continuam seguindo expandir e contrair, compatíveis com a versão anterior (DAD-02).

O arquivo, WAL e SHM precisam ficar no mesmo volume. Backup deve usar a API de backup do SQLite ou parar o
escritor, nunca copiar só o arquivo principal durante gravações. Backup automático criptografado e restauração
real permanecem obrigações do runbook de produção (DAD-08), não resultados alegados por este PR.

## Limitações

Consultas síncronas e espera por lock bloqueiam o event loop. O ranking limitado e indexado é adequado ao uso
previsto; esta escolha não atende alta concorrência de escrita ou várias réplicas em nós diferentes. Timeout gera
falha controlada, sem SQL, caminhos ou apelidos nas respostas HTTP. O contrato de leitura não oferece anticheat.
A operação de produção, o PVC e o startup da imagem são validados nas tarefas de entrega, não neste PR.
