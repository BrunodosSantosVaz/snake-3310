# ADR-0004: Flash, Tsuru e runtime verificável da CI

- **Situação:** aprovada pelo dono na [decisão #36](https://github.com/BrunodosSantosVaz/snake-3310/issues/36#issuecomment-6030577155).
- **Data:** 2026-10-07.
- **Decisor:** Bruno dos Santos Vaz; aplicação operacional no bootstrap #55/#57.
- **Substitui:** o alvo temporário VPS Docker do ADR-0001.

## Contexto e decisão

A configuração de main ainda selecionava VPS e modo padrão, enquanto a candidata homologada já usava Tsuru e
Flash. Aplicar a decisão existente à Fundação com a distribuição oficial Big Bang 1.5.2, mesclada pelo PR #52:
`projeto.modo = "flash"`, `entrega.alvo = "tsuru"`, formato imagem OCI, plataforma ARM64 e saúde em `/api/ready`.
URLs e nome da imagem permanecem os aprovados na Fundação.

## Bootstrap sem artefato

O épico #55 conserva exatamente os sete caminhos originais do artefato e os comandos originais da Fundação.
Sua publicação sem release leva apenas configuração, gerados e documentação à main. O artefato do jogo, seus
caminhos adicionais, banco e instalador Node24 já aprovados pertencem à release homologada dos épicos #13/#28.
Não há dependência nova nem alteração de runtime neste bootstrap.

`testes-producao.sh` resolve e faz checkout do SHA imutável de `origin/release/<versão>` antes de instalar e testar.
A promoção usa, portanto, a configuração e os comandos da release. O CA nativo #56 comprova a configuração da
Fundação; os testes HTTP e do navegador pertencem à release.

## Consequências e segurança

Flash conserva testes antes da implementação, aceites congelados, revisão independente e scanners. Estrutura
e produção exigem suíte completa. A publicação sem release exige main ancestral de develop, CI verde no SHA
exato e nenhuma diferença nos caminhos do artefato. Segredos continuam exclusivamente nos ambientes protegidos
(SEG-IA-04). O bootstrap não promove candidato, cria imagem nem declara produção concluída.
