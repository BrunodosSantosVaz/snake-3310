# Inventário de dados e privacidade

Não há conta, formulário de identificação, analytics ou integração de coleta. O jogador escolhe um apelido público;
isso não garante anonimato se ele colocar nome real. Não informe dados pessoais no apelido. Este documento descreve
a operação do sistema e não declara que todo texto livre é juridicamente anônimo.

| Dado | Finalidade e exposição | Armazenamento/retenção | Exclusão |
| --- | --- | --- | --- |
| Apelido e pontos | Ranking público; GET devolve somente esses campos | SQLite do ambiente; mantidos até limpeza administrativa | Dono remove o registro identificado em manutenção, com parâmetro preparado e cópia de segurança |
| DataUTC e identificador do placar | Desempate e integridade; não devolvidos naAPI pública | Mesmo arquivo, enquanto existir o placar | Removidos com o registro |
| IP e metadados HTTP | Infraestrutura precisa encaminhar pedidos; logs operacionais podem conterIP | Não existe campo IP no SQLite do ranking; política dos logs pertence à infraestrutura | Operador administra logs; não prometer ausência de logs no proxy |
| Backup do SQLite | Recuperação do ranking | Cópia local cifrada age, horária, retenção de 14 dias | Expiração pelo cron; remoção manual apenas no ambiente correto |
| Tokens/identidade age | Deploy e decifração de backup | Segredos dos ambientes e arquivo root privado; nunca front/repo | Revogar/rotacionar preservando acesso a snapshots antigos |

A base13 implementa leitura; envio e limitação de abusos são tarefas do épico #28. Não há venda nem compartilhamento
além da exposição intencional do ranking público. Dúvidas ou pedidos de remoção devem usar os canais de
[SECURITY](../../SECURITY.md), evitando publicar dados pessoais na issue. O dono avalia a identificação do registro
e mantém o menor conjunto necessário para atender o pedido. Cópias antigas expiram em até 14 dias; não prometer
apagamento instantâneo de backups. Uma base legal para tratamento identificável precisa ser definida pelo dono
se o uso mudar para coleta de identificação; o sistema atual não pede nome real.
