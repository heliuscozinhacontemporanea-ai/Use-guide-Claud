# Registro de Decisões de Arquitetura (ADR)

> Decisões aprovadas pelo responsável do produto. Todo agente DEVE segui-las (AGENTS.md §15). Mudar uma decisão aprovada exige nova aprovação e uma nova entrada aqui.

## Liberação para usuários

* **Data de liberação: ainda não definida.** Até essa data vale o AGENTS.md §2.2 item 8 (sem código legado ou de transição). Registre aqui a data quando o app for liberado.

## Decisões

| ID | Tema | Status | Data |
|---|---|---|---|
| D1 | Responsável legal pela venda (merchant of record) | ✅ Aprovada (condicionada à validação fiscal) | 2026-10-09 |
| D2 | Planos dos parceiros com Stripe Billing | ✅ Aprovada | 2026-10-09 |
| D3 | Domínio `bookings` em fases | ✅ Aprovada | 2026-10-09 |
| D4 | Upload de imagens via backend para Firebase Storage | ✅ Aprovada | 2026-10-09 |
| D5 | Tradução automática do conteúdo (Google Cloud Translation) | ✅ Aprovada | 2026-10-19 |
| D6 | URLs por idioma | ✅ Aprovada | 2026-10-09 |
| D7 | SEO em produção via Cloud Run | ✅ Aprovada | 2026-10-09 |
| D8 | Painel admin: selo, suspensão e planos | ✅ Aprovada | 2026-10-12 |
| D9 | Parceiros com vários estabelecimentos e novas categorias | ✅ Aprovada | 2026-10-12 |
| D10 | Idioma na primeira visita (navegador) | ✅ Aprovada | 2026-10-19 |
| D11 | Plano "Use Guide Verificado", selo e destaque por estabelecimento | ✅ Aprovada | 2026-10-19 |
| D12 | Verificação e documento por estabelecimento; venda só com verificação | ✅ Aprovada | 2026-10-19 |
| D13 | Troca de período do plano na próxima renovação | ✅ Aprovada | 2026-10-24 |
| D14 | Repasse por documento, retenção até o serviço, taxas e cancelamentos | ✅ Aprovada | 2026-10-24 |
| D15 | Termos com aceite registrado e idioma do editor de conteúdo | ✅ Aprovada | 2026-10-25 |

---

## D1 — Responsável legal pela venda

* **Decisão:** a plataforma continua como *merchant of record* (destination charge com `transfer_data.destination` + `application_fee_amount`), como já está no código.
* **Condição bloqueante:** antes de ativar chaves `sk_live_`, um contador DEVE confirmar o tratamento fiscal (tributação só sobre a taxa de intermediação ou sobre o valor total).
* **Plano B:** se o contador indicar o parceiro como vendedor, adicionar `on_behalf_of` na criação do PaymentIntent e solicitar a capability `pix_payments` nas contas conectadas. Nenhuma outra mudança de arquitetura.
* **Prompts:** nenhum (sem mudança de código).

## D2 — Planos com Stripe Billing

* **Decisão:** planos `monthly`, `semi-annual` e `annual` viram assinaturas do Stripe Billing, cobradas no cartão com renovação automática.
* **Pix:** Pix Automático não está disponível para contas Stripe do Brasil. O pagamento avulso por Pix continua disponível como "pagamento único, sem renovação automática", corrigido para conceder a duração certa do plano.
* **Preços:** um Product "Use Guide — Plano Parceiro" e um Price por plano e valor, identificado por `lookup_key` (`plan_<planId>_<amountMinor>`). Mudança de valor no painel admin gera novo Price na próxima contratação; assinaturas existentes mantêm o preço contratado.
* **Fonte da verdade:** webhooks `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`.
* **Prompts:** 6 (correção da duração do plano) e 9 (Billing).

## D3 — Domínio `bookings`

* **Decisão:** um domínio novo `bookings`, com modelo genérico e campo `kind`. O desenho completo está em `04-bookings-design.md`.
* **Fases:** 1) `tour` e `private_entry` (horário com capacidade) → 2) `rental` (período, termo, caução cobrada no dia da retirada) → 3) `transfer` (origem/destino, passageiros, bagagem).
* **Prompts:** 11 a 14 (fase 1).

## D4 — Upload de imagens

* **Decisão:** upload pelo backend (`POST /api/media/images`) para o Firebase Storage. O Cloudinary é removido.
* **Processamento:** validação por *magic bytes*, rotação pela orientação EXIF, redimensionamento (máx. 2048 px), conversão para WebP e remoção de todos os metadados (incluindo GPS), com a biblioteca `sharp` (dependência aprovada).
* **Prompt:** 7.

## D5 — Tradução automática do conteúdo (2026-10-19)

* **Fornecedor:** Google Cloud Translation, só no backend, atrás de um port (domínio `translation`, folha). Crédito mensal sem custo de 500 mil caracteres; acima disso, US$ 20 por milhão. Conta de serviço do Cloud Run com `roles/cloudtranslate.user` (sem chave nova).
* **Sem tradução feita à mão** e sem revisão pelo parceiro, por enquanto. Pode entrar quando o app crescer (campo `origin` opcional nas traduções, sem quebrar os dados).
* **Identificador = hash do texto original** (SHA-256). Quando o parceiro altera um campo, o job traduz só esse campo e grava por cima da versão anterior. Texto igual nunca é traduzido duas vezes.
* **Edição no idioma escolhido (opção A):** o editor mostra os campos no idioma de Configurações. Salvar um campo em outro idioma faz dele o novo original daquele campo, e as outras versões são traduzidas de novo a partir dele, com aviso antes de salvar. Nome, telefone, endereço, preço, horários e opções fixas são iguais em todos os idiomas.
* **Tradução em segundo plano:** o salvamento grava o original e um evento na outbox (AGENTS.md §5.6); o job traduz depois. Enquanto não termina, a interface mostra o original com aviso.
* **Avaliações:** ficam no idioma original. "Ver tradução" sob demanda, **também para visitante sem conta**, com limite de requisições por IP e uid, App Check, só os idiomas suportados e tamanho máximo. O resultado fica num cache indexado por hash e idioma e é reaproveitado para todos os leitores. Excluir avaliação ou conta apaga as entradas desse texto no cache.
* **Política de cancelamento e termos:** tradução automática com aviso e link para o original, que é o texto que vale.
* **Texto fixo da interface** (botões, menus, erros, e-mails) não usa a API: continua nos arquivos de tradução.
* **Depende de:** S11 (novo texto do AGENTS.md §12.6).

## D6 — URLs por idioma

* **Decisão:** pastas no mesmo domínio, português na raiz, slugs traduzidos:

| Chave da rota | pt-BR | en | fr |
|---|---|---|---|
| `explore` | `/` | `/en` | `/fr` |
| `events` | `/eventos` | `/en/events` | `/fr/evenements` |
| `tours` | `/passeios` | `/en/tours` | `/fr/excursions` |
| `stays` | `/pousadas` | `/en/stays` | `/fr/hebergements` |
| `restaurants` | `/restaurantes` | `/en/restaurants` | `/fr/restaurants` |
| `attractions` | `/pontos` | `/en/attractions` | `/fr/attractions` |
| `guide` | `/info` | `/en/travel-guide` | `/fr/guide-pratique` |

* Rotas não indexáveis (`/admin`, `/reset-password`, `/checkout/result`) não ganham versão por idioma.
* Favoritos, "Minhas reservas", ingressos, conta e configurações **não são páginas**: abrem dentro do menu lateral, com a sub-tela na URL (`?menu=favorites`, `?menu=bookings`, `?menu=tickets`…). Ajuste pedido pelo responsável do produto em 2026-10-12 (Prompt 16); as rotas `/favoritos` e `/reservas` foram removidas.
* O idioma da URL tem prioridade sobre o salvo no navegador.
* **Prompt:** 10.

## D7 — SEO em produção

* **Decisão:** o HTML das rotas de conteúdo passa pelo Cloud Run (`serverSeoService`) com cache na CDN do Hosting (`Cache-Control: public, max-age=0, s-maxage=300`). Arquivos estáticos continuam servidos direto pelo Hosting. `min-instances=1` no Cloud Run.
* `sitemap.xml` gerado dinamicamente pelo backend a partir do catálogo publicado.
* **Prompt:** 8.

## D8 — Painel admin: selo, suspensão e planos (2026-10-12)

* **Selo pelo admin:** o admin só concede ou retira o selo; o servidor decide tipo e validade. Com plano pago ou trial em vigor, o plano nunca é alterado: retirar o selo marca `isVerificationSuspended`, conceder desfaz a suspensão. Sem plano, o admin concede o selo `verificationType: 'admin'` por um ano. Renovação de plano mantém uma suspensão feita pelo admin.
* **Suspender:** grava `status: 'suspended'` e bloqueia o parceiro: perde o papel de parceiro no servidor (itens e eventos) e o portal mostra "conta suspensa". "Reativar" volta para `active`; "Aprovar" leva `pending` → `active`.
* **Preço dos planos em centavos inteiros** (sem migração; dados de teste recriados).
* **Oferta de reserva só é publicada com o Stripe do parceiro pronto** (bloqueio no servidor e botão desabilitado com explicação).
* **Editor único** de item e evento para parceiro e admin (Prompts 18–19).
* **Prompt:** 17, 17.1, 17.2, 18, 19.

## D9 — Parceiros com vários estabelecimentos e novas categorias (2026-10-12)

* **Três níveis**, como Airbnb, Google e TripAdvisor: **conta** (login) → **empresa** (CPF/CNPJ, conta Stripe) → **estabelecimentos**. A categoria pertence ao estabelecimento, não ao parceiro: uma conta pode ter pousada, restaurante e passeio, cada um com o formulário da sua categoria.
* **Produtor de eventos** (empresas com eventos esporádicos, sem estabelecimento): deixa de ser categoria do parceiro e passa a ser um **perfil de produtor**, cadastrado como os estabelecimentos (nome, descrição, fotos, contatos). Todo evento pertence a um estabelecimento **ou** ao perfil de produtor. Aprovado pelo responsável em 2026-10-12.
* **Selo e plano por estabelecimento** (cada estabelecimento, ou perfil de produtor, tem o seu plano e o seu selo).
* **Categorias novas:** Passeios (`tour`, já existente), **Translados** (`transfer`) e **Aluguéis** (`rental`), separadas. Regra: atividade guiada com roteiro é Passeio; o turista usa o veículo sozinho por um período é Aluguel.
* **Rotas novas** (altera D6): `/translados`, `/en/transfers`, `/fr/transferts`; `/alugueis`, `/en/rentals`, `/fr/locations`.
* **Formulário:** campo de arquivo do cardápio removido (fica só o link). **Telefone em E.164**, com o link do WhatsApp montado a partir dele.
* **Ordem:** Prompt 17.2 (publicar só com Stripe pronto) → Prompt 18 (modelo de categorias + editor único).

## D10 — Idioma na primeira visita (2026-10-19, opção B)

* **Prioridade:**
  1. URL com prefixo de idioma (`/en/...`, `/fr/...`): vale sempre.
  2. Escolha explícita: `users/{uid}.preferredLocale` para quem tem conta; `localStorage['useguide.locale']` para visitante.
  3. Idioma do navegador (`navigator.languages`), se for pt, en ou fr.
  4. Português.
* **Home `/`:** quando a preferência dos itens 2–4 não for português, o app redireciona para `/en` ou `/fr` (sem criar entrada no histórico). Robôs de busca nunca são redirecionados.
* **Outras páginas em português** (links do Google, WhatsApp etc.): o app mantém o idioma do link e mostra um aviso: "Esta página está disponível em English — Mudar". Os dois botões do aviso (mudar ou manter) gravam a escolha, e o aviso não volta.
* **Persistência só por escolha explícita** (Configurações ou aviso). Mudança causada pela URL não é gravada. Hoje o app grava o idioma da URL, e quem entra por `/` fica preso em português.
* Escolha feita por quem tem conta vai para `preferredLocale` pela API (escrita no backend, §6.1) e vale em todos os aparelhos e nos e-mails (§12.5).
* **Depende de:** S12 (AGENTS.md §12.1 e §12.7).

## D11 — Plano "Use Guide Verificado", selo e destaque por estabelecimento (2026-10-19)

Detalha o item "Selo e plano por estabelecimento" da D9. Modelo de referência: Meta Verified para empresas (assinatura que libera o selo, mas só para quem passou por verificação).

* **Dono do plano:** cada estabelecimento e o perfil de produtor (documentos em `items`). Estado do plano em `listingPlans/{itemId}` (só backend); o item recebe a cópia pública. Os campos de plano e selo saem de `partners/{uid}`, sem migração (§2.2 item 8).
* **Selo:** aparece só com **plano ativo do estabelecimento** (pago, trial ou concedido pelo admin) **e estabelecimento verificado pelo admin** (D12). Ao tocar no selo, o app explica: "Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado".
* **Plano e trial antes da verificação:** bloqueados (código `LISTING_PENDING_VERIFICATION`); avaliações, respostas e cadastro continuam liberados.
* **Nome do plano:** "Use Guide Verificado" (períodos mensal, semestral e anual).
* **Trial:** uma vez **por conta**, 7 dias; o parceiro escolhe o estabelecimento.
* **Preço:** cheio por estabelecimento (catálogo atual), sem desconto por quantidade.
* **Cobrança:** uma assinatura do Stripe por estabelecimento (`planSubscriptions/{itemId}`), um cliente Stripe por conta; metadata com `itemId` e `partnerId`. O Pix avulso também leva `itemId`.
* **Eventos:** herdam o selo do estabelecimento ou do perfil de produtor ao qual pertencem (`establishmentId`).
* **Admin:** concede ou retira o selo por estabelecimento, com as regras da D8.
* **Expiração:** job diário desliga o selo vencido em itens e eventos; os cards públicos também conferem `verifiedUntil`. A folga de 2 dias da renovação no cartão continua.
* **Benefícios:** avaliações e respostas **sempre liberadas**, com ou sem plano. As métricas (insights) de um estabelecimento exigem o plano daquele estabelecimento, conferido no backend.
* **Destaque nas listas (opção C):** **3 vagas** "Destaque" no topo de cada lista (valor de configuração), em rodízio diário entre os estabelecimentos com plano ativo; o resto da lista em ordem orgânica (nota, avaliações), com assinantes e não assinantes juntos. A vaga paga é sempre identificada como "Destaque" (CDC art. 36).
* **Detalhes de implementação (2026-10-21, aprovados):**
  * **Divisão:** 18.3a (plano por estabelecimento, selo, trial, selo do admin, job diário) → 18.3b (cobrança no Stripe por estabelecimento) → 18.3c (métricas exigindo o plano e destaque) → 18.3.1 (telas).
  * **Lista do destaque = categoria** (hospedagens, restaurantes, passeios, atrações, translados, aluguéis e eventos), cada uma com 3 vagas.
  * **Rodízio por job diário no backend:** sorteio com semente fixa do dia, gravado numa projeção pública (`featuredListings/{categoria}`) lida pelos cards; igual para todos os visitantes.
  * **Como o 18.3c implementa:**
    * métricas em `GET /api/insights/stats/:colecao/:id` (camada `interfaces/http/insights`): primeiro a posse, depois o plano; sem plano responde `403 LISTING_PLAN_REQUIRED`. O evento usa o plano do estabelecimento dele; evento sem estabelecimento não tem métricas. O admin vê sem plano;
    * candidatos do destaque: itens públicos com plano em vigor, de contas não suspensas; eventos públicos ativos de estabelecimento com plano. Listas: `hotel`, `restaurant`, `tour`, `sight`, `transfer`, `rental` e `events` (dicas e perfis de produtor ficam fora);
    * o dia do sorteio é o de `America/Fortaleza` e a semente é `dia:lista`; vagas em `FEATURED_SLOTS_PER_LIST` (padrão 3, de 0 a 12);
    * roda no job diário de planos (`checkExpiringPlans`), depois da manutenção dos selos; nenhuma Cloud Function nova.
* **Prompts:** 18.3a, 18.3b, 18.3c (backend) e 18.3.1 (frontend).

## D12 — Verificação e documento por estabelecimento (2026-10-19)

Referências: Receita Federal (IN RFB nº 2.119/2022: cada estabelecimento tem CNPJ próprio, matriz ou filial), Google (verificação por local), Airbnb, Booking, GetYourGuide e Stripe (verificação em registro oficial antes de pagar o parceiro).

* **Verificação por estabelecimento** (P0). O cadastro da conta deixa de pedir CPF/CNPJ; o status da conta fica só para suspensão. Cada estabelecimento nasce "aguardando verificação".
* **Documento:** no cadastro de cada estabelecimento, o parceiro escolhe CPF ou CNPJ.
  * **CNPJ:** 1 estabelecimento por CNPJ (filial usa o CNPJ da filial).
  * **CPF** (P4, opção B): pode ter vários estabelecimentos; o admin confere o CPF uma vez, e os outros estabelecimentos com o mesmo CPF já nascem conferidos.
  * **Perfil de produtor** (P6, opção A): usa o documento de um estabelecimento da mesma conta, fora da regra 1:1.
* **Venda** (P1, opção A): exige estabelecimento verificado pelo admin **e** conta Stripe pronta.
* **CPF não vende** (P3, opção A): vender exige CNPJ (MEI serve). Estabelecimento com CPF aparece no guia, pode ter plano e selo, mas não vende.
* **Prova do CNPJ** (P2, opção A): o parceiro envia o PDF do Cartão CNPJ (Comprovante de Inscrição e de Situação Cadastral), e o admin confere na Receita antes de aprovar: situação "ATIVA" e nome compatível com o estabelecimento.
* **Vínculo pessoa-empresa** (P5, opção A): o titular da conta precisa ser sócio ou administrador no Quadro de Sócios e Administradores (QSA) da Receita, ou o titular do MEI, e envia foto do documento de identidade (RG ou CNH). Gerente ou funcionário entra com autorização assinada por um sócio.
* **Cadastur** (P7, opção A): campo opcional e informativo por enquanto.
* **Proteção dos dados:**
  * CPF, CNPJ de pessoa física (MEI) e documentos de identidade são classe Restrita (AGENTS.md §7.6). O número fica cifrado (AES-256-GCM com Cloud KMS) e a unicidade usa índice cego (HMAC), conforme §7.7. Isso resolve o débito de `partnerDocumentKeys/{cpfCnpj}` em texto puro.
  * Os arquivos ficam em pasta privada do Storage, com nome gerado pelo servidor, e são apagados quando o estabelecimento ou a conta é excluído.
* **Repasse** (P8, opção A): uma conta Stripe por documento, no Prompt 18.4. Até lá, só vende o estabelecimento cujo documento é o da conta Stripe do parceiro.
* **Ordem** (P9): 18.3.0 (documento, criptografia e verificação por estabelecimento) → 18.3 (plano e selo, backend) → 18.3.1 (telas) → 18.4 (Stripe por documento) → 19.x (tradução).

## D13 — Troca de período do plano na próxima renovação (2026-10-24)

Mensal, semestral e anual do "Use Guide Verificado" dão os mesmos benefícios (D11); muda só o ciclo de cobrança. Por isso a troca de período (upgrade ou downgrade) é uma troca de ciclo, sem benefício a liberar na hora.

* **Opção A (aprovada):** o parceiro escolhe o novo período no diálogo do plano do estabelecimento. O período atual segue até o fim, e a próxima cobrança já sai no novo período e no novo valor.
* **Sem proração, crédito ou reembolso.** O cartão salvo é o mesmo; não há novo checkout.
* **Como:** *subscription schedule* do Stripe criado a partir da assinatura (`from_subscription`), com a fase atual e uma fase seguinte no novo preço e com a metadata do novo plano; `end_behavior: release`. O webhook `invoice.paid` da renovação ativa o plano novo pela metadata, como já faz (D11).
* **Regras:** escolher o período atual desfaz a troca; cancelar a renovação também desfaz a troca; trocar com a renovação cancelada retoma a renovação; com pagamento atrasado (`past_due`) a troca é recusada até a forma de pagamento ser atualizada. O valor vem sempre do catálogo no backend (§8.5).
* **Registro:** `planSubscriptions/{itemId}` guarda `pendingPlanId` e `pendingChangeAt` até o novo período entrar.
* **Descartadas:** B (troca imediata com proração) e C (troca pelo portal do Stripe).
* **Prompts:** 18.3b.2 (backend) e 18.3.1a (telas).

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

## D15 — Termos com aceite registrado e idioma do editor de conteúdo (2026-10-25)

* **Termos neutros da plataforma** em Sobre o app → Termos: termos de uso; compras, cancelamento e reembolso (todas as políticas, arrependimento, no-show, cancelamento pelo organizador, reagendamento por força maior, contestações); termos do parceiro; privacidade. Texto fixo da plataforma nos arquivos de tradução, com versão e data e o aviso de que vale a versão em português. Fonte: `src/shared/i18n/legalResources.ts`.
* **Checkout (2A):** uma linha com a política deste evento ou desta oferta, o link para os termos (abre num diálogo, sem perder a reserva) e a caixa "Li e aceito", obrigatória para continuar. O total com a taxa de serviço destacada continua no resumo (AGENTS.md §8.7; CDC art. 6º, III, e art. 31; Decreto 7.962/2013).
* **Prova do aceite (3A):** o pedido de ingresso e a reserva gravam `termsAcceptance { version, acceptedAt }`; o backend recusa a compra sem a versão atual (`BUYER_TERMS_VERSION` em `server/shared/kernel/legalTerms.ts`, espelhada no frontend com teste de paridade). Mudou o texto, muda a versão.
* **Termos do parceiro (4A):** aceite com versão e data no perfil do parceiro (`partners/{uid}.termsAcceptance`), pedido em Recebimentos antes de cadastrar a conta Stripe de qualquer CNPJ — passo obrigatório antes de qualquer venda paga, de evento ou de oferta. O texto mostra as taxas vigentes vindas do backend. O aceite de "termos de parceria" no cadastro de parceiro continua como está.
* **Idioma do editor (1A):** as abas de idioma do editor de oferta e o texto só em português do editor de evento contrariam a D5 e o AGENTS.md §12.6. Corrige no 19.1, junto com a tradução automática (débito B28).
* **Validação jurídica** dos textos antes das chaves `sk_live_`, como na D14.
* **Prompt:** 18.4b.3.

