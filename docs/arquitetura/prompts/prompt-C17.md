# Prompt C17 — Ajustes do lote 17

> Lote 18, correção do lote 17, conferida no zip de 2026-10-29 contra a branch `claude/agents-md-v2` (`ca3ecaa`). Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt C17 — Cartão do tema claro e texto do B30

O código do lote 17 voltou igual à referência; só estes dois trechos ficaram diferentes.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. Mude só os dois trechos abaixo, exatamente como estão; nada mais.

ARQUIVOS (altere exatamente estes):
- src/index.css (alterar)
- docs/arquitetura/debitos.md (alterar)

1) src/index.css — o cartão sólido do tema claro (`.glassmorphism`) voltou com fundo e borda diferentes do aprovado na D17 e sem a sombra leve. Substitua este bloco:

:root.light .glassmorphism {
  background-color: var(--ug-surface-solid);
  border-color: rgba(35, 29, 22, 0.08);
}

por este, exatamente:

:root.light .glassmorphism {
  box-shadow: 0 1px 3px rgba(35, 29, 22, 0.06);
}

O fundo e a borda vêm das regras `.glassmorphism` gerais logo acima (`var(--ug-surface)` e `var(--ug-line)`); não mexa nelas nem nos tokens `--ug-*`.

2) docs/arquitetura/debitos.md — na tabela, substitua a linha inteira que começa com "| B30 |" por esta, exatamente (uma linha só):

| B30 | `server/domain/payment/services/saleClaimService.ts` e `server/interfaces/http/saleClaims/`: o reembolso decidido numa reclamação não muda o status do pedido de ingresso nem da reserva; e a abertura de reclamação não tem rate limit (o app ainda não tem rate limit com armazenamento compartilhado) | §11.8 (o comprador vê o estado real da compra) e §7.4 (rate limit em rotas de pagamento) | baixo — uma reclamação por venda e só do próprio comprador; desde o 18.4f.1 a carteira e Minhas reservas mostram o status da reclamação ao lado do status da compra | atualizar o status do pedido e da reserva no reembolso da reclamação; rate limit junto com o das outras rotas de pagamento |

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros) e `npm run build`;
- abra o app no tema claro: os cartões (por exemplo Configurações › Compras e Minhas reservas) têm a sombra leve de antes e a mesma borda das outras listas.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
