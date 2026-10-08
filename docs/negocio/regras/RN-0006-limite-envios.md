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

## Implementação e verificação

A janela fixa de 60 segundos começa na primeira tentativa e conta também entradas recusadas, antes de ler
o corpo. Não guarda mais de 4.096 IPs nem aumenta contadores após o bloqueio. Ao saturar, recusa identidades
novas até expirar a entrada mais antiga, sem expulsar o IP já limitado. Expira entradas ao receber requisições;
o limite é local a um processo e um reinício zera contadores, conforme a entrega de uma réplica do ADR-0003.
`TRUSTED_PROXY_IPS` aceita somente IPs individuais do último salto e nenhum por padrão. Apenas esse peer pode
apresentar `X-Snake-Client-IP` com um IP único e válido; listas, portas e outros valores usam o peer.
IPv4 mapeado em IPv6 é normalizado. `X-Forwarded-For` nunca define a chave. Testes verificam proxy autorizado,
peers não confiados, cabeçalhos forjados, concorrência, expiração, memória limitada e propagação na inicialização.
