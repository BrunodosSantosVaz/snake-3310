id: RN-0003
titulo: O sistema informa se está vivo e se está pronto
situacao: vigente
substituida_por:
origem: "#13"
criada_em: 2026-10-06

## Descrição

O sistema tem dois endereços de verificação para a operação. "Vivo" (`/api/health`) responde que está tudo bem
sempre que o servidor está de pé, mesmo sem banco. "Pronto" (`/api/ready`) só responde que está tudo bem quando o
banco de dados responde. Quando não está pronto, ele avisa que está indisponível (503), sem mostrar detalhes do erro.

## Exemplos

- Dado o servidor de pé e o banco fora, quando a operação pergunta se está vivo, então recebe 200 com
  `{"status":"ok"}`.
- Dado o banco no ar, quando a operação pergunta se está pronto, então recebe 200.
- Dado o banco fora, quando a operação pergunta se está pronto, então recebe 503, sem a mensagem do erro.

## Exceções

Nenhuma.

## Testes que cobrem

- tests/aceite/13-esqueleto-andante/esqueleto.test.ts (CA-1 e CA-2)
