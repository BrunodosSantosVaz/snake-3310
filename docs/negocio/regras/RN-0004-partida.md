id: RN-0004
titulo: Partida da cobrinha e controles
situacao: vigente
substituida_por:
origem: "#28"
criada_em: 2026-10-07

## Descrição

A partida usa grade 21×13, três segmentos iniciais e passo de 180 ms. Cada comida acrescenta sete pontos e um segmento; a nova comida nunca ocupa a cobra. Bater na parede ou no corpo termina a partida. Inversão de 180 graus é ignorada. Preencher a grade termina com 1.890 pontos, sem sortear comida. Setas/WASD e teclas 2/4/6/8 movem; espaço/5 pausa e retoma; perder foco pausa. Reiniciar começa uma nova partida com zero pontos.

## Origem da decisão

PRODUTO.md e protótipo aprovado da Fundação; épico #28 refinado e execução completa autorizada pelo dono.

## Testes que cobrem

- `tests/aceite/28-partida-completa/game.test.ts (CA-1 e CA-2); ui.test.ts (CA-3); browser.test.ts (CA-8)`
