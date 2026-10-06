# Snake 3310 — Produto

> Escrito na Fundação (F1) a partir da entrevista com o dono. Só muda com decisão do dono registrada em ADR.

## O que é

Um jogo da cobrinha no navegador, fiel ao Snake do Nokia 3310, com ranking público por apelido, para o portfólio
do dono.

## Problema e para quem

É uma vitrine pública do trabalho do dono: quem visita o portfólio abre o link e joga na hora, no PC ou no celular,
sem instalar nada nem criar conta. O projeto também é o primeiro sistema a passar inteiro pela esteira do Big Bang
até produção, num servidor do próprio dono.

## Quem usa e quantos

| Perfil | Quantas pessoas | Com que frequência |
| --- | --- | --- |
| Visitante do portfólio (jogador anônimo) | Poucas visitas, público aberto na internet | Ocasional; o jogo precisa estar sempre no ar e bonito |
| Dono | 1 | Publica versões e cuida do ranking |

## Onde roda

Web: um único site responsivo, em navegadores atuais de PC e de celular.

- No PC, o jogo usa o teclado.
- No celular, o jogo usa o teclado numérico do 3310 desenhado na tela e clicável.

## Login e perfis de acesso

Não há login nem cadastro. Ao fim da partida, o jogador pode digitar um **apelido** para mandar o placar ao ranking
público. Todos os visitantes têm o mesmo acesso: jogar, ver o ranking e enviar o próprio placar.

## Funciona sem internet?

Não. É preciso internet para abrir o site e para enviar o placar.

## Dados sensíveis e nível ASVS

| Dado | Tipo (dinheiro, saúde, dado pessoal, outro) | Por que o sistema precisa dele |
| --- | --- | --- |
| Apelido | Outro (texto livre público, com filtro de palavrões) | Identificar o placar no ranking |
| Placar | Outro | Montar o ranking |

O sistema não pede nome, e-mail, localização, pagamento nem dado de saúde.

**Nível ASVS:** L1. O sistema não lida com dinheiro nem com dado pessoal: o apelido é um texto público escolhido
pelo jogador, e o jogo não pede nome real. Os riscos que sobram são abuso do ranking (placar falso, spam, apelido
ofensivo) e excesso de requisições. Eles são tratados pelas regras de ferro de segurança, com limite de envios
(SEG-IA-05), validação do placar no backend (SEG-IA-02) e filtro de palavrões.

## Integrações obrigatórias

Nenhuma.

## Orçamento mensal de hospedagem

R$ 0 extra. O dono quer publicar no Tsuru que já roda no servidor dele (`vm-oracle`, em
`tsuru.frontzap.com.br`). O alvo de entrega é decidido na F2.

## O que o dono já domina

O dono pediu que a IA escolha a stack mais apropriada para este tipo de sistema. O que ele já opera é o servidor
`vm-oracle`, com Docker, o proxy reverso e o Tsuru.

## Prazo do primeiro uso real

Sem prazo. O ritmo é o da Fundação, porque o objetivo principal é validar a esteira.

## Fora do escopo

- Login, contas, e-mail e notificações.
- Pagamento, doação e anúncios.
- Jogar offline.
- Analytics e integrações externas.
- Fora da v1 (pode entrar depois, com decisão do dono): velocidade progressiva, sons e paredes atravessáveis.

## Escopo da primeira versão

- Cobra, comida, crescer e fim de jogo ao bater.
- Ranking público com apelido.
- **Visual fiel ao 3310:** tela verde-azulada, pixels grossos, moldura do aparelho e teclado numérico clicável
  no celular.

## Histórico de mudanças

| Data | O que mudou | ADR |
| --- | --- | --- |
| 06/10/2026 | Versão inicial (Fundação F1) | — |
