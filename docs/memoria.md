# Memória da Fundação

## Bootstrap Flash/Tsuru — épico #55, teste #56

A tarefa #57 deve selecionar Flash/Tsuru/readiness usando o Big Bang oficial 1.5.2, preservando os sete caminhos
originais do artefato. Nenhum runtime do jogo entra em develop/main neste épico sem release.

O CA nativo fica em `tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs`, fora do glob Vitest da app,
e usa o parser oficial do framework. Rodar com Node 24: `node --test tests/aceite/55-bootstrap-flash-tsuru/bootstrap.acceptance.mjs`.
Antes da implementação, `BB_BOOTSTRAP_ENFORCE=1` demonstra a falha sem a marca estrita de pendente. Configuração
inválida falha antes de registrar o teste; a marca pendente aceita somente AssertionError e rejeita XPASS.

A CI oficial reconhece Fundação sem artefato e não executa comandos npm ausentes (F5). A prova nativa é executada
explicitamente e acompanha o PR; não declarar testes da app executados nesse estado. Não alterar comandos da
Fundação para copiar scripts ainda pertencentes à release. `testes-producao.sh` carrega o SHA imutável da release
antes de instalar e testar, usando a configuração da própria release.
