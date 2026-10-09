# Contrato transitório de dependências para o validador confiado

A documentação oficial da tecnologia está na [Wiki](https://github.com/BrunodosSantosVaz/snake-3310/wiki/Tecnologia). Este arquivo é entrada da Guarda da stack v1.5.5 ainda instalada na branch de destino; contém apenas a tabela consumida pelo código. A tarefa seguinte remove esta entrada após atualizar o destino para 2.0.0. Nenhum portão é desligado.

<!-- bb:dependencias:inicio -->
| Pacote | Ecossistema | Faixa de versão | Para quê | ADR |
| --- | --- | --- | --- | --- |
| `fastify` | npm | `^5.12.0` | Servidor HTTP da API e do jogo | ADR-0001 |
| `@fastify/rate-limit` | npm | `^11.2.0` | Limite de envios de placar (SEG-IA-05) | ADR-0001 |
| `@fastify/static` | npm | `^10.1.0` | Servir o jogo compilado sob `BASE_PATH` | ADR-0001 |
<!-- bb:dependencias:fim -->
