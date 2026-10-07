# Incidente

1. Identifique escopo e ambiente; compare URL pública/health/ready com eventos/unidades da app Tsuru. Não reinicie
   outros serviços do host para tentar recuperar o jogo.
2. Health200 e ready503 sugerem banco/volume; confirme PVC Bound, espaço, permissõesUID 1000, migração e busy timeout.
   Falha no startup pode impedir ambos; logs devem ser inspecionados em sessão privada, sem tokens ou dados públicos
   copiados para comentários.
3. Health/ready internosOK e público falhando sugerem prefixo/proxy/Cloudflare. Confira rotas do NPM e whitelist do ingress
   sem ampliar confiança de IPs. O IP do NPM é restrito àapp; não abra ingress global para sanar erro temporário.
4. Para regressão de release, consulte [voltar versão](voltar-versao.md); para corrupção, [restauração](backup-restauracao.md).
5. Confirme recuperação com smoke e evidência de versão/dados. Abra issue com período, causa, medidas e prevenção,
   removendo valores de credenciais, cabeçalhos de autorização e qualquer dado pessoal dos logs.

Sem prova da causa, preserve os dados e use as verificações do ambiente; nunca apague o banco para fazer a CI passar.
