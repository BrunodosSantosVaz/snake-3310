# Manutenção da esteira com Big Bang v1.5.5

Pedido do dono: atualizar framework e Actions de develop/main, preservando a produção v0.1.0 do aplicativo.
Rastreamento: [#74](https://github.com/BrunodosSantosVaz/snake-3310/issues/74);
[pacote oficial](https://github.com/BrunodosSantosVaz/big-bang/releases/tag/v1.5.5).

## Atualização e publicação

1. `python3 .bigbang/bin/bb.py atualizar 1.5.5 --simular`: conferir pacote, hash, atestação e migração.
2. `python3 .bigbang/bin/bb.py atualizar 1.5.5`: preparar framework/v1.5.5 a partir da develop pelo atualizador oficial.
3. Conferir que só framework, versão de bigbang.toml, arquivos gerados e documentação autorizada mudam.
   Configuração do projeto, caminhos do artefato, dependências, RNs e aceites permanecem iguais. Modo Flash preservado.
4. Aguardar CI estrutural completa e revisão independente no SHA final. Mesclar o PR pela esteira.
5. Liberar a posse e executar Publicar sem release pela main: simulação verde antes da execução real,
   com a autorização do dono no ambiente producao. Conferir main/develop no mesmo commit.
6. Fechar a issue, executar Faxina (simular antes), conferir branches/PRs/posses e remover a pasta de trabalho própria.

Não gerar candidata ou nova release do aplicativo nesta manutenção. A CI valida a fonte; os artefatos publicados abaixo
permanecem os mesmos. O recibo final dos runs e da comparação dos assets fica na issue da atualização.

## Faxina e recuperação

A publicação real já faz a faxina; o novo workflow recupera sobras diariamente e por botão, executando apenas scripts da main.
Simulações dos workflows de publicação e encerramento não disparam uma limpeza real separada. Só branches incorporadas e
concluídas podem ser apagadas; main/develop, tags, PRs abertos e commits exclusivos ficam preservados. Falhas de leitura
da API são explícitas. Encerrar exige faxina limpa; se falhar após registrar a data/milestone, resolver os pontos e repetir
é idempotente, sem desfazer uma publicação. Stashes locais não pertencem à faxina.

## Artefatos preservados da produção v0.1.0

| Asset | SHA-256 registrado antes da manutenção |
| --- | --- |
| `imagem.txt` | `sha256:75b816747eb0d81f5099f12753488feb3d7e2d95715c40a9f47ae3c4be2440ad` |
| `sbom-app.json` | `sha256:6c6e25ae78bf9806924f2c74d77419a3e343b2ff3dff5b2d0874458b7aba1e96` |
| `sbom-app.linux-arm64.json` | `sha256:6c6e25ae78bf9806924f2c74d77419a3e343b2ff3dff5b2d0874458b7aba1e96` |

Comparar também IDs, tamanho e datas dos assets; não sobrescrever releases anteriores. Para homologação do aplicativo,
continuam valendo os recibos da release vigente, sem alegar novo ensaio físico ou novo deploy nesta atualização.

## Alerta CodeQL do protótipo

O [alerta #1](https://github.com/BrunodosSantosVaz/snake-3310/security/code-scanning/1) apontou DOM text reinterpretado
como HTML em docs/prototipos/fundacao/index.html. A correção troca innerHTML por elementos e textContent.
Os três testes nativos novos cobrem apelido com marcação HTML como texto literal, ranking vazio e erro.
O caso hostil falhou antes da correção e passou depois. A fixture injeta o nome diretamente nos dados do renderer;
o formulário normal já limita apelidos a letras/números. Não alegar exploração pela entrada normal.

Esse protótipo não faz parte da imagem publicada: Vite compila src/web e Docker só copia dist, dependências e
migrações para o runtime. O jogo atual já renderiza nomes por textContent, com teste próprio de HTML malicioso.
A correção documental segue sem release. O fechamento efetivo do alerta deve ser conferido pela nova análise
CodeQL da main; scanner e regras ficam habilitados, sem dispensar o alerta manualmente.
