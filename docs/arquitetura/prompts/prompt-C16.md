# Prompt C16 — D14 no registro de decisões

> Lote 17, correção do lote 16, gerado do commit de referência `48a75ac` da branch `claude/agents-md-v2`. Aplique sobre o zip de 2026-10-25. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt C16 — D14 no registro de decisões

Só documentação: o texto da D14 entra no `docs/arquitetura/decisoes.md`.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. Este prompt só mexe em documentação; nenhum código muda.

CORREÇÃO DO LOTE 16: a decisão D14 (repasse por documento, retenção até o serviço, taxas e cancelamentos) foi aprovada e o código do 18.4a e do 18.4b já a segue, mas o texto dela não chegou ao docs/arquitetura/decisoes.md. Sem ela, o arquivo não explica de onde vêm as taxas, as políticas e o arrependimento (AGENTS.md §15: decisões aprovadas ficam nesse arquivo).

ARQUIVOS (altere exatamente este):
- docs/arquitetura/decisoes.md (alterar)

1) Na tabela "## Decisões", insira esta linha logo depois da linha da D13 e antes da linha da D15, sem mudar as outras:

| D14 | Repasse por documento, retenção até o serviço, taxas e cancelamentos | ✅ Aprovada | 2026-10-24 |

2) Insira a seção abaixo logo antes da linha que começa com "## D15 —", com uma linha em branco antes e outra depois, exatamente como está:

## D14 — Repasse por documento, retenção até o serviço, taxas e cancelamentos (2026-10-24)

Objetivo: proteger os dois lados, o consumidor (o dinheiro só sai depois do serviço) e o proprietário (repasse automático, com data certa e regras fixas). Pesquisa de mercado (Airbnb, Sympla, GetYourGuide, Viator, Booking.com) e regras do Stripe no Brasil registradas na conversa de 2026-10-24.

* **Contas de recebimento (1A, confirma D12/P8):** um login por pessoa e uma conta Stripe Express por documento. Como só CNPJ vende (D12/P3), na prática é uma conta por CNPJ; estabelecimento com CPF não tem conta de recebimento. Cada estabelecimento recebe na conta do seu documento. Resolve o débito B22.
* **Retenção até o serviço (2B):** a cobrança é feita na plataforma, sem destino (*separate charges and transfers*), e o Use Guide continua *merchant of record* (D1). O backend registra um repasse pendente por venda e um job transfere à conta do documento na data de liberação, com `source_transaction` e chave de idempotência. Motivo: no Brasil o repasse da conta conectada ao banco é sempre automático e diário, então não dá para segurar o dinheiro na conta do proprietário. Muda o AGENTS.md §8.1 (proposta S15).
* **Data de liberação (3):** fim do serviço (evento, passeio, aluguel, translado ou entrada) + **48 h** de janela de reclamação. O dinheiro continua sujeito ao prazo do meio de pagamento no Stripe (cartão 30 dias corridos, Pix 2 dias úteis); vale a data mais tardia.
* **Reclamação (4):** suspende o repasse daquela venda; a análise tem prazo máximo de **5 dias**. Sem decisão nesse prazo, o repasse é liberado.
* **Estorno fraudulento (5A):** com prova de check-in, a plataforma contesta e absorve o prejuízo. Sem prova, o valor é descontado de repasses futuros do documento.
* **No-show (6A):** cliente que não aparece não tem reembolso e o proprietário recebe normalmente.
* **Taxas (7 e 8):**
  * **Ofertas vendáveis do `bookings`** (passeio, aluguel, translado, entrada de atração privada): taxa da plataforma de **15%**, descontada do proprietário. O cliente paga o preço anunciado e o Use Guide paga as tarifas do Stripe.
  * **Ingressos de eventos:** taxa da plataforma de **10%**, descontada do proprietário, mais **taxa de serviço de R$ 3,00 por ingresso**, paga pelo comprador. No cadastro do evento, o proprietário escolhe **repassar** a taxa ao comprador ou **absorver**; se absorver, o comprador não paga os R$ 3,00 e a taxa da plataforma passa a **12,5%**.
  * Valores calculados só no backend, em centavos (AGENTS.md §8.1).
* **Cancelamento pelo cliente (9B, revisado):** ver "Direito de arrependimento" abaixo.
* **Cancelamento do evento pelo organizador:**
  * reembolso **integral** ao comprador, inclusive a taxa de serviço;
  * **multa de 20%** sobre o valor dos ingressos vendidos (sem as taxas de serviço), paga pelo proprietário à plataforma, **sempre**, inclusive em força maior;
  * com comprovação de força maior, a primeira solução oferecida pela plataforma é o **reagendamento** do evento;
  * a multa é cobrada **na hora, no cartão ou por Pix**; o reembolso dos compradores **não espera** o pagamento da multa (ver "Multa não paga" abaixo).
* **Adiantamento de recebíveis (10A):** fora do 18.4. Depende de convite do Stripe e de contrato com gestor de fundos parceiro.
* **Em aberto (decidir antes do código):**
  1. ~~Reagendamento~~ — decidido em 2026-10-24: o comprador que não aceitar a nova data recebe reembolso integral (ingresso + taxa de serviço) e o proprietário **não** paga multa sobre esses ingressos, porque reagendou em vez de cancelar.
  2. ~~Multa não paga~~ — decidido em 2026-10-24: o pedido de cancelamento pausa as vendas na hora e o proprietário paga a multa no cartão ou Pix; o reembolso dos compradores sai assim que o proprietário confirma o cancelamento, sem esperar a multa; se a multa não for paga em **24 h**, ela é descontada dos repasses pendentes e futuros do documento, que fica bloqueado para novas vendas até quitar. Cancelamento silencioso (o evento não acontece e as reclamações confirmam) tem o mesmo tratamento. Prazo de 24 h, e não 48 h, para não se confundir com a janela de reclamação de 48 h antes do repasse.
* **Direito de arrependimento (revisão do item 9, 2026-10-24):** desistência em até **7 dias da compra** e até **48 h antes do início** do serviço tem reembolso integral, inclusive a taxa de serviço (CDC art. 49; Decreto 7.962/2013; multa do Procon-MG à Sympla em fev/2026). A desistência é feita no app, pelo mesmo canal da compra. Fora disso, vale a política escolhida pelo proprietário, e a taxa de serviço não volta.
* **Políticas de cancelamento (opções da plataforma; o proprietário escolhe uma):**
  * **Ingressos de eventos:** Flexível (integral até 24 h antes do início) · Moderada (integral até 7 dias antes) · Rígida (integral até 30 dias antes) · Sem reembolso (só o arrependimento legal). Em todas, **no-show** (não comparecer) não tem reembolso.
  * **Passeios, aluguéis e entradas de atrações privadas:** **Flexível (padrão)** — integral até 24 h antes · Moderada — integral até 5 dias antes, 50% até 24 h antes · Rígida — 50% até 7 dias antes · Sem reembolso (só o arrependimento legal). No-show não tem reembolso.
  * **Translados (Código Civil art. 740, retenção máxima de 5%):** Flexível — integral até 24 h antes · Padrão translado — 95% até 24 h antes; com menos de 24 h ou no-show, sem reembolso.
  * **Regras:** o pedido grava a política vigente na compra, e é ela que vale para aquela compra; depois de publicar, o proprietário só pode mudar para uma opção mais flexível; a política aparece antes do pagamento, com o preço total e a taxa de serviço destacada (STJ, EDcl no REsp 1.737.428); o reembolso é calculado só no backend, em centavos.
* **Lacunas fechadas (2026-10-24):**
  * **Pix e o limite de 90 dias do reembolso:** Pix só é oferecido quando o serviço acontece até 80 dias depois da compra; para datas mais distantes, só cartão.
  * **Reembolso parcial:** a taxa da plataforma incide sobre o valor que o proprietário fica.
  * **Cancelamento pelo proprietário de passeio, aluguel, translado ou entrada:** mesmas regras do evento — reembolso integral ao comprador, multa de 20% sobre o valor vendido, reagendamento primeiro em força maior (inclusive vento e mar), sem multa sobre quem não aceitar a nova data.
* **Desenho do 18.4 aprovado (2026-10-24, `06-repasse-design.md`):** a conta do CNPJ é do titular, e o cadastro de um representante com o mesmo CNPJ só recebe nela depois que o titular aprova o vínculo; taxas em pontos-base por variável de ambiente, sem valor padrão no código; job de liberação de hora em hora; 6 prompts (18.4a a 18.4f). A S15 entra no AGENTS.md pelo prompt A5, junto com a S14.
* **Validação jurídica antes das chaves `sk_live_` (junto com a condição da D1):** termos do parceiro (multa de 20%, inclusive em força maior — Código Civil art. 393 —, compensação com repasses, bloqueio), limite de 48 h do arrependimento, políticas de cancelamento e a guarda do dinheiro no saldo do Stripe até o serviço (regulação do Banco Central).
* **Prompts:** 18.4 (contas por documento, retenção e liberação) e seguintes; desenho apresentado para aprovação antes do código.

VERIFICAÇÃO (obrigatória):
- docs/arquitetura/decisoes.md tem as linhas D13, D14 e D15 na tabela, nessa ordem, e as seções "## D13", "## D14" e "## D15", nessa ordem;
- nenhum outro arquivo mudou.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
