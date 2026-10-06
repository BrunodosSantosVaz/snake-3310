# Menu e ranking

A tela reproduz um aparelho Nokia 3310. Esta etapa do esqueleto andante permite consultar o ranking e as
instruções; a partida jogável será entregue no próximo épico.

No menu, use as teclas 2/8, as setas para cima/baixo ou W/S para escolher uma opção. OK, 5 ou Enter abrem a opção
selecionada. As opções também são botões acessíveis por Tab e clique. C ou Esc voltam ao menu e restauram o foco.

O ranking busca os placares na API do próprio servidor, no prefixo configurado em `BASE_PATH`. Exibe os cinco
primeiros, por pontos decrescentes e desempate pelo envio mais antigo, enquanto a API disponibiliza os dez primeiros.
Apelidos aparecem como texto e pontos usam formato brasileiro, por exemplo `1.234`.

Durante a consulta aparece “Carregando…”. Sem placares, “Ninguém ainda. Seja o primeiro!”. Se a rede, a API ou o
formato da resposta falharem, “Sem conexão. OK tenta de novo”. Pressione OK para repetir a consulta ou C para voltar.

O teclado numérico é clicável em computadores e celulares. A interface foi verificada com 360 px de largura,
sem rolagem horizontal; as teclas têm área de toque mínima de 44 × 44 px e o foco é visível. A tela cresce quando
o texto é ampliado em 200%, mantendo apelidos e pontos completos com quebra de linha, sem reticências. O contorno
amarelo recebe uma borda escura sobre a tela verde para manter contraste perceptível.
