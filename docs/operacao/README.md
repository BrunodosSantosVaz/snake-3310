# Operação

| Situação | Runbook |
| --- | --- |
| Conferir produção v0.1.0 e provas remotas | [Recibo atual](producao-010.md) |
| Publicar e verificar ambiente | [Deploy](deploy.md) |
| Retornar à imagem anterior | [Voltar versão](voltar-versao.md) |
| Recuperar placares | [Backup e restauração](backup-restauracao.md) |
| Tratar indisponibilidade | [Incidente](incidente.md) |
| Trocar credencial | [Rotação](rotacao-segredos.md) |
| Construir imagem/local | [Empacotamento](empacotamento.md) |
| Executar testes Flash | [CI](ci.md) |
| Conferir critérios antes da entrega | [Mapa dos 13 CA e checklist #34](documentacao-34.md) |

Configuração da infraestrutura é mantida no
[OracleCloud/infra/tsuru](https://github.com/BrunodosSantosVaz/oraclecloud/tree/main/infra/tsuru).
A preparação foi mesclada pelo [PR #1](https://github.com/BrunodosSantosVaz/oraclecloud/pull/1),
e os recibos atuais pelo [PR #2](https://github.com/BrunodosSantosVaz/oraclecloud/pull/2).
O [recibo v0.1.0](producao-010.md) identifica quais ensaios foram executados e seus limites.
