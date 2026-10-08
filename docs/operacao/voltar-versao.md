# Voltar versão

1. Identifique a Release estável anterior e seu `imagem.txt`; confirme digest/SHA e compatibilidade do esquema.
2. Preserve backup consistente atual e confirme o ambiente alvo. Na primeira publicação ainda não existe versão
   estável anterior; interromper o rollout ou corrigir a candidata é diferente de inventar uma release de rollback.
3. Rode *Voltar versão* com inputs do workflow, simulação primeiro e ordem explícita do dono para executar de verdade.
4. O Tsuru reimporta o digest anterior; não executa migração reversa nem restaura o arquivo SQLite.
5. Confira evento, health/readiness, smoke, ranking e dados. Se o banco precisar de recuperação, use o
   [runbook de restauração](backup-restauracao.md) em manutenção, com a app parada.
6. Registre causa, origem/importação, URL e resultado; trate a correção num PR próprio revisado.

Não apague PVC/PV nem dados para forçar health. Uma imagem antiga incompatível com esquema novo não é rollback seguro.
