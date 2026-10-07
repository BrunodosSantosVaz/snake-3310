id: RN-0005
titulo: Envio público de placar
situacao: vigente
substituida_por:
origem: "#28"
criada_em: 2026-10-07

## Descrição

Ao terminar, o jogador pode enviar um apelido público de 3 a 12 letras Unicode ou números e pontos inteiros de 0 a 1.890, múltiplos de sete. Tipos incorretos, campos extras, caracteres fora da regra e apelidos ofensivos (comparação sem caixa/acentos) são recusados com 400, sem gravação. O envio válido recebe 201, registra UTC e aparece no ranking RN-0001. O modal impede envio duplicado enquanto pendente, mostra sucesso ou erro controlado e ignora respostas de partidas anteriores. Não há autenticação nem prova criptográfica da partida; pontos plausíveis forjados continuam uma limitação explícita.

## Origem da decisão

PRODUTO.md e protótipo aprovado da Fundação; épico #28 refinado e execução completa autorizada pelo dono.

## Testes que cobrem

- `tests/aceite/28-partida-completa/scores.test.ts (CA-4 e CA-5); ui.test.ts (CA-7); browser.test.ts (CA-8)`
