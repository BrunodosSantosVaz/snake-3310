# Arquitetura — arc42 enxuto

## Objetivo e qualidade

Jogo público de portfólio com visual do Nokia 3310, partida e ranking, sem conta. Prioridades: uso imediato,
interface acessível, limites de abuso, persistência e release rastreável. [Produto](../../PRODUTO.md) e
[Design](../../DESIGN.md) definem o escopo; a documentação descreve o código revisado, enquanto a primeira
candidata e os recibos remotos ainda precisam comprovar a operação no Tsuru.

## Restrições

Tsuru existente ARM64, sem custo adicional nem servidor de banco. TypeScript/Fastify/Canvas/Vite e SQLite nativo
do Node 24.18.1, uma réplica e volume persistente por ambiente. [Stack](../../STACK.md), ADR-0003 e ADR-0004.

## Contexto e contêineres

[C4 nível 1](contexto.md) descreve jogador, dono e proxy; [nível 2](conteineres.md) mostra navegador, API e arquivo
SQLite. Front e API compartilham origem/prefixo; não há CORS, login ou acesso do navegador ao banco.

## Estratégia e estrutura

Domínio puro, aplicação com portas, infraestrutura SQLite e interface HTTP são separados por dependency-cruiser.
A raiz de composição liga repositório, prontidão, migrações e HTTP. O front não importa servidor: o motor puro
`game.ts` calcula os passos, `canvas.ts` desenha com tokens CSS e `ui.ts` controla telas, timer e requisições.
[OpenAPI](../api/openapi.yaml) define saúde, prontidão, GET e POST de placares.

## Execução

- Startup abre o arquivo, migra em transação na mesma conexão e só então registra/listen HTTP. Falha fecha recursos
  sem abrir a porta; SIGTERM fecha HTTP/banco. Saúde independe do banco; prontidão indisponível retorna 503.
- Partida: grade 21×13, três segmentos, tick de 180 ms e sete pontos por comida. Inversão é ignorada, inclusive por
  comandos rápidos; colisão com qualquer parte do corpo encerra. Comida vem de lista finita livre; grade cheia encerra.
  Pausa manual ou blur cancela o timer. Menu, saída e reinício limpam o ciclo e restauram o foco.
- No fim, o modal valida a forma Unicode do apelido e envia JSON. O backend valida forma/faixa/filtro, atribui UTC
  e prepara INSERT com bindings. Loading bloqueia duplicidade; 201 confirma uma vez nessa partida. Erros controlados
  permitem tentar novamente. AbortController e geração ignoram resposta antiga, sem reverter gravação já concluída.
- GET devolve até dez placares por pontos decrescentes, `julianday(created_at)` crescente e ID no empate exato.
  A tela mostra cinco. Datas e IDs não são devolvidos ao navegador.
- O POST passa pelo limite antes de ler o corpo: cinco tentativas em janela fixa de 60 s, mapa de até 4.096 IPs,
  expiração sob demanda e reset ao reiniciar. Saturação recusa novos IPs sem expulsar os já bloqueados.

## Implantação

Uma imagem OCI contém servidor/front. A candidata ARM64 passa em staging por scans, SBOM/atestação, smoke e ZAP;
produção promove a identidade já homologada. Tsuru pode importar sob outro nome/digest interno: o recibo precisa
reter SHA, digest de origem e evento de importação. Apps/PVCs separados, uma réplica por ambiente, migração na
inicialização e health em `<BASE_PATH>/api/ready`. [Runbooks](../operacao/README.md).

## Conceitos transversais

Configuração por ambiente, SQL preparado, Problem Details controlado, corpo de 1 KiB, cabeçalhos restritos e
aceites congelados. O servidor usa `trustProxy: false`; só um peer exato de `TRUSTED_PROXY_IPS` pode informar
um único IP válido em `X-Snake-Client-IP`, saneado pelo NPM. Nunca se confia em X-Forwarded-For; formato inválido
usa o peer, e IPv4 mapeado em IPv6 é normalizado. IPs do mapa não viram coluna do ranking; logs operacionais
podem conter IP/metadados e exigem acesso/retenção próprios. [Inventário](../dados/inventario.md).

## Decisões

[ADR-0001](../decisoes/ADR-0001-stack.md) registra a stack; [ADR-0003](../decisoes/ADR-0003-sqlite-embutido.md)
substitui PostgreSQL/PGlite; [ADR-0004](../decisoes/ADR-0004-flash-tsuru-ci.md) adota Flash/Tsuru/runtime da CI.
O épico #28 materializa as regras do protótipo aprovado nas RN-0004/5/6, sem nova tecnologia ou mudança de
produto/design. O limitador local usa estruturas nativas, sem dependência adicional.

## Qualidade e verificação

[Mapa dos 13 CA](../operacao/documentacao-34.md) liga regras, tarefas/PRs e provas. Aceite foi escrito antes da
implementação. A CI do SHA de código `a0b9324ade86dc9d827b3a07ed659a48e8821654` confirma 135 testes de
unidade/integração, 13 aceites e cobertura de 100% dos módulos incluídos. Chromium adicional comprovou
POST 201 único, SQLite persistido e GET posterior, CSP, foco, 360 px, texto a 200%, toque de 44 px e axe sem violações.

## Riscos e dívida

`node:sqlite` está em RC; mantenha o runtime fixado e o mesmo motor nos testes. Uma réplica por ambiente e
migrações compatíveis protegem rollout com sobreposição. Backup e chave locais, mesmo cifrados/Retain, não
recuperam a perda total do host; uma cópia independente continua pendente. Não há prova criptográfica de partida,
idempotência de POST nem garantia de filtro completo. Contadores reiniciam com o processo e usuários do mesmo
IP compartilham o limite. Teste local/CI não comprova deploy, persistência ou restauração remotos.

## Vocabulário

[Glossário PT ↔ EN](../produto/glossario.md).
