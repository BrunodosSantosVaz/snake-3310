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

## Implementação e verificação

`validSubmission` mantém as regras no domínio e `SubmitScore` usa relógio do servidor e a porta `ScoreWriter`.
A API usa esquema JSON sem coerção nem remoção de campos extras, corpo de até 1 KiB e respostas Problem Details
controladas. A gravação é parametrizada e armazena ISO 8601 UTC. Os testes de domínio, aplicação, repositório
SQLite e `src/interface/http/submit-score.test.ts` cobrem tipos, Unicode, UTC e falha sem detalhes internos.
O filtro compara fragmentos `puta`, `puto`, `porra`, `caralho`, `merda`, `buceta`, `cacete`, `foder` e `fodase`,
mais os nomes `cu` e `fdp` após retirar números, sem caixa/acentos. Esta lista local pode ter falsos positivos
e não identifica todas as ofensas. O modal e suas proteções de envio são implementados na tarefa #33.
