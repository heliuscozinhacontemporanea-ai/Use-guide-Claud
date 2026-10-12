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
| D5 | Tradução automática do conteúdo dos parceiros | ⏳ **Em aberto** | — |
| D6 | URLs por idioma | ✅ Aprovada | 2026-10-09 |
| D7 | SEO em produção via Cloud Run | ✅ Aprovada | 2026-10-09 |

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

## D5 — Tradução automática (EM ABERTO)

* Opções: (a) tradução automática com Gemini no backend, marcada como `machine` e editável pelo parceiro; (b) só tradução humana.
* Até a decisão, o modelo `LocalizedText` (AGENTS.md §12.6) PODE ser preparado, mas nenhuma chamada de tradução automática DEVE ser implementada.

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
* **Produtor de eventos** (empresas com eventos esporádicos, sem estabelecimento): deixa de ser categoria do parceiro e passa a ser um **perfil de produtor**, cadastrado como os estabelecimentos (nome, descrição, fotos, contatos). Todo evento pertence a um estabelecimento **ou** ao perfil de produtor. *Aguardando confirmação do responsável (resposta à ressalva do item 1).*
* **Selo e plano por estabelecimento** (cada estabelecimento, ou perfil de produtor, tem o seu plano e o seu selo).
* **Categorias novas:** Passeios (`tour`, já existente), **Translados** (`transfer`) e **Aluguéis** (`rental`), separadas. Regra: atividade guiada com roteiro é Passeio; o turista usa o veículo sozinho por um período é Aluguel.
* **Rotas novas** (altera D6): `/translados`, `/en/transfers`, `/fr/transferts`; `/alugueis`, `/en/rentals`, `/fr/locations`.
* **Formulário:** campo de arquivo do cardápio removido (fica só o link). **Telefone em E.164**, com o link do WhatsApp montado a partir dele.
* **Ordem:** Prompt 17.2 (publicar só com Stripe pronto) → Prompt 18 (modelo de categorias + editor único).
