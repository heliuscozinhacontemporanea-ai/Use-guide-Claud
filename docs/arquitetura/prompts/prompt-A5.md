# Prompt A5 — AGENTS.md: tema claro e app nativo (S14) + repasse por documento e retenção até o serviço (S15)

> Lote 16, gerado do commit de referência `5573f13` da branch `claude/agents-md-v2` (substitui a versão anterior do A5, `d09bbaf`, que ainda não tinha sido enviada). Aplique sobre o zip de 2026-10-24 (2º), que já tem o lote 15. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt A5 — AGENTS.md §11.1, §11.11 (S14) e §8.1, §8.2, §8.3, §8.7 (S15)

S14 e S15 aprovadas pelo responsável do produto em 2026-10-24.

~~~~text
Este prompt altera o AGENTS.md COM autorização explícita do responsável do produto (S14 e S15, aprovadas em 2026-10-24). Aplique EXATAMENTE o diff abaixo e nada mais. NÃO altere código: a mudança de cobrança descrita no §8 é implementada pelos prompts 18.4a a 18.4f.

O QUE MUDA:
1) §11.1 e nova §11.11 (S14): tokens --ug-* nos dois temas, tema claro sem branco puro (#f3eee4 / #faf6ee), experiência de app nativo.
2) §8.1 (S15): conta Stripe Express por documento (CNPJ); cobrança na plataforma com transferência separada 48 h depois do fim do serviço; reclamação suspende por até 5 dias; taxas por tipo de produto (bookings 15%; ingressos 10% + R$ 3,00 por ingresso ou 12,5% quando o proprietário absorve).
3) §8.2: ingressos e reservas com PaymentIntent na plataforma e transferência depois do serviço.
4) §8.3: Pix só para serviço até 80 dias depois da compra.
5) §8.7: políticas de cancelamento da plataforma, arrependimento de 7 dias até 48 h antes do início, no-show, translado (máx. 5%), cancelamento pelo proprietário com multa de 20%, reagendamento em força maior, disputa.
6) docs/arquitetura/solicitacoes-agents.md: S14 e S15 registradas como aprovadas.

ARQUIVOS (crie, altere ou apague exatamente estes):
- AGENTS.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== AGENTS.md — diff ===
@@ -487,24 +487,25 @@ O Stripe é o **único** provedor de pagamentos. Referências a Mercado Pago no
 
 ### 8.1. Modelo de marketplace
 
-* **Stripe Connect** com contas conectadas **Express** (`controller.stripe_dashboard.type = 'express'`), país `BR`, uma por parceiro (`paymentConnectedAccounts/{partnerId}`).
+* **Stripe Connect** com contas conectadas **Express** (`controller.stripe_dashboard.type = 'express'`), país `BR`, **uma por documento** (CNPJ verificado do estabelecimento; CPF não vende). Um login pode ter várias contas; cada estabelecimento recebe na conta do seu documento (D12, D14).
 * **Onboarding e gestão do parceiro** via Connect embedded components (Account Session gerada no backend).
-* **Tipo de cobrança padrão:** *destination charge* (`transfer_data.destination` + `application_fee_amount`). A plataforma é o *merchant of record*.
+* **Tipo de cobrança padrão:** cobrança na plataforma com **transferência separada** (*separate charges and transfers*). A plataforma é o *merchant of record*. Cada venda gera um repasse pendente, transferido por job à conta do documento **48 h depois do fim do serviço** (janela de reclamação), com `source_transaction` e chave de idempotência. Reclamação aberta suspende o repasse da venda por até 5 dias. É proibido transferir antes do fim do serviço + 48 h.
   * Mudar para `on_behalf_of` (parceiro como merchant of record) é decisão de produto/jurídica (§15) — muda descritor na fatura, taxas, e exige que o parceiro tenha os métodos de pagamento ativos (ex: capability `pix_payments`).
-* **Taxa da plataforma:** calculada **somente no backend**, em centavos, a partir de `USE_GUIDE_PLATFORM_FEE_PERCENT` ou da configuração do plano. NUNCA aceitar valor de taxa ou de preço vindo do cliente.
-* Antes de criar cobrança para um parceiro, DEVE ser verificado `charges_enabled` e `payouts_enabled` da conta conectada (`assertPartnerReadyForPaidEventUseCase`).
+* **Taxa da plataforma:** calculada **somente no backend**, em centavos, por tipo de produto (D14): ofertas do `bookings` 15%; ingressos 10% + taxa de serviço de R$ 3,00 por ingresso paga pelo comprador, ou 12,5% sem taxa de serviço quando o proprietário escolhe absorvê-la. Num reembolso parcial, a taxa incide sobre o valor que o proprietário fica. As tarifas do Stripe são pagas pela plataforma. NUNCA aceitar valor de taxa ou de preço vindo do cliente.
+* Antes de criar cobrança para um estabelecimento, DEVE ser verificado `charges_enabled` e `payouts_enabled` da conta conectada do documento dele, e que a conta não está bloqueada por dívida.
 
 ### 8.2. O que se vende e como
 
 | Produto | Fluxo Stripe |
 |---|---|
-| Ingresso de evento | PaymentIntent (destination charge) vinculado a `ticketOrder` com reserva de estoque |
-| Passeio, aluguel (quadriciclo), translado, entrada de atração privada | PaymentIntent (destination charge) vinculado a `booking` com reserva de disponibilidade (domínio `bookings`, §9.3) |
+| Ingresso de evento | PaymentIntent na plataforma vinculado a `ticketOrder` com reserva de estoque; transferência depois do serviço (§8.1) |
+| Passeio, aluguel (quadriciclo), translado, entrada de atração privada | PaymentIntent na plataforma vinculado a `booking` com reserva de disponibilidade (domínio `bookings`, §9.3); transferência depois do serviço (§8.1) |
 | Plano do parceiro (`monthly`, `semi-annual`, `annual`) | **Stripe Billing (Subscriptions)** no cartão, com renovação automática (decisão D2). Alternativa: pagamento único por Pix, sem renovação, concedendo exatamente a duração do plano |
 
 ### 8.3. Métodos de pagamento
 
 * Usar **dynamic payment methods** (`automatic_payment_methods: { enabled: true }`) e habilitar no Dashboard: cartão e **Pix** (Pix é suportado para contas BR e com Connect; valor mínimo de R$ 0,50; reembolso em até 90 dias; manual capture não é suportado no Pix).
+* Pix só é oferecido quando o serviço acontece até **80 dias** depois da compra, porque o reembolso de Pix só é possível em até 90 dias; para datas mais distantes, só cartão.
 * Pix é assíncrono: o pedido só é confirmado pelo webhook `payment_intent.succeeded`. A UI DEVE mostrar o QR Code/instruções e aguardar o status (tempo real ou polling da API).
 * Pré-autorização (`capture_method: 'manual'`) só para cartão e somente se o produto exigir (ex: caução de aluguel).
 
@@ -533,9 +534,11 @@ O Stripe é o **único** provedor de pagamentos. Referências a Mercado Pago no
 
 ### 8.7. Reembolsos, cancelamentos e disputas
 
-* Política de cancelamento por produto (prazo, % reembolsável) DEVE ser dado do cadastro, exibida antes da compra e aplicada no backend.
-* Cancelamento de evento/passeio pelo organizador → reembolso integral com `refund_application_fee: true` e `reverse_transfer: true`.
-* Disputa → marcar pedido como `disputed`, bloquear check-in/uso e notificar admin.
+* Política de cancelamento por produto DEVE ser uma das opções definidas pela plataforma (D14), escolhida no cadastro, gravada no pedido na compra, exibida antes do pagamento (com o preço total e a taxa de serviço destacada) e aplicada no backend. Depois de publicar, só pode mudar para uma opção mais flexível.
+* Cancelamento pelo cliente → em até 7 dias da compra e até 48 h antes do início, reembolso integral, inclusive a taxa de serviço (CDC art. 49), pedido no próprio app. Fora disso, segue a política gravada no pedido; a taxa de serviço não volta. No-show não tem reembolso. Translado retém no máximo 5% (Código Civil art. 740).
+* Cancelamento pelo proprietário (evento, passeio, aluguel, translado ou entrada) → reembolso integral ao comprador, inclusive a taxa de serviço, feito do saldo da plataforma antes do repasse. Multa de 20% sobre o valor vendido (sem as taxas de serviço), paga pelo proprietário na hora, no cartão ou por Pix, sempre, inclusive em força maior. O reembolso nunca espera a multa; multa não paga em 24 h é descontada dos repasses pendentes e futuros do documento, que fica bloqueado para novas vendas até quitar.
+* Força maior comprovada → a primeira solução oferecida é o reagendamento. Comprador que não aceitar a nova data recebe reembolso integral, sem multa para o proprietário.
+* Disputa → marcar pedido como `disputed`, suspender o repasse, bloquear check-in/uso e notificar admin. Com prova de check-in, a plataforma contesta e absorve se perder; sem prova, o valor vira dívida do documento.
 
 ### 8.8. Testes de pagamento
 
@@ -611,7 +614,7 @@ Passeios, aluguéis, translados e entradas de atrações privadas compartilham o
 
 ### 11.1. Identidade visual
 
-* **Estilo:** Glassmorphism. Tema **dark é o padrão de design**. O código já possui tema `light`/`system` (`ThemeContext`, `AppearanceSettingsView`); todo componente novo DEVE funcionar nos dois temas usando tokens/variáveis CSS, nunca `text-white` fixo em superfície que muda de cor.
+* **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
 * **Accent:** teal (`teal-400`/`teal-500`); emerald = sucesso; cyan = informação.
 * **Tipografia:** Inter (texto/UI) e Outfit (display). Proibida uma terceira fonte.
 * **Superfície elevada:** `GlassCard` (`src/ui/components/GlassCard.tsx`).
@@ -671,6 +674,15 @@ Todo hook assíncrono expõe `data`, `loading` e `error`. Toda tela trata: carre
 
 Proibido texto fixo com aparência de dado real do item. Valores financeiros (preço, taxa, quantidade) DEVEM vir do backend/cadastro, nunca de constante no componente.
 
+### 11.11. Experiência de app nativo
+
+* Modais e diálogos: folha que sobe da borda inferior no celular (com alça e safe area) e cartão central do `sm:` em diante, pelo `Dialog` do design system.
+* Entrada e saída animadas (fade, escala, folha), com saída pelo `data-state` do Radix; duração de 150–300 ms.
+* Retorno ao toque em todo botão (`press`: escala 0,97, sem destaque azul de toque, `touch-action: manipulation`).
+* **Um efeito por propriedade em cada elemento:** não somar `press` a `whileTap`/`whileHover` do `motion` nem a `active:scale-*`; animações usam as propriedades `scale`/`translate`, nunca `transform` quando o elemento já é centralizado por `transform`.
+* Tudo respeita `prefers-reduced-motion` (`motion-reduce:animate-none` e `MotionConfig reducedMotion="user"`).
+* Ao abrir um diálogo o foco vai para o próprio diálogo, sem anel de foco num botão que a pessoa não tocou.
+
 ---
 
 ## 12. Internacionalização (i18n) e Localização

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -4,6 +4,8 @@
 > Resposta de 2026-10-10: aprovadas S1, S2, S3, S4, S5, S7 e S8 (aplicadas pelo prompt A1). S6 não aprovada.
 > Resposta de 2026-10-12: aprovada S9 (aplicada pelo prompt A2).
 > Resposta de 2026-10-19: aprovadas S10, S11 e S12 (as três no prompt A3).
+> Resposta de 2026-10-24: aprovada S14 (aplicada pelo prompt A5).
+> Resposta de 2026-10-24: aprovada S15 (aplicada pelo prompt A5, junto com a S14).
 
 | # | Seção | Motivo | Status |
 |---|---|---|---|
@@ -20,6 +22,8 @@
 | S11 | §12.6 | Decisão D5 aprovada: Google Cloud Translation, sem tradução à mão, edição no idioma escolhido | ✅ Aprovada em 2026-10-19 (prompt A3) |
 | S12 | §12.1 e §12.7 | Decisão D10: idioma do navegador na primeira visita, persistência só por escolha explícita | ✅ Aprovada em 2026-10-19 (prompt A3) |
 | S13 | §7.7 | O débito de `partnerDocumentKeys` foi resolvido no Prompt 18.3.0b | ✅ Aprovada em 2026-10-19 (prompt A4) |
+| S14 | §11.1 e §11 (nova subseção) | Tema claro sem branco puro e regras de experiência de app nativo | ✅ Aprovada em 2026-10-24 (prompt A5) |
+| S15 | §8.1 e §8.7 | D14: conta por documento, cobrança na plataforma com transferência depois do serviço, taxas por tipo, multa e reagendamento | ✅ Aprovada em 2026-10-24 (prompt A5, junto com a S14) |
 
 ---
 
@@ -162,3 +166,32 @@
 
 **Texto proposto:**
 > * IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII.
+
+## S14 — §11.1 e nova §11.11: tema claro sem branco puro e experiência de app nativo
+
+**Por quê:** pedido de 2026-10-24. O app é web, mas deve se comportar como app nativo, e o claro em branco puro cansa a vista. Hoje o §11.1 só diz que o componente funciona nos dois temas; não fixa a cor do claro nem como transições e toque devem se comportar, e efeitos somados (escala do toque + `whileTap` + transform de centralização) já causaram conflito.
+
+**Texto atual (§11.1, 1º item):**
+> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**. O código já possui tema `light`/`system` (`ThemeContext`, `AppearanceSettingsView`); todo componente novo DEVE funcionar nos dois temas usando tokens/variáveis CSS, nunca `text-white` fixo em superfície que muda de cor.
+
+**Texto proposto (§11.1, 1º item):**
+> * **Estilo:** Glassmorphism. Tema **dark é o padrão de design**; em Configurações a pessoa escolhe claro, escuro ou sistema (`ThemeContext`, `AppearanceSettingsView`). Todo componente novo ou tocado DEVE funcionar nos dois temas com os tokens `--ug-*` de `src/index.css` (`bg-app`, `text-ink`, `bg-surface`, `border-line`, `text-warn`, `text-danger`…), nunca `text-white` fixo em superfície que muda de cor. O tema claro NUNCA usa branco puro: fundo off-white bege (`#f3eee4`) e superfícies `#faf6ee`. O tema é aplicado antes da primeira pintura (sem piscar) e o `theme-color` acompanha o tema.
+
+**Texto proposto (nova §11.11):**
+> ### 11.11. Experiência de app nativo
+>
+> * Modais e diálogos: folha que sobe da borda inferior no celular (com alça e safe area) e cartão central do `sm:` em diante, pelo `Dialog` do design system.
+> * Entrada e saída animadas (fade, escala, folha), com saída pelo `data-state` do Radix; duração de 150–300 ms.
+> * Retorno ao toque em todo botão (`press`: escala 0,97, sem destaque azul de toque, `touch-action: manipulation`).
+> * **Um efeito por propriedade em cada elemento:** não somar `press` a `whileTap`/`whileHover` do `motion` nem a `active:scale-*`; animações usam as propriedades `scale`/`translate`, nunca `transform` quando o elemento já é centralizado por `transform`.
+> * Tudo respeita `prefers-reduced-motion` (`motion-reduce:animate-none` e `MotionConfig reducedMotion="user"`).
+> * Ao abrir um diálogo o foco vai para o próprio diálogo, sem anel de foco num botão que a pessoa não tocou.
+
+## S15 — §8.1, §8.2, §8.3 e §8.7: repasse por documento e retenção até o serviço (D14)
+
+**Por quê:** decisão D14. No Brasil o repasse da conta conectada ao banco é sempre automático e diário, então a *destination charge* entrega o dinheiro ao proprietário antes do serviço (no Pix, em 2 dias úteis). Para proteger o consumidor e o proprietário, a cobrança fica na plataforma e a transferência sai 48 h depois do fim do serviço, para a conta do documento do estabelecimento. O texto final é o do AGENTS.md aplicado pelo prompt A5 (junto com a S14):
+
+* **§8.1:** conta Express por documento (CNPJ); cobrança na plataforma com transferência separada 48 h depois do fim do serviço; reclamação suspende por até 5 dias; taxas por tipo de produto (15%; 10% + R$ 3,00 por ingresso ou 12,5% absorvida), sobre o valor que o proprietário fica num reembolso parcial; checagem da conta do documento e do bloqueio por dívida antes de vender.
+* **§8.2:** ingressos e reservas com PaymentIntent na plataforma e transferência depois do serviço.
+* **§8.3:** Pix só para serviço até 80 dias depois da compra (reembolso de Pix só em até 90 dias).
+* **§8.7:** políticas de cancelamento da plataforma, gravadas no pedido e só mais flexíveis depois de publicar; arrependimento em 7 dias até 48 h antes do início; no-show sem reembolso; translado com retenção máxima de 5%; cancelamento pelo proprietário com reembolso integral, multa de 20%, compensação em 24 h e bloqueio; reagendamento em força maior; disputa com suspensão do repasse.

VERIFICAÇÃO: `git diff` deve mostrar só esses 2 arquivos. Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
