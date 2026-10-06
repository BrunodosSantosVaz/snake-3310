# Snake 3310 — Design

> Escrito na Fundação (F3). Só muda com decisão do dono registrada em ADR.
>
> **Regra para o front (`FE-01`): todo componente novo usa só os tokens e componentes daqui.** Cor, espaçamento e
> fonte literais no código são reprovados pelo lint. Os tokens estão em [`docs/design/tokens.css`](docs/design/tokens.css).

## Identidade

- **Nome visual:** SNAKE 3310, em maiúsculas e fonte monoespaçada, como o menu do aparelho.
- **Logo:** [`docs/design/logo.svg`](docs/design/logo.svg) é o ícone mais o nome, para fundo escuro.
- **Ícone global (DOC-17):** [`docs/design/icone.svg`](docs/design/icone.svg) é a tela verde com uma cobra de pixels
  e uma comida, dentro do corpo azul. É quadrado, desenhado numa grade de 48 px e legível em 48 px. É usado no
  favicon, no README e na imagem do repositório.
- **Uso:** respiro mínimo de 1/4 da largura do ícone. Logo só sobre `--cor-fundo` ou `--cor-aparelho`. Tamanho
  mínimo de 24 px.
- **Referência:** a página imita um Nokia 3310 azul. Tela verde-azulada com pixels escuros, teclado numérico e
  teclas OK e C.

## Paleta

Contraste verificado no nível **AA** (4,5:1 para texto normal; 3:1 para texto grande e componentes).

| Token | Valor | Uso | Contraste sobre o fundo |
| --- | --- | --- | --- |
| `--cor-fundo` | `#0E1A33` | Página atrás do aparelho e modais | — |
| `--cor-aparelho` | `#2B4C8C` | Corpo do 3310 (decorativo) | 2,1:1 (não é texto nem controle) |
| `--cor-aparelho-borda` | `#1C3566` | Contorno do corpo e moldura da tela | decorativo |
| `--cor-tela` | `#C7F0D8` | Fundo da tela do jogo | — |
| `--cor-pixel` | `#43523D` | Cobra, comida e texto da tela | 6,7:1 sobre `--cor-tela` |
| `--cor-tecla` | `#DCE3EE` | Teclas | 6,5:1 sobre `--cor-aparelho` |
| `--cor-tecla-texto` | `#16213A` | Rótulo das teclas | 12,4:1 sobre `--cor-tecla` |
| `--cor-texto` | `#F2F5FA` | Texto sobre o fundo e o aparelho | 15,8:1 (7,6:1 sobre o aparelho) |
| `--cor-texto-suave` | `#A9B8D0` | Ajuda e texto secundário | 8,6:1 |
| `--cor-primaria` | `#8FD3FF` | Botão principal e links | 10,6:1 |
| `--cor-primaria-texto` | `#0E1A33` | Texto do botão principal | 10,6:1 sobre `--cor-primaria` |
| `--cor-erro` | `#FF8A80` | Mensagens de erro | 7,6:1 |
| `--cor-sucesso` | `#7EE2A8` | Confirmações | 11,0:1 |
| `--cor-alerta` | `#FFD166` | Avisos, como o limite de envios | 12,0:1 |
| `--cor-foco` | `#FFD166` | Anel de foco | 12,0:1 (5,8:1 sobre o aparelho) |

## Tipografia

| Token | Família | Tamanho | Peso | Altura de linha |
| --- | --- | --- | --- | --- |
| `--fonte-titulo` | `--fonte-corpo` | `--tamanho-titulo` (1,5rem) | 700 | 1,5 |
| `--fonte-corpo` | system-ui (fonte do sistema) | `--tamanho-corpo` (1rem) | 400 | 1,5 |
| `--fonte-tela` | ui-monospace (texto HTML sobre a tela) | `--tamanho-pequeno` (0,875rem) | 400 e 700 | 1,35 |

Dentro do canvas, o jogo desenha números e letras com uma fonte bitmap 5×7 própria, sem arquivo de fonte externo.

## Espaçamento, raio e sombra

| Token | Valor |
| --- | --- |
| `--espaco-1` … `--espaco-6` | 4, 8, 12, 16, 24 e 32 px |
| `--raio-padrao` | 8px |
| `--raio-tecla` | 14px |
| `--raio-aparelho` | 48px no topo e 64px na base |
| `--sombra-padrao` | `0 8px 24px rgb(0 0 0 / 0.35)` |
| `--toque-minimo` | 44px |

## Ícones

Não há biblioteca de ícones. As setas das teclas são os caracteres ▲ ◀ ▶ ▼, e toda tecla com seta tem
`aria-label` ("2, para cima"). Os únicos desenhos são o ícone global e o logo.

## Componentes base

| Componente | Quando usar |
| --- | --- |
| Aparelho | Moldura da página inteira: marca, tela, teclas OK e C e teclado numérico |
| Tela | Tudo que é do jogo: menu, partida, pausa, ranking e instruções, em `--cor-pixel` sobre `--cor-tela` |
| Tecla | Botão do teclado, com área mínima de 44×44 px, número e letras. As teclas 2, 4, 6 e 8 movem; a 5 pausa; OK seleciona; C volta |
| Botão (primário, secundário) | Ações fora da tela, no modal de fim de jogo |
| Campo de formulário | Só o apelido: rótulo visível, ajuda abaixo e mensagem em `role="status"` |
| Lista de ranking | Posição, apelido e pontos, os 5 primeiros na tela |
| Modal de confirmação | Fim de jogo e todo aviso, com `<dialog>` (nunca `alert()` ou `confirm()`) |
| Aviso (toast) | Não há: os avisos ficam na mensagem do modal ou na própria tela |

## Padrões de tela

| Situação | Padrão |
| --- | --- |
| Lista | Ranking na tela: "1. APELIDO … pontos", pontos alinhados à direita e números no formato pt-BR |
| Formulário | Modal de fim de jogo: pontos, campo de apelido (3 a 12 letras ou números), "Enviar placar" e "Jogar de novo" |
| Detalhe | Não há |
| Vazio | Ranking: "Ninguém ainda. Seja o primeiro!" |
| Erro | Ranking: "Sem conexão. OK tenta de novo". Envio: "Não deu para enviar. Tente de novo.", em `--cor-erro`. Apelido recusado: "Esse apelido não pode. Escolha outro." |
| Limite (429) | "Muitos envios seguidos. Tente de novo em 1 minuto.", em `--cor-alerta` |
| Carregando | "Carregando…" na tela, e "Enviando…" com o botão desabilitado |
| Confirmação | Modal do design kit; **nunca** `alert()` ou `confirm()` |

## Responsividade

- Usável a partir de **360 px** de largura, sem rolagem horizontal da página. O aparelho ocupa até 340 px.
- Área de toque de pelo menos **44×44** px (`--toque-minimo`).
- No PC, as teclas do aparelho continuam clicáveis, e o teclado físico também funciona: setas ou WASD, espaço,
  Enter e Esc.

## Acessibilidade

**WCAG 2.2 nível AA**: contraste, navegação por teclado, foco visível, rótulos em todos os campos, verificador
automático na CI.

- O canvas tem `role="img"` e nome. O placar e o ranking ficam em texto HTML, lido por leitor de tela.
- Foco visível com anel `--cor-foco` de 3 px.
- O jogo pausa sozinho quando a aba perde o foco.

## Formatos pt-BR

| Tipo | Formato |
| --- | --- |
| Data | `03/10/2026` |
| Hora | `14:05` (fuso do usuário) |
| Moeda | `R$ 1.234,56` |
| Número | `1.234,5` (pontos no ranking: `1.234`) |

## Protótipo aprovado

[`docs/prototipos/fundacao/index.html`](docs/prototipos/fundacao/index.html) é navegável e jogável. Tem menu,
partida, pausa, fim de jogo com apelido, ranking e instruções. Um painel de protótipo simula as respostas da API:
ranking com placares, vazio ou com erro, e envio aceito, apelido recusado, limite 429 ou erro. Issue da Fundação:
[#7](https://github.com/BrunodosSantosVaz/snake-3310/issues/7).

## Histórico de mudanças

| Data | O que mudou | ADR |
| --- | --- | --- |
| 06/10/2026 | Versão inicial (Fundação F3) | — |
