# Checklist de produção

Como o Snake 3310 verifica cada item antes de *Publicar em produção* (`bb checklist producao`).

O [bootstrap #55](bootstrap-sem-release-55.md) publica somente a configuração da Fundação, pelo fluxo sem
release e seus portões próprios. Ele não satisfaz nem marca os itens abaixo como executados. Na promoção do
jogo, o framework carrega o SHA e a configuração da release antes da instalação e dos testes completos.

- [ ] O backend sobe sem erro — verificação: `portao: staging`
- [ ] O front compila — verificação: `portao: ci`
- [ ] As migrações rodam do zero e a partir da versão anterior — verificação: `portao: testes`
- [ ] O ambiente sobe pelo método de deploy do alvo — verificação: `portao: staging`
- [ ] Nenhum segredo no pacote do front — verificação: `portao: seguranca`
- [ ] Rotas privadas exigem autenticação — verificação: `nao-se-aplica: o sistema não tem login nem rotas privadas (PRODUTO.md)`
- [ ] CORS de produção configurado por ambiente — verificação: `nao-se-aplica: o jogo e a API estão na mesma origem e no mesmo caminho; a API não habilita CORS`
- [ ] Testes de limite de requisições presentes e passando — verificação: `portao: testes`
- [ ] /api/health responde sem autenticação — verificação: `portao: staging`
- [ ] O README documenta as variáveis de ambiente sem valores — verificação: `portao: builtin`
- [ ] A auditoria de segurança não tem achado crítico ou alto aberto — verificação: `portao: builtin`

O portão de testes completos de produção executa as migrações reais incluídas em `npm test` (banco vazio,
idempotência, evolução e rollback transacional). Reutiliza a evidência desse SHA, sem repetir a mesma suíte por hábito.

O POST limitado e o modal são cobertos por CA-4/5/6/7; CA-8 verifica Chromium/CSP/acessibilidade. O
[mapa completo](documentacao-34.md) registra os 13 CA sem alterar os cenários congelados. `TRUSTED_PROXY_IPS`
precisa coincidir com o último peer real, e NPM precisa sobrescrever o cabeçalho dedicado antes da aplicação.

Na primeira entrega, registrar após cada execução: SHA/digest, run de candidata, importação Tsuru, smoke sob cada
prefixo, PVC/UID e réplica, gravação/consulta após reinício, backup e restauração verificados. Os itens acima
continuam como verificações dos portões; ainda não são declaração de produção pronta.
