# Desenho do 18.4 — Repasse por documento e retenção até o serviço (D12/P8, D14, S15)

> Status: **proposta, aguardando aprovação** (AGENTS.md §15). Nenhum código antes da aprovação.

## 1. Objetivo

* Cada CNPJ verificado recebe na **própria conta Stripe Express** (CPF não vende, D12/P3); cada estabelecimento vende pela conta do seu documento (resolve B22).
* O dinheiro fica no saldo do Use Guide e só é transferido **48 h depois do fim do serviço**, se não houver reclamação.
* Taxas por tipo de produto, políticas de cancelamento da plataforma, direito de arrependimento, multa por cancelamento de evento e compensação de dívidas.

## 2. Modelo de dados (todas as coleções novas: `allow read, write: if false`, leitura só pela API)

| Coleção | Dono (domínio) | Campos principais | Classe (§7.6) |
|---|---|---|---|
| `paymentAccounts/{accountKey}` | `payment` | `accountKey` = índice cego do documento (HMAC, já existe no D12), `ownerUid`, `stripeAccountId`, `status`, `chargesEnabled`, `payoutsEnabled`, `requirementsDue[]`, `blockedReason` (`debt` \| null), datas | Interna |
| `payoutEntries/{entryId}` | `payment` | `referenceType`/`referenceId` (pedido de ingresso ou reserva), `accountKey`, `paymentIntentId`, `chargeId`, `grossMinor`, `buyerServiceFeeMinor`, `platformFeeMinor`, `partnerAmountMinor`, `serviceEndsAt`, `releaseAt` (= fim + 48 h), `status` (`pending` → `released` \| `on_hold` \| `refunded` \| `partially_refunded`), `holdReason`, `holdUntil`, `transferId`, `offsetDebtIds[]` | Interna (financeiro) |
| `accountDebts/{debtId}` | `payment` | `accountKey`, `reason` (`event_cancellation_penalty` \| `dispute_without_proof`), `referenceId`, `amountMinor`, `paidMinor`, `status` (`open` → `paid` \| `offset`), `dueAt` (24 h), `paymentIntentId` | Interna (financeiro) |
| `saleClaims/{claimId}` | `payment` | `referenceType`/`referenceId`, `buyerUid`, `reason` (lista fechada), `openedAt`, `decideBy` (+5 dias), `status` (`open` → `refunded` \| `released` \| `expired`), `decidedBy` | Confidencial (texto livre do comprador fica fora do log) |

Sai `paymentConnectedAccounts/{partnerId}` (sem migração, §2.2.8). Nenhum ID contém PII: `accountKey` é HMAC (§7.7).

**Campos novos em cadastros (backend grava, cliente lê pela projeção pública só o que é público):**

* Evento: `cancellationPolicy` = `flexible` \| `moderate` \| `strict` \| `none`; `serviceFeeMode` = `pass_to_buyer` \| `absorb`.
* Oferta do `bookings`: `cancellationPolicy` = `flexible` (padrão) \| `moderate` \| `strict` \| `none`; translado só `transfer_flexible` \| `transfer_standard`. Substitui o `CancellationPolicy { freeCancellationHoursBefore, refundPercentAfterDeadline }` atual.
* Pedido de ingresso e reserva gravam a política e a taxa vigentes na compra (já existe o snapshot; passa a guardar o preset).

## 3. Regras puras (sem I/O, testáveis, exportadas pelo `index.ts`)

* `calculatePlatformFees({ productType, unitPriceMinor, quantity, serviceFeeMode })` → `{ buyerServiceFeeMinor, platformFeeMinor, partnerAmountMinor }`.
  * `bookings`: 15% do preço.
  * ingresso `pass_to_buyer`: 10% do preço + R$ 3,00 por ingresso pago pelo comprador.
  * ingresso `absorb`: 12,5% do preço, sem taxa ao comprador.
  * Percentuais em **pontos-base** (1500, 1000, 1250) e taxa em centavos (300), vindos de variáveis de ambiente documentadas no `.env.example`; arredondamento para baixo a favor do proprietário. Substitui `USE_GUIDE_PLATFORM_FEE_PERCENT`.
* `calculateBuyerRefund({ preset, productKind, purchasedAt, startsAt, now, paidMinor, serviceFeeMinor })`:
  1. até 7 dias da compra **e** até 48 h antes do início → 100% + taxa de serviço (arrependimento);
  2. senão, a tabela do preset (D14); taxa de serviço não volta;
  3. depois do início ou no-show → 0.
* `canChangePolicy(from, to)` → só para mais flexível depois de publicar.
* `computeReleaseAt(serviceEndsAt)` → fim + 48 h; `computeClaimDeadline(openedAt)` → + 5 dias.

## 4. Fluxos

### 4.1 Conta por documento
1. A verificação do estabelecimento é aprovada (D12). `partners` publica o `accountKey` do documento da verificação aprovada (UseCase público `getListingPayoutKeyUseCase`).
2. O parceiro abre "Recebimentos": para cada documento verificado aparece um cartão com status e o botão "Concluir cadastro no Stripe" (Connect embedded, Account Session por `accountKey`).
3. `ensurePaymentAccountForDocumentApplicationUseCase` cria a conta Express se não existir para aquele `accountKey`. `account.updated` sincroniza o status da conta certa.
4. Antes de vender, `assertListingReadyToSellApplicationUseCase` confere verificação aprovada + conta do documento com `charges_enabled` e `payouts_enabled` + conta não bloqueada.

### 4.2 Compra
1. PaymentIntent na plataforma **sem** `transfer_data`, com `transfer_group` = ID do pedido, `metadata` só com IDs (`referenceType`, `referenceId`, `accountKey`), valor = preço + taxa de serviço (se houver), idempotência `pi_<referenceId>`.
2. Checkout mostra preço, taxa de serviço destacada, total e a política de cancelamento antes de pagar (STJ, EDcl no REsp 1.737.428).
3. `payment_intent.succeeded` (webhook, duas fases) → confirma o pedido e cria o `payoutEntry` `pending` com `releaseAt`.

### 4.3 Liberação (job)
* `POST /internal/payouts/release` (Cloud Scheduler a cada hora, `X-Internal-Job-Key` até migrar para OIDC).
* Para cada entrada `pending` com `releaseAt <= agora`, sem reclamação aberta:
  1. desconta dívidas abertas do mesmo `accountKey` (marca `offsetDebtIds`);
  2. cria a transferência (`destination` = conta do documento, `source_transaction` = `chargeId`, `transfer_group`, idempotência `tr_<entryId>`);
  3. marca `released`.
* Conta sem `payouts_enabled` ou bloqueada: a entrada espera, e o painel avisa o proprietário.
* Processa em lotes com `limit()`; o job é idempotente e pode rodar de novo sem duplicar.

### 4.4 Reembolso e cancelamento pelo comprador
* Antes da liberação: reembolso do saldo da plataforma (sem `reverse_transfer`), valor de `calculateBuyerRefund`; a entrada vira `refunded` ou tem `partnerAmountMinor` recalculado (`partially_refunded`).
* Depois da liberação (caso raro, ex. disputa tardia): `transfer reversal` ou dívida na conta.

### 4.5 Reclamação
* O comprador abre em "Minhas compras" até 48 h depois do fim do serviço (motivo de lista fechada). A entrada vira `on_hold` com `holdUntil` = + 5 dias.
* O admin decide: reembolso (total/parcial) ou liberação. Sem decisão em 5 dias, o job libera.

### 4.6 Cancelamento do evento pelo organizador
1. Pedido de cancelamento: vendas pausadas na hora; se houver força maior comprovada, a tela oferece primeiro o reagendamento.
2. Ao confirmar: cria a dívida de 20% sobre o valor dos ingressos vendidos (sem taxas de serviço) e abre o pagamento (cartão ou Pix, PaymentIntent na plataforma, sem transferência).
3. Reembolso integral aos compradores, inclusive a taxa de serviço, **sem esperar a multa**; as entradas viram `refunded`.
4. Job após 24 h: dívida aberta → desconta dos repasses pendentes do documento e marca a conta `blockedReason: debt` até quitar.
* Reagendamento: comprador que não aceitar a nova data recebe reembolso integral, sem multa.
* Cancelamento silencioso: reclamações confirmam que não aconteceu → mesmo tratamento.

### 4.7 Disputa (*chargeback*)
* `charge.dispute.created` → entrada `on_hold` (se ainda não liberada).
* Com check-in registrado: a plataforma contesta com a prova e absorve se perder.
* Sem check-in: se perder, o valor vira dívida `dispute_without_proof` do documento.

## 5. Arquitetura (DAG, §5.4)

* `payment` continua folha: conhece `accountKey`, entradas, dívidas e reclamações, mas não sabe o que é ingresso, reserva ou parceiro.
* Orquestração em `server/application/usecases/payouts/` (compra, liberação, cancelamento de evento, reclamação, disputa), chamando os UseCases públicos de `payment`, `partners`, `ticketing`, `bookings` e `events`.
* Rotas: `server/interfaces/http/payouts/` (parceiro: contas, extrato, dívidas; comprador: cancelar, reclamar; admin: reclamações, dívidas) e `/internal/payouts/*`.
* Novo port `PayoutTransferPort` (`createTransfer`, `reverseTransfer`) no adapter Stripe; `PaymentGatewayPort.createPaymentIntent` perde `connectedAccountId`/`applicationFeeMinor` e ganha `transferGroup`.

## 6. Telas

* **Parceiro — Recebimentos:** cartões por documento (mascarado), status no Stripe, botão de cadastro; extrato por venda (pendente, retido por reclamação, liberado, data prevista); dívidas com botão de pagar.
* **Editor de evento e de oferta:** seletor da política (opções da plataforma com o resumo de cada uma; depois de publicar, só as mais flexíveis ficam ativas); no evento, "Taxa de serviço: repassar ao comprador / absorver (taxa vira 12,5%)".
* **Comprador:** checkout com taxa destacada e política; "Minhas compras" com "Cancelar" (mostra quanto volta antes de confirmar) e "Relatar problema" (até 48 h depois do serviço).
* **Admin:** fila de reclamações com prazo, dívidas, contas bloqueadas.
* Tudo nos dois temas, com folha inferior no celular (§11.1, §11.11) e nos 3 idiomas.

## 7. Divisão em prompts (cada um ≤ 150 KB e compila sozinho)

| Prompt | Conteúdo |
|---|---|
| 18.4a | Contas por documento (backend): `paymentAccounts`, Account Session por documento, `account.updated`, checagem antes de vender; sai a trava B22 |
| 18.4b | Taxas por produto, presets de cancelamento e arrependimento (regras puras, schemas, campos de evento/oferta, snapshot no pedido) |
| 18.4c + A6 | Cobrança na plataforma, `payoutEntries`, job de liberação, reembolso antes da liberação, disputas; A6 aplica a S15 no AGENTS.md |
| 18.4d | Reclamações, cancelamento de evento com multa, dívidas, compensação e bloqueio |
| 18.4e | Telas do parceiro (recebimentos, extrato, dívidas, política, taxa de serviço) |
| 18.4f | Telas do comprador e do admin |

## 8. Pontos para aprovação

1. **Mesmo documento em dois logins** (titular e representante, D12): a conta pertence ao **titular** que verificou primeiro; cadastros de um representante com o mesmo documento recebem na conta do titular só depois que o titular aprovar o vínculo no painel. Alternativa: bloquear e o admin resolve.
2. **Taxas em variáveis de ambiente** em pontos-base (`BOOKINGS_PLATFORM_FEE_BPS=1500`, `TICKETS_PLATFORM_FEE_BPS=1000`, `TICKETS_ABSORBED_FEE_BPS=1250`, `TICKET_SERVICE_FEE_MINOR=300`), sem valor padrão no código: falta de configuração dá `503` na venda.
3. **Job de liberação a cada hora** (Cloud Scheduler).
4. **Divisão em 6 prompts** acima.
