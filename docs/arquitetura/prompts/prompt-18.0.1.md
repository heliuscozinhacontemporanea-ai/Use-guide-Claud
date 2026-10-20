# Prompt 18.0.1 — Completa o 18

> Lote 11, gerado do commit de referência `64b792a` da branch `claude/agents-md-v2`. É o primeiro do lote 11: aplique antes do 18.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.0.1 — Completa o 18

Comparação do zip de 2026-10-19: o 17.3 veio correto; o 18 veio só em parte (a conta do parceiro voltou a ter categoria, o que quebra a inscrição e o painel) e o 18.1 não foi aplicado.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva os arquivos do seu jeito, não mantenha a versão anterior de nenhum trecho e não acrescente funcionalidades.

O QUE MUDA:
1) A conta do parceiro NÃO tem categoria (decisão D9).
   - A inscrição envia só { cpfCnpj, termsAccepted }: hoje ela envia category e o schema estrito do servidor responde 400, então ninguém consegue se inscrever.
   - usePartnerProfile não exige categoria: hoje todo parceiro novo cai em "Não foi possível validar a categoria do parceiro" e fica sem painel.
   - isEventProducer e o tipo PartnerCategory são removidos (fica PartnerSignupCategory).
2) whatsappLink sai do conteúdo do parceiro (tipos, schema do evento e catálogo): o telefone em E.164 é a única fonte, e o link do WhatsApp é montado na exibição.
3) Nome do produtor obrigatório e phoneDdi obrigatório, como na referência.
4) Hooks do painel do parceiro (usePartnerContentActions, usePartnerPanelActions e o teste de usePartnerProfile) na versão do 18: o item é salvo com o mesmo mapeamento da inscrição e o evento sempre pertence a um cadastro.
5) Rótulos das categorias: Passeios, Translados, Aluguéis e Produtor de eventos (cor e ícone do aluguel como na referência).
6) Títulos das páginas de translados e aluguéis (header.pageTitles) de volta nos 3 idiomas, e as chaves navigation.transfers e navigation.rentals que faltavam para os itens novos do menu.
7) StandardCard e SearchOverlay sem `as Record<string, any>` (§14).
8) Teste novo: src/domain/partners/hooks/usePartnerRegistrationSubmission.test.ts.

São mantidas (não desfaça):
- guideService permitindo ao parceiro criar tour, transfer, rental e producer;
- as seções de translados e aluguéis na Explore;
- os filtros da busca;
- os itens do menu;
- o modal de detalhe para translado e aluguel.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/domain/admin/schemas/adminPlanSchema.ts (alterar)
- server/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/guide/components/StandardCard.tsx (alterar)
- src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts (alterar)
- src/domain/partners/application/mappers/partnerSubmissionToGuide.ts (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/hooks/usePartnerContentActions.ts (alterar)
- src/domain/partners/hooks/usePartnerContentCatalog.ts (alterar)
- src/domain/partners/hooks/usePartnerPanelActions.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.test.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.ts (alterar)
- src/domain/partners/hooks/usePartnerRegistrationSubmission.test.ts (criar)
- src/domain/partners/hooks/usePartnerRegistrationSubmission.ts (alterar)
- src/domain/partners/schemas/partnerEventFormSchema.ts (alterar)
- src/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/partners/schemas/partnerSchema.ts (alterar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/partners/types/partnerContent.ts (alterar)
- src/domain/search/components/SearchOverlay.tsx (alterar)
- src/shared/constants/categories.ts (alterar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/domain/admin/schemas/adminPlanSchema.ts — diff ===
@@ -1,5 +1,6 @@
 import { z } from 'zod';
 
+
 export const updatePlanSchema = z
   .object({
     name: z.string().trim().min(1).max(200).optional(),
@@ -15,4 +16,3 @@ export const updatePlanSchema = z
   });
 
 export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
-

=== server/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -85,7 +85,6 @@ describe('Partner Validation Schemas (Backend)', () => {
       );
     });
   });
-
   describe('activateTrialSchema', () => {
     it('should validate trial activation with required trimmed partnerId', () => {
       const result = activateTrialSchema.safeParse({

=== src/domain/guide/components/StandardCard.tsx — diff ===
@@ -27,7 +27,7 @@ import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
 
 export function StandardCard({ item, variant = 'square', onClick, className }: StandardCardProps) {
   const [imageError, setImageError] = useState(false);
-  const cat = (CATEGORIES as Record<string, any>)[item.category] || CATEGORIES.tips;
+  const cat = CATEGORIES[item.category];
 
   const variantClasses = {
     square: 'aspect-square min-w-[280px]',

=== src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts — diff ===
@@ -78,7 +78,7 @@ describe('mapPartnerSubmissionToGuideItem', () => {
   it('categoria inválida: deve lançar erro se a categoria for incompatível (ex: tour ou event)', () => {
     const invalidCategoryData: PartnerSubmissionData = {
       ...baseData,
-      category: 'event' as any,
+      category: 'event',
     };
 
     expect(() => mapPartnerSubmissionToGuideItem(invalidCategoryData, ['https://img.jpg'])).toThrow(

=== src/domain/partners/application/mappers/partnerSubmissionToGuide.ts — diff ===
@@ -90,7 +90,7 @@ export function mapPartnerSubmissionToGuideItem(
     instagramLink: formData.instagram,
     websiteLink: formData.website,
     bookingLink: formData.bookingLinks,
-    phone: toE164(formData.phoneDdi ?? '+55', formData.phone),
+    phone: toE164(formData.phoneDdi, formData.phone),
     googleMapsLink: formData.googleMaps,
     address: formData.address,
     operationalInfo: buildOperationalInfo(formData),

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -58,6 +58,7 @@ export interface PartnerPanelProps {
   renderBookableOffersManager?: (
     items: Array<{ id: string; name: string; category: string }>
   ) => React.ReactNode;
+  /** Chamado ao fechar o checkout depois de um pagamento confirmado, para recarregar o perfil. */
   onPlanPurchased?: () => void;
 }

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
@@ -1,7 +1,6 @@
 import { useEffect, useState } from 'react';
 import { subscribeToGuideManagementCatalogUseCase } from '../../guide';
 import type { PartnerContentRecord } from '../types/partnerContent';
-import { whatsAppUrl } from '../../../shared/utils/phone';
 
 export interface UsePartnerContentCatalogProps {
   userId?: string | null;
@@ -47,7 +46,6 @@ export function usePartnerContentCatalog({ userId, activeTab }: UsePartnerConten
           websiteLink: item.websiteLink,
           bookingLink: item.bookingLink,
           phone: item.phone,
-          whatsappLink: item.phone ? (whatsAppUrl(item.phone) ?? undefined) : undefined,
           googleMapsLink: item.googleMapsLink,
           address: item.address,
           tags: item.tags,
@@ -80,7 +78,6 @@ export function usePartnerContentCatalog({ userId, activeTab }: UsePartnerConten
           websiteLink: event.websiteLink,
           bookingLink: event.bookingLink,
           phone: event.phone,
-          whatsappLink: event.phone ? (whatsAppUrl(event.phone) ?? undefined) : undefined,
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
-          publicPartner.category === 'producer' &&
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
 
-  const isEventProducer = partnerProfile?.category === 'producer';
 
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

=== src/domain/partners/hooks/usePartnerRegistrationSubmission.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { mapPartnerRegistrationPayload } from './usePartnerRegistrationSubmission';

describe('mapPartnerRegistrationPayload', () => {
  it('envia só CPF/CNPJ e termos: a categoria pertence ao cadastro, não à conta (decisão D9)', () => {
    const payload = mapPartnerRegistrationPayload({
      ...INITIAL_FORM_DATA,
      category: 'producer',
      cpfCnpj: ' 529.982.247-25 ',
      termsAccepted: true,
    });
    // O schema do servidor é estrito: qualquer campo a mais faz a inscrição falhar com 400.
    expect(payload).toEqual({ cpfCnpj: '529.982.247-25', termsAccepted: true });
  });

  it('recusa inscrição sem aceite dos termos ou sem CPF/CNPJ', () => {
    expect(() =>
      mapPartnerRegistrationPayload({ ...INITIAL_FORM_DATA, cpfCnpj: '529.982.247-25' })
    ).toThrow();
    expect(() =>
      mapPartnerRegistrationPayload({ ...INITIAL_FORM_DATA, termsAccepted: true, cpfCnpj: ' ' })
    ).toThrow();
  });
});

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
-    case 'producer':
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
@@ -21,7 +21,6 @@ export const partnerEventFormSchema = z
     image: z.string().optional(),
     entryType: eventEntryTypeSchema.default('gratuito'),
     phone: z.string().optional(),
-    whatsappLink: z.string().optional(),
     websiteLink: z.string().optional(),
     instagramLink: z.string().optional(),
     address: z.string().optional(),

=== src/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -77,13 +77,21 @@ describe('Partner Validation Schemas (Frontend)', () => {
         expect(res.success).toBe(true);
       }
 
+      // Perfil de produtor: nome obrigatório, descrição opcional.
       const resProducer = step1Schema.safeParse({
         category: 'producer',
-        businessName: '',
+        businessName: 'Produtora Sol',
         cpfCnpj: VALID_TEST_CPF,
         description: '',
       });
       expect(resProducer.success).toBe(true);
+      const producerWithoutName = step1Schema.safeParse({
+        category: 'producer',
+        businessName: '',
+        cpfCnpj: VALID_TEST_CPF,
+        description: '',
+      });
+      expect(producerWithoutName.success).toBe(false);
     });
   });

=== src/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -2,6 +2,7 @@ import { z } from 'zod';
 import { isValidCpfCnpj } from '../../../shared/utils/documentValidator';
 import type { UserSession } from '../../auth';
 
+// Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos.
 const partnerCategorySchema = z.enum(['sight', 'hotel', 'restaurant', 'producer']);
 
 export const step1Schema = z
@@ -15,14 +16,17 @@ export const step1Schema = z
     description: z.string().default(''),
   })
   .superRefine((data, ctx) => {
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
     if (data.category !== 'producer') {
-      if (!data.businessName || data.businessName.trim() === '') {
-        ctx.addIssue({
-          code: z.ZodIssueCode.custom,
-          path: ['businessName'],
-          message: 'Nome do estabelecimento é obrigatório',
-        });
-      }
       if (!data.description || data.description.trim() === '') {
         ctx.addIssue({
           code: z.ZodIssueCode.custom,

=== src/domain/partners/types/partner.ts — diff ===
@@ -4,12 +4,12 @@ export interface PartnerBusiness {
   type: 'item' | 'event';
 }
 
-export type PartnerCategory = 'sight' | 'hotel' | 'restaurant' | 'producer';
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
@@ -25,13 +24,14 @@ export interface PartnerRegistrationPayload {
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
-  phoneDdi?: string;
+  phoneDdi: string;
   googleMaps: string;
   address: string;
   firstName: string;
@@ -77,7 +77,6 @@ export interface PartnerProfile {
   id: string;
   businessId?: string | null;
   businessName: string;
-  category: PartnerCategory;
   businesses?: PartnerBusiness[];
   cpfCnpj?: string;
   phone?: string;

=== src/domain/partners/types/partnerContent.ts — diff ===
@@ -49,10 +49,10 @@ export type PartnerContentCategory =
   | 'tour'
   | 'tips'
   | 'hotel'
-  | 'event'
-  | 'producer'
   | 'transfer'
-  | 'rental';
+  | 'rental'
+  | 'producer'
+  | 'event';
 export type EventEntryType = 'pago' | 'gratuito';
 
 export type PartnerContentEditorState = Omit<PartnerContentRecord, 'category'> & {
@@ -73,7 +73,6 @@ export interface PartnerContentRecord {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
   phone?: string;
   googleMapsLink?: string;
   address?: string;
@@ -97,14 +96,13 @@ export interface PartnerContentRecord {
 export interface PartnerContentItemInput {
   name: string;
   description: string;
-  category: 'sight' | 'hotel' | 'restaurant' | 'producer';
+  category: 'sight' | 'hotel' | 'restaurant' | 'tour' | 'transfer' | 'rental' | 'producer';
   image: string;
   images: string[];
   location: string;
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
   phone?: string;
   googleMapsLink?: string;
   address?: string;
@@ -128,7 +126,6 @@ export interface PartnerContentEventInput {
   instagramLink?: string;
   websiteLink?: string;
   bookingLink?: string;
-  whatsappLink?: string;
   phone?: string;
   googleMapsLink?: string;
   address?: string;

=== src/domain/search/components/SearchOverlay.tsx — diff ===
@@ -400,10 +400,10 @@ export function SearchOverlay({ isOpen, onClose, onSelectItem }: SearchOverlayPr
                     <span
                       className={cn(
                         'text-[9px] font-black tracking-widest uppercase',
-                        (CATEGORIES as Record<string, any>)[item.category]?.colorClass || 'text-emerald-400'
+                        CATEGORIES[item.category]?.colorClass || 'text-emerald-400'
                       )}
                     >
-                      {(CATEGORIES as Record<string, any>)[item.category]?.label || item.category}
+                      {CATEGORIES[item.category]?.label || item.category}
                     </span>
                     <span className="text-[10px] font-bold text-white/50">
                       {LOCATIONS.find((l) => l.id === item.location)?.name || item.location}

=== src/shared/constants/categories.ts — diff ===
@@ -19,7 +19,7 @@ export const CATEGORIES = {
   },
   tour: {
     id: 'tour',
-    label: 'Aventura',
+    label: 'Passeios',
     colorClass: 'text-cyan-400',
     bgClass: 'bg-cyan-500/10',
     borderClass: 'border-cyan-500/20',
@@ -28,7 +28,7 @@ export const CATEGORIES = {
   },
   transfer: {
     id: 'transfer',
-    label: 'Translado',
+    label: 'Translados',
     colorClass: 'text-sky-400',
     bgClass: 'bg-sky-500/10',
     borderClass: 'border-sky-500/20',
@@ -37,12 +37,12 @@ export const CATEGORIES = {
   },
   rental: {
     id: 'rental',
-    label: 'Aluguel',
-    colorClass: 'text-violet-400',
-    bgClass: 'bg-violet-500/10',
-    borderClass: 'border-violet-500/20',
-    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/20',
-    icon: 'KeyRound',
+    label: 'Aluguéis',
+    colorClass: 'text-orange-400',
+    bgClass: 'bg-orange-500/10',
+    borderClass: 'border-orange-500/20',
+    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/20',
+    icon: 'Bike',
   },
   hotel: {
     id: 'hotel',
@@ -64,7 +64,7 @@ export const CATEGORIES = {
   },
   producer: {
     id: 'producer',
-    label: 'Produtora',
+    label: 'Produtor de eventos',
     colorClass: 'text-fuchsia-400',
     bgClass: 'bg-fuchsia-500/10',
     borderClass: 'border-fuchsia-500/20',
@@ -81,4 +81,3 @@ export const CATEGORIES = {
     icon: 'Calendar',
   },
 } as const;
-

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
@@ -54,6 +56,8 @@ export interface TranslationResource {
     explore: string;
     events: string;
     tours: string;
+    transfers: string;
+    rentals: string;
     accommodations: string;
     restaurants: string;
     attractions: string;
@@ -204,6 +208,8 @@ const ptBR: TranslationResource = {
     pageTitles: {
       events: 'Eventos & Experiências',
       tours: 'Aventura & Passeios',
+      transfers: 'Translados',
+      rentals: 'Aluguéis',
       accommodations: 'Melhores Hospedagens',
       restaurants: 'Sabores Locais',
       attractions: 'Atrações',
@@ -236,6 +242,8 @@ const ptBR: TranslationResource = {
     explore: 'Explorar',
     events: 'Eventos',
     tours: 'Passeios',
+    transfers: 'Translados',
+    rentals: 'Aluguéis',
     accommodations: 'Hospedagens',
     restaurants: 'Restaurantes',
     attractions: 'Atrações',
@@ -331,18 +339,17 @@ const ptBR: TranslationResource = {
       },
       tours: {
         title: 'Aventura & Passeios | Use Guide',
-        description:
-          'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
+        description: 'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
       },
       transfers: {
-        title: 'Translados em Jericoacoara | Use Guide',
+        title: "Translados em Jericoacoara | Use Guide",
         description:
-          'Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.',
+          "Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.",
       },
       rentals: {
-        title: 'Aluguéis em Jericoacoara | Use Guide',
+        title: "Aluguéis em Jericoacoara | Use Guide",
         description:
-          'Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.',
+          "Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.",
       },
       stays: {
         title: 'Melhores Hospedagens & Pousadas | Use Guide',
@@ -426,6 +433,8 @@ const en: TranslationResource = {
     pageTitles: {
       events: 'Events & Experiences',
       tours: 'Adventure & Tours',
+      transfers: 'Transfers',
+      rentals: 'Rentals',
       accommodations: 'Best Accommodations',
       restaurants: 'Local Flavors',
       attractions: 'Attractions',
@@ -458,6 +467,8 @@ const en: TranslationResource = {
     explore: 'Explore',
     events: 'Events',
     tours: 'Tours',
+    transfers: 'Transfers',
+    rentals: 'Rentals',
     accommodations: 'Accommodations',
     restaurants: 'Restaurants',
     attractions: 'Attractions',
@@ -551,17 +562,17 @@ const en: TranslationResource = {
       },
       tours: {
         title: 'Adventure & Tours | Use Guide',
-        description:
-          'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
+        description: 'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
       },
       transfers: {
-        title: 'Transfers to Jericoacoara | Use Guide',
+        title: "Transfers to Jericoacoara | Use Guide",
         description:
-          'Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.',
+          "Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.",
       },
       rentals: {
-        title: 'Rentals in Jericoacoara | Use Guide',
-        description: 'Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.',
+        title: "Rentals in Jericoacoara | Use Guide",
+        description:
+          "Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.",
       },
       stays: {
         title: 'Best Stays & Inns | Use Guide',
@@ -645,6 +656,8 @@ const fr: TranslationResource = {
     pageTitles: {
       events: 'Événements & Expériences',
       tours: 'Aventure & Excursions',
+      transfers: 'Transferts',
+      rentals: 'Locations',
       accommodations: 'Meilleurs Hébergements',
       restaurants: 'Saveurs Locales',
       attractions: 'Attractions',
@@ -677,6 +690,8 @@ const fr: TranslationResource = {
     explore: 'Explorer',
     events: 'Événements',
     tours: 'Excursions',
+    transfers: 'Transferts',
+    rentals: 'Locations',
     accommodations: 'Hébergements',
     restaurants: 'Restaurants',
     attractions: 'Attractions',
@@ -775,18 +790,17 @@ const fr: TranslationResource = {
       },
       tours: {
         title: 'Aventure & Excursions | Use Guide',
-        description:
-          'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
+        description: 'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
       },
       transfers: {
-        title: 'Transferts à Jericoacoara | Use Guide',
+        title: "Transferts à Jericoacoara | Use Guide",
         description:
-          'Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.',
+          "Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.",
       },
       rentals: {
-        title: 'Locations à Jericoacoara | Use Guide',
+        title: "Locations à Jericoacoara | Use Guide",
         description:
-          'Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.',
+          "Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.",
       },
       stays: {
         title: 'Meilleurs Hébergements | Use Guide',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 139 arquivos, 780 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
