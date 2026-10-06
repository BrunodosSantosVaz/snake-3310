id: RN-0001
titulo: O ranking mostra os 10 maiores placares
situacao: vigente
substituida_por:
origem: "#13"
criada_em: 2026-10-06

## Descrição

O ranking público mostra no máximo os 10 maiores placares, do maior para o menor. Quando dois placares têm os
mesmos pontos, aparece primeiro o que foi enviado antes. Sem nenhum placar, o ranking aparece vazio.

## Exemplos

- Dado 12 placares gravados, quando alguém abre o ranking, então vê só os 10 maiores, do maior para o menor.
- Dado DUDA (70 pontos, enviado às 09:00) e CAIO (70 pontos, enviado às 10:02), quando alguém abre o ranking, então
  DUDA aparece antes de CAIO.
- Dado nenhum placar gravado, quando alguém abre o ranking, então vê a lista vazia.

## Exceções

Nenhuma.

## Testes que cobrem

- tests/aceite/13-esqueleto-andante/esqueleto.test.ts (CA-3 e CA-4)
