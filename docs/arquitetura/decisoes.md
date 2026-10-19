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
* **Selo:** aparece só com **plano ativo do estabelecimento** (pago, trial ou concedido pelo admin) **e conta do parceiro aprovada pelo admin** (status `active`, documentos CPF/CNPJ conferidos). Ao tocar no selo, o app explica: "Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado".
* **Nome do plano:** "Use Guide Verificado" (períodos mensal, semestral e anual).
* **Trial:** uma vez **por conta**, 7 dias; o parceiro escolhe o estabelecimento.
* **Preço:** cheio por estabelecimento (catálogo atual), sem desconto por quantidade.
* **Cobrança:** uma assinatura do Stripe por estabelecimento (`planSubscriptions/{itemId}`), um cliente Stripe por conta; metadata com `itemId` e `partnerId`. O Pix avulso também leva `itemId`.
* **Eventos:** herdam o selo do estabelecimento ou do perfil de produtor ao qual pertencem (`establishmentId`).
* **Admin:** concede ou retira o selo por estabelecimento, com as regras da D8.
* **Expiração:** job diário desliga o selo vencido em itens e eventos; os cards públicos também conferem `verifiedUntil`. A folga de 2 dias da renovação no cartão continua.
* **Benefícios:** avaliações e respostas **sempre liberadas**, com ou sem plano. As métricas (insights) de um estabelecimento exigem o plano daquele estabelecimento, conferido no backend.
* **Destaque nas listas (opção C):** **3 vagas** "Destaque" no topo de cada lista (valor de configuração), em rodízio diário entre os estabelecimentos com plano ativo; o resto da lista em ordem orgânica (nota, avaliações), com assinantes e não assinantes juntos. A vaga paga é sempre identificada como "Destaque" (CDC art. 36).
* **Prompts:** 18.3 (backend) e 18.3.1 (frontend).
