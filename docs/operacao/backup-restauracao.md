# Backup e restauração SQLite

## Cópia consistente

Infraestrutura preparada com `/usr/local/sbin/backup-snake-tsuru.py`, cron horário às `:17`, retenção de 14 dias.
O script descobre PVCs apenas das duas apps, verifica Retain, usa `sqlite3.backup`, quick_check, cifragem age e gravação
atômica/checksum. Cada snapshot é decifrado/verificado antes de confirmar. Plaintext temporário fica no tmpfs
privado e é removido; diretórios 700/arquivos 600. Não copie apenas `snake.sqlite` enquanto WAL estiver ativo.

O script preparado lê `snake.sqlite` no volume de cada app; o runtime dessas apps deve usar
`SQLITE_PATH=/data/snake.sqlite`. O padrão `/data/scores.sqlite` da imagem é diferente e precisa ser sobrescrito.
Antes de backup/restauração, confirme o caminho efetivo, o volume e o ambiente; um snapshot de outro arquivo
não protege o ranking em uso. O backup contém apelidos, pontos, UTC e IDs, sem o mapa de IPs em memória.

Após deploy, execute `sudo /usr/local/sbin/backup-snake-tsuru.py` no host e confirme um snapshot íntegro por ambiente
em `/srv/tsuru/backups/snake-3310/<app>/`. Sem banco/PVC o script não tem o que copiar; execução sem snapshot não
é evidência de backup. A prova de restauração do próprio ranking será registrada após criar dados no ambiente.

## Restauração

1. Escolha somente o snapshot da app afetada, confirme o checksum e sua chave válida.
2. Pare somente essa app e confirme ausência de processo acessando o PV. Preserve banco/WAL/SHM atuais juntos,
   com permissões privadas, para poder desfazer a operação.
3. Em shell root com umask 077, decifre para diretório privado no `/dev/shm`, usando a identidade em
   `/etc/tsuru/snake-backup/identity.agekey`. Interrompa se checksum ou decifração falhar; descarte saída parcial.
4. Use sqlite3 do Python para `PRAGMA quick_check` e confira dados esperados sem imprimir apelidos nos logs.
5. Substitua `snake.sqlite` no hostPath correto da app parada, com proprietário e permissão UID/GID 1000. Não deixe
   WAL/SHM antigos junto ao arquivo restaurado; eles permanecem na cópia preservada.
6. Inicie, confira health/ready/ranking, faça novo snapshot e remova o temporário em claro. Registre o resultado.

## Limites e chave

Backup e chave são locais ao mesmo host; não oferecem recuperação após perda total desse host. Custódia externa
da chave e cópia independente dos snapshots ainda não foram feitas. Não imprima, versione nem publique a chave.
Rotação deve preservar a identidade anterior enquanto houver snapshots antigos. Guia completo/script em
[infra Tsuru](https://github.com/BrunodosSantosVaz/oraclecloud/tree/main/infra/tsuru), preparação no
[PR #1](https://github.com/BrunodosSantosVaz/oraclecloud/pull/1).

## Evidência executada

A [produção v0.1.0](producao-010.md) registra os ensaios reais de ambos ambientes,
persistência após reinício, execução do daemon cron e restauração local dos snapshots cifrados.
