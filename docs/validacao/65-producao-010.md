# Plano de validação documental — produção v0.1.0, épico #65

O plano da tarefa #66 precede a atualização #67 e a conferência #68. A produção do jogo já existe;
estes três PRs não alteram imagem, dependências, regras ou aceites e não criam testes que procuram frases.

## Lacuna anterior à implementação

Na base `ee31aedb33db8575612eaa101028c15d1822c035`, README ainda declara primeira produção pendente,
o índice de operação anuncia PR Oracle #1 não integrado, e o rodapé do changelog diz que a versão não foi publicada.
Os CA-1/2/3 não estão satisfeitos na documentação, embora v0.1.0 esteja publicada e funcionando.
Registros históricos da Fundação e das tarefas devem preservar datas/resultados, com ponte para o recibo atual.

## Critérios e conferência independente

| Critério | Procedimento anterior à atualização | Evidência a confrontar |
| --- | --- | --- |
| CA-1 | Ler estado/instalação/recursos do README e confirmar v0.1.0 e os dois links reais | Release v0.1.0, RN-0001 a RN-0006, navegador atual |
| CA-2 | Comparar imagem.txt/SBOM da candidata e estável; separar SHA fonte da imagem do commit de promoção | Candidata37596185419, fonte7a770ff4be050598f8cebea9718d372145e1d3eb, produção37766740098, digest12fb06c1c51f72772358d7cf6dfd2a7b4468af13c5f4917946d290477b2acac1 |
| CA-3 | Conferir PVCs, privacidade, uma unidade após rollout, ranking preservado no reinício e snapshots realmente gerados/restaurados pelo daemon | Recibo público PR60, OraclePR2/runbook, snapshots11:07UTC08/10 e horário original :17restaurado |
| CA-4 | Conferir ensaios reais hom/prod com POST201 único, foco/movimento/pausa/reinício,360px/texto200%,toque44 e axe0 nos estados observados | Capturas reais sintéticas e recibo PR60, sem inferir aparelho físico ou teste externo de recuperação |
| CA-5 | Verificar Markdown/links/rastreabilidade/gerados; confrontar diff com base e CI do SHA exato; publicar sem release oficial | Portões documentais, revisão independente, diff vazio em runtime/CA/RN/config/framework e identidade estável da imagem |

## Rastreabilidade reutilizada

Os seis documentos RN e os 13 aceites da app permanecem congelados:
[esqueleto #13](../../tests/aceite/13-esqueleto-andante/) e
[partida #28](../../tests/aceite/28-partida-completa/).
O [mapa da implementação](../operacao/documentacao-34.md) relaciona critérios/RN/tarefa/PR.
CA histórico do bootstrap #55 permanece byte a byte e só reproduz a Fundação no SHA histórico descrito no runbook.
A CI atual usa135 testes unitários/integrados,13 aceites e128 na cobertura100%; documentação não exige repetição local.

## Comandos e limites

```bash
python3 .bigbang/bin/bb.py verificar
python3 .bigbang/bin/bb.py esteira documentacao
python3 .bigbang/bin/bb.py esteira rastreabilidade
git diff --check
```

Compare com a base os caminhos de artefato do TOML, tests/aceite, docs/negocio/regras, framework/gerados e configuração.
DOC-03/DOC-12/DOC-15: rastreabilidade, memória e README atuais. TST-02/TST-03: contrato preservado.
Capturas usam dados sintéticos, sem segredo ou apelido real. Backup/chave no mesmo host não provam recuperação externa.
A publicação sem release ainda exige revisão, CI verde, simulação e aprovação do ambiente já delegada pelo dono.

## Conferência posterior à atualização

O plano foi mesclado antes do PR70. A [conferência #68](../operacao/documentacao-68.md)
registra critérios/checklist e os portões restantes da publicação sem release.
O resultado final da esteira fica no recibo público do épico65, preservando este plano anterior ao trabalho.
