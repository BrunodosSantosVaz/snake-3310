# Incidente

1. Identifique escopo e ambiente; compare URL pública/health/ready com eventos/unidades da app Tsuru. Não reinicie
   outros serviços do host para tentar recuperar o jogo.
2. Health 200 e ready 503 sugerem banco/volume; confirme PVC Bound, espaço, permissões UID 1000, migração e busy timeout.
   Falha no startup pode impedir ambos; logs devem ser inspecionados em sessão privada, sem tokens ou dados públicos
   copiados para comentários.
3. Health/ready internos OK e público falhando sugerem prefixo/proxy/Cloudflare. Confira rotas do NPM e whitelist do ingress
   sem ampliar confiança de IPs. O IP do NPM é restrito à app; não abra ingress global para sanar erro temporário.
4. Para regressão de release, consulte [voltar versão](voltar-versao.md); para corrupção, [restauração](backup-restauracao.md).
5. Confirme recuperação com smoke e evidência de versão/dados. Abra issue com período, causa, medidas e prevenção,
   removendo valores de credenciais, cabeçalhos de autorização e qualquer dado pessoal dos logs.

Sem prova da causa, preserve os dados e use as verificações do ambiente; nunca apague o banco para fazer a CI passar.

## Envios e abuso do ranking

- Para 429 inesperado entre jogadores, compare o último peer real com `TRUSTED_PROXY_IPS` e confirme que NPM
  sobrescreve `X-Snake-Client-IP`. Header ausente/inválido usa o peer; isso pode reunir visitantes no mesmo
  contador. Não amplie confiança para todas as redes privadas nem aceite X-Forwarded-For para resolver o incidente.
- Cinco tentativas, inclusive inválidas, esgotam a janela de 60 s. Capacidade cheia recusa novos IPs até expirar;
  reiniciar zera contadores e não é tratamento de abuso. Limite é por processo, com uma réplica.
- 400 pode ser forma/tamanho/tipo/pontos ou filtro local; inspecione a causa em sessão privada sem copiar apelido
  ou IP para issues. A API não comprova a partida: pontos plausíveis podem ser fabricados. Não anunciar antifraude.
- Falha de rede após gravar pode gerar duplicidade em nova tentativa. Cancelar no navegador não é rollback
  do banco; preserve evidências e use manutenção parametrizada se houver registro a remover.
