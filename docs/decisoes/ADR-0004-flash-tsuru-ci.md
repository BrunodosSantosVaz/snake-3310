# ADR-0004: Flash, Tsuru e runtime verificável da CI

- **Situação:** aprovada pelo dono na decisão registrada em #36.
- **Data:** 2026-10-07
- **Decisores:** Bruno dos Santos Vaz (dono); Codex (implementação).
- **Substitui:** alvo temporário VPS Docker do ADR-0001. SQLite segue o ADR-0003.

## Contexto e decisão

O dono autorizou o modo Flash e a publicação no Tsuru existente. A configuração usa a distribuição oficial
do Big Bang 1.5.0, preservando sua validação, hashes e arquivos gerados. `bigbang.toml` define
`projeto.modo = "flash"`, `entrega.alvo = "tsuru"`, imagem OCI ARM64 e saúde em `/api/ready`.

O artefato inclui `scripts/`, `docs/design/`, `.dockerignore` e `deploy/`, além dos caminhos anteriores:
alterações nos recursos que o build copia ou nos scripts de inicialização precisam de release.

## Runtime e segurança

`bash scripts/install-ci.sh` instala Node **24.18.1** em Linux x64 ou ARM64 na CI. O SHA-256 oficial de cada
arquivo está fixado no código; qualquer divergência interrompe o comando antes de extrair ou instalar pacotes
(SEG-18). O script exporta `PATH` para `npm ci` e escreve `GITHUB_PATH` para os passos seguintes. Localmente,
o comando exige a mesma versão já instalada. Chromium é preparado pelo prehook de aceite quando a suíte
completa ou o aceite de navegador será executado; não há segunda instalação no instalador de pacotes.

## Seleção Flash e limites

`npm run test:affected` lê o **arquivo** JSON informado por `BB_ARQUIVOS_ALTERADOS`. O grafo estático real
do Vitest seleciona unidade e integração que importam os arquivos alterados, direta ou indiretamente.
O grafo SSR do Vite enumera as dependências transitivas dos arquivos alterados para delimitar a cobertura
dos módulos de domínio/aplicação. Linhas, funções, ramos e instruções mantêm o limite de **80%** (TST-05).
Uma alteração sem módulos dessas camadas executa os testes selecionados sem cobertura artificial.

Os aceites congelados usam imports por variável e recursos por URL: backend acrescenta os cenários de
esqueleto/ranking; front acrescenta jogo, interface e navegador. Uma nova dependência dinâmica que não esteja
nesse mapa, grafo inválido, caminho desconhecido/deletado ou seleção vazia executa unidade, integração,
aceite e cobertura completos. Não existe `passWithNoTests` (TST-11).

O framework exige CI completa em mudanças estruturais, produção e releases major/minor. Flash altera a
seleção em mudanças locais; a revisão independente, os scanners e os portões de entrega continuam obrigatórios.

## Consequências

Há menos testes executados para mudanças locais comprovadas pelo grafo. A cobertura completa continua no
comando estrutural; os mapas dos aceites dinâmicos devem ser atualizados se seu contrato mudar. Enquanto houver
incerteza, a seleção conservadora usa a suíte completa. Tsuru usa o mesmo digest OCI promovido e o volume
durável por ambiente já definido no ADR-0003; startup e migração são implementados pela tarefa #19.
