# Changelog — Snake 3310

Mudanças em português, no formato Keep a Changelog. A versão é preenchida pela integração da release.

## [Não publicado]

### Adicionado

- Aparelho3310 responsivo, menu, instruções e consulta de ranking com cinco linhas visíveis.
- API pública de listagem de até dez placares, desempate por envio mais antigo e prefixo exato por ambiente.
- Endpoints de saúde/prontidão e respostas de erro sem detalhes internos.
- ImagemARM64 para o Tsuru existente, migrações antes de HTTP e volume SQLite por ambiente.
- Guias de uso, contratoAPI, arquitetura, inventário de dados e runbooks.

### Alterado

- SQLite nativo substitui PostgreSQL/PGlite, sem servidor de banco adicional (ADR-0003).
- Modo Flash persistente e seleção dos testes afetados, mantendo revisão independente e suíte completa nos portões.

### Segurança

- RuntimeNode 24.18.1 fixado, bibliotecasOpenSSL 3.5.9-r0 e remoção de npm/npx/yarn daimagem.
- CSP própria origem, nosniff, bloqueio de frames, permissões restritas e HSTS em produção.
