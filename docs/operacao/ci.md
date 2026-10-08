# CI e testes afetados

A fonte da esteira é `bigbang.toml`; execute `bb gerar` após alterá-la. Arquivos com cabeçalho gerado e
`.bigbang/` pertencem ao framework oficial e não recebem edição manual.

## Instalação

Use Node 24.18.1 localmente e execute `bash scripts/install-ci.sh`. Na CI Linux, esse comando baixa a mesma
versão, confere seu SHA-256 fixado, exporta o runtime e executa `npm ci`. O arquivo `GITHUB_PATH` propaga o
runtime aos passos seguintes. Arquiteturas aceitas: x64 e ARM64. Falha de download ou hash interrompe o job.

## Comandos

- `npm test`: testes dos scripts, unidades e integrações, incluindo migrações.
- `npm run test:acceptance`: aceite completo; seu prehook prepara build e Chromium.
- `npm run test:coverage`: cobertura completa das camadas domínio/aplicação, com quatro limites de 80%.
- `npm run test:affected`: grafo do Vitest, aceite específico e cobertura dos módulos afetados e dependências.

Para reproduzir uma alteração local:

```sh
printf '["src/aplicacao/health.ts"]\n' > /tmp/snake-changed.json
BB_ARQUIVOS_ALTERADOS=/tmp/snake-changed.json npm run test:affected
```

O valor da variável é um caminho, nunca o próprio array JSON. Falta de manifesto, estrutura inválida,
arquivo desconhecido/deletado, grafo incerto ou conjunto vazio ativa a suíte completa.
Mudanças em CI, configuração da stack, Docker, migrações, dependências e outras estruturas relevantes
recebem CI completa pelo Big Bang. Antes de produção, o framework também exige a execução completa.

O mapa de aceite complementa o grafo estático para imports por variável: servidor executa os testes do
esqueleto e envio/listagem de placares; front executa jogo, DOM e navegador. Chromium/build só são preparados
na seleção local que inclui o cenário de navegador. Os detalhes estão no [ADR-0004](../decisoes/ADR-0004-flash-tsuru-ci.md).

## Evidência desta entrega

Os 13 CA são conferidos no [mapa #34](documentacao-34.md). A CI do SHA de implementação já testado é reutilizada
como evidência; documentação tem revisão/checks próprios sem teste espelhando frases nem repetição local da
suíte por hábito. Primeira candidata/produção exigem os portões completos. A verificação adicional
`node scripts/check-game-ui.mjs`, após build/Chromium, usa SQLite isolado real, confirma POST/GET e gera a
captura da partida; nunca usa dados do ranking de produção para uma imagem de documentação.
