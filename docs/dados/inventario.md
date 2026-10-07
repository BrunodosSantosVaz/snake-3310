# Inventário de dados e privacidade

Não há conta, coleta de nome/e-mail, analytics ou formulário de identificação. O jogador escolhe um apelido
público; isso não garante anonimato se ele colocar nome real. Não informe dados pessoais no apelido. O IP usado
para encaminhar pedidos e conter abuso também merece controle de acesso e retenção. Este inventário descreve
a implementação e a operação preparada, sem afirmar que todo texto livre ou IP é juridicamente anônimo.

| Dado | Finalidade e exposição | Armazenamento/retenção | Exclusão |
| --- | --- | --- | --- |
| Apelido e pontos | Ranking público; GET retorna somente esses campos | SQLite do ambiente; mantidos até limpeza administrativa | Dono remove o registro identificado em manutenção, com parâmetro preparado e backup consistente |
| Data UTC e ID do placar | Desempate e integridade; não devolvidos pela API pública | Mesmo arquivo, enquanto existir o placar | Removidos com o registro |
| IP da chave de limite | Até cinco tentativas de POST em 60 s, inclusive inválidas; não exposto no ranking | Mapa em memória de um processo, até 4.096 entradas; janela de 60 s, expiração removida no próximo pedido; reinício apaga o mapa | Expiração sob demanda ou encerramento do processo; não gravado em SQLite nem no backup do ranking |
| IP e metadados HTTP em logs | Encaminhamento, diagnóstico e segurança operacional; logs do Fastify/proxy podem conter IP/URL | Infraestrutura e logs do processo; prazo e acesso precisam ser conferidos pelo operador no ambiente | Operador aplica política dos logs; não prometer ausência de IP no proxy nem confundir logs com o mapa temporário |
| Backup de SQLite | Recuperação dos placares, datas e IDs | Cópia local cifrada com age, horária, retenção de 14 dias, no mesmo host | Expiração pelo cron; remoção manual somente no ambiente correto |
| Tokens e identidade age | Deploy e decifração | Segredos dos ambientes e arquivo root privado, nunca front/repo | Revogar/rotacionar preservando leitura de snapshots ainda retidos |

A finalidade do apelido escolhido é a publicação do ranking; a do IP temporário é conter abuso. O produto não
solicita identificação pessoal e o nível ASVS aprovado continua o da Fundação. Não há venda nem analytics;
a exposição intencional é o ranking público. Se o uso passar a coletar identificação, a avaliação de base legal
e o inventário precisam ser revistos pelo dono; a escolha de apelido não é garantia de anonimato.

Pedidos de remoção usam os canais de [SECURITY](../../SECURITY.md), evitando dados pessoais em issues públicas.
O dono avalia o registro indicado e mantém o menor conjunto necessário para atender o pedido. Backups antigos
podem conservar o registro por até 14 dias; não prometer remoção imediata dessas cópias. O procedimento não usa
apelido como autenticação: ninguém ganha privilégio por conhecer um nome público.

A chave e os snapshots preparados estão no mesmo host. Custódia externa e cópia independente ainda não foram
providenciadas; cifragem local não substitui recuperação de desastre. [Backup/restauração](../operacao/backup-restauracao.md).
