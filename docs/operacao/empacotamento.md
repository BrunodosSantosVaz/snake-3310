# Empacotamento e inicialização SQLite

A imagem contém a API e a interface compiladas. Base oficial Node 24.18.1 Alpine, fixada pelo digest multiarch
`sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3`; há manifesto ARM64. O build roda na
arquitetura do builder e copia JavaScript para o alvo ARM64; o estágio de segurança executa no alvo (com emulação no builder amd64); as dependências atuais são JS puro. O estágio de
dependências recusa addon `.node`, para não copiar binário de outra arquitetura silenciosamente. Dependência
nativa futura exige rever esse processo e sua decisão de stack.

O scan inicial identificou OpenSSL da base e dependências do npm embarcado. O runtime atualiza explicitamente
`libcrypto3`/`libssl3` para `3.5.9-r0` e remove npm/npx/yarn. O Node permanece fixado no digest acima. A CLI no
contêiner é `node /app/dist/server/interface/migrate.js`; `npm run migrar` continua disponível no checkout local.
A promoção exige novo scan HIGH/CRITICAL sem bypass e SBOM da imagem final, como definido pela esteira.

## Contrato da execução

| Variável | Padrão da imagem | Finalidade |
| --- | --- | --- |
| NODE_ENV | production | Ativa HSTS além dos cabeçalhos enviados em todas as respostas |
| PORT | 8888 | Porta HTTP da app, com bind 0.0.0.0 |
| BASE_PATH | vazio | Prefixo exato do ambiente; configure homologação/produção separadamente |
| WEB_DIR | /app/dist/web | Front compilado, caminho absoluto |
| MIGRATIONS_DIR | /app/migrations | Migrações numeradas embarcadas |
| SQLITE_PATH | /data/scores.sqlite | Arquivo persistente, fora de dist |

O processo executa como `node` (UID/GID 1000), com `umask 077` tanto no servidor quanto na CLI de migração.
`/data` nasce com permissão 700. Monte um volume persistente separado por ambiente com permissão de escrita para
UID/GID 1000; o PVC pode precisar de fsGroup 1000. Banco, WAL e SHM ficam juntos nesse volume. Não publique `/data`
em HTTP nem copie o arquivo para dentro do front.

A inicialização abre o arquivo, aplica migrações na mesma conexão e só depois constrói e inicia o servidor HTTP.
Erro de migração desfaz a transação, fecha o banco e impede listen. Repetir o startup mantém os registros e não
reaplica migrações. O contêiner recebe SIGTERM diretamente pelo Node; a app fecha HTTP e banco antes de sair, com
prazo de dez segundos. O healthcheck da imagem consulta `/api/ready` sob BASE_PATH; o health público continua
independente do banco. Veja as exceções aprovadas no ADR-0003.

No Tsuru, use a inicialização da própria app (`TSURU_MIGRACAO=inicializacao` na configuração do alvo do framework).
Um job manual independente não compartilha o PVC da app. Não configure esse job como migrador do SQLite.
Mantenha uma réplica por ambiente; sobreposição temporária em rollout ocorre no mesmo nó com WAL e timeout 5000 ms.
Migrações novas precisam continuar compatíveis com a versão anterior, inclusive em rollback (DAD-02).

## Desenvolvimento e Compose

Build ARM64: `docker buildx build --platform linux/arm64 --load -t snake-3310:local .`.
Em máquina amd64, use `--platform linux/amd64` para testar localmente sem emulador. A imagem de produção é ARM64
publicada no GHCR pelo fluxo de candidata e promovida por digest, sem recompilar para produção.

O Compose é um helper local/legado: não cria servidor de banco. Copie `deploy/app.env.example` para
`deploy/app.env`, ajuste BASE_PATH e forneça `BB_IMAGEM_APP` com digest imutável. Execute
`docker compose -f deploy/compose.yaml up -d app`. A porta publicada fica somente em 127.0.0.1 e o volume nomeado
`scores` persiste nas recriações. O helper `migrar`, opcional, compartilha o mesmo volume e aplica a CLI; o startup
normal também migra. Nunca use `down -v` em um ambiente com placares que precisam ser preservados.

O Compose usa filesystem somente leitura, /data montado para escrita, no-new-privileges, capabilities removidas,
limites de memória/processos e init. A política equivalente no Tsuru/PVC é configuração da entrega, não uma
alegação de que este PR já a aplicou.

## Smoke após deploy

`BB_URL=https://endereco/prefixo npm run test:smoke`, ou `SMOKE_URL` com a mesma URL. O script usa só Node/fetch,
sem npm ci, Playwright, banco local ou escrita de dados. Confere health, ready, HTML, CSP/nosniff e contrato do
ranking público (no máximo dez, nickname/points apenas e pontos inteiros decrescentes). Redirecionamento ou falha
retorna 1; URL ausente/inválida retorna 2. Não use URL com credenciais, query ou fragmento.

O backup consistente, criptografia e restauração real do PVC serão registrados no runbook da entrega. Este PR
não cria recursos Tsuru e não declara produção ou restauração concluídas.
