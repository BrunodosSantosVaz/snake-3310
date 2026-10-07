id: RN-0006
titulo: Limite público de envios por IP
situacao: vigente
substituida_por:
origem: "#28"
criada_em: 2026-10-07

## Descrição

No máximo cinco envios por minuto por IP. O sexto recebe 429 com Retry-After positivo de até 60 segundos, sem gravar. Outro IP continua independente. Cabeçalhos fornecidos por visitante não alteram o IP: somente o último salto configurado explicitamente pode apresentar o cabeçalho saneado pelo proxy dedicado. A aplicação limita memória e expira contadores; um reinício reinicia o limite. O modal explica o limite sem exibir detalhes internos.

## Origem da decisão

PRODUTO.md e protótipo aprovado da Fundação; épico #28 refinado e execução completa autorizada pelo dono.

## Testes que cobrem

- `tests/aceite/28-partida-completa/scores.test.ts (CA-6); ui.test.ts (CA-7)`
