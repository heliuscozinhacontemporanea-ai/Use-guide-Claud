# Prompt 18.1 — Inscrição e editor do parceiro com passeio, translado e aluguel

> Lote 10, gerado do commit de referência `82b7084` da branch `claude/agents-md-v2`. Aplique depois do Prompt 18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.1 — Inscrição e editor do parceiro com passeio, translado e aluguel

O formulário de inscrição e o editor do painel passam a ter os campos próprios de cada categoria; o editor reflete exatamente o formulário de inscrição.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

O QUE MUDA:
1) Step3Details vira despachante por categoria; componentes em src/domain/partners/components/steps/details/ (hotel, restaurante, atração, passeio, translado, aluguel).
2) FormState ganha os campos de passeio/translado/aluguel; step3Schema valida os obrigatórios; buildOperationalInfo grava em operationalInfo.
3) LISTING_CATEGORIES único para inscrição e painel.
4) Editor do painel: sem CPF/CNPJ (pertence à conta) e categoria travada em item existente.
5) Campo de arquivo do cardápio removido (fica só o link).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- src/domain/guide/types/guide.ts (alterar)
- src/domain/partners/application/mappers/partnerFormMapper.ts (alterar)
- src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts (alterar)
- src/domain/partners/application/mappers/partnerSubmissionToGuide.ts (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/PartnersModal.tsx (alterar)
- src/domain/partners/components/steps/Step1CompanyInfo.tsx (alterar)
- src/domain/partners/components/steps/Step2ContactInfo.tsx (alterar)
- src/domain/partners/components/steps/Step3Details.tsx (alterar)
- src/domain/partners/components/steps/Step4Additional.tsx (alterar)
- src/domain/partners/components/steps/Step5Media.tsx (alterar)
- src/domain/partners/components/steps/details/DetailFields.tsx (criar)
- src/domain/partners/components/steps/details/HotelDetails.tsx (criar)
- src/domain/partners/components/steps/details/RentalDetails.tsx (criar)
- src/domain/partners/components/steps/details/RestaurantDetails.tsx (criar)
- src/domain/partners/components/steps/details/SightDetails.tsx (criar)
- src/domain/partners/components/steps/details/TourDetails.tsx (criar)
- src/domain/partners/components/steps/details/TransferDetails.tsx (criar)
- src/domain/partners/components/steps/details/useDetailsForm.ts (criar)
- src/domain/partners/constants/formDefaults.ts (alterar)
- src/domain/partners/constants/listingCategories.tsx (criar)
- src/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/partners/schemas/partnerSchema.ts (alterar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/partners/types/partnerContent.ts (alterar)
- src/domain/partners/types/partsForm.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -13,7 +13,7 @@
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 | B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
 | B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
-| B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7 | médio | passeio não salva (aguarda decisão sobre a categoria passeio); seção de reservas aparece para hospedagem/restaurante; três critérios de "pronto para receber" (Prompt 17.2); parceiro não gerencia datas/capacidade do evento (editor único, Prompts 18–19); ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; clique fora do editor descarta edições; preço de plano com `'R$ ' +` (Prompt 17.1); datas exibidas sem fuso no gerenciador de ingressos; botões só com ícone sem nome; `PartnerItemForms.tsx` sem uso |
+| B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; três critérios de "pronto para receber" (Prompt 17.2); parceiro não gerencia datas/capacidade do evento (editor único, Prompts 18–19); ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; clique fora do editor descarta edições; preço de plano com `'R$ ' +` (Prompt 17.1); datas exibidas sem fuso no gerenciador de ingressos; botões só com ícone sem nome; `PartnerItemForms.tsx` sem uso; `PartnerPanel.tsx` (592 linhas), `Step2ContactInfo.tsx` (516) e `Step5Media.tsx` (756) acima de 400 linhas, a dividir no editor único (Prompt 18.2) |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B19 | Modelo de eventos guarda contato em dois lugares (`phone` no topo e `contact.phone`) | §13, §6.3 | baixo | unificar em `contact` quando o editor único (Prompt 18.2) tocar no evento |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
@@ -22,6 +22,7 @@
 
 | ID | Resolução |
 |---|---|
+| Categorias passeio, translado e aluguel na inscrição e no editor — Prompt 18.1 | formulário com campos próprios por categoria (`steps/details/`), validação no `step3Schema`, gravação em `operationalInfo`; editor do painel sem CPF/CNPJ e com categoria travada em item existente; campo de arquivo do cardápio removido |
 | Painéis parceiro/admin — Prompt 17 | plano pago abre o checkout; visualizações e relatório de evento corretos; portal rola; sessões de evento não duplicam e são removidas no servidor; "Suspender" grava `suspended` e bloqueia; selo do admin sem mexer no plano; excluir parceiro com confirmação; filtro e categoria de evento; avisos com seleção limpa; datas dos formulários de evento no fuso de Fortaleza |
 | B15 | Removido import de `database/factory` em `FavoritesList` (Prompt 16): o item usa os dados de `FavoriteItem` e navega para o detalhe via `useSideMenu` |
 | Menu lateral em `src/ui/layouts` importando domínios (§3.4.3) | Prompt 16: virou composição em `src/app/menu/SideMenu.tsx`; `SidebarLayout` continua em `src/ui` sem conhecer domínios |

=== src/domain/guide/types/guide.ts — diff ===
@@ -1,4 +1,16 @@
 export interface GuideItemOperationalInfo {
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
   tags?: string[];
   cuisineType?: string;
   subcategory?: string;

=== src/domain/partners/application/mappers/partnerFormMapper.ts — diff ===
@@ -21,7 +21,6 @@ export const getEmptyFormData = (category = ''): FormState => ({
   breakfastTypes: [],
   amenities: [],
   menuLink: '',
-  menuFile: null,
   subcategory: '',
   cuisineType: '',
   mealTypes: [],
@@ -33,6 +32,19 @@ export const getEmptyFormData = (category = ''): FormState => ({
   sightAccessType: '',
   sightPrice: '',
   languages: [],
+  tourDurationHours: '',
+  meetingPoint: '',
+  itinerary: '',
+  tourIncludes: [],
+  transferRoutes: [],
+  transferVehicles: [],
+  maxPassengers: '',
+  luggageInfo: '',
+  rentalVehicles: [],
+  minRentalHours: '',
+  depositRequired: null,
+  driverLicenseRequired: null,
+  rentalIncludes: [],
   checkInFrom: '',
   checkInTo: '',
   checkOutFrom: '',
@@ -96,7 +108,6 @@ export const mapItemToFormData = (item: PartnerContentRecord, partnerCpfCnpj = '
     breakfastTypes: opInfo.breakfast?.types || [],
     amenities: item.category === 'hotel' ? ensureArray(opInfo.amenities) : [],
     menuLink: opInfo.menuLink || '',
-    menuFile: null,
     subcategory: opInfo.subcategory || '',
     cuisineType: opInfo.cuisineType || '',
     mealTypes: ensureArray(opInfo.mealTypes),
@@ -108,6 +119,19 @@ export const mapItemToFormData = (item: PartnerContentRecord, partnerCpfCnpj = '
     sightAccessType,
     sightPrice: opInfo.price || '',
     languages: ensureArray(opInfo.languages),
+    tourDurationHours: opInfo.durationMinutes ? String(opInfo.durationMinutes / 60) : '',
+    meetingPoint: opInfo.meetingPoint || '',
+    itinerary: opInfo.itinerary || '',
+    tourIncludes: item.category === 'tour' ? ensureArray(opInfo.includes) : [],
+    transferRoutes: opInfo.transferRoutes ?? [],
+    transferVehicles: item.category === 'transfer' ? ensureArray(opInfo.vehicleTypes) : [],
+    maxPassengers: opInfo.maxPassengers ? String(opInfo.maxPassengers) : '',
+    luggageInfo: opInfo.luggageInfo || '',
+    rentalVehicles: item.category === 'rental' ? ensureArray(opInfo.vehicleTypes) : [],
+    minRentalHours: opInfo.minRentalHours ? String(opInfo.minRentalHours) : '',
+    depositRequired: opInfo.depositRequired ?? null,
+    driverLicenseRequired: opInfo.driverLicenseRequired ?? null,
+    rentalIncludes: item.category === 'rental' ? ensureArray(opInfo.includes) : [],
     checkInFrom: opInfo.checkIn?.from || '',
     checkInTo: opInfo.checkIn?.to || '',
     checkOutFrom: opInfo.checkOut?.from || '',

=== src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts — diff ===
@@ -75,7 +75,7 @@ describe('mapPartnerSubmissionToGuideItem', () => {
     });
   });
 
-  it('categoria inválida: deve lançar erro se a categoria for incompatível (ex: tour ou event)', () => {
+  it('categoria inválida: deve lançar erro se a categoria for incompatível (ex: event)', () => {
     const invalidCategoryData: PartnerSubmissionData = {
       ...baseData,
       category: 'event',
@@ -122,4 +122,69 @@ describe('mapPartnerSubmissionToGuideItem', () => {
     const result = mapPartnerSubmissionToGuideItem(baseData, ['https://img1.jpg']);
     expect(result).not.toHaveProperty('isActive');
   });
+  it('tour: converte a duração em minutos e mantém roteiro e itens inclusos', () => {
+    const result = mapPartnerSubmissionToGuideItem(
+      {
+        ...baseData,
+        category: 'tour',
+        tourDurationHours: '2,5',
+        meetingPoint: 'Praça principal',
+        itinerary: 'Lagoa do Paraíso e Pedra Furada',
+        tourIncludes: ['Guia'],
+      },
+      ['https://tour.jpg']
+    );
+    expect(result.category).toBe('tour');
+    expect(result.operationalInfo).toMatchObject({
+      durationMinutes: 150,
+      meetingPoint: 'Praça principal',
+      itinerary: 'Lagoa do Paraíso e Pedra Furada',
+      includes: ['Guia'],
+    });
+  });
+
+  it('transfer: descarta trechos incompletos e grava a capacidade como inteiro', () => {
+    const result = mapPartnerSubmissionToGuideItem(
+      {
+        ...baseData,
+        category: 'transfer',
+        transferRoutes: [
+          { from: 'Fortaleza', to: 'Jericoacoara' },
+          { from: 'Jijoca', to: '' },
+        ],
+        transferVehicles: ['4x4'],
+        maxPassengers: '6',
+        luggageInfo: '1 mala por pessoa',
+      },
+      ['https://transfer.jpg']
+    );
+    expect(result.category).toBe('transfer');
+    expect(result.operationalInfo).toMatchObject({
+      transferRoutes: [{ from: 'Fortaleza', to: 'Jericoacoara' }],
+      vehicleTypes: ['4x4'],
+      maxPassengers: 6,
+      luggageInfo: '1 mala por pessoa',
+    });
+  });
+
+  it('rental: grava período mínimo, caução e exigência de habilitação', () => {
+    const result = mapPartnerSubmissionToGuideItem(
+      {
+        ...baseData,
+        category: 'rental',
+        rentalVehicles: ['Quadriciclo'],
+        minRentalHours: '0',
+        depositRequired: true,
+        driverLicenseRequired: false,
+      },
+      ['https://rental.jpg']
+    );
+    expect(result.category).toBe('rental');
+    expect(result.operationalInfo).toMatchObject({
+      vehicleTypes: ['Quadriciclo'],
+      depositRequired: true,
+      driverLicenseRequired: false,
+    });
+    expect(result.operationalInfo).not.toHaveProperty('minRentalHours', 0);
+  });
 });

=== src/domain/partners/application/mappers/partnerSubmissionToGuide.ts — diff ===
@@ -10,6 +10,12 @@ function toGuideItemCategory(value: string): PartnerContentItemInput['category']
       return 'restaurant';
     case 'sight':
       return 'sight';
+    case 'tour':
+      return 'tour';
+    case 'transfer':
+      return 'transfer';
+    case 'rental':
+      return 'rental';
     case 'producer':
       return 'producer';
     default:
@@ -64,9 +70,46 @@ function buildOperationalInfo(formData: PartnerSubmissionData) {
       languages: formData.languages,
     };
   }
+  if (formData.category === 'tour') {
+    const hours = Number((formData.tourDurationHours ?? '').replace(',', '.'));
+    return {
+      durationMinutes: Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : undefined,
+      meetingPoint: formData.meetingPoint,
+      itinerary: formData.itinerary,
+      includes: formData.tourIncludes,
+      languages: formData.languages,
+    };
+  }
+  if (formData.category === 'transfer') {
+    return {
+      transferRoutes: (formData.transferRoutes ?? []).filter(
+        (route) => route.from.trim() && route.to.trim()
+      ),
+      vehicleTypes: formData.transferVehicles,
+      maxPassengers: positiveInt(formData.maxPassengers),
+      luggageInfo: formData.luggageInfo,
+      languages: formData.languages,
+    };
+  }
+  if (formData.category === 'rental') {
+    return {
+      vehicleTypes: formData.rentalVehicles,
+      minRentalHours: positiveInt(formData.minRentalHours),
+      depositRequired: formData.depositRequired ?? undefined,
+      driverLicenseRequired: formData.driverLicenseRequired ?? undefined,
+      includes: formData.rentalIncludes,
+      operatingHours: formData.operatingHours,
+      languages: formData.languages,
+    };
+  }
   return undefined;
 }
 
+function positiveInt(value: string | undefined): number | undefined {
+  const parsed = Number.parseInt(value ?? '', 10);
+  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
+}
+
 export function mapPartnerSubmissionToGuideItem(
   formData: PartnerSubmissionData,
   imageUrls: string[]

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -1,13 +1,4 @@
-import {
-  BarChart3,
-  Home as Bed,
-  Calendar,
-  RefreshCw,
-  Sparkles,
-  Trash2,
-  Utensils,
-  X,
-} from 'lucide-react';
+import { BarChart3, RefreshCw, Trash2, X } from 'lucide-react';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { AnimatePresence, motion } from 'motion/react';
 import React, { useEffect, useRef } from 'react';
@@ -35,6 +26,7 @@ import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
 import { PartnerTabsNavigation } from './subcomponents/PartnerTabsNavigation';
 import { PlansModal } from './subcomponents/PlansModal';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
+import { LISTING_CATEGORIES } from '../constants/listingCategories';
 
 export interface PartnerPanelProps {
   profile?: PartnerProfile;
@@ -172,12 +164,7 @@ export function PartnerPanel({
     }
   }, [isEditing]);
 
-  const categories = [
-    { id: 'sight', label: 'Atrações Turísticas', icon: <Sparkles size={16} /> },
-    { id: 'hotel', label: 'Hospedagem', icon: <Bed size={16} /> },
-    { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={16} /> },
-    { id: 'producer', label: 'Perfil de produtor de eventos', icon: <Calendar size={16} /> },
-  ];
+  const categories = LISTING_CATEGORIES;
 
   if (userLoading || profileStatus === 'loading') {
     return (
@@ -428,7 +415,9 @@ export function PartnerPanel({
                     <Step1CompanyInfo
                       formData={editorFormData}
                       setFormData={setEditorFormData}
-                      categories={categories.filter((c) => c.id !== 'event')}
+                      categories={categories}
+                      mode="editor"
+                      lockCategory={Boolean(isEditing?.id)}
                     />
                   </div>

=== src/domain/partners/components/PartnersModal.tsx — diff ===
@@ -8,10 +8,6 @@ import {
   Handshake,
   ChevronLeft,
   ChevronRight,
-  Camera,
-  Bed,
-  Utensils,
-  Sparkles,
   Loader2,
 } from 'lucide-react';
 import { ModalLayout } from '../../../ui/layouts/ModalLayout';
@@ -29,6 +25,7 @@ import { ErrorState } from './sections/ErrorState';
 import { Step6Success } from './steps/Step6Success';
 import { usePartnerForm } from '../hooks/usePartnerForm';
 import { Z_INDEX } from '../../../shared/constants/zIndex';
+import { LISTING_CATEGORIES } from '../constants/listingCategories';
 
 interface PartnersModalProps {
   isOpen: boolean;
@@ -36,12 +33,7 @@ interface PartnersModalProps {
   onOpenPartnerPanel: () => void;
 }
 
-const CATEGORIES = [
-  { id: 'sight', label: 'Atrações turísticas', icon: <Camera size={18} /> },
-  { id: 'hotel', label: 'Hospedagem', icon: <Bed size={18} /> },
-  { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={18} /> },
-  { id: 'producer', label: 'Eventos (sou produtor)', icon: <Sparkles size={18} /> },
-];
+const CATEGORIES = LISTING_CATEGORIES;
 
 const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

=== src/domain/partners/components/steps/Step1CompanyInfo.tsx — diff ===
@@ -20,12 +20,18 @@ interface Step1CompanyInfoProps {
   };
   setFormData: React.Dispatch<React.SetStateAction<any>>;
   categories: Category[];
+  // No editor do painel o CPF/CNPJ já pertence à conta do parceiro e não é editado por item.
+  mode?: 'signup' | 'editor';
+  // Trocar a categoria de um item existente mudaria o schema de operationalInfo já gravado.
+  lockCategory?: boolean;
 }
 
 export function Step1CompanyInfo({
   formData: propFormData,
   setFormData,
   categories,
+  mode = 'signup',
+  lockCategory = false,
 }: Step1CompanyInfoProps) {
   const formContext = useFormContext();
 
@@ -33,6 +39,7 @@ export function Step1CompanyInfo({
   const formErrors = formContext ? formContext.formState.errors : {};
 
   const handleCategoryChange = (catId: string) => {
+    if (lockCategory) return;
     if (formContext) {
       formContext.setValue('category', catId, { shouldValidate: true });
     }
@@ -63,6 +70,7 @@ export function Step1CompanyInfo({
   };
 
   const isEventProducer = formData.category === 'producer';
+  const showCpfCnpj = mode === 'signup';
 
   return (
     <div className="space-y-6">
@@ -87,8 +95,10 @@ export function Step1CompanyInfo({
                 key={cat.id}
                 type="button"
                 onClick={() => handleCategoryChange(cat.id)}
+                disabled={lockCategory && formData.category !== cat.id}
+                aria-pressed={formData.category === cat.id}
                 className={cn(
-                  'flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer',
+                  'flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100',
                   formData.category === cat.id
                     ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10'
                     : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
@@ -108,6 +118,11 @@ export function Step1CompanyInfo({
               </button>
             ))}
           </div>
+          {lockCategory && (
+            <p className="text-xs text-white/50 font-medium ml-1">
+              A categoria não pode ser alterada depois do cadastro.
+            </p>
+          )}
           {formErrors.category && (
             <p className="text-xs text-red-400 font-medium ml-1">
               {formErrors.category.message?.toString()}
@@ -124,7 +139,7 @@ export function Step1CompanyInfo({
             className="space-y-6 pt-2 border-t border-white/5"
           >
             {/* Somente se for produtor de eventos: campo CPF/CNPJ obrigatório acima do nome */}
-            {isEventProducer && (
+            {showCpfCnpj && isEventProducer && (
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                   CPF ou CNPJ <span className="text-red-500">*</span>
@@ -174,7 +189,7 @@ export function Step1CompanyInfo({
             </div>
 
             {/* CPF ou CNPJ para Atrações turísticas, Hospedagem e Restaurantes */}
-            {!isEventProducer && (
+            {showCpfCnpj && !isEventProducer && (
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                   CPF ou CNPJ <span className="text-red-500">*</span>

=== src/domain/partners/components/steps/Step2ContactInfo.tsx — diff ===
@@ -328,9 +328,9 @@ export function Step2ContactInfo({
             </div>
           </div>
         </div>
-      ) : formData.category === 'restaurant' ||
-        formData.category === 'sight' ||
-        formData.category === 'producer' ? (
+      ) : ['restaurant', 'sight', 'tour', 'transfer', 'rental', 'producer'].includes(
+          formData.category
+        ) ? (
         <div className="space-y-4">
           {/* Telefone / WhatsApp */}
           <div className="space-y-2">

=== src/domain/partners/components/steps/Step3Details.tsx — diff ===
@@ -1,774 +1,47 @@
-import React from 'react';
-import { AnimatePresence, motion } from 'motion/react';
-import { Sparkles, Globe, Upload, CheckCircle2, X, Utensils, LayoutList } from 'lucide-react';
-import { useFormContext } from 'react-hook-form';
-import { cn } from '../../../../shared/utils/cn';
+import type React from 'react';
+import { Sparkles } from 'lucide-react';
+import type { FormState } from '../../types/partsForm';
+import { HotelDetails } from './details/HotelDetails';
+import { RentalDetails } from './details/RentalDetails';
+import { RestaurantDetails } from './details/RestaurantDetails';
+import { SightDetails } from './details/SightDetails';
+import { TourDetails } from './details/TourDetails';
+import { TransferDetails } from './details/TransferDetails';
+import type { DetailsSectionProps, FormStateSetter } from './details/useDetailsForm';
 
 interface Step3DetailsProps {
-  formData: any;
-  setFormData: React.Dispatch<React.SetStateAction<any>>;
+  formData: FormState;
+  setFormData: FormStateSetter;
   errors: { [key: string]: string };
   setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
   categories: { id: string; label: string }[];
 }
 
-const breakfastOptions = [
-  'A lá carte',
-  'Americano',
-  'Buffet',
-  'Vegano',
-  'Vegetariano',
-  'Glúten-free',
-  'Italiano',
-  'Asiático',
-];
+const DETAILS_BY_CATEGORY: Record<string, (props: DetailsSectionProps) => React.ReactElement> = {
+  hotel: HotelDetails,
+  restaurant: RestaurantDetails,
+  sight: SightDetails,
+  tour: TourDetails,
+  transfer: TransferDetails,
+  rental: RentalDetails,
+};
 
-const amenityOptions = [
-  'Restaurante',
-  'Serviço de quarto',
-  'Bar',
-  'Recepção 24 horas',
-  'Sauna',
-  'Academia',
-  'Jardim',
-  'Terraço',
-  'Transporte para o aeroporto',
-  'Quartos familiares',
-  'Spa e centro de bem-estar',
-  'Banheira de hidromassagem',
-  'Wi-Fi gratuito',
-  'Ar condicionado',
-  'Parque aquático',
-  'Estação de carregamento de veículos elétricos',
-  'Piscina',
-];
-
-const mealTypeOptions = [
-  'Café da Manhã',
-  'Buffet',
-  'Almoço',
-  'Jantar',
-  'Petiscos',
-  'Drinks',
-  'Vinhos',
-];
-
-const additionalServiceOptions = [
-  'Delivery',
-  'Reservas Online',
-  'Música ao Vivo',
-  'Eventos Privados',
-];
-
-const restaurantAmenityOptions = [
-  'Wi-Fi Gratuito',
-  'Ar Condicionado',
-  'Pé na areia',
-  'Área Externa/Jardim',
-  'Estacionamento',
-  'Acessibilidade',
-  'Aceita Pets',
-];
-
-const sightServiceOptions = ['Estacionamento', 'Guia Turístico', 'Aluguel de Equipamentos'];
-
-const sightAmenityOptions = [
-  'Piscina',
-  'Restaurante/Bar',
-  'Vestiários',
-  'Wi-Fi Gratuito',
-  'Área de Acampamento',
-  'Aceita Pets',
-  'Acessibilidade',
-  'Espaço para Eventos',
-];
-
-const sightActivityOptions = [
-  'Trilhas',
-  'Esportes Aquáticos',
-  'Pesca',
-  'Passeios de Barco',
-  'Fotografia',
-  'Observação de Pássaros',
-  'Ecoturismo',
-  'Banho de Mar/Rio',
-];
-
-export function Step3Details({
-  formData: propFormData,
-  setFormData,
-  errors: propErrors,
-  setErrors,
-  categories,
-}: Step3DetailsProps) {
-  const formContext = useFormContext();
-
-  const formData = formContext ? formContext.watch() : propFormData;
-  const rhfErrors = formContext ? formContext.formState.errors : {};
-
-  const getFieldError = (field: string) => {
-    return propErrors[field] || rhfErrors[field]?.message?.toString();
-  };
-
-  const updateFieldValue = (field: string, value: any) => {
-    if (formContext) {
-      formContext.setValue(field, value, { shouldValidate: true });
-    }
-    setFormData((prev: any) => ({ ...prev, [field]: value }));
-    clearError(field);
-  };
-
-  const clearError = (field: string) => {
-    if (propErrors[field]) {
-      setErrors((prev) => {
-        const copy = { ...prev };
-        delete copy[field];
-        return copy;
-      });
-    }
-  };
-
-  const toggleBreakfastType = (type: string) => {
-    const current = formData.breakfastTypes || [];
-    const next = current.includes(type)
-      ? current.filter((t: string) => t !== type)
-      : [...current, type];
-    updateFieldValue('breakfastTypes', next);
-  };
-
-  const toggleAmenity = (amenity: string) => {
-    const current = formData.amenities || [];
-    const next = current.includes(amenity)
-      ? current.filter((a: string) => a !== amenity)
-      : [...current, amenity];
-    updateFieldValue('amenities', next);
-  };
-
-  const toggleMealType = (type: string) => {
-    const current = formData.mealTypes || [];
-    const nextTypes = current.includes(type)
-      ? current.filter((t: string) => t !== type)
-      : [...current, type];
-    updateFieldValue('mealTypes', nextTypes);
-  };
-
-  const toggleAdditionalService = (service: string) => {
-    const current = formData.additionalServices || [];
-    const next = current.includes(service)
-      ? current.filter((s: string) => s !== service)
-      : [...current, service];
-    updateFieldValue('additionalServices', next);
-  };
-
-  const toggleRestaurantAmenity = (amenity: string) => {
-    const current = formData.amenitiesRestaurant || [];
-    const next = current.includes(amenity)
-      ? current.filter((a: string) => a !== amenity)
-      : [...current, amenity];
-    updateFieldValue('amenitiesRestaurant', next);
-  };
-
-  const toggleSightService = (service: string) => {
-    const current = formData.sightServices || [];
-    const nextServices = current.includes(service)
-      ? current.filter((s: string) => s !== service)
-      : [...current, service];
-    updateFieldValue('sightServices', nextServices);
-  };
-
-  const toggleSightAmenity = (amenity: string) => {
-    const current = formData.sightAmenities || [];
-    const next = current.includes(amenity)
-      ? current.filter((a: string) => a !== amenity)
-      : [...current, amenity];
-    updateFieldValue('sightAmenities', next);
-  };
-
-  const toggleSightActivity = (activity: string) => {
-    const current = formData.sightActivities || [];
-    const nextActivities = current.includes(activity)
-      ? current.filter((a: string) => a !== activity)
-      : [...current, activity];
-    updateFieldValue('sightActivities', nextActivities);
-  };
+/** Passo 3 da inscrição e do editor: campos próprios de cada categoria. */
+export function Step3Details({ categories, ...props }: Step3DetailsProps) {
+  const Details = DETAILS_BY_CATEGORY[props.formData.category];
+  const label = categories.find((c) => c.id === props.formData.category)?.label;
 
   return (
     <div className="space-y-6">
       <div className="flex items-center gap-2">
         <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
-          <Sparkles size={18} />
+          <Sparkles size={18} aria-hidden="true" />
         </span>
         <h3 className="text-sm font-black text-white uppercase tracking-widest">
-          Serviços e Comodidades
+          {label ? `Detalhes · ${label}` : 'Serviços e Comodidades'}
         </h3>
       </div>
-
-      {formData.category === 'hotel' ? (
-        <div className="space-y-8">
-          {/* Café da Manhã Section */}
-          <div className="space-y-6">
-            <div className="space-y-4">
-              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-                Café da Manhã
-              </label>
-
-              {/* Serve Café? */}
-              <div className="space-y-3">
-                <p className="text-xs font-bold text-white/80 ml-1">
-                  Serve café da manhã ao hóspede? <span className="text-red-500">*</span>
-                </p>
-                <div className="flex gap-2">
-                  {[
-                    { v: true, l: 'Sim' },
-                    { v: false, l: 'Não' },
-                  ].map((opt) => (
-                    <button
-                      key={opt.l}
-                      type="button"
-                      onClick={() => updateFieldValue('servesBreakfast', opt.v)}
-                      className={cn(
-                        'flex-1 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95',
-                        formData.servesBreakfast === opt.v
-                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
-                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                      )}
-                    >
-                      {opt.l}
-                    </button>
-                  ))}
-                </div>
-                {getFieldError('servesBreakfast') && (
-                  <p className="text-xs text-red-400 font-medium ml-1">
-                    {getFieldError('servesBreakfast')}
-                  </p>
-                )}
-              </div>
-
-              <AnimatePresence>
-                {formData.servesBreakfast && (
-                  <motion.div
-                    initial={{ opacity: 0, height: 0 }}
-                    animate={{ opacity: 1, height: 'auto' }}
-                    exit={{ opacity: 0, height: 0 }}
-                    className="space-y-6 overflow-hidden"
-                  >
-                    {/* Incluso no preço? */}
-                    <div className="space-y-3">
-                      <p className="text-xs font-bold text-white/80 ml-1">
-                        O café está incluso no preço da estadia?{' '}
-                        <span className="text-red-500">*</span>
-                      </p>
-                      <div className="flex flex-col gap-2">
-                        {[
-                          { v: true, l: 'Sim, está incluso' },
-                          { v: false, l: 'Não, é cobrado à parte' },
-                        ].map((opt) => (
-                          <button
-                            key={opt.l}
-                            type="button"
-                            onClick={() => updateFieldValue('breakfastIncluded', opt.v)}
-                            className={cn(
-                              'w-full py-4 px-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-left transition-all active:scale-[0.98]',
-                              formData.breakfastIncluded === opt.v
-                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
-                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                            )}
-                          >
-                            {opt.l}
-                          </button>
-                        ))}
-                      </div>
-                      {getFieldError('breakfastIncluded') && (
-                        <p className="text-xs text-red-400 font-medium ml-1">
-                          {getFieldError('breakfastIncluded')}
-                        </p>
-                      )}
-                    </div>
-
-                    {/* Preço se não incluso */}
-                    {formData.breakfastIncluded === false && (
-                      <motion.div
-                        initial={{ opacity: 0, x: -10 }}
-                        animate={{ opacity: 1, x: 0 }}
-                        className="space-y-2 pl-4 border-l-2 border-indigo-500/30"
-                      >
-                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                          Preço por pessoa/dia (com impostos){' '}
-                          <span className="text-red-500">*</span>
-                        </label>
-                        <div className="relative">
-                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400">
-                            R$
-                          </span>
-                          <input
-                            type="text"
-                            value={formData.breakfastPrice || ''}
-                            onChange={(e) => updateFieldValue('breakfastPrice', e.target.value)}
-                            placeholder="0,00"
-                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
-                          />
-                        </div>
-                        {getFieldError('breakfastPrice') && (
-                          <p className="text-xs text-red-400 font-medium ml-1">
-                            {getFieldError('breakfastPrice')}
-                          </p>
-                        )}
-                      </motion.div>
-                    )}
-
-                    {/* Tipos de Café */}
-                    <div className="space-y-3">
-                      <p className="text-xs font-bold text-white/80 ml-1">
-                        Tipos de café da manhã oferecidos:
-                      </p>
-                      <div className="flex flex-wrap gap-2">
-                        {breakfastOptions.map((type) => (
-                          <button
-                            key={type}
-                            type="button"
-                            onClick={() => toggleBreakfastType(type)}
-                            className={cn(
-                              'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all',
-                              (formData.breakfastTypes || []).includes(type)
-                                ? 'bg-indigo-500 text-white border-indigo-500'
-                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                            )}
-                          >
-                            {type}
-                          </button>
-                        ))}
-                      </div>
-                    </div>
-                  </motion.div>
-                )}
-              </AnimatePresence>
-            </div>
-          </div>
-
-          {/* Comodidades Section */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Comodidades
-            </label>
-            <div className="grid grid-cols-2 gap-2">
-              {amenityOptions.map((amenity) => (
-                <button
-                  key={amenity}
-                  type="button"
-                  onClick={() => toggleAmenity(amenity)}
-                  className={cn(
-                    'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
-                    (formData.amenities || []).includes(amenity)
-                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                  )}
-                >
-                  <div
-                    className={cn(
-                      'w-2 h-2 rounded-full shrink-0 transition-all',
-                      (formData.amenities || []).includes(amenity)
-                        ? 'bg-indigo-400 animate-pulse'
-                        : 'bg-white/10'
-                    )}
-                  />
-                  <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">
-                    {amenity}
-                  </span>
-                </button>
-              ))}
-            </div>
-          </div>
-        </div>
-      ) : formData.category === 'restaurant' ? (
-        <div className="space-y-8">
-          {/* Cardápio digital */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Cardápio Digital
-            </label>
-            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
-              <div className="space-y-2">
-                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                  Link do Cardápio
-                </label>
-                <div className="relative">
-                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
-                    <Globe size={16} />
-                  </div>
-                  <input
-                    type="url"
-                    value={formData.menuLink || ''}
-                    onChange={(e) => updateFieldValue('menuLink', e.target.value)}
-                    placeholder="https://..."
-                    className={cn(
-                      'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
-                      getFieldError('menuLink')
-                        ? 'border-red-500/50 ring-2 ring-red-500/10'
-                        : 'border-white/10'
-                    )}
-                  />
-                  {getFieldError('menuLink') && (
-                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
-                      {getFieldError('menuLink')}
-                    </span>
-                  )}
-                </div>
-              </div>
-              <div className="space-y-2">
-                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                  Upload PDF/Imagem
-                </label>
-                <div
-                  onClick={() =>
-                    !formData.menuFile && document.getElementById('menu-file-input')?.click()
-                  }
-                  className={cn(
-                    'relative flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer group/menu',
-                    formData.menuFile
-                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:border-indigo-500/30 hover:bg-white/10'
-                  )}
-                >
-                  {formData.menuFile ? (
-                    <CheckCircle2 size={16} />
-                  ) : (
-                    <Upload size={16} className="group-hover/menu:scale-110 transition-transform" />
-                  )}
-                  <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[150px]">
-                    {formData.menuFile ? formData.menuFile.name : 'Selecionar Arquivo'}
-                  </span>
-                  {formData.menuFile && (
-                    <button
-                      type="button"
-                      onClick={(e) => {
-                        e.stopPropagation();
-                        updateFieldValue('menuFile', null);
-                      }}
-                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-lg active:scale-90 transition-transform"
-                    >
-                      <X size={10} />
-                    </button>
-                  )}
-                  <input
-                    id="menu-file-input"
-                    type="file"
-                    className="hidden"
-                    accept=".pdf,image/*"
-                    onChange={(e) => {
-                      const file = e.target.files?.[0];
-                      if (file) updateFieldValue('menuFile', file);
-                    }}
-                  />
-                </div>
-              </div>
-            </div>
-          </div>
-
-          {/* Subcategoria e Culinária */}
-          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
-            <div className="space-y-2">
-              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                Subcategoria <span className="text-red-500 ml-0.5">*</span>
-              </label>
-              <div className="relative">
-                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
-                  <LayoutList size={16} />
-                </div>
-                <input
-                  type="text"
-                  value={formData.subcategory || ''}
-                  onChange={(e) => updateFieldValue('subcategory', e.target.value)}
-                  placeholder="Ex: Restaurante, Bar, Café..."
-                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
-                />
-              </div>
-              {getFieldError('subcategory') && (
-                <p className="text-xs text-red-400 font-medium ml-1">
-                  {getFieldError('subcategory')}
-                </p>
-              )}
-            </div>
-            <div className="space-y-2">
-              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                Tipo de Culinária
-              </label>
-              <div className="relative">
-                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
-                  <Utensils size={16} />
-                </div>
-                <input
-                  type="text"
-                  value={formData.cuisineType || ''}
-                  onChange={(e) => updateFieldValue('cuisineType', e.target.value)}
-                  placeholder="Ex: Italiana, Japonesa..."
-                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
-                />
-              </div>
-              {getFieldError('cuisineType') && (
-                <p className="text-xs text-red-400 font-medium ml-1">
-                  {getFieldError('cuisineType')}
-                </p>
-              )}
-            </div>
-          </div>
-
-          {/* Tipos de Refeição */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Tipos de Refeição e Bebidas
-            </label>
-            <div className="flex flex-wrap gap-2">
-              {mealTypeOptions.map((type) => (
-                <button
-                  key={type}
-                  type="button"
-                  onClick={() => toggleMealType(type)}
-                  className={cn(
-                    'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
-                    (formData.mealTypes || []).includes(type)
-                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
-                  )}
-                >
-                  {type}
-                </button>
-              ))}
-            </div>
-            {getFieldError('mealTypes') && (
-              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
-                {getFieldError('mealTypes')}
-              </p>
-            )}
-          </div>
-
-          {/* Serviços Adicionais */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Serviços Adicionais
-            </label>
-            <div className="flex flex-wrap gap-2">
-              {additionalServiceOptions.map((service) => (
-                <button
-                  key={service}
-                  type="button"
-                  onClick={() => toggleAdditionalService(service)}
-                  className={cn(
-                    'px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
-                    (formData.additionalServices || []).includes(service)
-                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                  )}
-                >
-                  {service}
-                </button>
-              ))}
-            </div>
-          </div>
-
-          {/* Comodidades Restaurante */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Comodidades
-            </label>
-            <div className="grid grid-cols-2 gap-2">
-              {restaurantAmenityOptions.map((amenity) => (
-                <button
-                  key={amenity}
-                  type="button"
-                  onClick={() => toggleRestaurantAmenity(amenity)}
-                  className={cn(
-                    'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
-                    (formData.amenitiesRestaurant || []).includes(amenity)
-                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                  )}
-                >
-                  <div
-                    className={cn(
-                      'w-2 h-2 rounded-full shrink-0 transition-all',
-                      (formData.amenitiesRestaurant || []).includes(amenity)
-                        ? 'bg-indigo-400 animate-pulse'
-                        : 'bg-white/10'
-                    )}
-                  />
-                  <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">
-                    {amenity}
-                  </span>
-                </button>
-              ))}
-            </div>
-          </div>
-        </div>
-      ) : formData.category === 'sight' ? (
-        <div className="space-y-10">
-          {/* Acesso (Pago ou Gratuito) */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Acesso à Atração <span className="text-red-500 ml-0.5">*</span>
-            </label>
-            <div className="grid grid-cols-2 gap-2">
-              {['pago', 'gratuito'].map((type) => (
-                <button
-                  key={type}
-                  type="button"
-                  onClick={() => {
-                    updateFieldValue('sightAccessType', type);
-                    if (type === 'gratuito') updateFieldValue('sightPrice', '');
-                  }}
-                  className={cn(
-                    'px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
-                    formData.sightAccessType === type
-                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                  )}
-                >
-                  {type}
-                </button>
-              ))}
-            </div>
-            {getFieldError('sightAccessType') && (
-              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
-                {getFieldError('sightAccessType')}
-              </p>
-            )}
-
-            <AnimatePresence>
-              {formData.sightAccessType === 'pago' && (
-                <motion.div
-                  initial={{ opacity: 0, height: 0 }}
-                  animate={{ opacity: 1, height: 'auto' }}
-                  exit={{ opacity: 0, height: 0 }}
-                  className="space-y-2 pt-2"
-                >
-                  <label className="text-[9px] font-black uppercase tracking-widest text-white/50 block ml-1">
-                    Preço por pessoa
-                  </label>
-                  <div className="relative group">
-                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-indigo-400 transition-colors text-[10px] font-black">
-                      R$
-                    </div>
-                    <input
-                      type="text"
-                      placeholder="0,00"
-                      value={formData.sightPrice || ''}
-                      onChange={(e) => updateFieldValue('sightPrice', e.target.value)}
-                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white text-[11px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/50"
-                    />
-                  </div>
-                  {getFieldError('sightPrice') && (
-                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
-                      {getFieldError('sightPrice')}
-                    </p>
-                  )}
-                </motion.div>
-              )}
-            </AnimatePresence>
-          </div>
-
-          {/* Serviços oferecidos */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Serviços Oferecidos
-            </label>
-            <div className="flex flex-wrap gap-2">
-              {sightServiceOptions.map((service) => (
-                <button
-                  key={service}
-                  type="button"
-                  onClick={() => toggleSightService(service)}
-                  className={cn(
-                    'px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
-                    (formData.sightServices || []).includes(service)
-                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
-                  )}
-                >
-                  {service}
-                </button>
-              ))}
-            </div>
-            {getFieldError('sightServices') && (
-              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
-                {getFieldError('sightServices')}
-              </p>
-            )}
-          </div>
-
-          {/* Confortos / Comodidades */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Confortos e Estrutura
-            </label>
-            <div className="grid grid-cols-2 gap-2">
-              {sightAmenityOptions.map((amenity) => (
-                <button
-                  key={amenity}
-                  type="button"
-                  onClick={() => toggleSightAmenity(amenity)}
-                  className={cn(
-                    'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
-                    (formData.sightAmenities || []).includes(amenity)
-                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
-                  )}
-                >
-                  <div
-                    className={cn(
-                      'w-2 h-2 rounded-full shrink-0 transition-all',
-                      (formData.sightAmenities || []).includes(amenity)
-                        ? 'bg-indigo-400 animate-pulse'
-                        : 'bg-white/10'
-                    )}
-                  />
-                  <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">
-                    {amenity}
-                  </span>
-                </button>
-              ))}
-            </div>
-          </div>
-
-          {/* Atividades disponíveis */}
-          <div className="space-y-4">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Atividades Disponíveis
-            </label>
-            <p className="text-[9px] text-white/50 uppercase font-black ml-1">
-              Quais experiências o turista pode vivenciar?
-            </p>
-            <div className="flex flex-wrap gap-2">
-              {sightActivityOptions.map((activity) => (
-                <button
-                  key={activity}
-                  type="button"
-                  onClick={() => toggleSightActivity(activity)}
-                  className={cn(
-                    'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
-                    (formData.sightActivities || []).includes(activity)
-                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
-                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
-                  )}
-                >
-                  {activity}
-                </button>
-              ))}
-            </div>
-            {getFieldError('sightActivities') && (
-              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
-                {getFieldError('sightActivities')}
-              </p>
-            )}
-          </div>
-        </div>
-      ) : (
-        <div className="py-20 text-center space-y-4">
-          <p className="text-white/50 text-xs italic">
-            Comodidades específicas para{' '}
-            {categories.find((c) => c.id === formData.category)?.label || formData.category} em
-            breve.
-          </p>
-        </div>
-      )}
+      {Details ? <Details {...props} /> : null}
     </div>
   );
 }

=== src/domain/partners/components/steps/Step4Additional.tsx — diff ===
@@ -228,7 +228,7 @@ export function Step4Additional({ formData: propFormData, setFormData }: Step4Ad
             </AnimatePresence>
           </div>
         </div>
-      ) : formData.category === 'restaurant' || formData.category === 'sight' ? (
+      ) : ['restaurant', 'sight', 'tour', 'transfer', 'rental'].includes(formData.category) ? (
         <div className="space-y-10">
           {/* Idiomas */}
           <div className="space-y-4">
@@ -254,106 +254,112 @@ export function Step4Additional({ formData: propFormData, setFormData }: Step4Ad
             </div>
           </div>
 
-          {/* Horários de Funcionamento */}
-          <div className="space-y-6">
-            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
-              Horários de Funcionamento
-            </label>
+          {/* Horários de funcionamento: passeio e translado têm horários próprios na oferta. */}
+          {formData.category !== 'tour' && formData.category !== 'transfer' && (
+            <>
+              <div className="space-y-6">
+                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
+                  Horários de Funcionamento
+                </label>
 
-            <div className="space-y-3">
-              {['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map((day) => {
-                const hours = (formData.operatingHours?.[day] || {
-                  open: '08:00',
-                  close: '22:00',
-                  closed: false,
-                }) as OperatingDay;
-                return (
-                  <div
-                    key={day}
-                    className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4"
-                  >
-                    <div className="flex items-center justify-between">
-                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
-                        {day}
-                      </span>
-                      <button
-                        type="button"
-                        onClick={() => {
-                          const currentHours = formData.operatingHours || {};
-                          const dayData = currentHours[day] || {
-                            open: '08:00',
-                            close: '22:00',
-                            closed: false,
-                          };
-                          updateFieldValue('operatingHours', {
-                            ...currentHours,
-                            [day]: { ...dayData, closed: !dayData.closed },
-                          });
-                        }}
-                        className={cn(
-                          'px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all',
-                          hours.closed
-                            ? 'bg-red-500/20 text-red-400 border border-red-500/20'
-                            : 'bg-white/10 text-white/50 border border-white/10'
-                        )}
-                      >
-                        {hours.closed ? 'Fechado' : 'Aberto'}
-                      </button>
-                    </div>
+                <div className="space-y-3">
+                  {['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map(
+                    (day) => {
+                      const hours = (formData.operatingHours?.[day] || {
+                        open: '08:00',
+                        close: '22:00',
+                        closed: false,
+                      }) as OperatingDay;
+                      return (
+                        <div
+                          key={day}
+                          className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4"
+                        >
+                          <div className="flex items-center justify-between">
+                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
+                              {day}
+                            </span>
+                            <button
+                              type="button"
+                              onClick={() => {
+                                const currentHours = formData.operatingHours || {};
+                                const dayData = currentHours[day] || {
+                                  open: '08:00',
+                                  close: '22:00',
+                                  closed: false,
+                                };
+                                updateFieldValue('operatingHours', {
+                                  ...currentHours,
+                                  [day]: { ...dayData, closed: !dayData.closed },
+                                });
+                              }}
+                              className={cn(
+                                'px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all',
+                                hours.closed
+                                  ? 'bg-red-500/20 text-red-400 border border-red-500/20'
+                                  : 'bg-white/10 text-white/50 border border-white/10'
+                              )}
+                            >
+                              {hours.closed ? 'Fechado' : 'Aberto'}
+                            </button>
+                          </div>
 
-                    {!hours.closed && (
-                      <div className="flex items-center gap-4 w-[90%]">
-                        <div className="flex-1 space-y-1">
-                          <span className="text-[8px] text-white/50 uppercase font-black ml-1">
-                            Abertura
-                          </span>
-                          <input
-                            type="time"
-                            value={hours.open || ''}
-                            onChange={(e) => {
-                              const currentHours = formData.operatingHours || {};
-                              const dayData = currentHours[day] || {
-                                open: '08:00',
-                                close: '22:00',
-                                closed: false,
-                              };
-                              updateFieldValue('operatingHours', {
-                                ...currentHours,
-                                [day]: { ...dayData, open: e.target.value },
-                              });
-                            }}
-                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none"
-                          />
-                        </div>
-                        <div className="flex-1 space-y-1">
-                          <span className="text-[8px] text-white/50 uppercase font-black ml-1">
-                            Fechamento
-                          </span>
-                          <input
-                            type="time"
-                            value={hours.close || ''}
-                            onChange={(e) => {
-                              const currentHours = formData.operatingHours || {};
-                              const dayData = currentHours[day] || {
-                                open: '08:00',
-                                close: '22:00',
-                                closed: false,
-                              };
-                              updateFieldValue('operatingHours', {
-                                ...currentHours,
-                                [day]: { ...dayData, close: e.target.value },
-                              });
-                            }}
-                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none"
-                          />
+                          {!hours.closed && (
+                            <div className="flex items-center gap-4 w-[90%]">
+                              <div className="flex-1 space-y-1">
+                                <span className="text-[8px] text-white/50 uppercase font-black ml-1">
+                                  Abertura
+                                </span>
+                                <input
+                                  type="time"
+                                  value={hours.open || ''}
+                                  onChange={(e) => {
+                                    const currentHours = formData.operatingHours || {};
+                                    const dayData = currentHours[day] || {
+                                      open: '08:00',
+                                      close: '22:00',
+                                      closed: false,
+                                    };
+                                    updateFieldValue('operatingHours', {
+                                      ...currentHours,
+                                      [day]: { ...dayData, open: e.target.value },
+                                    });
+                                  }}
+                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none"
+                                />
+                              </div>
+                              <div className="flex-1 space-y-1">
+                                <span className="text-[8px] text-white/50 uppercase font-black ml-1">
+                                  Fechamento
+                                </span>
+                                <input
+                                  type="time"
+                                  value={hours.close || ''}
+                                  onChange={(e) => {
+                                    const currentHours = formData.operatingHours || {};
+                                    const dayData = currentHours[day] || {
+                                      open: '08:00',
+                                      close: '22:00',
+                                      closed: false,
+                                    };
+                                    updateFieldValue('operatingHours', {
+                                      ...currentHours,
+                                      [day]: { ...dayData, close: e.target.value },
+                                    });
+                                  }}
+                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none"
+                                />
+                              </div>
+                            </div>
+                          )}
                         </div>
-                      </div>
-                    )}
-                  </div>
-                );
-              })}
-            </div>
-          </div>
+                      );
+                    }
+                  )}
+                </div>
+              </div>
+            </>
+          )}
         </div>
       ) : (
         <div className="py-20 text-center">

=== src/domain/partners/components/steps/Step5Media.tsx — diff ===
@@ -277,15 +277,12 @@ export function Step5Media({
                             ))}
                           </div>
                         )}
-                        {(formData.menuLink || formData.menuFile) && (
+                        {formData.menuLink && (
                           <div className="space-y-1">
                             <p className="text-[9px] text-white/50 uppercase font-black">
                               Cardápio Digital
                             </p>
-                            <p className="text-xs text-indigo-400 truncate">
-                              {formData.menuLink ||
-                                (formData.menuFile ? `Arquivo: ${formData.menuFile.name}` : '')}
-                            </p>
+                            <p className="text-xs text-indigo-400 truncate">{formData.menuLink}</p>
                           </div>
                         )}
                       </div>

=== src/domain/partners/components/steps/details/DetailFields.tsx — ARQUIVO NOVO, conteúdo completo ===
import { cn } from '../../../../../shared/utils/cn';

const LABEL = 'text-[10px] font-black uppercase tracking-widest text-white/50 ml-1 block';
const INPUT =
  'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">{message}</p>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = 'text',
  required,
  multiline,
  maxLength = 300,
  error,
}: TextFieldProps) {
  const className = cn(
    INPUT,
    error ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10'
  );
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className={className}
        />
      ) : (
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
        />
      )}
      <FieldError message={error} />
    </div>
  );
}

interface ChipGroupProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function ChipGroup({ label, options, selected, onToggle, required, error }: ChipGroupProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selected.includes(option)}
            onClick={() => onToggle(option)}
            className={cn(
              'min-h-[44px] px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400/50',
              selected.includes(option)
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

interface YesNoFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  return (
    <fieldset className="space-y-3">
      <legend className={LABEL}>{label}</legend>
      <div className="flex gap-2">
        {([true, false] as const).map((option) => (
          <button
            key={String(option)}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              'flex-1 min-h-[44px] rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50',
              value === option
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            )}
          >
            {option ? 'Sim' : 'Não'}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

=== src/domain/partners/components/steps/details/HotelDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../../../shared/utils/cn';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const breakfastOptions = [
  'A lá carte',
  'Americano',
  'Buffet',
  'Vegano',
  'Vegetariano',
  'Glúten-free',
  'Italiano',
  'Asiático',
];

const amenityOptions = [
  'Restaurante',
  'Serviço de quarto',
  'Bar',
  'Recepção 24 horas',
  'Sauna',
  'Academia',
  'Jardim',
  'Terraço',
  'Transporte para o aeroporto',
  'Quartos familiares',
  'Spa e centro de bem-estar',
  'Banheira de hidromassagem',
  'Wi-Fi gratuito',
  'Ar condicionado',
  'Parque aquático',
  'Estação de carregamento de veículos elétricos',
  'Piscina',
];

/** Campos da inscrição de hospedagem. */
export function HotelDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const toggleBreakfastType = (value: string) => toggleInList('breakfastTypes', value);
  const toggleAmenity = (value: string) => toggleInList('amenities', value);

  return (
    <div className="space-y-8">
      {/* Café da Manhã Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
            Café da Manhã
          </label>

          {/* Serve Café? */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white/80 ml-1">
              Serve café da manhã ao hóspede? <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-2">
              {[
                { v: true, l: 'Sim' },
                { v: false, l: 'Não' },
              ].map((opt) => (
                <button
                  key={opt.l}
                  type="button"
                  onClick={() => updateFieldValue('servesBreakfast', opt.v)}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95',
                    formData.servesBreakfast === opt.v
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  )}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            {getFieldError('servesBreakfast') && (
              <p className="text-xs text-red-400 font-medium ml-1">
                {getFieldError('servesBreakfast')}
              </p>
            )}
          </div>

          <AnimatePresence>
            {formData.servesBreakfast && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                {/* Incluso no preço? */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-white/80 ml-1">
                    O café está incluso no preço da estadia? <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { v: true, l: 'Sim, está incluso' },
                      { v: false, l: 'Não, é cobrado à parte' },
                    ].map((opt) => (
                      <button
                        key={opt.l}
                        type="button"
                        onClick={() => updateFieldValue('breakfastIncluded', opt.v)}
                        className={cn(
                          'w-full py-4 px-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-left transition-all active:scale-[0.98]',
                          formData.breakfastIncluded === opt.v
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                        )}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                  {getFieldError('breakfastIncluded') && (
                    <p className="text-xs text-red-400 font-medium ml-1">
                      {getFieldError('breakfastIncluded')}
                    </p>
                  )}
                </div>

                {/* Preço se não incluso */}
                {formData.breakfastIncluded === false && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2 pl-4 border-l-2 border-indigo-500/30"
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                      Preço por pessoa/dia (com impostos) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400">
                        R$
                      </span>
                      <input
                        type="text"
                        value={formData.breakfastPrice || ''}
                        onChange={(e) => updateFieldValue('breakfastPrice', e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
                      />
                    </div>
                    {getFieldError('breakfastPrice') && (
                      <p className="text-xs text-red-400 font-medium ml-1">
                        {getFieldError('breakfastPrice')}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Tipos de Café */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-white/80 ml-1">
                    Tipos de café da manhã oferecidos:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {breakfastOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleBreakfastType(type)}
                        className={cn(
                          'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all',
                          (formData.breakfastTypes || []).includes(type)
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Comodidades Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Comodidades
        </label>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
                (formData.amenities || []).includes(amenity)
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-all',
                  (formData.amenities || []).includes(amenity)
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-white/10'
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                {amenity}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

=== src/domain/partners/components/steps/details/RentalDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChipGroup, TextField, YesNoField } from './DetailFields';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const RENTAL_VEHICLE_OPTIONS = [
  'Quadriciclo',
  'Buggy',
  'UTV',
  'Bicicleta',
  'Bicicleta elétrica',
  'Stand up paddle',
  'Caiaque',
  'Equipamento de kitesurf',
] as const;

const RENTAL_INCLUDES_OPTIONS = ['Capacete', 'Combustível', 'Seguro', 'Colete', 'Mapa'] as const;

/** Campos da inscrição de aluguel: o turista usa o veículo ou equipamento por um período (decisão D9). */
export function RentalDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);

  return (
    <div className="space-y-8">
      <ChipGroup
        label="O que é alugado"
        options={RENTAL_VEHICLE_OPTIONS}
        selected={formData.rentalVehicles}
        onToggle={(value) => toggleInList('rentalVehicles', value)}
        required
        error={getFieldError('rentalVehicles')}
      />
      <TextField
        id="rental-min-hours"
        label="Período mínimo (horas)"
        inputMode="numeric"
        value={formData.minRentalHours}
        onChange={(value) => updateFieldValue('minRentalHours', value.replace(/\D/g, ''))}
        placeholder="Ex: 2"
        required
        error={getFieldError('minRentalHours')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <YesNoField
          label="Exige caução"
          value={formData.depositRequired}
          onChange={(value) => updateFieldValue('depositRequired', value)}
        />
        <YesNoField
          label="Exige habilitação (CNH)"
          value={formData.driverLicenseRequired}
          onChange={(value) => updateFieldValue('driverLicenseRequired', value)}
        />
      </div>
      <ChipGroup
        label="O que está incluído"
        options={RENTAL_INCLUDES_OPTIONS}
        selected={formData.rentalIncludes}
        onToggle={(value) => toggleInList('rentalIncludes', value)}
      />
    </div>
  );
}

=== src/domain/partners/components/steps/details/RestaurantDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Globe, Utensils, LayoutList } from 'lucide-react';
import { cn } from '../../../../../shared/utils/cn';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const mealTypeOptions = [
  'Café da Manhã',
  'Buffet',
  'Almoço',
  'Jantar',
  'Petiscos',
  'Drinks',
  'Vinhos',
];

const additionalServiceOptions = [
  'Delivery',
  'Reservas Online',
  'Música ao Vivo',
  'Eventos Privados',
];

const restaurantAmenityOptions = [
  'Wi-Fi Gratuito',
  'Ar Condicionado',
  'Pé na areia',
  'Área Externa/Jardim',
  'Estacionamento',
  'Acessibilidade',
  'Aceita Pets',
];

/** Campos da inscrição de restaurante (o cardápio é só por link). */
export function RestaurantDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const toggleMealType = (value: string) => toggleInList('mealTypes', value);
  const toggleAdditionalService = (value: string) => toggleInList('additionalServices', value);
  const toggleRestaurantAmenity = (value: string) => toggleInList('amenitiesRestaurant', value);

  return (
    <div className="space-y-8">
      {/* Cardápio digital */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Cardápio Digital
        </label>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Link do Cardápio
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <Globe size={16} />
            </div>
            <input
              type="url"
              value={formData.menuLink || ''}
              onChange={(e) => updateFieldValue('menuLink', e.target.value)}
              placeholder="https://..."
              className={cn(
                'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                getFieldError('menuLink')
                  ? 'border-red-500/50 ring-2 ring-red-500/10'
                  : 'border-white/10'
              )}
            />
            {getFieldError('menuLink') && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                {getFieldError('menuLink')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subcategoria e Culinária */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Subcategoria <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <LayoutList size={16} />
            </div>
            <input
              type="text"
              value={formData.subcategory || ''}
              onChange={(e) => updateFieldValue('subcategory', e.target.value)}
              placeholder="Ex: Restaurante, Bar, Café..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
            />
          </div>
          {getFieldError('subcategory') && (
            <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('subcategory')}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Tipo de Culinária
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <Utensils size={16} />
            </div>
            <input
              type="text"
              value={formData.cuisineType || ''}
              onChange={(e) => updateFieldValue('cuisineType', e.target.value)}
              placeholder="Ex: Italiana, Japonesa..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
            />
          </div>
          {getFieldError('cuisineType') && (
            <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('cuisineType')}</p>
          )}
        </div>
      </div>

      {/* Tipos de Refeição */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Tipos de Refeição e Bebidas
        </label>
        <div className="flex flex-wrap gap-2">
          {mealTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleMealType(type)}
              className={cn(
                'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                (formData.mealTypes || []).includes(type)
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {getFieldError('mealTypes') && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
            {getFieldError('mealTypes')}
          </p>
        )}
      </div>

      {/* Serviços Adicionais */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Serviços Adicionais
        </label>
        <div className="flex flex-wrap gap-2">
          {additionalServiceOptions.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleAdditionalService(service)}
              className={cn(
                'px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                (formData.additionalServices || []).includes(service)
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Comodidades Restaurante */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Comodidades
        </label>
        <div className="grid grid-cols-2 gap-2">
          {restaurantAmenityOptions.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleRestaurantAmenity(amenity)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
                (formData.amenitiesRestaurant || []).includes(amenity)
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-all',
                  (formData.amenitiesRestaurant || []).includes(amenity)
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-white/10'
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                {amenity}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

=== src/domain/partners/components/steps/details/SightDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../../../shared/utils/cn';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const sightServiceOptions = ['Estacionamento', 'Guia Turístico', 'Aluguel de Equipamentos'];

const sightAmenityOptions = [
  'Piscina',
  'Restaurante/Bar',
  'Vestiários',
  'Wi-Fi Gratuito',
  'Área de Acampamento',
  'Aceita Pets',
  'Acessibilidade',
  'Espaço para Eventos',
];

const sightActivityOptions = [
  'Trilhas',
  'Esportes Aquáticos',
  'Pesca',
  'Passeios de Barco',
  'Fotografia',
  'Observação de Pássaros',
  'Ecoturismo',
  'Banho de Mar/Rio',
];

/** Campos da inscrição de atração. */
export function SightDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const toggleSightService = (value: string) => toggleInList('sightServices', value);
  const toggleSightAmenity = (value: string) => toggleInList('sightAmenities', value);
  const toggleSightActivity = (value: string) => toggleInList('sightActivities', value);

  return (
    <div className="space-y-10">
      {/* Acesso (Pago ou Gratuito) */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Acesso à Atração <span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['pago', 'gratuito'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                updateFieldValue('sightAccessType', type);
                if (type === 'gratuito') updateFieldValue('sightPrice', '');
              }}
              className={cn(
                'px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
                formData.sightAccessType === type
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {getFieldError('sightAccessType') && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
            {getFieldError('sightAccessType')}
          </p>
        )}

        <AnimatePresence>
          {formData.sightAccessType === 'pago' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-2"
            >
              <label className="text-[9px] font-black uppercase tracking-widest text-white/50 block ml-1">
                Preço por pessoa
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-indigo-400 transition-colors text-[10px] font-black">
                  R$
                </div>
                <input
                  type="text"
                  placeholder="0,00"
                  value={formData.sightPrice || ''}
                  onChange={(e) => updateFieldValue('sightPrice', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white text-[11px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/50"
                />
              </div>
              {getFieldError('sightPrice') && (
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
                  {getFieldError('sightPrice')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Serviços oferecidos */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Serviços Oferecidos
        </label>
        <div className="flex flex-wrap gap-2">
          {sightServiceOptions.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleSightService(service)}
              className={cn(
                'px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                (formData.sightServices || []).includes(service)
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
              )}
            >
              {service}
            </button>
          ))}
        </div>
        {getFieldError('sightServices') && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
            {getFieldError('sightServices')}
          </p>
        )}
      </div>

      {/* Confortos / Comodidades */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Confortos e Estrutura
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sightAmenityOptions.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleSightAmenity(amenity)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
                (formData.sightAmenities || []).includes(amenity)
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-all',
                  (formData.sightAmenities || []).includes(amenity)
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-white/10'
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                {amenity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Atividades disponíveis */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Atividades Disponíveis
        </label>
        <p className="text-[9px] text-white/50 uppercase font-black ml-1">
          Quais experiências o turista pode vivenciar?
        </p>
        <div className="flex flex-wrap gap-2">
          {sightActivityOptions.map((activity) => (
            <button
              key={activity}
              type="button"
              onClick={() => toggleSightActivity(activity)}
              className={cn(
                'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                (formData.sightActivities || []).includes(activity)
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
              )}
            >
              {activity}
            </button>
          ))}
        </div>
        {getFieldError('sightActivities') && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
            {getFieldError('sightActivities')}
          </p>
        )}
      </div>
    </div>
  );
}

=== src/domain/partners/components/steps/details/TourDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChipGroup, TextField } from './DetailFields';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const TOUR_INCLUDES_OPTIONS = [
  'Guia credenciado',
  'Transporte',
  'Água e lanche',
  'Almoço',
  'Ingressos das paradas',
  'Equipamentos',
  'Fotos',
  'Seguro',
] as const;

/** Campos da inscrição de passeio: atividade guiada com roteiro (decisão D9). */
export function TourDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="tour-duration"
          label="Duração (horas)"
          inputMode="decimal"
          value={formData.tourDurationHours}
          onChange={(value) => updateFieldValue('tourDurationHours', value)}
          placeholder="Ex: 4"
          required
          error={getFieldError('tourDurationHours')}
        />
        <TextField
          id="tour-meeting-point"
          label="Ponto de encontro"
          value={formData.meetingPoint}
          onChange={(value) => updateFieldValue('meetingPoint', value)}
          placeholder="Ex: Em frente à Igreja de Jeri"
          required
          error={getFieldError('meetingPoint')}
        />
      </div>
      <TextField
        id="tour-itinerary"
        label="Roteiro"
        multiline
        maxLength={2000}
        value={formData.itinerary}
        onChange={(value) => updateFieldValue('itinerary', value)}
        placeholder="Paradas, horários e o que o turista vai ver"
        error={getFieldError('itinerary')}
      />
      <ChipGroup
        label="O que está incluído"
        options={TOUR_INCLUDES_OPTIONS}
        selected={formData.tourIncludes}
        onToggle={(value) => toggleInList('tourIncludes', value)}
      />
    </div>
  );
}

=== src/domain/partners/components/steps/details/TransferDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Plus, Trash2 } from 'lucide-react';
import { ChipGroup, TextField } from './DetailFields';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const TRANSFER_VEHICLE_OPTIONS = [
  'Carro',
  'Caminhonete 4x4',
  'Van',
  'Micro-ônibus',
  'Jardineira',
  'Buggy',
] as const;

const MAX_ROUTES = 30;

/** Campos da inscrição de translado: trechos, veículos e capacidade (decisão D9). */
export function TransferDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const routes = formData.transferRoutes;

  const setRoute = (index: number, field: 'from' | 'to', value: string) => {
    updateFieldValue(
      'transferRoutes',
      routes.map((route, i) => (i === index ? { ...route, [field]: value } : route))
    );
  };

  return (
    <div className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Trechos atendidos <span className="text-red-500">*</span>
        </legend>
        {routes.map((route, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <TextField
              id={`transfer-from-${index}`}
              label="Origem"
              value={route.from}
              maxLength={100}
              onChange={(value) => setRoute(index, 'from', value)}
              placeholder="Ex: Aeroporto de Fortaleza"
            />
            <TextField
              id={`transfer-to-${index}`}
              label="Destino"
              value={route.to}
              maxLength={100}
              onChange={(value) => setRoute(index, 'to', value)}
              placeholder="Ex: Jericoacoara"
            />
            <button
              type="button"
              aria-label={`Remover trecho ${index + 1}`}
              onClick={() =>
                updateFieldValue(
                  'transferRoutes',
                  routes.filter((_, i) => i !== index)
                )
              }
              className="w-11 h-11 mb-1 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        {routes.length < MAX_ROUTES && (
          <button
            type="button"
            onClick={() => updateFieldValue('transferRoutes', [...routes, { from: '', to: '' }])}
            className="min-h-[44px] px-4 rounded-xl bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500/20 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <Plus size={14} aria-hidden="true" /> Adicionar trecho
          </button>
        )}
        {getFieldError('transferRoutes') && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
            {getFieldError('transferRoutes')}
          </p>
        )}
      </fieldset>

      <ChipGroup
        label="Veículos"
        options={TRANSFER_VEHICLE_OPTIONS}
        selected={formData.transferVehicles}
        onToggle={(value) => toggleInList('transferVehicles', value)}
        required
        error={getFieldError('transferVehicles')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="transfer-max-passengers"
          label="Passageiros por veículo (máximo)"
          inputMode="numeric"
          value={formData.maxPassengers}
          onChange={(value) => updateFieldValue('maxPassengers', value.replace(/\D/g, ''))}
          placeholder="Ex: 4"
          required
          error={getFieldError('maxPassengers')}
        />
        <TextField
          id="transfer-luggage"
          label="Bagagem"
          value={formData.luggageInfo}
          maxLength={500}
          onChange={(value) => updateFieldValue('luggageInfo', value)}
          placeholder="Ex: 1 mala grande e 1 de mão por pessoa"
        />
      </div>
    </div>
  );
}

=== src/domain/partners/components/steps/details/useDetailsForm.ts — ARQUIVO NOVO, conteúdo completo ===
import type React from 'react';
import { useFormContext } from 'react-hook-form';
import type { FormState } from '../../../types/partsForm';

/** A inscrição guarda o formulário sempre preenchido; o editor do painel pode estar vazio (null). */
export type FormStateSetter =
  | React.Dispatch<React.SetStateAction<FormState>>
  | React.Dispatch<React.SetStateAction<FormState | null>>;

export interface DetailsSectionProps {
  formData: FormState;
  setFormData: FormStateSetter;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

/** Leitura e escrita dos campos de detalhe, iguais na inscrição e no editor do painel. */
export function useDetailsForm({
  formData: propFormData,
  setFormData,
  errors,
  setErrors,
}: DetailsSectionProps) {
  const formContext = useFormContext<FormState>();
  const formData = formContext ? formContext.watch() : propFormData;
  const rhfErrors = formContext ? formContext.formState.errors : {};

  const getFieldError = (field: string): string | undefined =>
    errors[field] ||
    (rhfErrors as Record<string, { message?: unknown }>)[field]?.message?.toString();

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const updateFieldValue = (field: string, value: unknown) => {
    if (formContext) {
      formContext.setValue(field as keyof FormState, value as never, { shouldValidate: true });
    }
    (setFormData as React.Dispatch<React.SetStateAction<FormState | null>>)((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
    clearError(field);
  };

  const toggleInList = (field: keyof FormState, value: string) => {
    const current = (formData[field] as string[] | undefined) ?? [];
    updateFieldValue(
      field,
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  return { formData, getFieldError, updateFieldValue, toggleInList };
}

=== src/domain/partners/constants/formDefaults.ts — diff ===
@@ -19,7 +19,6 @@ export const INITIAL_FORM_DATA: FormState = {
   breakfastTypes: [],
   amenities: [],
   menuLink: '',
-  menuFile: null,
   subcategory: '',
   cuisineType: '',
   mealTypes: [],
@@ -32,6 +31,19 @@ export const INITIAL_FORM_DATA: FormState = {
   sightAccessType: '',
   sightPrice: '',
   languages: [],
+  tourDurationHours: '',
+  meetingPoint: '',
+  itinerary: '',
+  tourIncludes: [],
+  transferRoutes: [],
+  transferVehicles: [],
+  maxPassengers: '',
+  luggageInfo: '',
+  rentalVehicles: [],
+  minRentalHours: '',
+  depositRequired: null,
+  driverLicenseRequired: null,
+  rentalIncludes: [],
   checkInFrom: '',
   checkInTo: '',
   checkOutFrom: '',

=== src/domain/partners/constants/listingCategories.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Bed, Bike, Calendar, Camera, Car, Compass, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ListingCategoryOption {
  id: string;
  label: string;
  icon: ReactNode;
}

/**
 * Categorias que o parceiro pode cadastrar, na inscrição e no painel (decisão D9). A categoria
 * pertence ao cadastro: uma mesma conta pode ter várias. `producer` é o perfil de produtor de eventos.
 */
export const LISTING_CATEGORIES: ListingCategoryOption[] = [
  { id: 'hotel', label: 'Hospedagem', icon: <Bed size={18} aria-hidden="true" /> },
  { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={18} aria-hidden="true" /> },
  { id: 'sight', label: 'Atrações turísticas', icon: <Camera size={18} aria-hidden="true" /> },
  { id: 'tour', label: 'Passeios', icon: <Compass size={18} aria-hidden="true" /> },
  { id: 'transfer', label: 'Translados', icon: <Car size={18} aria-hidden="true" /> },
  { id: 'rental', label: 'Aluguéis', icon: <Bike size={18} aria-hidden="true" /> },
  {
    id: 'producer',
    label: 'Eventos (sou produtor)',
    icon: <Calendar size={18} aria-hidden="true" />,
  },
];

=== src/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -154,6 +154,49 @@ describe('Partner Validation Schemas (Frontend)', () => {
       });
       expect(result.success).toBe(true);
     });
+
+    it('tour exige duração positiva e ponto de encontro', () => {
+      expect(
+        step3Schema.safeParse({ category: 'tour', tourDurationHours: '3', meetingPoint: 'Vila' })
+          .success
+      ).toBe(true);
+      const invalid = step3Schema.safeParse({ category: 'tour', tourDurationHours: '0' });
+      expect(invalid.success).toBe(false);
+      const paths = invalid.error?.issues.map((issue) => issue.path[0]);
+      expect(paths).toEqual(expect.arrayContaining(['tourDurationHours', 'meetingPoint']));
+    });
+
+    it('transfer exige um trecho completo, um veículo e a capacidade', () => {
+      expect(
+        step3Schema.safeParse({
+          category: 'transfer',
+          transferRoutes: [{ from: 'Fortaleza', to: 'Jericoacoara' }],
+          transferVehicles: ['Van'],
+          maxPassengers: '12',
+        }).success
+      ).toBe(true);
+      const invalid = step3Schema.safeParse({
+        category: 'transfer',
+        transferRoutes: [{ from: 'Fortaleza', to: ' ' }],
+      });
+      const paths = invalid.error?.issues.map((issue) => issue.path[0]);
+      expect(paths).toEqual(
+        expect.arrayContaining(['transferRoutes', 'transferVehicles', 'maxPassengers'])
+      );
+    });
+
+    it('rental exige o que é alugado e o período mínimo', () => {
+      expect(
+        step3Schema.safeParse({
+          category: 'rental',
+          rentalVehicles: ['Quadriciclo'],
+          minRentalHours: '2',
+        }).success
+      ).toBe(true);
+      const invalid = step3Schema.safeParse({ category: 'rental' });
+      const paths = invalid.error?.issues.map((issue) => issue.path[0]);
+      expect(paths).toEqual(expect.arrayContaining(['rentalVehicles', 'minRentalHours']));
+    });
   });
 
   describe('termsAccepted e Contexto de Cadastro (step5SchemaContext)', () => {

=== src/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -3,7 +3,15 @@ import { isValidCpfCnpj } from '../../../shared/utils/documentValidator';
 import type { UserSession } from '../../auth';
 
 // Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos.
-const partnerCategorySchema = z.enum(['sight', 'hotel', 'restaurant', 'producer']);
+const partnerCategorySchema = z.enum([
+  'sight',
+  'hotel',
+  'restaurant',
+  'tour',
+  'transfer',
+  'rental',
+  'producer',
+]);
 
 export const step1Schema = z
   .object({
@@ -95,14 +103,41 @@ export const step3Schema = z
     additionalServices: z.array(z.string()).optional().default([]),
     amenitiesRestaurant: z.array(z.string()).optional().default([]),
     menuLink: z.string().optional().default(''),
-    menuFile: z.any().optional().nullable(),
     sightAccessType: z.string().optional().default(''),
     sightPrice: z.string().optional().default(''),
     sightServices: z.array(z.string()).optional().default([]),
     sightAmenities: z.array(z.string()).optional().default([]),
     sightActivities: z.array(z.string()).optional().default([]),
+    tourDurationHours: z.string().optional().default(''),
+    meetingPoint: z.string().optional().default(''),
+    transferRoutes: z
+      .array(z.object({ from: z.string(), to: z.string() }))
+      .optional()
+      .default([]),
+    transferVehicles: z.array(z.string()).optional().default([]),
+    maxPassengers: z.string().optional().default(''),
+    rentalVehicles: z.array(z.string()).optional().default([]),
+    minRentalHours: z.string().optional().default(''),
   })
   .superRefine((data, ctx) => {
+    const require = (ok: boolean, path: string, message: string) => {
+      if (!ok) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
+    };
+    if (data.category === 'tour') {
+      const hours = Number(data.tourDurationHours.replace(',', '.'));
+      require(Number.isFinite(hours) && hours > 0, 'tourDurationHours', 'Informe a duração');
+      require(data.meetingPoint.trim() !== '', 'meetingPoint', 'Informe o ponto de encontro');
+    } else if (data.category === 'transfer') {
+      require(data.transferRoutes.some(
+        (route) => route.from.trim() && route.to.trim()
+      ), 'transferRoutes', 'Informe ao menos um trecho com origem e destino');
+      require(data.transferVehicles.length > 0, 'transferVehicles', 'Escolha ao menos um veículo');
+      require(Number.parseInt(data.maxPassengers, 10) > 0, 'maxPassengers', 'Informe a capacidade');
+    } else if (data.category === 'rental') {
+      require(data.rentalVehicles.length > 0, 'rentalVehicles', 'Escolha o que é alugado');
+      require(Number.parseInt(data.minRentalHours, 10) >
+        0, 'minRentalHours', 'Informe o período mínimo');
+    }
     if (data.category === 'hotel') {
       if (data.servesBreakfast === null || data.servesBreakfast === undefined) {
         ctx.addIssue({
@@ -320,7 +355,6 @@ export const partnerSubmissionSchema = z.object({
     )
     .optional(),
   menuLink: z.string().optional().default(''),
-  menuFile: z.any().optional().nullable(),
   sightActivities: z.array(z.string()).optional().default([]),
   sightServices: z.array(z.string()).optional().default([]),
   sightAmenities: z.array(z.string()).optional().default([]),

=== src/domain/partners/types/partner.ts — diff ===
@@ -5,7 +5,14 @@ export interface PartnerBusiness {
 }
 
 /** Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos. */
-export type PartnerSignupCategory = 'sight' | 'hotel' | 'restaurant' | 'producer';
+export type PartnerSignupCategory =
+  | 'sight'
+  | 'hotel'
+  | 'restaurant'
+  | 'tour'
+  | 'transfer'
+  | 'rental'
+  | 'producer';
 
 export interface PublicPartnerProfile {
   id: string;
@@ -63,6 +70,19 @@ export interface PartnerSubmissionData {
   sightAmenities?: string[];
   sightAccessType?: string;
   sightPrice?: string;
+  tourDurationHours?: string;
+  meetingPoint?: string;
+  itinerary?: string;
+  tourIncludes?: string[];
+  transferRoutes?: Array<{ from: string; to: string }>;
+  transferVehicles?: string[];
+  maxPassengers?: string;
+  luggageInfo?: string;
+  rentalVehicles?: string[];
+  minRentalHours?: string;
+  depositRequired?: boolean | null;
+  driverLicenseRequired?: boolean | null;
+  rentalIncludes?: string[];
 }
 
 export type PartnerVerificationType =

=== src/domain/partners/types/partnerContent.ts — diff ===
@@ -1,4 +1,16 @@
 export interface PartnerOperationalInfo {
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
   tags?: string[];
   cuisineType?: string;
   subcategory?: string;

=== src/domain/partners/types/partsForm.ts — diff ===
@@ -29,7 +29,6 @@ export interface FormState {
   breakfastTypes: string[];
   amenities: string[];
   menuLink: string;
-  menuFile: File | null;
   subcategory: string;
   cuisineType: string;
   mealTypes: string[];
@@ -42,6 +41,22 @@ export interface FormState {
   sightAccessType: 'pago' | 'gratuito' | '';
   sightPrice: string;
   languages: string[];
+  // Passeio
+  tourDurationHours: string;
+  meetingPoint: string;
+  itinerary: string;
+  tourIncludes: string[];
+  // Translado
+  transferRoutes: Array<{ from: string; to: string }>;
+  transferVehicles: string[];
+  maxPassengers: string;
+  luggageInfo: string;
+  // Aluguel
+  rentalVehicles: string[];
+  minRentalHours: string;
+  depositRequired: boolean | null;
+  driverLicenseRequired: boolean | null;
+  rentalIncludes: string[];
   checkInFrom: string;
   checkInTo: string;
   checkOutFrom: string;

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 138 arquivos, 784 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
