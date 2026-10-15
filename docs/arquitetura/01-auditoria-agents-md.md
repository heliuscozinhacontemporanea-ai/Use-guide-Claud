# Auditoria do AGENTS.md (v1 → v2)

> Base: `AGENTS.md` v1 (793 linhas) confrontado com o código real do zip `use-guide-main` e com documentação oficial (Stripe, Firebase, WCAG, Apple HIG, Material Design).
> Resultado: `AGENTS.md` v2 na raiz do repositório.

---

## 1. Veredito

A v1 é **acima da média** do mercado em intenção: Hexagonal + DIP, DAG entre domínios, Composition UseCases, CQRS leitura/escrita, Zero-Trust e regras de UI concretas (contraste calculado, escala de z-index, área de toque). O código mostra que o time segue boa parte disso (backend sem ciclos de domínio, DTOs, Zod, QR Code assinado com RSA-PSS, idempotência no Stripe, valores em centavos).

Porém a v1 tinha **6 erros factuais**, **9 conflitos internos ou com o código** e **lacunas importantes** para um marketplace com pagamentos: Stripe, LGPD, observabilidade, contrato de erro, ambiente AI Studio e o domínio de reservas (passeios/aluguel/translado).

---

## 2. Erros factuais da v1 (corrigidos na v2)

| # | Onde (v1) | O que dizia | Realidade | Correção v2 |
|---|---|---|---|---|
| F1 | §6.2 diagrama e Camada 4 | Firestore Rules como 4ª camada no fluxo de **escrita** do backend | O **Admin SDK ignora as Security Rules**. Rules só protegem acesso direto do Client SDK | §7.1/§7.2 separam caminho de escrita (backend autoriza) e de leitura (rules) |
| F2 | §5.3 | `sm:` = 480px | Tailwind v4 (usado no projeto) tem `sm` = **640px**; `src/index.css` não redefine breakpoints | §11.3 com breakpoints reais |
| F3 | §5.1 | App é dark-only, "não implementar light mode" | Já existe `ThemeContext` com `light`/`dark`/`system`, CSS `:root.light` e `AppearanceSettingsView` | §11.1: dark padrão; componentes funcionam nos dois temas |
| F4 | §1, §3, §4, §7.2 | Mercado Pago como gateway, credenciais MP, `fetch('/api/payment/pix')` | O código usa **Stripe** (`stripe@23`, `@stripe/*`, Connect Express); não existe MP no código (só no README) | §8 inteira sobre Stripe; remove MP |
| F5 | §7.2.2 | Segredos como `FIREBASE_SERVICE_ACCOUNT_KEY` no Cloud Run | No Cloud Run o recomendado é **ADC** pela conta de serviço anexada (`adminClient.ts` já tem fallback `applicationDefault()`); chave JSON é risco de vazamento | §2.1: chave JSON só no AI Studio |
| F6 | §5.5 | 44×44 "seguindo Apple HIG e Material Design" | Apple HIG = 44pt; Material = **48dp** | §11.5: mínimo 44, 48 em ações primárias |

## 3. Conflitos internos e com o código

| # | Conflito | Evidência | Resolução v2 |
|---|---|---|---|
| C1 | §2.1 diz que `services/` = "casos de uso"; §6 exige UseCases públicos; código tem pasta `usecases/` não prevista | `server/domain/*/usecases/` | §4.1 inclui `usecases/`, `utils/`, `shared/kernel`, `interfaces/http` |
| C2 | §6.1.7 exige camada Application/Composition, mas a estrutura (§2.1) não a define | `server/application/usecases/` existe com 13 arquivos | §3.4 e §4.1 definem a camada e a regra de dependência |
| C3 | §6.1.1 "somente UseCases" entre domínios, mas consumidores precisam dos **tipos** e **erros** do destino | todos os `index.ts` exportam types/errors | §5.2 *Published Language*: UseCases + tipos + erros + funções puras |
| C4 | §1.1 "nunca importar SDKs de terceiros" × Stripe Elements/Connect são componentes React que precisam estar no JSX | `StripePaymentElement.tsx`, `PartnerStripeConnectPortal.tsx` | §3.2 lista de permissões + §3.3 UI Adapters |
| C5 | §7 "Foco exclusivo em produção" × requisito de funcionar no AI Studio | `server.ts` tem caminho Vite dev; `.env.example` com segredos do AI Studio | §2 matriz de dois ambientes |
| C6 | §7.1 "zero mocks" × testes precisam de fakes | 60+ arquivos `*.test.ts` com `vi.mock` | §2.2.7: fakes só em testes |
| C7 | §8 "frontend lê direto do Firestore" × muitas coleções são `read: false` (pedidos, ingressos, transações) | `firestore.rules` | §6.2 critérios de leitura direta vs. via API |
| C8 | §10.1 "um UseCase por arquivo / ~200 linhas" × arquivos agregadores enormes | `ticketingService.ts` 1861 linhas, `firestoreTicketingAdapter.ts` 1500, `eventUseCases.ts`, `ticketingUseCases.ts` | §13: regra mantida, legado vira débito, dividir ao tocar |
| C9 | §9 "sempre perguntar quando houver 2+ soluções" × agente travaria em toda decisão trivial; conflita com a regra de emergência | — | §15: perguntar só em decisões de dados, dinheiro, segurança, contrato, irreversíveis |

Observações menores corrigidas: exemplo de `zIndex.ts` com JSDoc contrariava a tabela de JSDoc (§4.5 v1); "Factories não devem executar efeitos colaterais" contrariado pelo `adminClient.ts` que lança erro na importação (ver P0-3).

## 4. Lacunas preenchidas na v2

| Tema | Por que importa neste produto | Seção v2 |
|---|---|---|
| Stripe Connect (Express, destination charges, taxa, Pix, webhooks, refunds, disputas, Billing para planos) | É o coração financeiro do marketplace | §8 |
| Domínio `bookings` (passeios, aluguel de quadriciclo, translado, entradas de atração privada) | Não cabe em `ticketing` (ingresso de evento) nem em `guide` (catálogo) | §1, §9.3 |
| LGPD | Operação no Brasil com CPF/CNPJ, telefone, documentos de parceiros | §7.5 |
| Contrato de erro + códigos HTTP | Hoje há formatos mistos (`{error: string}` e `{error: {message,status}}`) | §10.2 |
| Observabilidade (logs estruturados, trace do Cloud Run) | Diagnóstico de pagamento sem PII | §10.3 |
| Limites da plataforma (timeout 60 s do Hosting→Cloud Run, cookie `__session`, stateless) | Evita bugs que só aparecem em produção | §2.3 |
| Rate limiting, `trust proxy`, `checkRevoked` | Proteção de rotas públicas e de pagamento | §7.3, §7.4 |
| Fuso `America/Fortaleza`, dinheiro em centavos, i18n pt-BR/en/fr | Eventos e passeios com horário errado = reembolso | §1 |
| SEO schema.org (Restaurant, LodgingBusiness, TouristAttraction, Event+Offer, AggregateRating) | Principal canal de aquisição de guias turísticos | §9.5 |
| Core Web Vitals | Uso móvel ao ar livre, rede instável | §11.9 |
| Gates de qualidade e formato de entrega do agente | Garante que o Gemini rode typecheck/lint/test/build antes de concluir | §16 |
| Precedência de regras | Resolve conflitos de forma determinística | §0.1 |
| Classificação de dados, criptografia de campo (AES-256-GCM + Cloud KMS), blind index, hash/assinatura, algoritmos proibidos | CPF/CNPJ e documentos de parceiros hoje em texto puro | §7.6, §7.7 |
| Gestão e rotação de chaves | Stripe, HMAC do QR, chaves RSA de check-in, KMS | §7.8 |
| Segurança da transferência interna e externa (TLS, HSTS, OIDC entre serviços, IAM mínimo, SSRF, CORS, DTO de saída) | Cloud Run é invocável publicamente; job interno usa chave estática | §7.9 |
| OWASP Top 10, uploads (EXIF/GPS, SVG), MFA de admin, backups | Superfície de marketplace com dinheiro e PII | §7.10 |
| Internacionalização completa (estrutura de namespaces, tipagem de chaves, plural, `Intl`, backend por `code`, conteúdo `LocalizedText`, Stripe `locale`, SEO `hreflang`) | Só 6 arquivos usam `useTranslation`; resto do texto fixo em pt-BR | §12 |

## 5. Alinhamento com práticas de grandes plataformas

> Importante: Apple, Google, Meta, Airbnb e Tripadvisor **não publicam um "AGENTS.md" interno**. A comparação abaixo é com as práticas que essas empresas **documentam publicamente** (guias de engenharia, design e pagamentos) e com padrões de mercado. "Simpla" não foi identificada como referência pública; se a intenção era **Sympla** (ingressos no Brasil), o modelo de referência para ingressos é o seu domínio `ticketing`, já alinhado (estoque com reserva, QR assinado, check-in offline, reembolso, transferência).

| Prática | Referência pública | v1 | v2 |
|---|---|---|---|
| Regra de dependência entre camadas, fronteiras de módulo | Clean Architecture; Google "Software Engineering at Google" (cap. dependências) | 🟡 domínio↔domínio sim, camadas não | ✅ §3.4 |
| Revisão de código com padrões objetivos e "por quê" nos comentários | Google Engineering Practices (code review) | ✅ | ✅ |
| Guia de estilo JS/TS e lint automático | Airbnb JavaScript Style Guide; Biome no projeto | 🟡 sem gates | ✅ §16 |
| Área de toque 44pt / 48dp | Apple HIG / Material Design | 🟡 | ✅ |
| Contraste WCAG 2.2 AA | W3C WCAG 2.2 | ✅ (números corretos para fundo sólido) | ✅ + texto grande e vidro |
| Core Web Vitals | Google web.dev | ❌ | ✅ |
| Dados estruturados para busca | Google Search Central (schema.org) | ❌ | ✅ |
| Idempotência, webhook como fonte da verdade, eventos fora de ordem | Stripe Docs (webhooks, idempotent requests) | ❌ | ✅ |
| Princípio do menor privilégio, segredos fora do código | Google Cloud Security best practices; OWASP ASVS | 🟡 | ✅ |
| SRE: logs estruturados, timeouts, degradação graciosa | Google SRE Book | ❌ | ✅ |
| Avaliações apenas de experiências verificadas | Prática de marketplaces de viagem (ex: Airbnb só permite avaliar após estadia) | ❌ | ✅ §9.4 |

## 6. Bugs reais encontrados durante a auditoria (fora do AGENTS.md, porém críticos)

| ID | Severidade | Problema | Arquivo |
|---|---|---|---|
| **P0-1** | Crítico (perda de pagamento) | O webhook marca o evento como processado **antes** de processar. Se `reconcileStripeWebhookEventApplicationUseCase` falhar, responde 400; o Stripe reenvia, mas o reenvio é tratado como duplicado e retorna 200 → **pedido pago que nunca é confirmado e ingresso nunca emitido** | `server/domain/payment/controllers/paymentController.ts:206-222` |
| **P0-2** | Alto (reembolso preso) | Refund é criado no Stripe **sem `metadata`**, mas o webhook só finaliza o reembolso se `metadata.refundId` existir → reembolsos `pending_provider` nunca são finalizados. Além disso, qualquer status diferente de `failed/canceled` (inclusive `pending`) é tratado como aprovado | `stripePaymentGatewayAdapter.ts:80-100`, `ticketingPaymentOrchestrationUseCases.ts:255-270` |
| **P0-3** | Alto (boot) | `adminClient.ts` lança exceção na importação se faltar `FIRESTORE_DATABASE_ID`/`FIREBASE_STORAGE_BUCKET`; factories instanciam adapters na importação → o servidor inteiro não sobe | `server/infrastructure/firebase/adminClient.ts` |
| P1-1 | Médio | Código morto duplicando idempotência: `handleStripeWebhookOrchestrationApplicationUseCase` (não usado) | `ticketingPaymentOrchestrationUseCases.ts:294` |
| P1-2 | Médio | Duas rotas de webhook (`/api/payment/webhook` e `/api/payment/webhook/stripe`) → se as duas estiverem cadastradas no Stripe, cada evento chega 2× | `server.ts` |
| P1-3 | Médio | `charge.dispute.created`: `metadata` do objeto Dispute não carrega `orderId` → pedido não é marcado como disputado (só a transação) | `ticketingPaymentOrchestrationUseCases.ts:275` |
| P1-4 | Médio | `app.set('trust proxy', true)` permite falsificar IP via `X-Forwarded-For` | `server.ts` |
| P1-5 | Médio | Plano do parceiro cobrado por PaymentIntent avulso — sem renovação automática | `createPlanPaymentIntentUseCase` |
| P1-6 | Médio | Upload de imagens direto do navegador ao Cloudinary com preset não assinado (abuso de cota, conteúdo arbitrário) | `src/domain/media/adapters/cloudinaryAdapter.ts` |
| **P0-4** | Alto (segurança de ingressos) | Se `TICKET_QR_SECRET` faltar ou tiver < 16 caracteres, o HMAC do QR usa o segredo fixo `'use-guide-ticket-qr-hmac-secret-v1'`, que está no código-fonte | `server/domain/ticketing/utils/qrToken.ts:3-11` |
| P1-7 | Médio (LGPD) | CPF/CNPJ em texto puro nos campos `cpfCnpj`/`cpfCnpjClean` e como **ID de documento** em `partnerDocumentKeys` | `server/domain/partners/adapters/firestorePartnerAdapter.ts:128` |
| P1-8 | Médio | Handler global de erros devolve `err.message` ao cliente (pode vazar detalhe interno ou do SDK) | `server.ts` (error handler) |
| P1-9 | Médio | Job interno `/internal/ticketing/expire-orders` autenticado por chave estática; o alvo é OIDC | `ticketingController.ts:222`, `functions/src/expireTicketingOrders.ts` |
| P1-10 | Médio (SEO) | Hosting serve `index.html` estático para `**`; o `serverSeoService` do Cloud Run nunca roda nas páginas em produção | `firebase.json`, `server.ts` |
| P1-11 | Médio | i18n cobre só 6 arquivos; UI, toasts, schemas e erros do backend com texto pt-BR fixo | `src/**` |
| **P0-5** | Crítico (financeiro) | Plano semestral ou anual pago libera só 30 dias e grava `verificationType: 'monthly'` (o `billingCycle` nunca é enviado na metadata); o selo também não é propagado para itens e eventos | `ticketingPaymentOrchestrationUseCases.ts:216-228`, `updatePartnerPlanFromPaymentUseCase.ts` |
| **P0-6** | Crítico (receita) | A compra de plano não funciona: o frontend chama `POST /api/payment/plan-intent` com `{ itemId, billingCycle }` e `/plan-intent/confirm`, mas o backend só expõe `/plans/intents` esperando `{ planId }` e não tem rota de confirmação | `src/domain/payment/api/apiPaymentAdapter.ts:14,33`, `server/domain/payment/routes/paymentRoutes.ts` |
| **P0-7** | Crítico (reembolso) | `updateRefundStatus` escreve antes de ler na mesma transação; o Admin SDK recusa a transação e todo reembolso aprovado de pedido pago termina como `failed` (o cliente recebe o dinheiro, mas os ingressos continuam válidos). Também não era idempotente e devolvia 1 ingresso ao estoque quando havia 2 do mesmo tipo | `server/domain/ticketing/adapters/firestoreTicketingAdapter.ts` (`updateRefundStatus`) |
| P1-12 | Médio | `navigate('/favoritos')` e o `return_url` do Stripe (`/checkout/result`) apontam para rotas que não existem no `AppRouter`; não há rota 404 | `SideMenu.tsx:349`, `StripePaymentElement.tsx:45`, `AppRouter.tsx` |
| P1-13 | Médio | `seoService` insere valores sem escape e usa `String.replace` com string de substituição (`$&` é expandido) | `server/domain/seo/seoService.ts` |
| P2-1 | Baixo | README e `.env.example` desatualizados (Mercado Pago, módulos, `eslint.config.js` inexistente) | `README.md` |

Prompts prontos para o AI Studio: `docs/arquitetura/03-prompts-ai-studio.md`.
