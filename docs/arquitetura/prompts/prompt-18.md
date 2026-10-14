# Prompt 18 — Parceiro com vários cadastros, categorias novas e telefone em E.164

> Lote 10, gerado do commit de referência `37b8a4b` da branch `claude/agents-md-v2`. Aplique depois do lote 9. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18 — Parceiro com vários cadastros, categorias novas e telefone em E.164

Decisão D9 (modelo em 3 níveis: conta do parceiro → cadastros → ofertas), categorias passeio/translado/aluguel separadas, perfil de produtor e telefone em E.164.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

O QUE MUDA:
1) A conta do parceiro deixa de ter categoria; a categoria fica em cada cadastro (item). getAdminPartners devolve listingsCount.
2) Novas categorias de item: transfer, rental e producer (perfil de produtor, fora do catálogo, do sitemap e do SEO). Evento de parceiro sempre exige um establishmentId próprio.
3) Rotas novas /translados (/en/transfers, /fr/transferts) e /alugueis (/en/rentals, /fr/locations), com SEO e JSON-LD.
4) Telefone gravado em E.164: whatsappLink vira phone em todo o código (eventos: contact.phone); E164PhoneField no design system; VITE_SUPPORT_WHATSAPP no .env.example.
5) Inscrição: payload {cpfCnpj, termsAccepted}; o primeiro cadastro é sempre criado.
6) Débitos B19 e B20 registrados.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- firebase-blueprint.json (alterar)
- server/application/seo/catalogSeoContentProvider.test.ts (alterar)
- server/application/seo/catalogSeoContentProvider.ts (alterar)
- server/application/usecases/activatePartnerTrialApplicationUseCase.test.ts (alterar)
- server/application/usecases/createPartnerEventApplicationUseCase.test.ts (alterar)
- server/application/usecases/createPartnerEventApplicationUseCase.ts (alterar)
- server/application/usecases/getAdminPartnersUseCase.test.ts (alterar)
- server/application/usecases/getAdminPartnersUseCase.ts (alterar)
- server/application/usecases/updatePartnerItemApplicationUseCase.ts (alterar)
- server/application/usecases/verifyPartnerApplicationUseCase.test.ts (alterar)
- server/domain/events/dtos/eventPersistenceMappers.ts (alterar)
- server/domain/events/schemas/eventSchema.ts (alterar)
- server/domain/events/types/eventTypes.ts (alterar)
- server/domain/guide/schemas/guideSchema.ts (alterar)
- server/domain/guide/types/guideTypes.ts (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.test.ts (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.ts (alterar)
- server/domain/partners/dtos/RegisterPartnerDTO.ts (alterar)
- server/domain/partners/index.ts (alterar)
- server/domain/partners/mappers/partnerMapper.test.ts (alterar)
- server/domain/partners/mappers/partnerMapper.ts (alterar)
- server/domain/partners/schemas/partnerContentSchema.ts (alterar)
- server/domain/partners/schemas/partnerSchema.test.ts (alterar)
- server/domain/partners/schemas/partnerSchema.ts (alterar)
- server/domain/partners/services/partnerService.test.ts (alterar)
- server/domain/partners/services/partnerService.ts (alterar)
- server/domain/partners/types/partnerTypes.ts (alterar)
- server/domain/seo/services/sitemapService.test.ts (alterar)
- server/domain/seo/types/seoTypes.ts (alterar)
- server/domain/seo/utils/routeSeo.ts (alterar)
- server/domain/seo/utils/structuredData.ts (alterar)
- server/shared/kernel/localizedRoutes.ts (alterar)
- server/shared/kernel/phone.test.ts (criar)
- server/shared/kernel/phone.ts (criar)
- src/app/routes/AppRoutes.tsx (alterar)
- src/domain/admin/application/mappers/adminGuideEditorMapper.ts (alterar)
- src/domain/admin/components/subcomponents/AdminEditorLocation.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminEditorModal.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminPartnersView.tsx (alterar)
- src/domain/admin/schemas/adminGuideEditorFormSchema.ts (alterar)
- src/domain/admin/schemas/adminGuideEditorSchema.ts (alterar)
- src/domain/admin/types/admin.ts (alterar)
- src/domain/content/components/SupportView.tsx (alterar)
- src/domain/events/types/event.ts (alterar)
- src/domain/guide/adapters/firebaseGuideCatalogAdapter.ts (alterar)
- src/domain/guide/components/EventDetailModal.tsx (alterar)
- src/domain/guide/components/ItemDetailModal.tsx (alterar)
- src/domain/guide/components/RestaurantDetailModal.tsx (alterar)
- src/domain/guide/components/StayDetailModal.tsx (alterar)
- src/domain/guide/components/TourDetailModal.tsx (alterar)
- src/domain/guide/types/guide.ts (alterar)
- src/domain/partners/application/mappers/partnerFormMapper.test.ts (alterar)
- src/domain/partners/application/mappers/partnerFormMapper.ts (alterar)
- src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts (alterar)
- src/domain/partners/application/mappers/partnerSubmissionToGuide.ts (alterar)
- src/domain/partners/components/PartnerEventForm.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/PartnersModal.tsx (alterar)
- src/domain/partners/components/sections/StepNavigation.tsx (alterar)
- src/domain/partners/components/steps/Step1CompanyInfo.tsx (alterar)
- src/domain/partners/components/steps/Step2ContactInfo.tsx (alterar)
- src/domain/partners/components/steps/Step5Media.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerTabsNavigation.tsx (alterar)
- src/domain/partners/hooks/usePartnerContentActions.ts (alterar)
- src/domain/partners/hooks/usePartnerContentCatalog.ts (alterar)
- src/domain/partners/hooks/usePartnerPanelActions.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.test.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.ts (alterar)
- src/domain/partners/hooks/usePartnerRegistrationSubmission.ts (alterar)
- src/domain/partners/schemas/partnerEventFormSchema.ts (alterar)
- src/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/partners/schemas/partnerSchema.ts (alterar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/partners/types/partnerContent.ts (alterar)
- src/shared/constants/categories.ts (alterar)
- src/shared/constants/countryCodes.ts (criar)
- src/shared/i18n/localizedRoutes.test.ts (alterar)
- src/shared/i18n/localizedRoutes.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/utils/phone.test.ts (criar)
- src/shared/utils/phone.ts (criar)
- src/ui/components/E164PhoneField.tsx (criar)
- src/ui/components/PhoneInputField.tsx (alterar)
- src/ui/layouts/Header.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -17,6 +17,8 @@ VITE_GOOGLE_MAPS_API_KEY=""
 # Stripe Payment & Stripe Connect Config
 STRIPE_SECRET_KEY=
 VITE_STRIPE_PUBLISHABLE_KEY=
+# WhatsApp do suporte, em E.164 (ex: +5588999999999). Público; sem valor, o botão de WhatsApp do suporte não aparece.
+VITE_SUPPORT_WHATSAPP=
 STRIPE_WEBHOOK_SECRET=
 USE_GUIDE_PLATFORM_FEE_PERCENT=10

=== docs/arquitetura/debitos.md — diff ===
@@ -15,6 +15,8 @@
 | B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
 | B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7 | médio | passeio não salva (aguarda decisão sobre a categoria passeio); seção de reservas aparece para hospedagem/restaurante; três critérios de "pronto para receber" (Prompt 17.2); parceiro não gerencia datas/capacidade do evento (editor único, Prompts 18–19); ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; clique fora do editor descarta edições; preço de plano com `'R$ ' +` (Prompt 17.1); datas exibidas sem fuso no gerenciador de ingressos; botões só com ícone sem nome; `PartnerItemForms.tsx` sem uso |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
+| B19 | Modelo de eventos guarda contato em dois lugares (`phone` no topo e `contact.phone`) | §13, §6.3 | baixo | unificar em `contact` quando o editor único (Prompt 18.2) tocar no evento |
+| B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 
 ## Resolvidos

=== docs/arquitetura/decisoes.md — diff ===
@@ -89,7 +89,7 @@
 ## D9 — Parceiros com vários estabelecimentos e novas categorias (2026-10-12)
 
 * **Três níveis**, como Airbnb, Google e TripAdvisor: **conta** (login) → **empresa** (CPF/CNPJ, conta Stripe) → **estabelecimentos**. A categoria pertence ao estabelecimento, não ao parceiro: uma conta pode ter pousada, restaurante e passeio, cada um com o formulário da sua categoria.
-* **Produtor de eventos** (empresas com eventos esporádicos, sem estabelecimento): deixa de ser categoria do parceiro e passa a ser um **perfil de produtor**, cadastrado como os estabelecimentos (nome, descrição, fotos, contatos). Todo evento pertence a um estabelecimento **ou** ao perfil de produtor. *Aguardando confirmação do responsável (resposta à ressalva do item 1).*
+* **Produtor de eventos** (empresas com eventos esporádicos, sem estabelecimento): deixa de ser categoria do parceiro e passa a ser um **perfil de produtor**, cadastrado como os estabelecimentos (nome, descrição, fotos, contatos). Todo evento pertence a um estabelecimento **ou** ao perfil de produtor. Aprovado pelo responsável em 2026-10-12.
 * **Selo e plano por estabelecimento** (cada estabelecimento, ou perfil de produtor, tem o seu plano e o seu selo).
 * **Categorias novas:** Passeios (`tour`, já existente), **Translados** (`transfer`) e **Aluguéis** (`rental`), separadas. Regra: atividade guiada com roteiro é Passeio; o turista usa o veículo sozinho por um período é Aluguel.
 * **Rotas novas** (altera D6): `/translados`, `/en/transfers`, `/fr/transferts`; `/alugueis`, `/en/rentals`, `/fr/locations`.

=== firebase-blueprint.json — diff ===
@@ -145,7 +145,10 @@
             "sight",
             "tour",
             "tips",
-            "hotel"
+            "hotel",
+            "transfer",
+            "rental",
+            "producer"
           ]
         },
         "image": { "type": "string" },
@@ -159,7 +162,7 @@
         "instagramLink": { "type": "string" },
         "websiteLink": { "type": "string" },
         "bookingLink": { "type": "string" },
-        "whatsappLink": { "type": "string" },
+        "phone": { "type": "string", "description": "Telefone em E.164 (ex: +5588999999999)." },
         "googleMapsLink": { "type": "string" },
         "address": { "type": "string" },
         "tags": {
@@ -201,10 +204,6 @@
       "description": "Business partner profile information with decoupled user attributes.",
       "type": "object",
       "properties": {
-        "category": {
-          "type": "string",
-          "description": "The category of the partner (restaurant, hotel, sight, event, etc.)."
-        },
         "businesses": {
           "type": "array",
           "description": "Array of assigned business objects containing businessId, name and type.",

=== server/application/seo/catalogSeoContentProvider.test.ts — diff ===
@@ -36,14 +36,14 @@ describe('CatalogSeoContentProvider', () => {
       image: 'https://x/y.webp',
       location: 'prea',
       ownerId: 'owner-1',
-      whatsappLink: 'https://wa.me/5588999999999',
+      phone: '+5588999999999',
       rating: 0,
       reviewCount: 0,
       isActive: true,
     });
     const item = await new CatalogSeoContentProvider().getGuideItem('a');
     expect(item).not.toHaveProperty('ownerId');
-    expect(item).not.toHaveProperty('whatsappLink');
+    expect(item).not.toHaveProperty('phone');
     expect(item).toMatchObject({ id: 'a', name: 'Pousada', category: 'hotel' });
   });
 
@@ -107,4 +107,23 @@ describe('CatalogSeoContentProvider', () => {
     const item = await new CatalogSeoContentProvider().getGuideItem('t1');
     expect(item?.offer).toEqual({ lowestPriceMinor: 9000, inStock: true });
   });
+
+  it('perfil de produtor não entra no sitemap nem ganha página do guia', async () => {
+    mocks.listPublicGuideItemsUseCase.mockResolvedValue([
+      { id: 'p1', category: 'producer' },
+      { id: 't1', category: 'transfer' },
+    ]);
+    mocks.listPublicEventListingsUseCase.mockResolvedValue([]);
+    mocks.getPublicGuideItemUseCase.mockResolvedValue({
+      id: 'p1',
+      name: 'Produtora',
+      category: 'producer',
+    });
+    const provider = new CatalogSeoContentProvider();
+
+    await expect(provider.listIndexableEntries()).resolves.toEqual([
+      { id: 't1', category: 'transfer' },
+    ]);
+    await expect(provider.getGuideItem('p1')).resolves.toBeNull();
+  });
 });

=== server/application/seo/catalogSeoContentProvider.ts — diff ===
@@ -14,7 +14,8 @@ import type { SeoContentPort, SeoEvent, SeoGuideItem, SeoSitemapEntry } from '..
 export class CatalogSeoContentProvider implements SeoContentPort {
   async getGuideItem(id: string): Promise<SeoGuideItem | null> {
     const item = await getPublicGuideItemUseCase(id);
-    if (!item) return null;
+    // Perfil de produtor não tem página própria no guia (decisão D9).
+    if (!item || item.category === 'producer') return null;
     const offer =
       item.category === 'tour' || item.category === 'sight'
         ? await getPublicOfferSummaryUseCase(item.id)
@@ -73,7 +74,9 @@ export class CatalogSeoContentProvider implements SeoContentPort {
       listPublicEventListingsUseCase(),
     ]);
     return [
-      ...items.map((item) => ({ id: item.id, category: item.category })),
+      ...items.flatMap((item) =>
+        item.category === 'producer' ? [] : [{ id: item.id, category: item.category }]
+      ),
       ...events.map((event) => ({ id: event.id, category: 'event' as const })),
     ];
   }

=== server/application/usecases/activatePartnerTrialApplicationUseCase.test.ts — diff ===
@@ -30,7 +30,6 @@ describe('activatePartnerTrialApplicationUseCase', () => {
 
   const mockPreviousProfile: PartnerProfileDocument = {
     id: 'partner-123',
-    category: 'restaurant',
     status: 'active',
     businesses: [],
     isVerified: false,

=== server/application/usecases/createPartnerEventApplicationUseCase.test.ts — diff ===
@@ -53,17 +53,15 @@ describe('createPartnerEventApplicationUseCase', () => {
     mocks.linkBusinessUseCase.mockResolvedValue(undefined);
   });
 
-  it.each(['hotel', 'restaurant', 'sight'] as const)(
-    'permite partner %s criar evento vinculado a establishmentId próprio',
+  it.each(['hotel', 'restaurant', 'sight', 'producer'])(
+    'cria evento vinculado a cadastro próprio (%s)',
     async (category) => {
-      mocks.getPartnerProfileUseCase.mockResolvedValue({
-        id: 'partner-1',
-        category,
-      });
+      mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
       mocks.getItemByIdUseCase.mockResolvedValue({
         id: 'est-1',
         ownerId: 'partner-1',
-        name: 'Meu Estabelecimento',
+        category,
+        name: 'Meu cadastro',
       });
 
       const eventId = await createPartnerEventApplicationUseCase(partnerUser, {
@@ -72,90 +70,52 @@ describe('createPartnerEventApplicationUseCase', () => {
       });
 
       expect(eventId).toBe('event-created-1');
-      expect(mocks.getItemByIdUseCase).toHaveBeenCalledWith('est-1');
       expect(mocks.createEventListingUseCase).toHaveBeenCalledWith(
         partnerUser,
-        expect.objectContaining({
-          establishmentId: 'est-1',
-        })
+        expect.objectContaining({ establishmentId: 'est-1' })
       );
-    }
-  );
-
-  it.each(['hotel', 'restaurant', 'sight'] as const)(
-    'rejeita partner %s sem establishmentId',
-    async (category) => {
-      mocks.getPartnerProfileUseCase.mockResolvedValue({
-        id: 'partner-1',
-        category,
+      expect(mocks.linkBusinessUseCase).toHaveBeenCalledWith('partner-1', {
+        businessId: 'event-created-1',
+        businessName: 'Sunset Jeri',
+        type: 'event',
       });
-
-      await expect(
-        createPartnerEventApplicationUseCase(partnerUser, {
-          ...baseEventInput,
-        })
-      ).rejects.toThrow('Selecione o estabelecimento ao qual o evento pertence.');
-
-      expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
     }
   );
 
-  it('rejeita partner tentando usar establishment de outro owner', async () => {
-    mocks.getPartnerProfileUseCase.mockResolvedValue({
-      id: 'partner-1',
-      category: 'hotel',
-    });
-    mocks.getItemByIdUseCase.mockResolvedValue({
-      id: 'est-other',
-      ownerId: 'partner-2',
-      name: 'Hotel de Outro Parceiro',
-    });
+  it('recusa evento sem estabelecimento nem perfil de produtor', async () => {
+    mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
+    await expect(
+      createPartnerEventApplicationUseCase(partnerUser, baseEventInput)
+    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
+    expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
+  });
 
+  it('recusa cadastro de outro parceiro', async () => {
+    mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
+    mocks.getItemByIdUseCase.mockResolvedValue({ id: 'est-x', ownerId: 'outro' });
     await expect(
       createPartnerEventApplicationUseCase(partnerUser, {
         ...baseEventInput,
-        establishmentId: 'est-other',
+        establishmentId: 'est-x',
       })
-    ).rejects.toThrow('Você não possui permissão sobre este estabelecimento.');
-
+    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
     expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
   });
 
-  it('permite event producer criar evento sem establishmentId', async () => {
-    mocks.getPartnerProfileUseCase.mockResolvedValue({
-      id: 'partner-1',
-      category: 'event',
-    });
-
-    const eventId = await createPartnerEventApplicationUseCase(partnerUser, {
-      ...baseEventInput,
-    });
-
-    expect(eventId).toBe('event-created-1');
-    expect(mocks.getItemByIdUseCase).not.toHaveBeenCalled();
-    expect(mocks.createEventListingUseCase).toHaveBeenCalledWith(
-      partnerUser,
-      expect.objectContaining({
-        establishmentId: undefined,
-      })
-    );
-  });
-
-  it('rejeita event producer enviando establishmentId', async () => {
-    mocks.getPartnerProfileUseCase.mockResolvedValue({
-      id: 'partner-1',
-      category: 'event',
-    });
-
+  it('desfaz o evento se o vínculo com o parceiro falhar', async () => {
+    mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
+    mocks.getItemByIdUseCase.mockResolvedValue({ id: 'est-1', ownerId: 'partner-1' });
+    mocks.linkBusinessUseCase.mockRejectedValue(new Error('falhou'));
     await expect(
       createPartnerEventApplicationUseCase(partnerUser, {
         ...baseEventInput,
         establishmentId: 'est-1',
       })
-    ).rejects.toThrow(
-      'Produtor de eventos não pode vincular evento a estabelecimento.'
+    ).rejects.toThrow('falhou');
+    expect(mocks.deleteOrArchiveEventListingUseCase).toHaveBeenCalledWith(
+      partnerUser,
+      'event-created-1',
+      false
     );
-
-    expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
   });
 });

=== server/application/usecases/createPartnerEventApplicationUseCase.ts — diff ===
@@ -11,16 +11,6 @@ import {
   linkBusinessUseCase,
 } from '../../domain/partners';
 
-function isEstablishmentRequired(
-  partnerCategory: string | null | undefined
-): boolean {
-  return (
-    partnerCategory === 'hotel' ||
-    partnerCategory === 'restaurant' ||
-    partnerCategory === 'sight'
-  );
-}
-
 export type CreatePartnerEventInput = Omit<CreateEventListingInput, 'ownerId'> & {
   name: string;
   image: string;
@@ -44,34 +34,21 @@ export async function createPartnerEventApplicationUseCase(
       'Perfil de parceiro não encontrado.'
     );
   }
-  const requiresEstablishment = isEstablishmentRequired(partnerProfile.category);
-  if (requiresEstablishment) {
-    if (!data.establishmentId) {
-      throw new PartnerDomainError(
-        'INVALID_ARGUMENT',
-        'Selecione o estabelecimento ao qual o evento pertence.'
-      );
-    }
-    const establishment = await getItemByIdUseCase(data.establishmentId);
-    if (!establishment) {
-      throw new PartnerDomainError(
-        'NOT_FOUND',
-        'Estabelecimento não encontrado.'
-      );
-    }
-    if (establishment.ownerId !== user.uid) {
-      throw new PartnerDomainError(
-        'FORBIDDEN',
-        'Você não possui permissão sobre este estabelecimento.'
-      );
-    }
-  } else if (
-    partnerProfile.category === 'event' &&
-    data.establishmentId
-  ) {
+  // Todo evento pertence a um estabelecimento ou ao perfil de produtor do parceiro (decisão D9).
+  if (!data.establishmentId) {
     throw new PartnerDomainError(
       'INVALID_ARGUMENT',
-      'Produtor de eventos não pode vincular evento a estabelecimento.'
+      'Selecione o estabelecimento ou o perfil de produtor do evento.'
+    );
+  }
+  const establishment = await getItemByIdUseCase(data.establishmentId);
+  if (!establishment) {
+    throw new PartnerDomainError('NOT_FOUND', 'Estabelecimento não encontrado.');
+  }
+  if (establishment.ownerId !== user.uid) {
+    throw new PartnerDomainError(
+      'FORBIDDEN',
+      'Você não possui permissão sobre este estabelecimento.'
     );
   }
 
@@ -79,7 +56,7 @@ export async function createPartnerEventApplicationUseCase(
     ...data,
     title: data.name,
     coverImage: data.image,
-    establishmentId: requiresEstablishment ? data.establishmentId : undefined,
+    establishmentId: data.establishmentId,
   });
 
   const eventId = created.listing.id;

=== server/application/usecases/getAdminPartnersUseCase.test.ts — diff ===
@@ -97,13 +97,13 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
     expect(Object.keys(result[0] ?? {}).sort()).toEqual(
       [
         'businessName',
-        'category',
         'email',
         'firstName',
         'id',
         'isVerificationSuspended',
         'isVerified',
         'lastName',
+        'listingsCount',
         'status',
         'verificationType',
         'verifiedUntil',

=== server/application/usecases/getAdminPartnersUseCase.ts — diff ===
@@ -8,7 +8,8 @@ export interface AdminPartnerSummaryDTO {
   firstName: string;
   lastName: string;
   email: string;
-  category: PartnerProfileDTO['category'];
+  /** Estabelecimentos e eventos vinculados ao parceiro (a categoria é de cada estabelecimento). */
+  listingsCount: number;
   status: PartnerProfileDTO['status'];
   isVerified: boolean;
   verifiedUntil: string | null;
@@ -32,7 +33,7 @@ export async function getAdminPartnersUseCase(): Promise<AdminPartnerSummaryDTO[
       firstName: user?.firstName || '',
       lastName: user?.lastName || '',
       email: user?.email || '',
-      category: partner.category,
+      listingsCount: partner.businesses?.length ?? 0,
       status: partner.status,
       isVerified: partner.isVerified,
       verifiedUntil: partner.verifiedUntil,

=== server/application/usecases/updatePartnerItemApplicationUseCase.ts — diff ===
@@ -16,7 +16,7 @@ function toItemRollbackInput(previous: { [key: string]: unknown }): GuideUpdateI
     'instagramLink',
     'websiteLink',
     'bookingLink',
-    'whatsappLink',
+    'phone',
     'googleMapsLink',
     'address',
   ] as const;

=== server/application/usecases/verifyPartnerApplicationUseCase.test.ts — diff ===
@@ -23,7 +23,6 @@ vi.mock('../../domain/events', () => ({
 describe('verifyPartnerApplicationUseCase', () => {
   const mockPreviousProfile: PartnerProfileDocument = {
     id: 'partner-123',
-    category: 'hotel',
     status: 'active',
     businesses: [],
     isVerified: false,

=== server/domain/events/dtos/eventPersistenceMappers.ts — diff ===
@@ -106,9 +106,9 @@ export class EventListingPersistenceMapper {
       organizerId: String(raw.organizerId || ownerId),
       location,
       contact: {
-        whatsapp:
-          (raw.contact as Record<string, string> | undefined)?.whatsapp ||
-          (typeof raw.whatsappLink === 'string' ? raw.whatsappLink : undefined),
+        phone:
+          (raw.contact as Record<string, string> | undefined)?.phone ||
+          (typeof raw.phone === 'string' ? raw.phone : undefined),
         website:
           (raw.contact as Record<string, string> | undefined)?.website ||
           (typeof raw.websiteLink === 'string' ? raw.websiteLink : undefined),
@@ -230,8 +230,8 @@ export class EventListingPersistenceMapper {
       ...(locationObj.googleMapsLink || input.googleMapsLink
         ? { googleMapsLink: locationObj.googleMapsLink || input.googleMapsLink }
         : {}),
-      ...(input.whatsappLink || input.contact?.whatsapp
-        ? { whatsappLink: input.whatsappLink || input.contact?.whatsapp }
+      ...(input.phone || input.contact?.phone
+        ? { phone: input.phone || input.contact?.phone }
         : {}),
       ...(input.websiteLink || input.contact?.website
         ? { websiteLink: input.websiteLink || input.contact?.website }
@@ -243,8 +243,8 @@ export class EventListingPersistenceMapper {
         ? { bookingLink: input.bookingLink || input.contact?.booking }
         : {}),
       contact: {
-        ...(input.contact?.whatsapp || input.whatsappLink
-          ? { whatsapp: input.contact?.whatsapp || input.whatsappLink }
+        ...(input.contact?.phone || input.phone
+          ? { phone: input.contact?.phone || input.phone }
           : {}),
         ...(input.contact?.website || input.websiteLink
           ? { website: input.contact?.website || input.websiteLink }
@@ -317,7 +317,7 @@ export class EventListingPersistenceMapper {
     }
     if (input.address !== undefined) patch.address = input.address;
     if (input.googleMapsLink !== undefined) patch.googleMapsLink = input.googleMapsLink;
-    if (input.whatsappLink !== undefined) patch.whatsappLink = input.whatsappLink;
+    if (input.phone !== undefined) patch.phone = input.phone;
     if (input.websiteLink !== undefined) patch.websiteLink = input.websiteLink;
     if (input.instagramLink !== undefined) patch.instagramLink = input.instagramLink;
     if (input.bookingLink !== undefined) patch.bookingLink = input.bookingLink;

=== server/domain/events/schemas/eventSchema.ts — diff ===
@@ -1,4 +1,5 @@
 import { z } from 'zod';
+import { E164_MESSAGE, E164_PATTERN } from '../../../shared/kernel/phone';
 
 const optionalUrl = z.string().url().or(z.literal('')).optional();
 
@@ -98,13 +99,13 @@ export const createEventListingSchema = z
     location: z.union([z.string().trim().min(1).max(200), eventLocationSchema]),
     address: z.string().trim().max(500).optional(),
     googleMapsLink: optionalUrl,
-    whatsappLink: z.string().trim().max(100).optional(),
+    phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
     websiteLink: optionalUrl,
     instagramLink: optionalUrl,
     bookingLink: optionalUrl,
     contact: z
       .object({
-        whatsapp: z.string().trim().max(100).optional(),
+        phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
         website: optionalUrl,
         instagram: optionalUrl,
         booking: optionalUrl,
@@ -153,13 +154,13 @@ export const updateEventListingSchema = z
     location: z.union([z.string().trim().min(1).max(200), eventLocationSchema]).optional(),
     address: z.string().trim().max(500).optional(),
     googleMapsLink: optionalUrl,
-    whatsappLink: z.string().trim().max(100).optional(),
+    phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
     websiteLink: optionalUrl,
     instagramLink: optionalUrl,
     bookingLink: optionalUrl,
     contact: z
       .object({
-        whatsapp: z.string().trim().max(100).optional(),
+        phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
         website: optionalUrl,
         instagram: optionalUrl,
         booking: optionalUrl,

=== server/domain/events/types/eventTypes.ts — diff ===
@@ -36,7 +36,7 @@ export interface EventListing {
   organizerId: string;
   location: EventLocation;
   contact?: {
-    whatsapp?: string;
+    phone?: string;
     website?: string;
     instagram?: string;
     booking?: string;
@@ -120,12 +120,12 @@ export interface CreateEventListingInput {
   location: EventLocation | string;
   address?: string;
   googleMapsLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
   contact?: {
-    whatsapp?: string;
+    phone?: string;
     website?: string;
     instagram?: string;
     booking?: string;
@@ -167,12 +167,12 @@ export interface UpdateEventListingInput {
   location?: EventLocation | string;
   address?: string;
   googleMapsLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
   contact?: {
-    whatsapp?: string;
+    phone?: string;
     website?: string;
     instagram?: string;
     booking?: string;

=== server/domain/guide/schemas/guideSchema.ts — diff ===
@@ -1,4 +1,5 @@
 import { z } from 'zod';
+import { E164_MESSAGE, E164_PATTERN } from '../../../shared/kernel/phone';
 
 const optionalUrl = z.string().url().or(z.literal('')).optional();
 
@@ -42,6 +43,28 @@ const operationalInfoSchema = z
       })
       .strict()
       .optional(),
+    // Passeio, translado e aluguel (decisão D9).
+    durationMinutes: z.number().int().min(15).max(10080).optional(),
+    meetingPoint: z.string().trim().max(300).optional(),
+    itinerary: z.string().trim().max(2000).optional(),
+    includes: stringArraySchema.max(30).optional(),
+    transferRoutes: z
+      .array(
+        z
+          .object({
+            from: z.string().trim().min(1).max(100),
+            to: z.string().trim().min(1).max(100),
+          })
+          .strict()
+      )
+      .max(30)
+      .optional(),
+    vehicleTypes: stringArraySchema.max(20).optional(),
+    maxPassengers: z.number().int().min(1).max(100).optional(),
+    luggageInfo: z.string().trim().max(500).optional(),
+    minRentalHours: z.number().int().min(1).max(720).optional(),
+    depositRequired: z.boolean().optional(),
+    driverLicenseRequired: z.boolean().optional(),
     childrenAllowed: z.boolean().optional(),
     petsPolicy: z.string().trim().max(1000).optional(),
     petsExtraCost: z.string().trim().max(200).optional(),
@@ -72,7 +95,7 @@ const commonFields = {
   websiteLink: optionalUrl,
   bookingLink: optionalUrl,
   googleMapsLink: optionalUrl,
-  whatsappLink: z.string().trim().max(100).optional(),
+  phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
   address: z.string().trim().max(500).optional(),
   tags: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
   operationalInfo: operationalInfoSchema.optional(),
@@ -82,7 +105,16 @@ const commonFields = {
 export const createItemSchema = z
   .object({
     ...commonFields,
-    category: z.enum(['restaurant', 'sight', 'tour', 'tips', 'hotel']),
+    category: z.enum([
+      'restaurant',
+      'sight',
+      'tour',
+      'tips',
+      'hotel',
+      'transfer',
+      'rental',
+      'producer',
+    ]),
   })
   .strict();

=== server/domain/guide/types/guideTypes.ts — diff ===
@@ -1,6 +1,15 @@
 export type GuideVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
 
-export type GuideItemCategory = 'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel';
+/** `producer`: perfil de produtor de eventos, sem endereço fixo; não aparece nas listagens do guia. */
+export type GuideItemCategory =
+  | 'restaurant'
+  | 'sight'
+  | 'tour'
+  | 'tips'
+  | 'hotel'
+  | 'transfer'
+  | 'rental'
+  | 'producer';
 
 export interface GuideOperationalInfo {
   tags?: string[];
@@ -22,6 +31,18 @@ export interface GuideOperationalInfo {
     included?: boolean;
     price?: string;
   };
+  /** Passeio, translado e aluguel (decisão D9). */
+  durationMinutes?: number;
+  meetingPoint?: string;
+  itinerary?: string;
+  includes?: string[];
+  transferRoutes?: Array<{ from: string; to: string }>;
+  vehicleTypes?: string[];
+  maxPassengers?: number;
+  luggageInfo?: string;
+  minRentalHours?: number;
+  depositRequired?: boolean;
+  driverLicenseRequired?: boolean;
   checkIn?: {
     from: string;
     to: string;
@@ -56,7 +77,7 @@ export interface GuideCatalogFields {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];
@@ -103,7 +124,7 @@ export interface GuideCreateItemInput {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];
@@ -123,7 +144,7 @@ export interface GuideUpdateItemInput {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];

=== server/domain/partners/adapters/firestorePartnerAdapter.test.ts — diff ===
@@ -294,7 +294,6 @@ describe('FirestorePartnerAdapter', () => {
     it('rejeita termsAccepted=false', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
-          category: 'hotel',
           cpfCnpj: '52998224725',
           termsAccepted: false,
         },
@@ -309,7 +308,6 @@ describe('FirestorePartnerAdapter', () => {
       const uid = 'partner-user-1';
 
       const result = await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
@@ -319,7 +317,6 @@ describe('FirestorePartnerAdapter', () => {
       expect(
         store.get(getDocKey('partners', uid))?.data
       ).toMatchObject({
-        category: 'hotel',
         cpfCnpj: '52998224725',
         cpfCnpjClean: '52998224725',
         isVerified: false,
@@ -344,7 +341,6 @@ describe('FirestorePartnerAdapter', () => {
         store.get(getDocKey('publicPartners', uid))?.data
       ).toMatchObject({
         id: uid,
-        category: 'hotel',
         isVerified: false,
         verifiedUntil: null,
         isVerificationSuspended: false,
@@ -370,7 +366,6 @@ describe('FirestorePartnerAdapter', () => {
 
       await expect(
         adapter.registerPartner('new-user', {
-          category: 'restaurant',
           cpfCnpj: '529.982.247-25',
           termsAccepted: true,
         })
@@ -386,22 +381,18 @@ describe('FirestorePartnerAdapter', () => {
       const uid = 'partner-user-1';
 
       await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
 
       const result = await adapter.registerPartner(uid, {
-        category: 'restaurant',
         cpfCnpj: '529.982.247-25',
         termsAccepted: true,
       });
 
       expect(result.created).toBe(false);
 
-      expect(
-        store.get(getDocKey('partners', uid))?.data.category
-      ).toBe('restaurant');
+      expect(store.get(getDocKey('partners', uid))?.data).not.toHaveProperty('category');
 
       expect(
         store.get(
@@ -417,13 +408,11 @@ describe('FirestorePartnerAdapter', () => {
       const uid = 'partner-user-1';
 
       await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
 
       await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '00.000.000/0001-91',
         termsAccepted: true,
       });
@@ -454,7 +443,6 @@ describe('FirestorePartnerAdapter', () => {
         exists: true,
         version: 1,
         data: {
-          category: 'hotel',
           cpfCnpj: '529.982.247-25',
           businesses: [],
           isVerified: false,
@@ -482,7 +470,6 @@ describe('FirestorePartnerAdapter', () => {
       );
 
       await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '00.000.000/0001-91',
         termsAccepted: true,
       });
@@ -515,7 +502,6 @@ describe('FirestorePartnerAdapter', () => {
         exists: true,
         version: 1,
         data: {
-          category: 'hotel',
           cpfCnpj: '529.982.247-25',
           businesses: [],
           isVerified: false,
@@ -593,7 +579,6 @@ describe('FirestorePartnerAdapter', () => {
       const uid = 'partner-status';
 
       await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
@@ -624,7 +609,6 @@ describe('FirestorePartnerAdapter', () => {
 
     beforeEach(async () => {
       await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
@@ -715,7 +699,6 @@ describe('FirestorePartnerAdapter', () => {
       const uid = 'partner-verification';
 
       await adapter.registerPartner(uid, {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
@@ -752,7 +735,6 @@ describe('FirestorePartnerAdapter', () => {
         adapter.registerPartner(
           'partner-concurrent-A',
           {
-            category: 'hotel',
             cpfCnpj: '52998224725',
             termsAccepted: true,
           }
@@ -760,7 +742,6 @@ describe('FirestorePartnerAdapter', () => {
         adapter.registerPartner(
           'partner-concurrent-B',
           {
-            category: 'restaurant',
             cpfCnpj: '52998224725',
             termsAccepted: true,
           }

=== server/domain/partners/adapters/firestorePartnerAdapter.ts — diff ===
@@ -152,14 +152,12 @@ export class FirestorePartnerAdapter implements PartnerPort {
 
         const nextData = {
           ...oldData,
-          category: data.category,
           cpfCnpjClean: cleanDoc,
           cpfCnpj: data.cpfCnpj,
           termsAccepted: data.termsAccepted,
         };
 
         transaction.update(partnerRef, {
-          category: data.category,
           cpfCnpjClean: cleanDoc,
           cpfCnpj: data.cpfCnpj,
           termsAccepted: data.termsAccepted,
@@ -170,7 +168,6 @@ export class FirestorePartnerAdapter implements PartnerPort {
       } else {
         const nextData = {
           businesses: [],
-          category: data.category,
           cpfCnpjClean: cleanDoc,
           cpfCnpj: data.cpfCnpj,
           hasUsedTrial: false,

=== server/domain/partners/dtos/RegisterPartnerDTO.ts — diff ===
@@ -6,7 +6,6 @@ export class RegisterPartnerDTO {
 
   static fromValidatedInput(input: RegisterPartnerInput): RegisterPartnerDTO {
     return new RegisterPartnerDTO({
-      category: input.formData.category,
       cpfCnpj: input.formData.cpfCnpj,
       termsAccepted: input.formData.termsAccepted,
     });

=== server/domain/partners/index.ts — diff ===
@@ -13,7 +13,6 @@ export { deletePartnerProfileUseCase } from './usecases/deletePartnerProfileUseC
 
 export type {
   PartnerStatus,
-  PartnerCategory,
   PartnerVerificationType,
   PartnerBusinessType,
   PartnerBusiness,

=== server/domain/partners/mappers/partnerMapper.test.ts — diff ===
@@ -3,7 +3,6 @@ import { toPartnerProfileDTO, toPublicPartnerProfileDTO } from './partnerMapper'
 
 describe('partnerMapper', () => {
   const rawPersistenceData = {
-    category: 'restaurant',
     cpfCnpj: '12.345.678/0001-90',
     cpfCnpjClean: '12345678000190',
     businesses: [
@@ -27,7 +26,6 @@ describe('partnerMapper', () => {
 
       expect(dto).toEqual({
         id: 'partner-123',
-        category: 'restaurant',
         cpfCnpj: '12.345.678/0001-90',
         businesses: [
           { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
@@ -47,22 +45,6 @@ describe('partnerMapper', () => {
       expect((dto as any).cpfCnpjClean).toBeUndefined();
     });
 
-    it('deve lançar erro se category for inválida e nunca converter silenciosamente para sight', () => {
-      expect(() =>
-        toPartnerProfileDTO('partner-123', {
-          ...rawPersistenceData,
-          category: 'invalid-cat',
-        })
-      ).toThrow('Categoria Parceiro inválida.');
-
-      expect(() =>
-        toPartnerProfileDTO('partner-123', {
-          ...rawPersistenceData,
-          category: '',
-        })
-      ).toThrow('Categoria Parceiro inválida.');
-    });
-
     it('deve lançar erro se status for inválido', () => {
       expect(() =>
         toPartnerProfileDTO('partner-123', {
@@ -117,16 +99,6 @@ describe('partnerMapper', () => {
       ).toThrow('Status Partner inválido persistido no Firestore.');
     });
 
-    it('deve projetar category como null se category for inválida ou não reconhecida', () => {
-      const publicDto = toPublicPartnerProfileDTO('partner-123', {
-        ...rawPersistenceData,
-        category: 'unknown_cat',
-      });
-
-      expect(publicDto.category).toBeNull();
-      expect(publicDto.category).not.toBe('sight');
-    });
-
     it('deve projetar estritamente campos públicos sem vazar dados sensíveis ou de persistência', () => {
       const publicDto = toPublicPartnerProfileDTO('partner-123', rawPersistenceData);
 
@@ -136,7 +108,6 @@ describe('partnerMapper', () => {
           { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
           { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
         ],
-        category: 'restaurant',
         isVerified: true,
         verifiedUntil: '2026-12-31T23:59:59.000Z',
         isVerificationSuspended: false,

=== server/domain/partners/mappers/partnerMapper.ts — diff ===
@@ -2,7 +2,6 @@ import { PartnerDomainError } from '../errors/partnerDomainError';
 import type {
   PartnerBusiness,
   PartnerBusinessType,
-  PartnerCategory,
   PartnerProfileDTO,
   PartnerStatus,
   PartnerVerificationType,
@@ -49,21 +48,6 @@ function toPartnerVerificationType(value: unknown): PartnerVerificationType {
   );
 }
 
-function toPartnerCategory(value: unknown): PartnerCategory {
-  if (value === 'sight' || value === 'hotel' || value === 'restaurant' || value === 'event') {
-    return value;
-  }
-
-  throw new PartnerDomainError('INVALID_ARGUMENT', 'Categoria Parceiro inválida.');
-}
-
-function toNullablePartnerCategory(value: unknown): PartnerCategory | null {
-  if (value === 'sight' || value === 'hotel' || value === 'restaurant' || value === 'event') {
-    return value;
-  }
-  return null;
-}
-
 function toIsoString(value: unknown): string | null {
   if (!value) return null;
   if (typeof value === 'string') return value;
@@ -91,7 +75,6 @@ export function toPartnerProfileDTO(id: string, raw: Record<string, unknown>): P
   return {
     id,
     businesses,
-    category: toPartnerCategory(raw.category),
     cpfCnpj: typeof raw.cpfCnpj === 'string' ? raw.cpfCnpj : undefined,
     isVerified: raw.isVerified === true,
     verifiedUntil: toIsoString(raw.verifiedUntil),
@@ -120,7 +103,6 @@ export function toPublicPartnerProfileDTO(
   return {
     id: partnerId,
     businesses,
-    category: toNullablePartnerCategory(raw.category),
     isVerified: raw.isVerified === true,
     verifiedUntil: raw.isVerified === true ? toIsoString(raw.verifiedUntil) : null,
     isVerificationSuspended: raw.isVerificationSuspended === true,

=== server/domain/partners/schemas/partnerContentSchema.ts — diff ===
@@ -1,5 +1,6 @@
 import { z } from 'zod';
 import { eventRefundPolicySchema } from '../../events/schemas/eventSchema';
+import { E164_MESSAGE, E164_PATTERN } from '../../../shared/kernel/phone';
 
 const optionalUrl = z.string().url().or(z.literal('')).optional();
 
@@ -43,6 +44,25 @@ const operationalInfoSchema = z
       })
       .strict()
       .optional(),
+    // Passeio, translado e aluguel (decisão D9).
+    durationMinutes: z.number().int().min(15).max(10080).optional(),
+    meetingPoint: z.string().trim().max(300).optional(),
+    itinerary: z.string().trim().max(2000).optional(),
+    includes: stringArraySchema.max(30).optional(),
+    transferRoutes: z
+      .array(
+        z
+          .object({ from: z.string().trim().min(1).max(100), to: z.string().trim().min(1).max(100) })
+          .strict()
+      )
+      .max(30)
+      .optional(),
+    vehicleTypes: stringArraySchema.max(20).optional(),
+    maxPassengers: z.number().int().min(1).max(100).optional(),
+    luggageInfo: z.string().trim().max(500).optional(),
+    minRentalHours: z.number().int().min(1).max(720).optional(),
+    depositRequired: z.boolean().optional(),
+    driverLicenseRequired: z.boolean().optional(),
     childrenAllowed: z.boolean().optional(),
     petsPolicy: z.string().trim().max(1000).optional(),
     petsExtraCost: z.string().trim().max(200).optional(),
@@ -73,7 +93,7 @@ const commonFields = {
   websiteLink: optionalUrl,
   bookingLink: optionalUrl,
   googleMapsLink: optionalUrl,
-  whatsappLink: z.string().trim().max(100).optional(),
+  phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
   address: z.string().trim().max(500).optional(),
   tags: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
   operationalInfo: operationalInfoSchema.optional(),
@@ -83,7 +103,7 @@ const commonFields = {
 export const createPartnerItemSchema = z
   .object({
     ...commonFields,
-    category: z.enum(['restaurant', 'sight', 'tour', 'tips', 'hotel']),
+    category: z.enum(['restaurant', 'sight', 'tour', 'tips', 'hotel', 'transfer', 'rental', 'producer']),
   })
   .strict();

=== server/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -6,7 +6,6 @@ describe('Partner Validation Schemas (Backend)', () => {
     it('should validate complete partner registration payload with valid CPF', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
-          category: 'hotel',
           cpfCnpj: '123.456.789-09',
           termsAccepted: true,
         },
@@ -17,7 +16,6 @@ describe('Partner Validation Schemas (Backend)', () => {
     it('should validate partner registration payload with valid numeric CNPJ', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
-          category: 'restaurant',
           cpfCnpj: '00.000.000/0001-91',
           termsAccepted: true,
         },
@@ -28,7 +26,6 @@ describe('Partner Validation Schemas (Backend)', () => {
     it('should validate partner registration payload with valid alphanumeric CNPJ', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
-          category: 'sight',
           cpfCnpj: '12.ABC.345/01DE-35',
           termsAccepted: true,
         },
@@ -39,7 +36,6 @@ describe('Partner Validation Schemas (Backend)', () => {
     it('should fail when termsAccepted is false', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
-          category: 'hotel',
           cpfCnpj: '123.456.789-09',
           termsAccepted: false,
         },
@@ -50,7 +46,6 @@ describe('Partner Validation Schemas (Backend)', () => {
     it('should fail when cpfCnpj is invalid', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
-          category: 'hotel',
           cpfCnpj: '123.456.789-00',
           termsAccepted: true,
         },
@@ -58,17 +53,6 @@ describe('Partner Validation Schemas (Backend)', () => {
       expect(result.success).toBe(false);
     });
 
-    it('should fail when category is invalid', () => {
-      const result = registerPartnerSchema.safeParse({
-        formData: {
-          category: 'invalid_category',
-          cpfCnpj: '123.456.789-09',
-          termsAccepted: true,
-        },
-      });
-      expect(result.success).toBe(false);
-    });
-
     it('should fail when formData is missing', () => {
       const result = registerPartnerSchema.safeParse({});
       expect(result.success).toBe(false);

=== server/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -1,11 +1,8 @@
 import { z } from 'zod';
 import { isValidCpfCnpj } from '../services/documentIdentity';
 
-const partnerCategorySchema = z.enum(['sight', 'hotel', 'restaurant', 'event']);
-
 const registerPartnerFormSchema = z
   .object({
-    category: partnerCategorySchema,
     cpfCnpj: z
       .string()
       .trim()

=== server/domain/partners/services/partnerService.test.ts — diff ===
@@ -107,32 +107,19 @@ describe('PartnerService', () => {
   describe('registerPartner', () => {
     it('deve chamar registerPartner no port quando os dados forem válidos', async () => {
       await service.registerPartner('user-1', {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
 
       expect(partnerPort.registerPartner).toHaveBeenCalledWith('user-1', {
-        category: 'hotel',
         cpfCnpj: '52998224725',
         termsAccepted: true,
       });
     });
 
-    it('deve lançar erro se categoria for inválida', async () => {
-      await expect(
-        service.registerPartner('user-1', {
-          category: 'invalid-category' as never,
-          cpfCnpj: '52998224725',
-          termsAccepted: true,
-        })
-      ).rejects.toThrow('Categoria de parceiro inválida');
-    });
-
     it('deve lançar erro se CPF/CNPJ for inválido', async () => {
       await expect(
         service.registerPartner('user-1', {
-          category: 'hotel',
           cpfCnpj: '12345678900',
           termsAccepted: true,
         })
@@ -142,7 +129,6 @@ describe('PartnerService', () => {
     it('deve lançar erro se CPF/CNPJ estiver ausente', async () => {
       await expect(
         service.registerPartner('user-1', {
-          category: 'hotel',
           cpfCnpj: '' as never,
           termsAccepted: true,
         })
@@ -152,7 +138,6 @@ describe('PartnerService', () => {
     it('deve lançar erro se termsAccepted for false', async () => {
       await expect(
         service.registerPartner('user-1', {
-          category: 'hotel',
           cpfCnpj: '52998224725',
           termsAccepted: false as never,
         })

=== server/domain/partners/services/partnerService.ts — diff ===
@@ -3,7 +3,6 @@ import { PartnerPort } from '../ports/partnerPort';
 import { isValidCpfCnpj } from '../services/documentIdentity';
 import type {
   PartnerBusiness,
-  PartnerCategory,
   PartnerProfileDocument,
   PartnerRegistrationData,
   PartnerStatus,
@@ -12,13 +11,6 @@ import type {
   RegisterPartnerResult,
 } from '../types/partnerTypes';
 
-const VALID_PARTNER_CATEGORIES = new Set<PartnerCategory>([
-  'sight',
-  'hotel',
-  'restaurant',
-  'event',
-]);
-
 export class PartnerService {
   constructor(private readonly partnerPort: PartnerPort) {}
 
@@ -32,9 +24,6 @@ export class PartnerService {
         'UID do usuário é obrigatório para cadastrar como parceiro'
       );
     }
-    if (!VALID_PARTNER_CATEGORIES.has(data.category)) {
-      throw new PartnerDomainError('INVALID_ARGUMENT', 'Categoria de parceiro inválida');
-    }
     if (!data.cpfCnpj || !isValidCpfCnpj(data.cpfCnpj)) {
       throw new PartnerDomainError('INVALID_ARGUMENT', 'CPF/CNPJ inválido');
     }

=== server/domain/partners/types/partnerTypes.ts — diff ===
@@ -1,7 +1,5 @@
 export type PartnerStatus = 'active' | 'pending' | 'suspended';
 
-export type PartnerCategory = 'sight' | 'hotel' | 'restaurant' | 'event';
-
 /** `admin`: selo concedido pelo admin, sem plano pago. */
 export type PartnerVerificationType =
   | 'trial'
@@ -20,7 +18,6 @@ export interface PartnerBusiness {
 }
 
 export interface PartnerRegistrationData {
-  category: PartnerCategory;
   cpfCnpj: string;
   termsAccepted: true;
 }
@@ -46,7 +43,6 @@ export interface PartnerTrialState {
 
 export interface PartnerPersistenceDocument {
   id: string;
-  category: string;
   cpfCnpj?: string;
   cpfCnpjClean?: string;
   status: PartnerStatus;
@@ -63,7 +59,6 @@ export interface PartnerPersistenceDocument {
 
 export interface PartnerProfileDTO {
   id: string;
-  category: PartnerCategory;
   cpfCnpj?: string;
   status: PartnerStatus;
   businesses: PartnerBusiness[];
@@ -80,7 +75,6 @@ export interface PartnerProfileDTO {
 export interface PublicPartnerProfileDTO {
   id: string;
   businesses: PartnerBusiness[];
-  category: PartnerCategory | null;
   isVerified: boolean;
   verifiedUntil: string | null;
   isVerificationSuspended: boolean;

=== server/domain/seo/services/sitemapService.test.ts — diff ===
@@ -38,7 +38,7 @@ describe('SitemapService', () => {
       '<xhtml:link rel="alternate" hreflang="x-default" href="https://useguide.com.br/" />'
     );
     expect(xml).not.toContain('favoris');
-    // 7 rotas indexáveis + 1 evento, cada um em 3 idiomas.
-    expect(xml.match(/<url>/g)).toHaveLength(24);
+    // 9 rotas indexáveis + 1 evento, cada um em 3 idiomas.
+    expect(xml.match(/<url>/g)).toHaveLength(30);
   });
 });

=== server/domain/seo/types/seoTypes.ts — diff ===
@@ -23,7 +23,14 @@ export interface SeoAlternate {
   href: string;
 }
 
-export type SeoGuideCategory = 'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel';
+export type SeoGuideCategory =
+  | 'restaurant'
+  | 'sight'
+  | 'tour'
+  | 'tips'
+  | 'hotel'
+  | 'transfer'
+  | 'rental';
 
 /** Projeção pública de um item do guia: só campos que podem aparecer no HTML indexável. */
 export interface SeoGuideItem {

=== server/domain/seo/utils/routeSeo.ts — diff ===
@@ -12,6 +12,8 @@ export const CATEGORY_ROUTE_KEY: Record<SeoGuideCategory | 'event', RouteKey> =
   restaurant: 'restaurants',
   hotel: 'stays',
   tour: 'tours',
+  transfer: 'transfers',
+  rental: 'rentals',
   sight: 'attractions',
   tips: 'guide',
   event: 'events',
@@ -77,6 +79,39 @@ export const ROUTE_SEO_TEXTS: Record<RouteKey, Record<Locale, RouteText>> = {
         'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
     },
   },
+  transfers: {
+    'pt-BR': {
+      title: 'Translados em Jericoacoara | Use Guide',
+      description:
+        'Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.',
+    },
+    en: {
+      title: 'Transfers to Jericoacoara | Use Guide',
+      description:
+        'Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.',
+    },
+    fr: {
+      title: 'Transferts à Jericoacoara | Use Guide',
+      description:
+        'Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.',
+    },
+  },
+  rentals: {
+    'pt-BR': {
+      title: 'Aluguéis em Jericoacoara | Use Guide',
+      description:
+        'Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.',
+    },
+    en: {
+      title: 'Rentals in Jericoacoara | Use Guide',
+      description: 'Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.',
+    },
+    fr: {
+      title: 'Locations à Jericoacoara | Use Guide',
+      description:
+        'Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.',
+    },
+  },
   stays: {
     'pt-BR': {
       title: 'Melhores Hospedagens & Pousadas | Use Guide',

=== server/domain/seo/utils/structuredData.ts — diff ===
@@ -7,6 +7,8 @@ const SCHEMA_TYPE_BY_CATEGORY: Record<SeoGuideItem['category'], string> = {
   hotel: 'LodgingBusiness',
   sight: 'TouristAttraction',
   tour: 'TouristTrip',
+  transfer: 'TaxiService',
+  rental: 'LocalBusiness',
   tips: 'Article',
 };

=== server/shared/kernel/localizedRoutes.ts — diff ===
@@ -4,6 +4,8 @@ export const ROUTE_KEYS = [
   'explore',
   'events',
   'tours',
+  'transfers',
+  'rentals',
   'stays',
   'restaurants',
   'attractions',
@@ -19,6 +21,8 @@ export const LOCALIZED_ROUTES: Record<RouteKey, Record<Locale, string>> = {
   explore: { 'pt-BR': '/', en: '/en', fr: '/fr' },
   events: { 'pt-BR': '/eventos', en: '/en/events', fr: '/fr/evenements' },
   tours: { 'pt-BR': '/passeios', en: '/en/tours', fr: '/fr/excursions' },
+  transfers: { 'pt-BR': '/translados', en: '/en/transfers', fr: '/fr/transferts' },
+  rentals: { 'pt-BR': '/alugueis', en: '/en/rentals', fr: '/fr/locations' },
   stays: { 'pt-BR': '/pousadas', en: '/en/stays', fr: '/fr/hebergements' },
   restaurants: { 'pt-BR': '/restaurantes', en: '/en/restaurants', fr: '/fr/restaurants' },
   attractions: { 'pt-BR': '/pontos', en: '/en/attractions', fr: '/fr/attractions' },

=== server/shared/kernel/phone.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { E164_PATTERN } from './phone';

describe('E164_PATTERN', () => {
  it('aceita telefone internacional e recusa formatos locais', () => {
    expect(E164_PATTERN.test('+5588999999999')).toBe(true);
    expect(E164_PATTERN.test('+351912345678')).toBe(true);
    expect(E164_PATTERN.test('(88) 99999-9999')).toBe(false);
    expect(E164_PATTERN.test('5588999999999')).toBe(false);
    expect(E164_PATTERN.test('+0123456789')).toBe(false);
    expect(E164_PATTERN.test('https://wa.me/5588999999999')).toBe(false);
  });
});

=== server/shared/kernel/phone.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Telefone em E.164: "+" e de 8 a 15 dígitos, o primeiro diferente de zero (AGENTS.md §12.4).
 * Ex: +5588999999999. O link do WhatsApp é montado a partir dele na exibição.
 */
export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export const E164_MESSAGE = 'Telefone deve estar no formato internacional, ex: +5588999999999.';

=== src/app/routes/AppRoutes.tsx — diff ===
@@ -10,11 +10,21 @@ import { NotFoundView } from '../../ui/components/NotFoundView';
 import { PageLayout } from '../../ui/layouts/PageLayout';
 import { CheckoutResultComposition } from '../compositions/CheckoutResultComposition';
 
-type GridCategory = 'event' | 'tour' | 'hotel' | 'restaurant' | 'sight' | 'tips';
+type GridCategory =
+  | 'event'
+  | 'tour'
+  | 'transfer'
+  | 'rental'
+  | 'hotel'
+  | 'restaurant'
+  | 'sight'
+  | 'tips';
 
 const GRID_CATEGORY: Record<Exclude<RouteKey, 'explore'>, GridCategory> = {
   events: 'event',
   tours: 'tour',
+  transfers: 'transfer',
+  rentals: 'rental',
   stays: 'hotel',
   restaurants: 'restaurant',
   attractions: 'sight',

=== src/domain/admin/application/mappers/adminGuideEditorMapper.ts — diff ===
@@ -25,7 +25,7 @@ export function toGuideItemInput(
     instagramLink: data.instagramLink,
     websiteLink: data.websiteLink,
     bookingLink: data.bookingLink,
-    whatsappLink: data.whatsappLink,
+    phone: data.phone,
     googleMapsLink: data.googleMapsLink,
     address: data.address,
     tags: data.tags,
@@ -68,7 +68,7 @@ export function toGuideEventInput(
     instagramLink: data.instagramLink,
     websiteLink: data.websiteLink,
     bookingLink: data.bookingLink,
-    whatsappLink: data.whatsappLink,
+    phone: data.phone,
     googleMapsLink: data.googleMapsLink,
     address: data.address,
     isActive: data.isActive,

=== src/domain/admin/components/subcomponents/AdminEditorLocation.tsx — diff ===
@@ -1,9 +1,10 @@
 import React from 'react';
 import { useFormContext } from 'react-hook-form';
 import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';
+import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
 
 export function AdminEditorLocation() {
-  const { register } = useFormContext<AdminGuideEditorSchemaValues>();
+  const { register, watch, setValue } = useFormContext<AdminGuideEditorSchemaValues>();
 
   return (
     <div className="pt-4 pb-2" id="links-integrations-section">
@@ -36,14 +37,16 @@ export function AdminEditorLocation() {
           />
         </div>
         <div className="space-y-2">
-          <label className="text-[9px] font-bold uppercase tracking-widest text-[#25D366] px-2">
-            WhatsApp
+          <label
+            htmlFor="admin-editor-phone"
+            className="text-[9px] font-bold uppercase tracking-widest text-[#25D366] px-2"
+          >
+            Telefone / WhatsApp
           </label>
-          <input
-            type="text"
-            placeholder="Link do WhatsApp..."
-            {...register('whatsappLink')}
-            className="w-full bg-[#25D366]/[0.05] border border-[#25D366]/20 rounded-xl p-4 text-base focus:outline-none focus:border-[#25D366]/50 transition-all placeholder:text-white/50"
+          <E164PhoneField
+            id="admin-editor-phone"
+            value={watch('phone')}
+            onChange={(e164) => setValue('phone', e164, { shouldDirty: true })}
           />
         </div>
         <div className="space-y-2">

=== src/domain/admin/components/subcomponents/AdminEditorModal.tsx — diff ===
@@ -96,7 +96,7 @@ export function AdminEditorModal({
       customCategory: isEditing?.customCategory,
       googleMapsLink: isEditing?.googleMapsLink,
       instagramLink: isEditing?.instagramLink,
-      whatsappLink: isEditing?.whatsappLink,
+      phone: isEditing?.phone,
       websiteLink: isEditing?.websiteLink,
       bookingLink: isEditing?.bookingLink,
       operationalInfo: isEditing?.operationalInfo as Record<string, unknown> | undefined,

=== src/domain/admin/components/subcomponents/AdminPartnersView.tsx — diff ===
@@ -81,7 +81,9 @@ export function AdminPartnersView({
                 </p>
                 <div className="flex flex-wrap items-center gap-3 mt-2">
                   <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase text-white/50 border border-white/10">
-                    Cat: {partner.category}
+                    {partner.listingsCount === 1
+                      ? '1 cadastro'
+                      : `${partner.listingsCount} cadastros`}
                   </span>
                   {(() => {
                     const badge = STATUS_BADGE[partner.status];

=== src/domain/admin/schemas/adminGuideEditorFormSchema.ts — diff ===
@@ -42,7 +42,7 @@ export const adminGuideEditorFormSchema = z
     customCategory: z.string().optional(),
     googleMapsLink: z.string().optional(),
     instagramLink: z.string().optional(),
-    whatsappLink: z.string().optional(),
+    phone: z.string().optional(),
     websiteLink: z.string().optional(),
     bookingLink: z.string().optional(),
     operationalInfo: z.record(z.string(), z.unknown()).optional(),

=== src/domain/admin/schemas/adminGuideEditorSchema.ts — diff ===
@@ -116,7 +116,7 @@ export const adminGuideItemFormSchema = z.object({
   instagramLink: optionalUrl,
   websiteLink: optionalUrl,
   bookingLink: optionalUrl,
-  whatsappLink: z.string().trim().max(100).optional(),
+  phone: z.string().trim().max(100).optional(),
   googleMapsLink: optionalUrl,
   address: z.string().trim().max(500).optional(),
   tags: z
@@ -142,7 +142,7 @@ export const adminGuideEventFormSchema = z.object({
   instagramLink: optionalUrl,
   websiteLink: optionalUrl,
   bookingLink: optionalUrl,
-  whatsappLink: z.string().trim().max(100).optional(),
+  phone: z.string().trim().max(100).optional(),
   googleMapsLink: optionalUrl,
   address: z.string().trim().max(500).optional(),
   tags: z

=== src/domain/admin/types/admin.ts — diff ===
@@ -29,7 +29,7 @@ export interface AdminPartnerSummary {
   firstName: string;
   lastName: string;
   email: string;
-  category: string;
+  listingsCount: number;
   status: 'active' | 'pending' | 'suspended';
   isVerified: boolean;
   verifiedUntil: string | null;

=== src/domain/content/components/SupportView.tsx — diff ===
@@ -18,6 +18,7 @@ import {
 import { cn } from '../../../shared/utils/cn';
 import { FAQCategoryType } from '../types/content';
 import { FAQ_DATA } from '../data/faqItems';
+import { whatsAppUrl } from '../../../shared/utils/phone';
 
 interface SupportViewProps {
   onBack: () => void;
@@ -31,8 +32,11 @@ export function SupportView({ onBack, userEmail }: SupportViewProps) {
   const [copiedEmail, setCopiedEmail] = useState(false);
 
   const supportEmail = 'atendimento@useguide.com.br';
-  const whatsappUrl =
-    'https://wa.me/5588999999999?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20Use%20Guide.';
+  // Número real vem da configuração (AGENTS.md §11.10: nada de número fictício no código).
+  const whatsappUrl = whatsAppUrl(
+    import.meta.env.VITE_SUPPORT_WHATSAPP?.trim(),
+    'Olá, preciso de suporte no Use Guide.'
+  );
 
   const filteredFaqs = FAQ_DATA.filter((item) => {
     const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
@@ -68,24 +72,26 @@ export function SupportView({ onBack, userEmail }: SupportViewProps) {
       </div>
 
       <div className="grid grid-cols-2 gap-2 mb-4">
-        <a
-          href={whatsappUrl}
-          target="_blank"
-          rel="noopener noreferrer"
-          className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all text-left group"
-        >
-          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
-            <MessageSquare size={16} />
-          </div>
-          <div className="overflow-hidden">
-            <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-400">
-              WhatsApp
-            </span>
-            <span className="block text-[8px] text-emerald-300/60 truncate">
-              Atendimento humano
-            </span>
-          </div>
-        </a>
+        {whatsappUrl && (
+          <a
+            href={whatsappUrl}
+            target="_blank"
+            rel="noopener noreferrer"
+            className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all text-left group"
+          >
+            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
+              <MessageSquare size={16} />
+            </div>
+            <div className="overflow-hidden">
+              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-400">
+                WhatsApp
+              </span>
+              <span className="block text-[8px] text-emerald-300/60 truncate">
+                Atendimento humano
+              </span>
+            </div>
+          </a>
+        )}
 
         <button
           onClick={handleCopyEmail}

=== src/domain/events/types/event.ts — diff ===
@@ -45,7 +45,7 @@ export interface EventListing {
   organizerId: string;
   location: EventLocation;
   contact?: {
-    whatsapp?: string;
+    phone?: string;
     website?: string;
     instagram?: string;
     booking?: string;
@@ -115,7 +115,7 @@ export interface CreateEventListingInput {
   location: EventLocation | string;
   address?: string;
   googleMapsLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;

=== src/domain/guide/adapters/firebaseGuideCatalogAdapter.ts — diff ===
@@ -24,7 +24,7 @@ export function mapGuideItem(record: Record<string, unknown>): GuideItem {
     instagramLink: typeof record.instagramLink === 'string' ? record.instagramLink : undefined,
     websiteLink: typeof record.websiteLink === 'string' ? record.websiteLink : undefined,
     bookingLink: typeof record.bookingLink === 'string' ? record.bookingLink : undefined,
-    whatsappLink: typeof record.whatsappLink === 'string' ? record.whatsappLink : undefined,
+    phone: typeof record.phone === 'string' ? record.phone : undefined,
     googleMapsLink: typeof record.googleMapsLink === 'string' ? record.googleMapsLink : undefined,
     address: typeof record.address === 'string' ? record.address : undefined,
     tags: Array.isArray(record.tags)
@@ -104,7 +104,10 @@ export class FirebaseGuideCatalogAdapter implements GuideCatalogPort {
     const unsubscribeItems = subscribeToCollectionUseCase(
       'items',
       (records) => {
-        items = records.map(mapGuideItem).filter((item) => item.isActive !== false);
+        // Perfil de produtor não é item do guia: só serve de vínculo para os eventos (decisão D9).
+        items = records
+          .map(mapGuideItem)
+          .filter((item) => item.isActive !== false && item.category !== 'producer');
         emit();
       },
       onError

=== src/domain/guide/components/EventDetailModal.tsx — diff ===
@@ -16,6 +16,7 @@ import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
 import { useScrollBorderRadius } from '../../../ui/hooks/useScrollBorderRadius';
+import { whatsAppUrl } from '../../../shared/utils/phone';
 
 interface EventDetailModalProps {
   item: GuideItem | null;
@@ -196,12 +197,12 @@ export function EventDetailModal({ item, onClose }: EventDetailModalProps) {
             </GlassCard>
           )}
 
-          {item.whatsappLink && (
+          {whatsAppUrl(item.phone) && (
             <GlassCard
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 trackInteraction(item.id, 'whatsapp_click', 'events', item.partnerId);
-                window.open(item.whatsappLink, '_blank', 'noopener,noreferrer');
+                window.open(whatsAppUrl(item.phone) ?? '', '_blank', 'noopener,noreferrer');
               }}
               className="col-span-2 p-4 bg-[#25D366]/10 border-[#25D366]/20 text-center cursor-pointer hover:bg-[#25D366]/20 transition-all group flex flex-col items-center justify-center gap-1"
             >

=== src/domain/guide/components/ItemDetailModal.tsx — diff ===
@@ -28,6 +28,7 @@ import {
   DAY_KEYS,
   DAY_LABELS_SHORT,
 } from '../../../shared/utils/operatingHoursStatus';
+import { whatsAppUrl } from '../../../shared/utils/phone';
 
 interface ItemDetailModalProps {
   item: GuideItem | null;
@@ -289,12 +290,12 @@ export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
             </p>
           </GlassCard>
 
-          {item.whatsappLink && (
+          {whatsAppUrl(item.phone) && (
             <GlassCard
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 trackInteraction(item.id, 'whatsapp_click', 'items', item.partnerId);
-                window.open(item.whatsappLink, '_blank', 'noopener,noreferrer');
+                window.open(whatsAppUrl(item.phone) ?? '', '_blank', 'noopener,noreferrer');
               }}
               className="col-span-2 p-6 bg-[#25D366]/10 border-[#25D366]/20 text-center cursor-pointer hover:bg-[#25D366]/20 transition-all group"
             >

=== src/domain/guide/components/RestaurantDetailModal.tsx — diff ===
@@ -14,6 +14,7 @@ import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
 import { useScrollBorderRadius } from '../../../ui/hooks/useScrollBorderRadius';
+import { whatsAppUrl } from '../../../shared/utils/phone';
 
 interface RestaurantDetailModalProps {
   item: GuideItem | null;
@@ -178,12 +179,12 @@ export function RestaurantDetailModal({ item, onClose }: RestaurantDetailModalPr
             </GlassCard>
           )}
 
-          {item.whatsappLink && (
+          {whatsAppUrl(item.phone) && (
             <GlassCard
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 trackInteraction(item.id, 'whatsapp_click', 'items', item.partnerId);
-                window.open(item.whatsappLink, '_blank', 'noopener,noreferrer');
+                window.open(whatsAppUrl(item.phone) ?? '', '_blank', 'noopener,noreferrer');
               }}
               className="col-span-2 p-6 bg-[#25D366]/10 border-[#25D366]/20 text-center cursor-pointer hover:bg-[#25D366]/20 transition-all group"
             >

=== src/domain/guide/components/StayDetailModal.tsx — diff ===
@@ -14,6 +14,7 @@ import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
 import { useScrollBorderRadius } from '../../../ui/hooks/useScrollBorderRadius';
+import { whatsAppUrl } from '../../../shared/utils/phone';
 
 interface StayDetailModalProps {
   item: GuideItem | null;
@@ -166,12 +167,12 @@ export function StayDetailModal({ item, onClose }: StayDetailModalProps) {
         </div>
 
         <div className="grid grid-cols-2 gap-4">
-          {item.whatsappLink && (
+          {whatsAppUrl(item.phone) && (
             <GlassCard
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 trackInteraction(item.id, 'whatsapp_click', 'items', item.partnerId);
-                window.open(item.whatsappLink, '_blank', 'noopener,noreferrer');
+                window.open(whatsAppUrl(item.phone) ?? '', '_blank', 'noopener,noreferrer');
               }}
               className="col-span-2 p-4 bg-[#25D366]/10 border-[#25D366]/20 text-center cursor-pointer hover:bg-[#25D366]/20 transition-all group flex flex-col items-center justify-center gap-1"
             >

=== src/domain/guide/components/TourDetailModal.tsx — diff ===
@@ -14,6 +14,7 @@ import { trackInteractionUseCase as trackInteraction } from '../../insights';
 import { FavoriteButton } from '../../favorites/components/FavoriteButton';
 import { ShareButton } from '../../../ui/components/ShareButton';
 import { useScrollBorderRadius } from '../../../ui/hooks/useScrollBorderRadius';
+import { whatsAppUrl } from '../../../shared/utils/phone';
 
 interface TourDetailModalProps {
   item: GuideItem | null;
@@ -168,12 +169,12 @@ export function TourDetailModal({ item, onClose, bookingPanel }: TourDetailModal
         </div>
 
         <div className="grid grid-cols-2 gap-4">
-          {item.whatsappLink && (
+          {whatsAppUrl(item.phone) && (
             <GlassCard
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 trackInteraction(item.id, 'whatsapp_click', 'items', item.partnerId);
-                window.open(item.whatsappLink, '_blank', 'noopener,noreferrer');
+                window.open(whatsAppUrl(item.phone) ?? '', '_blank', 'noopener,noreferrer');
               }}
               className="col-span-2 p-4 bg-[#25D366]/10 border-[#25D366]/20 text-center cursor-pointer hover:bg-[#25D366]/20 transition-all group flex flex-col items-center justify-center gap-1"
             >

=== src/domain/guide/types/guide.ts — diff ===
@@ -39,7 +39,16 @@ export interface GuideItemOperationalInfo {
   >;
 }
 
-export type GuideItemCategory = 'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel';
+/** `producer`: perfil de produtor de eventos; não aparece nas listagens do guia (decisão D9). */
+export type GuideItemCategory =
+  | 'restaurant'
+  | 'sight'
+  | 'tour'
+  | 'tips'
+  | 'hotel'
+  | 'transfer'
+  | 'rental'
+  | 'producer';
 
 export type GuideContentType = 'item' | 'event';
 
@@ -61,7 +70,7 @@ export interface GuideItem {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];
@@ -93,7 +102,7 @@ export interface GuideCreateItemInput {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];

=== src/domain/partners/application/mappers/partnerFormMapper.test.ts — diff ===
@@ -10,7 +10,7 @@ describe('partnerFormMapper', () => {
     description: 'Frutos do mar e vista da praia',
     location: 'jeri',
     address: 'Rua Principal, 100',
-    whatsappLink: '88999999999',
+    phone: '88999999999',
     instagramLink: 'https://instagram.com/maraberto',
     websiteLink: 'https://maraberto.com.br',
     bookingLink: '',

=== src/domain/partners/application/mappers/partnerFormMapper.ts — diff ===
@@ -1,3 +1,4 @@
+import { splitE164 } from '../../../../shared/utils/phone';
 import type { PartnerContentRecord } from '../../types/partnerContent';
 import type { FormState } from '../../types/partsForm';
 
@@ -76,8 +77,8 @@ export const mapItemToFormData = (item: PartnerContentRecord, partnerCpfCnpj = '
     category: item.category || '',
     description: item.description || '',
     cpfCnpj: partnerCpfCnpj,
-    phone: item.whatsappLink || '',
-    phoneDdi: '+55',
+    phone: splitE164(item.phone).nationalNumber,
+    phoneDdi: splitE164(item.phone).ddi,
     instagram: item.instagramLink || '',
     website: item.websiteLink || '',
     bookingLinks: item.bookingLink || '',

=== src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts — diff ===
@@ -10,7 +10,8 @@ describe('mapPartnerSubmissionToGuideItem', () => {
     description: 'Descrição de teste',
     region: 'Jericoacoara',
     address: 'Rua Principal, 100',
-    phone: '85999999999',
+    phone: '(85) 99999-9999',
+    phoneDdi: '+55',
     instagram: '@teste',
     website: 'https://teste.com',
     bookingLinks: 'https://booking.com',
@@ -101,4 +102,24 @@ describe('mapPartnerSubmissionToGuideItem', () => {
       'Ao menos uma imagem é obrigatória'
     );
   });
+
+  it('grava o telefone em E.164', () => {
+    const result = mapPartnerSubmissionToGuideItem(baseData, ['https://img1.jpg']);
+    expect(result.phone).toBe('+5585999999999');
+  });
+
+  it('perfil de produtor pode não ter fotos; estabelecimento precisa de ao menos uma', () => {
+    const producer = mapPartnerSubmissionToGuideItem(
+      { ...baseData, category: 'producer', description: '' },
+      []
+    );
+    expect(producer.category).toBe('producer');
+    expect(producer.operationalInfo).toBeUndefined();
+    expect(() => mapPartnerSubmissionToGuideItem(baseData, [])).toThrow();
+  });
+
+  it('não força o item como ativo (a edição não reativa item desativado)', () => {
+    const result = mapPartnerSubmissionToGuideItem(baseData, ['https://img1.jpg']);
+    expect(result).not.toHaveProperty('isActive');
+  });
 });

=== src/domain/partners/application/mappers/partnerSubmissionToGuide.ts — diff ===
@@ -1,4 +1,5 @@
 import type { PartnerContentItemInput } from '../../types/partnerContent';
+import { toE164 } from '../../../../shared/utils/phone';
 import type { PartnerSubmissionData } from '../../types/partner';
 
 function toGuideItemCategory(value: string): PartnerContentItemInput['category'] {
@@ -9,6 +10,8 @@ function toGuideItemCategory(value: string): PartnerContentItemInput['category']
       return 'restaurant';
     case 'sight':
       return 'sight';
+    case 'producer':
+      return 'producer';
     default:
       throw new Error('Categoria de Partner incompatível com conteúdo do Guide.');
   }
@@ -71,12 +74,12 @@ export function mapPartnerSubmissionToGuideItem(
   if (!formData.region?.trim()) {
     throw new Error('Região é obrigatória');
   }
-  if (imageUrls.length === 0) {
+  const category = toGuideItemCategory(formData.category);
+  // Perfil de produtor pode não ter fotos; estabelecimentos precisam de ao menos uma.
+  if (imageUrls.length === 0 && category !== 'producer') {
     throw new Error('Ao menos uma imagem é obrigatória');
   }
 
-  const category = toGuideItemCategory(formData.category);
-
   return {
     name: formData.businessName,
     description: formData.description,
@@ -87,10 +90,9 @@ export function mapPartnerSubmissionToGuideItem(
     instagramLink: formData.instagram,
     websiteLink: formData.website,
     bookingLink: formData.bookingLinks,
-    whatsappLink: formData.phone,
+    phone: toE164(formData.phoneDdi, formData.phone),
     googleMapsLink: formData.googleMaps,
     address: formData.address,
     operationalInfo: buildOperationalInfo(formData),
-    isActive: true,
   };
 }

=== src/domain/partners/components/PartnerEventForm.tsx — diff ===
@@ -22,10 +22,11 @@ import {
   partnerEventFormSchema,
   type PartnerEventFormValues,
 } from '../schemas/partnerEventFormSchema';
-import type { PartnerBusiness, PartnerCategory } from '../types/partner';
+import type { PartnerBusiness } from '../types/partner';
 import type { PartnerContentEditorState } from '../types/partnerContent';
 import { businessDateTimeToIso, isoToBusinessDateTime } from '../../../shared/utils/businessDateTime';
 import { EVENT_CATEGORIES } from '../../events';
+import { E164PhoneField } from '../../../ui/components/E164PhoneField';
 
 
 function RegionDropdown({
@@ -101,7 +102,6 @@ interface PartnerEventFormProps {
   onChange: (updatedItem: PartnerContentEditorState) => void;
   isUploading: boolean;
   onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
-  partnerCategory?: PartnerCategory | null;
   businesses?: PartnerBusiness[];
   renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
 }
@@ -111,7 +111,6 @@ export function PartnerEventForm({
   onChange,
   isUploading,
   onImageUpload,
-  partnerCategory,
   businesses,
   renderEventTicketingManager,
 }: PartnerEventFormProps) {
@@ -138,18 +137,13 @@ export function PartnerEventForm({
       images: item?.images || [],
       image: item?.image || '',
       entryType: item?.entryType || 'gratuito',
-      whatsappLink: item?.whatsappLink || '',
+      phone: item?.phone || '',
       websiteLink: item?.websiteLink || '',
       instagramLink: item?.instagramLink || '',
       address: item?.address || '',
     });
   }, [item, reset]);
 
-  const requiresEstablishment =
-    partnerCategory === 'hotel' ||
-    partnerCategory === 'restaurant' ||
-    partnerCategory === 'sight';
-
   const partnerEstablishments = (businesses ?? []).filter(
     (business) => business.type === 'item'
   );
@@ -190,10 +184,11 @@ export function PartnerEventForm({
         </div>
 
         <div className="space-y-4">
-          {requiresEstablishment && (
+          {/* Todo evento pertence a um estabelecimento ou ao perfil de produtor (decisão D9). */}
+          {(
             <div className="space-y-2 relative" ref={establishmentRef}>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                Estabelecimento do Evento <span className="text-rose-500 font-bold">*</span>
+                Estabelecimento ou perfil de produtor <span className="text-rose-500 font-bold">*</span>
               </label>
               {isEditingExistingEvent ? (
                 <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/70 text-sm flex items-center justify-between cursor-not-allowed">
@@ -449,17 +444,11 @@ export function PartnerEventForm({
             <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
               WhatsApp de Contato / Reservas
             </label>
-            <div className="relative">
-              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
-              <input
-                type="text"
-                placeholder="(85) 99999-9999"
-                value={item.whatsappLink || ''}
-                onChange={(e) => updateField('whatsappLink', e.target.value)}
-                maxLength={300}
-                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
-              />
-            </div>
+            <E164PhoneField
+              id="partner-event-phone"
+              value={item.phone}
+              onChange={(e164) => updateField('phone', e164)}
+            />
           </div>
 
           <div className="space-y-2">

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -95,7 +95,6 @@ export function PartnerPanel({
     setErrors,
     dataLoading,
     isVerified,
-    isEventProducer,
     itemsList,
     eventsList,
     handleDelete,
@@ -142,13 +141,6 @@ export function PartnerPanel({
     }
   }, [editorFormData, editorMethods]);
 
-  // Efeito reativo estrutural para garantir que parceiros cadastrados como produtores de eventos fiquem e usem unicamente a aba de eventos
-  React.useEffect(() => {
-    if (isEventProducer && activeTab === 'items') {
-      setActiveTab('events');
-    }
-  }, [isEventProducer, activeTab, setActiveTab]);
-
   // Efeito estratégico para bloquear scroll do body e corrigir deslocamento de cabeçalho no mobile devido ao teclado
   React.useEffect(() => {
     if (isEditing) {
@@ -184,7 +176,7 @@ export function PartnerPanel({
     { id: 'sight', label: 'Atrações Turísticas', icon: <Sparkles size={16} /> },
     { id: 'hotel', label: 'Hospedagem', icon: <Bed size={16} /> },
     { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={16} /> },
-    { id: 'event', label: 'Produtor de Eventos', icon: <Calendar size={16} /> },
+    { id: 'producer', label: 'Perfil de produtor de eventos', icon: <Calendar size={16} /> },
   ];
 
   if (userLoading || profileStatus === 'loading') {
@@ -232,7 +224,6 @@ export function PartnerPanel({
         <PartnerTabsNavigation
           activeTab={activeTab}
           setActiveTab={setActiveTab}
-          isEventProducer={isEventProducer}
           isVerified={isVerified}
         />
 
@@ -355,7 +346,6 @@ export function PartnerPanel({
                 onChange={(updatedItem) => setIsEditing(updatedItem)}
                 isUploading={isUploading}
                 onImageUpload={handleImageUpload}
-                partnerCategory={partnerProfile?.category}
                 businesses={partnerProfile?.businesses}
                 renderEventTicketingManager={renderEventTicketingManager}
               />

=== src/domain/partners/components/PartnersModal.tsx — diff ===
@@ -40,7 +40,7 @@ const CATEGORIES = [
   { id: 'sight', label: 'Atrações turísticas', icon: <Camera size={18} /> },
   { id: 'hotel', label: 'Hospedagem', icon: <Bed size={18} /> },
   { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={18} /> },
-  { id: 'event', label: 'Produtor de Eventos', icon: <Sparkles size={18} /> },
+  { id: 'producer', label: 'Eventos (sou produtor)', icon: <Sparkles size={18} /> },
 ];
 
 const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
@@ -165,7 +165,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                         disabled={
                           !formData.category ||
                           !formData.cpfCnpj ||
-                          (formData.category !== 'event' &&
+                          (formData.category !== 'producer' &&
                             (!formData.businessName || !formData.description))
                         }
                         onClick={() => {
@@ -177,7 +177,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                           'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                           !formData.category ||
                             !formData.cpfCnpj ||
-                            (formData.category !== 'event' &&
+                            (formData.category !== 'producer' &&
                               (!formData.businessName || !formData.description))
                             ? 'bg-white/5 text-white/50 cursor-not-allowed'
                             : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
@@ -219,7 +219,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                         type="button"
                         disabled={(() => {
                           if (!formData.phone) return true;
-                          if (formData.category !== 'event') {
+                          if (formData.category !== 'producer') {
                             if (!formData.region || !formData.googleMaps) return true;
                             if (formData.category === 'hotel' && !formData.bookingLinks)
                               return true;
@@ -228,14 +228,14 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                         })()}
                         onClick={() => {
                           if (validateStep2()) {
-                            setCurrentStep(formData.category === 'event' ? 5 : 3);
+                            setCurrentStep(formData.category === 'producer' ? 5 : 3);
                           }
                         }}
                         className={cn(
                           'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                           (() => {
                             if (!formData.phone) return true;
-                            if (formData.category !== 'event') {
+                            if (formData.category !== 'producer') {
                               if (!formData.region || !formData.googleMaps) return true;
                               if (formData.category === 'hotel' && !formData.bookingLinks)
                                 return true;
@@ -431,7 +431,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                     <div className="flex items-center gap-4 pt-4 pb-10">
                       <button
                         type="button"
-                        onClick={() => setCurrentStep(formData.category === 'event' ? 2 : 4)}
+                        onClick={() => setCurrentStep(formData.category === 'producer' ? 2 : 4)}
                         className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
                       >
                         <ChevronLeft size={14} />
@@ -441,7 +441,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                         type="button"
                         disabled={
                           !formData.termsAccepted ||
-                          (formData.images.length === 0 && formData.category !== 'event') ||
+                          (formData.images.length === 0 && formData.category !== 'producer') ||
                           (!currentUser &&
                             (!formData.firstName ||
                               !formData.email ||
@@ -461,7 +461,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                         className={cn(
                           'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
                           !formData.termsAccepted ||
-                            (formData.images.length === 0 && formData.category !== 'event') ||
+                            (formData.images.length === 0 && formData.category !== 'producer') ||
                             (!currentUser &&
                               (!formData.firstName ||
                                 !formData.email ||

=== src/domain/partners/components/sections/StepNavigation.tsx — diff ===
@@ -7,14 +7,14 @@ interface StepNavigationProps {
 }
 
 export function StepNavigation({ category, currentStep }: StepNavigationProps) {
-  const steps = category === 'event' ? [1, 2, 5] : [1, 2, 3, 4, 5];
+  const steps = category === 'producer' ? [1, 2, 5] : [1, 2, 3, 4, 5];
 
   return (
     <div className="flex items-center gap-1.5 mt-1" id="step-navigation-indicators">
       {steps.map((step, idx) => {
         const isActive = currentStep === step;
         const isCompleted =
-          category === 'event' ? steps.indexOf(currentStep) > idx : currentStep > step;
+          category === 'producer' ? steps.indexOf(currentStep) > idx : currentStep > step;
 
         return (
           <div

=== src/domain/partners/components/steps/Step1CompanyInfo.tsx — diff ===
@@ -62,7 +62,7 @@ export function Step1CompanyInfo({
     setFormData((prev: any) => ({ ...prev, description: sliced }));
   };
 
-  const isEventProducer = formData.category === 'event';
+  const isEventProducer = formData.category === 'producer';
 
   return (
     <div className="space-y-6">
@@ -152,7 +152,8 @@ export function Step1CompanyInfo({
             {/* Nome da Empresa */}
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                Nome da Empresa {!isEventProducer && <span className="text-red-500">*</span>}
+                {isEventProducer ? 'Nome do Produtor' : 'Nome da Empresa'}{' '}
+                <span className="text-red-500">*</span>
               </label>
               <input
                 type="text"

=== src/domain/partners/components/steps/Step2ContactInfo.tsx — diff ===
@@ -330,7 +330,7 @@ export function Step2ContactInfo({
         </div>
       ) : formData.category === 'restaurant' ||
         formData.category === 'sight' ||
-        formData.category === 'event' ? (
+        formData.category === 'producer' ? (
         <div className="space-y-4">
           {/* Telefone / WhatsApp */}
           <div className="space-y-2">
@@ -365,7 +365,7 @@ export function Step2ContactInfo({
                   type="text"
                   value={formData.instagram || ''}
                   onChange={(e) => updateFieldValue('instagram', e.target.value)}
-                  placeholder={formData.category === 'event' ? '@perfil_evento' : '@perfil'}
+                  placeholder={formData.category === 'producer' ? '@perfil_evento' : '@perfil'}
                   maxLength={300}
                   className={cn(
                     'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
@@ -381,9 +381,9 @@ export function Step2ContactInfo({
                 )}
               </div>
             </div>
-            <div className={cn('space-y-2', formData.category === 'event' && 'hidden')}>
+            <div className={cn('space-y-2', formData.category === 'producer' && 'hidden')}>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                {formData.category === 'event' ? 'Site / Link Vendas' : 'Site Próprio'}
+                {formData.category === 'producer' ? 'Site / Link Vendas' : 'Site Próprio'}
               </label>
               <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
@@ -413,7 +413,7 @@ export function Step2ContactInfo({
 
           {/* Google Maps e Endereço */}
           <div className="space-y-4 pt-2">
-            <div className={cn('space-y-2', formData.category === 'event' && 'hidden')}>
+            <div className={cn('space-y-2', formData.category === 'producer' && 'hidden')}>
               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                 Link Google Maps{' '}
                 {(formData.category === 'restaurant' || formData.category === 'sight') && (

=== src/domain/partners/components/steps/Step5Media.tsx — diff ===
@@ -445,7 +445,7 @@ export function Step5Media({
       )}
 
       {/* Section: Photos */}
-      {formData.category !== 'event' && (
+      {formData.category !== 'producer' && (
         <div className="space-y-6">
           <div className="flex items-center gap-2">
             <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">

=== src/domain/partners/components/subcomponents/PartnerTabsNavigation.tsx — diff ===
@@ -5,33 +5,28 @@ import { cn } from '../../../../shared/utils/cn';
 interface PartnerTabsNavigationProps {
   activeTab: 'items' | 'events' | 'reports';
   setActiveTab: (tab: 'items' | 'events' | 'reports') => void;
-  isEventProducer: boolean;
   isVerified: boolean;
 }
 
 export function PartnerTabsNavigation({
   activeTab,
   setActiveTab,
-  isEventProducer,
   isVerified,
 }: PartnerTabsNavigationProps) {
   return (
-    <div className={cn('grid gap-3', isEventProducer ? 'grid-cols-2' : 'grid-cols-3')}>
-      {/* Exibe "Meus Itens" somente se o parceiro não for estritamente de eventos */}
-      {!isEventProducer && (
-        <button
-          type="button"
-          onClick={() => setActiveTab('items')}
-          className={cn(
-            'py-4 rounded-2xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer',
-            activeTab === 'items'
-              ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20'
-              : 'glassmorphism text-white/50 hover:bg-white/5 bg-white/3'
-          )}
-        >
-          <Layers size={14} /> Meus Itens
-        </button>
-      )}
+    <div className="grid grid-cols-3 gap-3">
+      <button
+        type="button"
+        onClick={() => setActiveTab('items')}
+        className={cn(
+          'py-4 rounded-2xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer',
+          activeTab === 'items'
+            ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20'
+            : 'glassmorphism text-white/50 hover:bg-white/5 bg-white/3'
+        )}
+      >
+        <Layers size={14} /> Meus Itens
+      </button>
 
       {/* Aba de Agenda de Eventos */}
       <button

=== src/domain/partners/hooks/usePartnerContentActions.ts — diff ===
@@ -10,6 +10,7 @@ import {
   updatePartnerContentEventUseCase,
   updatePartnerContentItemUseCase,
 } from '../index';
+import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
 import { partnerEventFormSchema } from '../schemas/partnerEventFormSchema';
 import type { PartnerProfile } from '../types/partner';
 import type {
@@ -23,19 +24,6 @@ function getErrorMessage(error: unknown, fallback: string): string {
   return error instanceof Error && error.message ? error.message : fallback;
 }
 
-function toPartnerItemCategory(value: string): PartnerContentItemInput['category'] {
-  switch (value) {
-    case 'hotel':
-      return 'hotel';
-    case 'restaurant':
-      return 'restaurant';
-    case 'sight':
-      return 'sight';
-    default:
-      throw new Error('Categoria de item inválida.');
-  }
-}
-
 function toPlainRecord(value: object): Record<string, unknown> {
   return Object.fromEntries(Object.entries(value));
 }
@@ -115,13 +103,8 @@ export function usePartnerContentActions({
   const handleSaveEvent = useCallback(async () => {
     if (!isEditing || !user?.uid) return;
 
-    const requiresEstablishment =
-      partnerProfile?.category === 'hotel' ||
-      partnerProfile?.category === 'restaurant' ||
-      partnerProfile?.category === 'sight';
-
-    if (!isEditing.id && requiresEstablishment && !isEditing.establishmentId?.trim()) {
-      showToast('Selecione o estabelecimento ao qual o evento pertence.', 'error');
+    if (!isEditing.id && !isEditing.establishmentId?.trim()) {
+      showToast('Selecione o estabelecimento ou o perfil de produtor do evento.', 'error');
       return;
     }
 
@@ -138,7 +121,7 @@ export function usePartnerContentActions({
       images: isEditing.images ?? [],
       image: isEditing.image,
       entryType: isEditing.entryType || 'gratuito',
-      whatsappLink: isEditing.whatsappLink,
+      phone: isEditing.phone,
       websiteLink: isEditing.websiteLink,
       instagramLink: isEditing.instagramLink,
       address: isEditing.address,
@@ -164,11 +147,11 @@ export function usePartnerContentActions({
         eventCategory: isEditing.eventCategory || 'geral',
         customCategory: isEditing.customCategory,
         entryType: parsedEvent.data.entryType,
-        establishmentId: requiresEstablishment ? isEditing.establishmentId : undefined,
+        establishmentId: isEditing.establishmentId,
         instagramLink: isEditing.instagramLink,
         websiteLink: isEditing.websiteLink,
         bookingLink: isEditing.bookingLink,
-        whatsappLink: isEditing.whatsappLink,
+        phone: isEditing.phone,
         googleMapsLink: isEditing.googleMapsLink,
         address: isEditing.address,
         tags: isEditing.tags,
@@ -191,7 +174,7 @@ export function usePartnerContentActions({
     } finally {
       setIsLoading(false);
     }
-  }, [isEditing, user?.uid, partnerProfile?.category, setIsLoading, setIsEditing, showToast]);
+  }, [isEditing, user?.uid, setIsLoading, setIsEditing, showToast]);
 
   const handleSaveItem = useCallback(
     async (phoneValidateFn: () => boolean) => {
@@ -224,71 +207,11 @@ export function usePartnerContentActions({
           return;
         }
 
-        const itemData: PartnerContentItemInput = {
-          name: editorFormData.businessName,
-          description: editorFormData.description,
-          category: toPartnerItemCategory(editorFormData.category),
-          image: validUrls[0] || '',
-          images: validUrls,
-          location: editorFormData.region.trim(),
-          instagramLink: editorFormData.instagram,
-          websiteLink: editorFormData.website,
-          bookingLink: editorFormData.bookingLinks,
-          whatsappLink: editorFormData.phone,
-          googleMapsLink: editorFormData.googleMaps,
-          address: editorFormData.address,
-          operationalInfo: {
-            ...(editorFormData.category === 'hotel' && {
-              childrenAllowed:
-                editorFormData.childrenAllowed !== null
-                  ? editorFormData.childrenAllowed
-                  : undefined,
-              petsPolicy: editorFormData.petsPolicy,
-              petsExtraCost: editorFormData.petsExtraCost,
-              checkIn: {
-                from: editorFormData.checkInFrom,
-                to: editorFormData.checkInTo,
-              },
-              checkOut: {
-                from: editorFormData.checkOutFrom,
-                to: editorFormData.checkOutTo,
-              },
-              languages: editorFormData.languages,
-              amenities: editorFormData.amenities,
-              breakfast: {
-                serves:
-                  editorFormData.servesBreakfast !== null
-                    ? editorFormData.servesBreakfast
-                    : undefined,
-                included:
-                  editorFormData.breakfastIncluded !== null
-                    ? editorFormData.breakfastIncluded
-                    : undefined,
-                price: editorFormData.breakfastPrice,
-                types: editorFormData.breakfastTypes,
-              },
-            }),
-            ...(editorFormData.category === 'restaurant' && {
-              subcategory: editorFormData.subcategory,
-              cuisineType: editorFormData.cuisineType,
-              mealTypes: editorFormData.mealTypes,
-              additionalServices: editorFormData.additionalServices,
-              amenities: editorFormData.amenitiesRestaurant,
-              operatingHours: editorFormData.operatingHours,
-              languages: editorFormData.languages,
-              menuLink: editorFormData.menuLink || '',
-            }),
-            ...(editorFormData.category === 'sight' && {
-              activities: editorFormData.sightActivities,
-              services: editorFormData.sightServices,
-              amenities: editorFormData.sightAmenities,
-              access: editorFormData.sightAccessType || undefined,
-              price: editorFormData.sightPrice,
-              operatingHours: editorFormData.operatingHours,
-              languages: editorFormData.languages,
-            }),
-          },
-        };
+        // Mesma conversão da inscrição: o editor mostra e grava exatamente os campos do formulário.
+        const itemData: PartnerContentItemInput = mapPartnerSubmissionToGuideItem(
+          editorFormData,
+          validUrls
+        );
 
         if (!itemId) {
           await createPartnerContentItemUseCase(itemData);

=== src/domain/partners/hooks/usePartnerContentCatalog.ts — diff ===
@@ -45,7 +45,7 @@ export function usePartnerContentCatalog({ userId, activeTab }: UsePartnerConten
           instagramLink: item.instagramLink,
           websiteLink: item.websiteLink,
           bookingLink: item.bookingLink,
-          whatsappLink: item.whatsappLink,
+          phone: item.phone,
           googleMapsLink: item.googleMapsLink,
           address: item.address,
           tags: item.tags,
@@ -77,7 +77,7 @@ export function usePartnerContentCatalog({ userId, activeTab }: UsePartnerConten
           instagramLink: event.instagramLink,
           websiteLink: event.websiteLink,
           bookingLink: event.bookingLink,
-          whatsappLink: event.whatsappLink,
+          phone: event.phone,
           googleMapsLink: event.googleMapsLink,
           address: event.address,
           tags: event.tags,

=== src/domain/partners/hooks/usePartnerPanelActions.ts — diff ===
@@ -13,9 +13,7 @@ export { getEmptyFormData, mapItemToFormData, isValidUrl };
 export function usePartnerPanelActions(profileData?: PartnerProfile) {
   const layout = usePartnerLayoutState();
 
-  const profile = usePartnerProfile(profileData, (autoTab) => {
-    layout.setActiveTab(autoTab);
-  });
+  const profile = usePartnerProfile(profileData);
 
   const items = usePartnerItems({
     user: profile.user,
@@ -41,7 +39,6 @@ export function usePartnerPanelActions(profileData?: PartnerProfile) {
     partnerProfile: profile.partnerProfile,
     profileStatus: profile.profileStatus,
     isVerified: profile.isVerified,
-    isEventProducer: profile.isEventProducer,
 
     activeTab: layout.activeTab,
     setActiveTab: layout.setActiveTab,

=== src/domain/partners/hooks/usePartnerProfile.test.ts — diff ===
@@ -46,7 +46,6 @@ describe('usePartnerProfile', () => {
 
   const mockLoadedProfile: PartnerProfile = {
     id: 'partner-user-1',
-    category: 'hotel',
     businessName: 'Pousada Sol',
     businessId: 'bus-1',
     businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
@@ -99,7 +98,6 @@ describe('usePartnerProfile', () => {
 
     const mockPublicPartner: PublicPartnerProfile = {
       id: 'partner-user-1',
-      category: 'hotel',
       businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol Atualizada', type: 'item' }],
       isVerified: true,
       verifiedUntil: '2026-12-31T23:59:59.000Z',
@@ -124,7 +122,6 @@ describe('usePartnerProfile', () => {
 
     const mockPublicPartner: PublicPartnerProfile = {
       id: 'partner-user-1',
-      category: 'hotel',
       businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
       isVerified: true,
       verifiedUntil: '2027-01-01T00:00:00.000Z',

=== src/domain/partners/hooks/usePartnerProfile.ts — diff ===
@@ -57,10 +57,7 @@ function handleFirestoreError(
   console.error('Firestore Error [Domain Profile]:', JSON.stringify(errInfo));
 }
 
-export function usePartnerProfile(
-  loadedProfile?: PartnerProfile,
-  onAutoSwitchTab?: (tab: 'events' | 'items') => void
-) {
+export function usePartnerProfile(loadedProfile?: PartnerProfile) {
   const [user, setUser] = useState<UserSession | null>(null);
   const [userLoading, setUserLoading] = useState(true);
 
@@ -114,13 +111,6 @@ export function usePartnerProfile(
   const [profileError, setProfileError] = useState<string | null>(null);
   const [profileStatus, setProfileStatus] = useState<'loading' | 'ready' | 'empty'>('loading');
 
-  const hasAutoSwitchedRef = useRef(false);
-  const onAutoSwitchTabRef = useRef(onAutoSwitchTab);
-
-  useEffect(() => {
-    onAutoSwitchTabRef.current = onAutoSwitchTab;
-  }, [onAutoSwitchTab]);
-
   useEffect(() => {
     if (userLoading || !user) {
       return;
@@ -147,26 +137,6 @@ export function usePartnerProfile(
           return;
         }
 
-        const category = publicPartner.category ?? loadedProfile?.category;
-
-        if (!category) {
-          const error = new Error('Categoria do parceiro ausente ou inválida.');
-
-          handleFirestoreError(error, OperationType.GET, path, user);
-
-          setProfileError('Não foi possível validar a categoria do parceiro.');
-
-          if (loadedProfile) {
-            setPartnerProfile(loadedProfile);
-            setProfileStatus('ready');
-          } else {
-            setPartnerProfile(null);
-            setProfileStatus('empty');
-          }
-
-          return;
-        }
-
         const businesses = publicPartner.businesses ?? loadedProfile?.businesses ?? [];
         const firstBusiness = businesses[0];
 
@@ -175,7 +145,6 @@ export function usePartnerProfile(
           id: targetPartnerId,
           businessId: firstBusiness?.businessId ?? loadedProfile?.businessId ?? null,
           businessName: firstBusiness?.businessName ?? loadedProfile?.businessName ?? '',
-          category,
           businesses,
           cpfCnpj: loadedProfile?.cpfCnpj,
           firstName: userProfileData?.firstName ?? loadedProfile?.firstName ?? '',
@@ -201,14 +170,6 @@ export function usePartnerProfile(
         setPartnerProfile(partnerProfileData);
         setProfileStatus('ready');
 
-        if (
-          publicPartner.category === 'event' &&
-          onAutoSwitchTabRef.current &&
-          !hasAutoSwitchedRef.current
-        ) {
-          hasAutoSwitchedRef.current = true;
-          onAutoSwitchTabRef.current('events');
-        }
       },
       (error) => {
         handleFirestoreError(error, OperationType.GET, path, user);
@@ -234,7 +195,6 @@ export function usePartnerProfile(
     (!partnerProfile?.verifiedUntil || new Date(partnerProfile.verifiedUntil) > new Date())
   );
 
-  const isEventProducer = partnerProfile?.category === 'event';
 
   const isStep1Valid = (): boolean => {
     if (!editorFormData?.category) return false;
@@ -352,7 +312,6 @@ export function usePartnerProfile(
     setIsUploading,
     profileError,
     isVerified,
-    isEventProducer,
     isStep1Valid,
     validateStep2,
     validateStep3,

=== src/domain/partners/hooks/usePartnerRegistrationSubmission.ts — diff ===
@@ -5,7 +5,7 @@ import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerS
 import { createOrUpdatePartnerProfileUseCase } from '../application/usecases/createOrUpdatePartnerProfileUseCase';
 import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
 import { partnerSubmissionSchema } from '../schemas/partnerSchema';
-import type { PartnerCategory, PartnerRegistrationPayload } from '../types/partner';
+import type { PartnerRegistrationPayload } from '../types/partner';
 import type { FormState } from '../types/partsForm';
 
 function isFirebaseAuthError(error: unknown, code: string): boolean {
@@ -17,19 +17,6 @@ function isFirebaseAuthError(error: unknown, code: string): boolean {
   );
 }
 
-function toPartnerCategory(value: string): PartnerCategory {
-  switch (value) {
-    case 'sight':
-    case 'hotel':
-    case 'restaurant':
-    case 'event':
-      return value;
-
-    default:
-      throw new Error('Categoria de Partner inválida.');
-  }
-}
-
 export function mapPartnerRegistrationPayload(formData: FormState): PartnerRegistrationPayload {
   if (formData.termsAccepted !== true) {
     throw new Error('Você precisa aceitar os termos de parceria.');
@@ -42,7 +29,6 @@ export function mapPartnerRegistrationPayload(formData: FormState): PartnerRegis
   }
 
   return {
-    category: toPartnerCategory(formData.category),
     cpfCnpj,
     termsAccepted: true,
   };
@@ -103,18 +89,8 @@ export function usePartnerRegistrationSubmission({
 
       const imageUrls = await uploadPartnerImages(values.images);
 
-      if (values.category !== 'event') {
-        const category = toPartnerCategory(values.category);
-
-        const guideItem = mapPartnerSubmissionToGuideItem(
-          {
-            ...values,
-            category,
-          },
-          imageUrls
-        );
-        await createPartnerContentItemUseCase(guideItem);
-      }
+      // O primeiro cadastro (estabelecimento ou perfil de produtor) nasce junto com o parceiro.
+      await createPartnerContentItemUseCase(mapPartnerSubmissionToGuideItem(values, imageUrls));
 
       if (setCurrentStep) setCurrentStep(6);
       setIsSubmitting(false);

=== src/domain/partners/schemas/partnerEventFormSchema.ts — diff ===
@@ -20,7 +20,7 @@ export const partnerEventFormSchema = z
     images: z.array(z.string()).min(1, 'Ao menos uma imagem é obrigatória.'),
     image: z.string().optional(),
     entryType: eventEntryTypeSchema.default('gratuito'),
-    whatsappLink: z.string().optional(),
+    phone: z.string().optional(),
     websiteLink: z.string().optional(),
     instagramLink: z.string().optional(),
     address: z.string().optional(),

=== src/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -66,7 +66,7 @@ describe('Partner Validation Schemas (Frontend)', () => {
       expect(result.success).toBe(false);
     });
 
-    it('deve aceitar categorias válidas: hotel, restaurant, sight, tour, event', () => {
+    it('deve aceitar categorias válidas: hotel, restaurant, sight, tour, producer', () => {
       for (const category of ['hotel', 'restaurant', 'sight', 'tour']) {
         const res = step1Schema.safeParse({
           category,
@@ -77,13 +77,21 @@ describe('Partner Validation Schemas (Frontend)', () => {
         expect(res.success).toBe(true);
       }
 
-      const resEvent = step1Schema.safeParse({
-        category: 'event',
+      // Perfil de produtor: nome obrigatório, descrição opcional.
+      const resProducer = step1Schema.safeParse({
+        category: 'producer',
+        businessName: 'Produtora Sol',
+        cpfCnpj: VALID_TEST_CPF,
+        description: '',
+      });
+      expect(resProducer.success).toBe(true);
+      const producerWithoutName = step1Schema.safeParse({
+        category: 'producer',
         businessName: '',
         cpfCnpj: VALID_TEST_CPF,
         description: '',
       });
-      expect(resEvent.success).toBe(true);
+      expect(producerWithoutName.success).toBe(false);
     });
   });

=== src/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -2,7 +2,8 @@ import { z } from 'zod';
 import { isValidCpfCnpj } from '../../../shared/utils/documentValidator';
 import type { UserSession } from '../../auth';
 
-const partnerCategorySchema = z.enum(['sight', 'hotel', 'restaurant', 'event']);
+// Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos.
+const partnerCategorySchema = z.enum(['sight', 'hotel', 'restaurant', 'producer']);
 
 export const step1Schema = z
   .object({
@@ -15,14 +16,17 @@ export const step1Schema = z
     description: z.string().default(''),
   })
   .superRefine((data, ctx) => {
-    if (data.category !== 'event') {
-      if (!data.businessName || data.businessName.trim() === '') {
-        ctx.addIssue({
-          code: z.ZodIssueCode.custom,
-          path: ['businessName'],
-          message: 'Nome do estabelecimento é obrigatório',
-        });
-      }
+    if (!data.businessName || data.businessName.trim() === '') {
+      ctx.addIssue({
+        code: z.ZodIssueCode.custom,
+        path: ['businessName'],
+        message:
+          data.category === 'producer'
+            ? 'Nome do produtor é obrigatório'
+            : 'Nome do estabelecimento é obrigatório',
+      });
+    }
+    if (data.category !== 'producer') {
       if (!data.description || data.description.trim() === '') {
         ctx.addIssue({
           code: z.ZodIssueCode.custom,
@@ -59,7 +63,7 @@ export const step2Schema = z
         message: 'Link para reserva é obrigatório',
       });
     }
-    if (data.category !== 'event') {
+    if (data.category !== 'producer') {
       if (!data.googleMaps || data.googleMaps.trim() === '') {
         ctx.addIssue({
           code: z.ZodIssueCode.custom,
@@ -219,7 +223,7 @@ export const step5SchemaContext = (options: { currentUser?: UserSession | null }
       termsAccepted: z.literal(true),
     })
     .superRefine((data, ctx) => {
-      if (data.category !== 'event' && data.images.length === 0) {
+      if (data.category !== 'producer' && data.images.length === 0) {
         ctx.addIssue({
           code: z.ZodIssueCode.custom,
           path: ['images'],

=== src/domain/partners/types/partner.ts — diff ===
@@ -4,12 +4,12 @@ export interface PartnerBusiness {
   type: 'item' | 'event';
 }
 
-export type PartnerCategory = 'sight' | 'hotel' | 'restaurant' | 'event';
+/** Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos. */
+export type PartnerSignupCategory = 'sight' | 'hotel' | 'restaurant' | 'producer';
 
 export interface PublicPartnerProfile {
   id: string;
   businesses: PartnerBusiness[];
-  category: PartnerCategory | null;
   isVerified: boolean;
   verifiedUntil: string | null;
   isVerificationSuspended: boolean;
@@ -17,7 +17,6 @@ export interface PublicPartnerProfile {
 }
 
 export interface PartnerRegistrationPayload {
-  category: PartnerCategory;
   cpfCnpj: string;
   termsAccepted: true;
 }
@@ -25,12 +24,14 @@ export interface PartnerRegistrationPayload {
 export interface PartnerSubmissionData {
   businessName: string;
   description: string;
-  category: PartnerCategory;
+  /** Categoria do cadastro (validada na conversão para item do guia). */
+  category: string;
   region: string;
   instagram: string;
   website: string;
   bookingLinks: string;
   phone: string;
+  phoneDdi: string;
   googleMaps: string;
   address: string;
   firstName: string;
@@ -76,7 +77,6 @@ export interface PartnerProfile {
   id: string;
   businessId?: string | null;
   businessName: string;
-  category: PartnerCategory;
   businesses?: PartnerBusiness[];
   cpfCnpj?: string;
   phone?: string;

=== src/domain/partners/types/partnerContent.ts — diff ===
@@ -43,7 +43,16 @@ export interface PartnerOperationalInfo {
   >;
 }
 
-export type PartnerContentCategory = 'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel' | 'event';
+export type PartnerContentCategory =
+  | 'restaurant'
+  | 'sight'
+  | 'tour'
+  | 'tips'
+  | 'hotel'
+  | 'transfer'
+  | 'rental'
+  | 'producer'
+  | 'event';
 export type EventEntryType = 'pago' | 'gratuito';
 
 export type PartnerContentEditorState = Omit<PartnerContentRecord, 'category'> & {
@@ -64,7 +73,7 @@ export interface PartnerContentRecord {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];
@@ -87,14 +96,14 @@ export interface PartnerContentRecord {
 export interface PartnerContentItemInput {
   name: string;
   description: string;
-  category: 'sight' | 'hotel' | 'restaurant';
+  category: 'sight' | 'hotel' | 'restaurant' | 'tour' | 'transfer' | 'rental' | 'producer';
   image: string;
   images: string[];
   location: string;
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];
@@ -117,7 +126,7 @@ export interface PartnerContentEventInput {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
+  phone?: string;
   googleMapsLink?: string;
   address?: string;
   tags?: string[];

=== src/shared/constants/categories.ts — diff ===
@@ -19,13 +19,31 @@ export const CATEGORIES = {
   },
   tour: {
     id: 'tour',
-    label: 'Aventura',
+    label: 'Passeios',
     colorClass: 'text-cyan-400',
     bgClass: 'bg-cyan-500/10',
     borderClass: 'border-cyan-500/20',
     badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
     icon: 'Compass',
   },
+  transfer: {
+    id: 'transfer',
+    label: 'Translados',
+    colorClass: 'text-sky-400',
+    bgClass: 'bg-sky-500/10',
+    borderClass: 'border-sky-500/20',
+    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/20',
+    icon: 'Car',
+  },
+  rental: {
+    id: 'rental',
+    label: 'Aluguéis',
+    colorClass: 'text-orange-400',
+    bgClass: 'bg-orange-500/10',
+    borderClass: 'border-orange-500/20',
+    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/20',
+    icon: 'Bike',
+  },
   hotel: {
     id: 'hotel',
     label: 'Hospedagem',
@@ -44,6 +62,15 @@ export const CATEGORIES = {
     badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
     icon: 'Info',
   },
+  producer: {
+    id: 'producer',
+    label: 'Produtor de eventos',
+    colorClass: 'text-fuchsia-400',
+    bgClass: 'bg-fuchsia-500/10',
+    borderClass: 'border-fuchsia-500/20',
+    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/20',
+    icon: 'Sparkles',
+  },
   event: {
     id: 'event',
     label: 'Evento',

=== src/shared/constants/countryCodes.ts — ARQUIVO NOVO, conteúdo completo ===
/** DDIs oferecidos no campo de telefone. */
export const COUNTRY_CODES = [
  { code: '+55', name: 'Brasil' },
  { code: '+1', name: 'EUA/Canadá' },
  { code: '+351', name: 'Portugal' },
  { code: '+34', name: 'Espanha' },
  { code: '+33', name: 'França' },
  { code: '+44', name: 'Reino Unido' },
  { code: '+49', name: 'Alemanha' },
  { code: '+39', name: 'Itália' },
  { code: '+54', name: 'Argentina' },
  { code: '+598', name: 'Uruguai' },
  { code: '+56', name: 'Chile' },
  { code: '+57', name: 'Colômbia' },
  { code: '+52', name: 'México' },
  { code: '+81', name: 'Japão' },
  { code: '+86', name: 'China' },
] as const;

=== src/shared/i18n/localizedRoutes.test.ts — diff ===
@@ -41,6 +41,6 @@ describe('localizedRoutes', () => {
   it('favoritos e reservas não são páginas: abrem no menu lateral', () => {
     expect(parseLocalizedPath('/favoritos')).toBeNull();
     expect(parseLocalizedPath('/en/bookings')).toBeNull();
-    expect(ROUTE_KEYS).toHaveLength(7);
+    expect(ROUTE_KEYS).toHaveLength(9);
   });
 });

=== src/shared/i18n/localizedRoutes.ts — diff ===
@@ -4,6 +4,8 @@ export const ROUTE_KEYS = [
   'explore',
   'events',
   'tours',
+  'transfers',
+  'rentals',
   'stays',
   'restaurants',
   'attractions',
@@ -19,6 +21,8 @@ export const LOCALIZED_ROUTES: Record<RouteKey, Record<Locale, string>> = {
   explore: { 'pt-BR': '/', en: '/en', fr: '/fr' },
   events: { 'pt-BR': '/eventos', en: '/en/events', fr: '/fr/evenements' },
   tours: { 'pt-BR': '/passeios', en: '/en/tours', fr: '/fr/excursions' },
+  transfers: { 'pt-BR': '/translados', en: '/en/transfers', fr: '/fr/transferts' },
+  rentals: { 'pt-BR': '/alugueis', en: '/en/rentals', fr: '/fr/locations' },
   stays: { 'pt-BR': '/pousadas', en: '/en/stays', fr: '/fr/hebergements' },
   restaurants: { 'pt-BR': '/restaurantes', en: '/en/restaurants', fr: '/fr/restaurants' },
   attractions: { 'pt-BR': '/pontos', en: '/en/attractions', fr: '/fr/attractions' },

=== src/shared/i18n/resources.ts — diff ===
@@ -22,6 +22,8 @@ export interface TranslationResource {
     pageTitles: {
       events: string;
       tours: string;
+      transfers: string;
+      rentals: string;
       accommodations: string;
       restaurants: string;
       attractions: string;
@@ -137,6 +139,8 @@ export interface TranslationResource {
       explore: { title: string; description: string };
       events: { title: string; description: string };
       tours: { title: string; description: string };
+      transfers: { title: string; description: string };
+      rentals: { title: string; description: string };
       stays: { title: string; description: string };
       restaurants: { title: string; description: string };
       attractions: { title: string; description: string };
@@ -202,6 +206,8 @@ const ptBR: TranslationResource = {
     pageTitles: {
       events: 'Eventos & Experiências',
       tours: 'Aventura & Passeios',
+      transfers: 'Translados',
+      rentals: 'Aluguéis',
       accommodations: 'Melhores Hospedagens',
       restaurants: 'Sabores Locais',
       attractions: 'Atrações',
@@ -331,6 +337,16 @@ const ptBR: TranslationResource = {
         title: 'Aventura & Passeios | Use Guide',
         description: 'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
       },
+      transfers: {
+        title: "Translados em Jericoacoara | Use Guide",
+        description:
+          "Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.",
+      },
+      rentals: {
+        title: "Aluguéis em Jericoacoara | Use Guide",
+        description:
+          "Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.",
+      },
       stays: {
         title: 'Melhores Hospedagens & Pousadas | Use Guide',
         description: 'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
@@ -413,6 +429,8 @@ const en: TranslationResource = {
     pageTitles: {
       events: 'Events & Experiences',
       tours: 'Adventure & Tours',
+      transfers: 'Transfers',
+      rentals: 'Rentals',
       accommodations: 'Best Accommodations',
       restaurants: 'Local Flavors',
       attractions: 'Attractions',
@@ -540,6 +558,16 @@ const en: TranslationResource = {
         title: 'Adventure & Tours | Use Guide',
         description: 'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
       },
+      transfers: {
+        title: "Transfers to Jericoacoara | Use Guide",
+        description:
+          "Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.",
+      },
+      rentals: {
+        title: "Rentals in Jericoacoara | Use Guide",
+        description:
+          "Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.",
+      },
       stays: {
         title: 'Best Stays & Inns | Use Guide',
         description: 'A curated selection of the best inns, boutique hotels and beachfront resorts in Jeri, Preá and Barrinha.',
@@ -622,6 +650,8 @@ const fr: TranslationResource = {
     pageTitles: {
       events: 'Événements & Expériences',
       tours: 'Aventure & Excursions',
+      transfers: 'Transferts',
+      rentals: 'Locations',
       accommodations: 'Meilleurs Hébergements',
       restaurants: 'Saveurs Locales',
       attractions: 'Attractions',
@@ -754,6 +784,16 @@ const fr: TranslationResource = {
         title: 'Aventure & Excursions | Use Guide',
         description: 'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
       },
+      transfers: {
+        title: "Transferts à Jericoacoara | Use Guide",
+        description:
+          "Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.",
+      },
+      rentals: {
+        title: "Locations à Jericoacoara | Use Guide",
+        description:
+          "Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.",
+      },
       stays: {
         title: 'Meilleurs Hébergements | Use Guide',
         description: 'Une sélection des meilleures pousadas, hôtels boutique et resorts en bord de mer à Jeri, Preá et Barrinha.',

=== src/shared/utils/phone.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { splitE164, toE164, whatsAppUrl } from './phone';

describe('telefone em E.164', () => {
  it('monta E.164 a partir do DDI e do número com máscara', () => {
    expect(toE164('+55', '(88) 99999-9999')).toBe('+5588999999999');
    expect(toE164('+351', '912 345 678')).toBe('+351912345678');
    expect(toE164('+55', '')).toBeUndefined();
    expect(toE164('+55', '123')).toBeUndefined();
  });

  it('separa DDI e número para a edição, preferindo o DDI mais longo conhecido', () => {
    expect(splitE164('+5588999999999')).toEqual({ ddi: '+55', nationalNumber: '88999999999' });
    expect(splitE164('+351912345678')).toEqual({ ddi: '+351', nationalNumber: '912345678' });
    expect(splitE164(undefined)).toEqual({ ddi: '+55', nationalNumber: '' });
  });

  it('link do WhatsApp só para telefone válido', () => {
    expect(whatsAppUrl('+5588999999999')).toBe('https://wa.me/5588999999999');
    expect(whatsAppUrl('+5588999999999', 'Olá!')).toBe(
      'https://wa.me/5588999999999?text=Ol%C3%A1!'
    );
    expect(whatsAppUrl('(88) 99999-9999')).toBeNull();
    expect(whatsAppUrl(undefined)).toBeNull();
  });
});

=== src/shared/utils/phone.ts — ARQUIVO NOVO, conteúdo completo ===
import { COUNTRY_CODES } from '../constants/countryCodes';

// Telefone é gravado em E.164 (AGENTS.md §12.4); o link do WhatsApp é montado na exibição.
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const DEFAULT_DDI = '+55';

/** DDI + número digitado (com ou sem máscara) → E.164; `undefined` se vazio ou inválido. */
export function toE164(ddi: string, nationalNumber: string): string | undefined {
  const ddiDigits = ddi.replace(/\D/g, '');
  const numberDigits = nationalNumber.replace(/\D/g, '');
  if (!ddiDigits || !numberDigits) return undefined;
  const e164 = `+${ddiDigits}${numberDigits}`;
  return E164_PATTERN.test(e164) ? e164 : undefined;
}

/** E.164 → DDI e número, para preencher o campo de telefone na edição. */
export function splitE164(e164: string | undefined): { ddi: string; nationalNumber: string } {
  if (!e164 || !E164_PATTERN.test(e164)) {
    return { ddi: DEFAULT_DDI, nationalNumber: '' };
  }
  const known = [...COUNTRY_CODES]
    .map((country) => country.code as string)
    .sort((a, b) => b.length - a.length)
    .find((code) => e164.startsWith(code));
  const ddi = known ?? e164.slice(0, 3);
  return { ddi, nationalNumber: e164.slice(ddi.length) };
}

/** Link do WhatsApp para um telefone em E.164; `null` se o telefone não for válido. */
export function whatsAppUrl(e164: string | undefined, text?: string): string | null {
  if (!e164 || !E164_PATTERN.test(e164)) return null;
  const base = `https://wa.me/${e164.slice(1)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

=== src/ui/components/E164PhoneField.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { splitE164, toE164 } from '../../shared/utils/phone';
import { PhoneInputField } from './PhoneInputField';

interface E164PhoneFieldProps {
  id: string;
  /** Telefone em E.164 (ex: +5588999999999) ou vazio. */
  value: string | undefined;
  onChange: (e164: string | undefined) => void;
}

/** Campo de telefone com DDI que entrega o valor já em E.164 (AGENTS.md §12.4). */
export function E164PhoneField({ id, value, onChange }: E164PhoneFieldProps) {
  const [{ ddi, nationalNumber }, setParts] = useState(() => splitE164(value));

  const update = (next: { ddi: string; nationalNumber: string }) => {
    setParts(next);
    onChange(toE164(next.ddi, next.nationalNumber));
  };

  return (
    <PhoneInputField
      id={id}
      phone={nationalNumber}
      ddi={ddi}
      onPhoneChange={(phone) => update({ ddi, nationalNumber: phone })}
      onDdiChange={(nextDdi) => update({ ddi: nextDdi, nationalNumber })}
    />
  );
}

=== src/ui/components/PhoneInputField.tsx — diff ===
@@ -3,24 +3,7 @@ import { motion, AnimatePresence } from 'motion/react';
 import { ChevronDown, Phone } from 'lucide-react';
 import { cn } from '../../shared/utils/cn';
 import { Z_INDEX } from '../../shared/constants/zIndex';
-
-const COUNTRY_CODES = [
-  { code: '+55', name: 'Brasil' },
-  { code: '+1', name: 'EUA/Canadá' },
-  { code: '+351', name: 'Portugal' },
-  { code: '+34', name: 'Espanha' },
-  { code: '+33', name: 'França' },
-  { code: '+44', name: 'Reino Unido' },
-  { code: '+49', name: 'Alemanha' },
-  { code: '+39', name: 'Itália' },
-  { code: '+54', name: 'Argentina' },
-  { code: '+598', name: 'Uruguai' },
-  { code: '+56', name: 'Chile' },
-  { code: '+57', name: 'Colômbia' },
-  { code: '+52', name: 'México' },
-  { code: '+81', name: 'Japão' },
-  { code: '+86', name: 'China' },
-];
+import { COUNTRY_CODES } from '../../shared/constants/countryCodes';
 
 interface PhoneInputFieldProps {
   id?: string;

=== src/ui/layouts/Header.tsx — diff ===
@@ -47,6 +47,10 @@ export function Header({
         return t('header.pageTitles.events');
       case 'tours':
         return t('header.pageTitles.tours');
+      case 'transfers':
+        return t('header.pageTitles.transfers');
+      case 'rentals':
+        return t('header.pageTitles.rentals');
       case 'stays':
         return t('header.pageTitles.accommodations');
       case 'restaurants':

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 138 arquivos, 778 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
