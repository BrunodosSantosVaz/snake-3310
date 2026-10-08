# Changelog — Snake 3310

Mudanças em português, no formato Keep a Changelog. A versão é preenchida pela integração da release.

## [Não publicado]

### Documentação

- Recibos da produção v0.1.0, README e operação revisados pelo épico #65, sem nova imagem ou versão do jogo.
- Atualização oficial do framework 1.5.3 pelo PR #64, preservando runtime, aceites e configuração Flash/Tsuru.

## [0.1.0] - 2026-10-07

### Adicionado

- Flash, Tsuru e CI com Node24 verificado (#41)
- SQLite nativo e persistente para o ranking (#29)
- Criar aparelho 3310 com menu e ranking acessíveis (#26)
- Listar os dez maiores placares públicos (#25)
- Banco SQLite, migração inicial e readiness (#29); a proposta PostgreSQL/PGlite do PR #24 foi substituída pelo ADR-0003.
- Estrutura do projeto, servidor sob BASE_PATH e health check (#23)
- Enviar placar pelo modal acessível da partida (#49)
- Valida e limita o envio público de placares (#47)
- Entregar partida Canvas com controles e pausa (#44)
- Aparelho 3310 responsivo, menu, instruções e consulta de ranking com cinco linhas visíveis.
- Partida em pixels: grade 21×13, três segmentos, passo de 180 ms, sete pontos por comida, colisões,
  grade cheia, pausa manual/perda de foco e reinício por teclado ou toque.
- Modal com apelido Unicode de 3–12 letras/números, POST real, loading, confirmação, erros controlados e
  cancelamento da espera/respostas antigas ao reiniciar ou sair.
- API pública de envio com pontos inteiros de 0 a 1.890, múltiplos de sete, UTC do servidor e filtro local de apelidos.
- API pública de listagem de até dez placares, desempate por envio mais antigo e prefixo exato por ambiente.
- Endpoints de saúde/prontidão e respostas de erro sem detalhes internos.
- Imagem ARM64 para o Tsuru existente, migrações antes de HTTP e volume SQLite por ambiente.
- Guias de uso, contrato API, arquitetura, inventário de dados e runbooks.

### Alterado

- Fundação sincronizada após o bootstrap sem release #55, preservando os comandos, arquivos e aceites do jogo.

- SQLite nativo substitui PostgreSQL/PGlite, sem servidor de banco adicional (ADR-0003).
- Modo Flash persistente e seleção dos testes afetados, mantendo revisão independente e suíte completa nos portões.

### Segurança

- Runtime Node 24.18.1 fixado, bibliotecas OpenSSL 3.5.9-r0 e remoção de npm/npx/yarn da imagem.
- Cinco tentativas de POST em 60 s por IP, mapa limitado/expirável e 429 com Retry-After. Cabeçalho dedicado
  somente de proxy exato configurado, saneado no NPM; X-Forwarded-For não define a chave.
- Validação sem coerção/campos extras, INSERT preparado, corpo de 1 KiB e nenhuma credencial no navegador.
- CSP própria origem, nosniff, bloqueio de frames, permissões restritas e HSTS em produção.
A data acima é a integração da versão; a promoção estável ocorreu em 08/10/2026.
Os [recibos de homologação, persistência e restauração](docs/operacao/producao-010.md) registram as verificações reais.
