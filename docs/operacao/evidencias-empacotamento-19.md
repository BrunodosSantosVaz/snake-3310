# Evidências locais de empacotamento — tarefa #19

Em 2026-10-07, sem publicar ou alterar serviço Tsuru:

- Testes anteriores ao runtime: commit `9cc5094`, startup e smoke nativo.
- Node local 24.18.1: 64 testes de unidade/integração (inclui startup TCP e smoke em servidor local), cinco critérios
  congelados do épico #13, cobertura domínio/aplicação 100%. Lint, tipos, arquitetura, build, documentação e
  `bb verificar` passaram.
- Docker build ARM64 e amd64 concluídos. ARM64 executado no Docker local **sob emulação**, não no Oracle nativo;
  binfmt usado como ferramenta de desenvolvimento pelo digest
  `sha256:400a4873b838d1b89194d982c45e5fb3cda4593fbfd7e08a02e76b03b21166f0`, somente arm64 instalado.
- Contêiner final ARM64: Node 24.18.1, SQLite 3.53.1, UID 1000, arquivo 600 e diretório `/data` 700. Volume próprio
  descartável, filesystem da app somente leitura. Smoke nativo passou health, ready, ranking e HTML/CSP/nosniff.
- Após inserir um placar fictício 21 no arquivo e trocar o contêiner, ranking permaneceu e o ledger teve uma
  única migração. SIGTERM fechou recursos e saiu 0.
- Injetar migração inválida em diretório readonly separado fez o contêiner sair 1, sem log de listen; esquema
  parcial e marca estavam ausentes ao reabrir o arquivo.
- Compose foi validado com `docker compose config --quiet`, sem iniciar ambiente externo.
- O scan inicial da base fixada encontrou libcrypto3/libssl3 3.5.7-r0 HIGH e dependências do npm com HIGH/CRITICAL.
  Corrigido com pacotes Alpine `3.5.9-r0` e remoção de npm/yarn do filesystem de runtime.
- Trivy 0.75.0, binário validado pelo SHA da esteira: scan final ARM64 com `--severity HIGH,CRITICAL --exit-code 1
  --scanners vuln`, sem ignore ou bypass, passou com **zero** achados nesse nível. O JSON completo local fica em
  `/tmp/snake19-trivy-final.json`; a candidata gerará sua própria evidência e SBOM do digest publicado.

Permissões do PVC, configuração Tsuru, backup/restauração, URL externa, ZAP da candidata e publicação permanecem
validações da entrega. Estes resultados locais não são homologação manual do dono nem teste nativo ARM no servidor.
