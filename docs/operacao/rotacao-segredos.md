# Rotação de credenciais

O app não tem senha de usuário nem credencial de banco: SQLite é protegido por permissões/volume. Segredos
operacionais incluem tokens Tsuru dos ambientes, tokens de automação GitHub e identidade age dos backups.

1. Se houver exposição, trate o valor como vazado e avise o dono pelo canal privado; nunca coloque o valor na issue.
2. Crie substituto com menor escopo: leitura de info/eventos e importação de imagem apenas na app correspondente.
3. Grave `TSURU_TOKEN` no ambiente correto do GitHub por stdin/ferramenta segura, sem eco ou comandos com valor literal.
4. Verifique acesso à própria app e recusa à outra app/ambiente/leitura de env secretas. Valide deploy autorizado, depois
   revogue o token antigo e remova cópias locais temporárias.
5. Token GitHub deve ser rotacionado conforme a função original; não dê admin global à CI para solucionar pull do registry.
6. Para age, mantenha identidade anterior protegida até expirar/recifrar backups antigos. Nova chave somente não
   decifra os snapshots anteriores. Confira restauro com a nova identidade e sua custódia independente.
7. Registre data, escopos e resultado sem nomes/valores desnecessários, acompanhando os scanners do repositório.
