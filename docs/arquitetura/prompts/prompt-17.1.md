# Prompt 17.1 — Preço dos planos em centavos inteiros

> Lote 9, gerado do commit de referência `f036c3e` da branch `claude/agents-md-v2`. Aplique depois do Prompt 16.1, na ordem 16.1 → 17 → 17.1 → 17.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 17.1 — Preço dos planos em centavos inteiros

Decisão D8: valores monetários em centavos (AGENTS.md §1).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

O QUE MUDA:
1) Planos usam priceMinor e monthlyEquivalentMinor (inteiros) no servidor, no admin e no painel do parceiro.
2) Checkout do plano recebe amountMinor; valores exibidos com Intl (src/shared/utils/money.ts).

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts (alterar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts (alterar)
- server/domain/admin/adapters/firestoreAdminPlansAdapter.test.ts (alterar)
- server/domain/admin/adapters/firestoreAdminPlansAdapter.ts (alterar)
- server/domain/admin/dtos/updateSubscriptionPlanDTO.test.ts (alterar)
- server/domain/admin/dtos/updateSubscriptionPlanDTO.ts (alterar)
- server/domain/admin/schemas/adminPlanSchema.test.ts (alterar)
- server/domain/admin/schemas/adminPlanSchema.ts (alterar)
- server/domain/admin/services/adminPlansService.test.ts (alterar)
- server/domain/admin/services/adminPlansService.ts (alterar)
- server/domain/admin/types/subscriptionPlan.ts (alterar)
- server/domain/payment/controllers/paymentController.test.ts (alterar)
- server/domain/payment/controllers/paymentController.ts (alterar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/admin/adapters/firestoreAdminPlansAdapter.ts (alterar)
- src/domain/admin/application/usecases/updateSubscriptionPlanUseCase.ts (alterar)
- src/domain/admin/components/subcomponents/AdminPlansView.tsx (alterar)
- src/domain/admin/ports/adminPlansPort.ts (alterar)
- src/domain/admin/types/admin.ts (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/subcomponents/PlansModal.tsx (alterar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/payment/components/CheckoutModal.tsx (alterar)
- src/domain/payment/components/subcomponents/OneTimePlanCheckout.tsx (alterar)
- src/domain/payment/components/subcomponents/SubscriptionPlanCheckout.tsx (alterar)
- src/domain/payment/components/subcomponents/SuccessPaymentGlass.tsx (alterar)
- src/domain/payment/utils/formatPlanAmount.ts (alterar)
- src/shared/utils/money.test.ts (criar)
- src/shared/utils/money.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts — diff ===
@@ -18,7 +18,7 @@ function mockPlan(overrides: Record<string, unknown> = {}) {
   vi.mocked(getSubscriptionPlanByIdUseCase).mockResolvedValue({
     id: 'semi-annual',
     name: 'Semestral',
-    price: 249.9,
+    priceMinor: 24990,
     isActive: true,
     ...overrides,
   } as never);

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts — diff ===
@@ -38,7 +38,7 @@ export async function startPartnerPlanSubscriptionApplicationUseCase(
     locale: input.locale,
     planId: input.planId,
     planName: plan.name,
-    amountMinor: Math.round(Number(plan.price) * 100),
+    amountMinor: plan.priceMinor,
     ...BILLING_INTERVAL[input.planId],
     currentVerifiedUntil: profile.verifiedUntil ?? null,
     idempotencyKey: input.idempotencyKey,

=== server/domain/admin/adapters/firestoreAdminPlansAdapter.test.ts — diff ===
@@ -44,7 +44,7 @@ describe('FirestoreAdminPlansAdapter', () => {
 
     await adapter.updatePlan('monthly', {
       name: 'Plano Mensal',
-      price: 59.9,
+      priceMinor: 5990,
       description: 'Descrição atualizada',
       isActive: true,
     });
@@ -53,7 +53,7 @@ describe('FirestoreAdminPlansAdapter', () => {
     expect(mocks.doc).toHaveBeenCalledWith('monthly');
     expect(mocks.update).toHaveBeenCalledWith({
       name: 'Plano Mensal',
-      price: 59.9,
+      priceMinor: 5990,
       description: 'Descrição atualizada',
       isActive: true,
       updatedAt: 'SERVER_TIMESTAMP',

=== server/domain/admin/adapters/firestoreAdminPlansAdapter.ts — diff ===
@@ -14,12 +14,11 @@ function mapSubscriptionPlan(
   return {
     id: id as SubscriptionPlan['id'],
     name: typeof data.name === 'string' ? data.name : '',
-    price: typeof data.price === 'number' ? data.price : 0,
+    priceMinor: Number.isInteger(data.priceMinor) ? data.priceMinor : 0,
     period: typeof data.period === 'string' ? data.period : '',
-    monthlyEquivalent:
-      typeof data.monthlyEquivalent === 'number'
-        ? data.monthlyEquivalent
-        : null,
+    monthlyEquivalentMinor: Number.isInteger(data.monthlyEquivalentMinor)
+      ? data.monthlyEquivalentMinor
+      : null,
     savingLabel:
       typeof data.savingLabel === 'string'
         ? data.savingLabel

=== server/domain/admin/dtos/updateSubscriptionPlanDTO.test.ts — diff ===
@@ -4,10 +4,10 @@ import { UpdateSubscriptionPlanDTO } from './updateSubscriptionPlanDTO';
 
 describe('UpdateSubscriptionPlanDTO', () => {
   it('mantém apenas campos informados e entrega objeto imutável', () => {
-    const parsed = updatePlanSchema.parse({ name: 'Plano Anual', price: '299,90'.replace(',', '.') });
+    const parsed = updatePlanSchema.parse({ name: 'Plano Anual', priceMinor: 29990 });
     const dto = UpdateSubscriptionPlanDTO.fromValidatedInput(parsed);
 
-    expect(dto.fields).toEqual({ name: 'Plano Anual', price: 299.9 });
+    expect(dto.fields).toEqual({ name: 'Plano Anual', priceMinor: 29990 });
     expect(Object.isFrozen(dto.fields)).toBe(true);
   });
 });

=== server/domain/admin/dtos/updateSubscriptionPlanDTO.ts — diff ===
@@ -7,7 +7,7 @@ export class UpdateSubscriptionPlanDTO {
   static fromValidatedInput(input: UpdatePlanInput): UpdateSubscriptionPlanDTO {
     const fields: UpdateSubscriptionPlanInput = {};
     if (input.name !== undefined) fields.name = input.name;
-    if (input.price !== undefined) fields.price = input.price;
+    if (input.priceMinor !== undefined) fields.priceMinor = input.priceMinor;
     if (input.period !== undefined) fields.period = input.period;
     if (input.description !== undefined) fields.description = input.description;
     if (input.isActive !== undefined) fields.isActive = input.isActive;

=== server/domain/admin/schemas/adminPlanSchema.test.ts — diff ===
@@ -2,10 +2,10 @@ import { describe, expect, it } from 'vitest';
 import { updatePlanSchema } from './adminPlanSchema';
 
 describe('updatePlanSchema', () => {
-  it('aceita description e campos válidos', () => {
+  it('aceita description e preço em centavos', () => {
     const result = updatePlanSchema.safeParse({
       name: 'Plano Anual',
-      price: 299.9,
+      priceMinor: 29990,
       period: '/ano',
       description: 'Ideal para estabelecimentos de alta temporada',
       isActive: true,
@@ -13,63 +13,35 @@ describe('updatePlanSchema', () => {
 
     expect(result.success).toBe(true);
     if (result.success) {
-      expect(result.data.description).toBe(
-        'Ideal para estabelecimentos de alta temporada'
-      );
-      expect(result.data.price).toBe(299.9);
+      expect(result.data.description).toBe('Ideal para estabelecimentos de alta temporada');
+      expect(result.data.priceMinor).toBe(29990);
     }
   });
 
-  it('rejeita campo desconhecido (ex: ownerId, id, monthlyEquivalent)', () => {
-    expect(
-      updatePlanSchema.safeParse({
-        name: 'Plano',
-        ownerId: 'hacker-1',
-      }).success
-    ).toBe(false);
-
-    expect(
-      updatePlanSchema.safeParse({
-        name: 'Plano',
-        id: 'annual',
-      }).success
-    ).toBe(false);
-
-    expect(
-      updatePlanSchema.safeParse({
-        name: 'Plano',
-        monthlyEquivalent: 25,
-      }).success
-    ).toBe(false);
+  it('rejeita campo desconhecido (ex: ownerId, id, equivalente mensal, preço em reais)', () => {
+    for (const extra of [
+      { ownerId: 'hacker-1' },
+      { id: 'annual' },
+      { monthlyEquivalentMinor: 2500 },
+      { price: 299.9 },
+    ]) {
+      expect(updatePlanSchema.safeParse({ name: 'Plano', ...extra }).success).toBe(false);
+    }
   });
 
   it('rejeita corpo vazio', () => {
     expect(updatePlanSchema.safeParse({}).success).toBe(false);
   });
 
-  it('rejeita price inválido, NaN, Infinity e negativo', () => {
-    expect(
-      updatePlanSchema.safeParse({
-        price: 'abc',
-      }).success
-    ).toBe(false);
-
-    expect(
-      updatePlanSchema.safeParse({
-        price: Number.NaN,
-      }).success
-    ).toBe(false);
-
-    expect(
-      updatePlanSchema.safeParse({
-        price: Number.POSITIVE_INFINITY,
-      }).success
-    ).toBe(false);
-
-    expect(
-      updatePlanSchema.safeParse({
-        price: -10,
-      }).success
-    ).toBe(false);
+  it('rejeita preço com casas decimais, texto, NaN, Infinity e negativo', () => {
+    for (const priceMinor of [
+      299.9,
+      '29990',
+      Number.NaN,
+      Number.POSITIVE_INFINITY,
+      -10,
+    ]) {
+      expect(updatePlanSchema.safeParse({ priceMinor }).success).toBe(false);
+    }
   });
 });

=== server/domain/admin/schemas/adminPlanSchema.ts — diff ===
@@ -1,23 +1,11 @@
 import { z } from 'zod';
 
-const finiteNonNegativeNumber = z.preprocess(
-  (value) => {
-    if (typeof value === 'string') {
-      const normalized = value.trim();
-      if (!normalized) {
-        return undefined;
-      }
-      return Number(normalized);
-    }
-    return value;
-  },
-  z.number().finite().nonnegative()
-);
 
 export const updatePlanSchema = z
   .object({
     name: z.string().trim().min(1).max(200).optional(),
-    price: finiteNonNegativeNumber.optional(),
+    // Centavos inteiros: R$ 49,90 = 4990.
+    priceMinor: z.number().int().nonnegative().max(100_000_000).optional(),
     period: z.string().trim().min(1).max(50).optional(),
     description: z.string().trim().max(300).optional(),
     isActive: z.boolean().optional(),

=== server/domain/admin/services/adminPlansService.test.ts — diff ===
@@ -26,47 +26,47 @@ describe('AdminPlansService', () => {
   it('delega updatePlan para o port quando planId for válido', async () => {
     await service.updatePlan('monthly', {
       name: 'Plano Mensal',
-      price: 49.9,
+      priceMinor: 4990,
       description: 'Acesso completo mensal',
     });
 
     expect(port.updatePlan).toHaveBeenCalledWith('monthly', {
       name: 'Plano Mensal',
-      price: 49.9,
+      priceMinor: 4990,
       description: 'Acesso completo mensal',
     });
   });
 
-  it('deriva monthlyEquivalent do preço para planos semestral e anual', async () => {
-    await service.updatePlan('annual', { price: 299.9 });
-    await service.updatePlan('semi-annual', { price: 150 });
+  it('deriva o equivalente mensal (centavos) do preço para planos semestral e anual', async () => {
+    await service.updatePlan('annual', { priceMinor: 29990 });
+    await service.updatePlan('semi-annual', { priceMinor: 15000 });
 
     expect(port.updatePlan).toHaveBeenNthCalledWith(1, 'annual', {
-      price: 299.9,
-      monthlyEquivalent: 24.99,
+      priceMinor: 29990,
+      monthlyEquivalentMinor: 2499,
     });
     expect(port.updatePlan).toHaveBeenNthCalledWith(2, 'semi-annual', {
-      price: 150,
-      monthlyEquivalent: 25,
+      priceMinor: 15000,
+      monthlyEquivalentMinor: 2500,
     });
   });
 
-  it('não altera monthlyEquivalent quando o preço não muda ou o plano é mensal', async () => {
+  it('não altera o equivalente mensal quando o preço não muda ou o plano é mensal', async () => {
     await service.updatePlan('annual', { name: 'Anual Premium' });
-    await service.updatePlan('monthly', { price: 49.9 });
+    await service.updatePlan('monthly', { priceMinor: 4990 });
 
     expect(port.updatePlan).toHaveBeenNthCalledWith(1, 'annual', { name: 'Anual Premium' });
-    expect(port.updatePlan).toHaveBeenNthCalledWith(2, 'monthly', { price: 49.9 });
+    expect(port.updatePlan).toHaveBeenNthCalledWith(2, 'monthly', { priceMinor: 4990 });
   });
 
   it('rejeita preço zero em plano pago, mas permite no trial', async () => {
-    await expect(service.updatePlan('monthly', { price: 0 })).rejects.toMatchObject({
+    await expect(service.updatePlan('monthly', { priceMinor: 0 })).rejects.toMatchObject({
       code: 'VALIDATION_ERROR',
     });
     expect(port.updatePlan).not.toHaveBeenCalled();
 
-    await service.updatePlan('trial', { price: 0 });
-    expect(port.updatePlan).toHaveBeenCalledWith('trial', { price: 0 });
+    await service.updatePlan('trial', { priceMinor: 0 });
+    expect(port.updatePlan).toHaveBeenCalledWith('trial', { priceMinor: 0 });
   });
 
   it('retorna null em getPlanById quando planId for vazio', async () => {
@@ -80,9 +80,9 @@ describe('AdminPlansService', () => {
     vi.mocked(port.getPlanById).mockResolvedValue({
       id: 'annual',
       name: 'Anual',
-      price: 299,
+      priceMinor: 29900,
       period: '/ano',
-      monthlyEquivalent: 24.9,
+      monthlyEquivalentMinor: 2492,
       savingLabel: 'Economize 20%',
       description: 'Plano anual',
       isActive: true,

=== server/domain/admin/services/adminPlansService.ts — diff ===
@@ -10,10 +10,6 @@ const BILLING_MONTHS_BY_PLAN: Partial<Record<SubscriptionPlan['id'], number>> =
   annual: 12,
 };
 
-function roundCurrency(value: number): number {
-  return Math.round(value * 100) / 100;
-}
-
 export class AdminPlansService {
   constructor(
     private readonly adminPlansPort: AdminPlansPort
@@ -30,18 +26,18 @@ export class AdminPlansService {
       );
     }
 
-    if (planId !== 'trial' && data.price !== undefined && data.price <= 0) {
+    if (planId !== 'trial' && data.priceMinor !== undefined && data.priceMinor <= 0) {
       throw new AdminDomainError(
         'VALIDATION_ERROR',
         'Planos pagos exigem preço maior que zero'
       );
     }
 
-    // monthlyEquivalent é exibido ao parceiro e não é editável pelo admin: derivar do preço evita valor defasado.
+    // O equivalente mensal é exibido ao parceiro e não é editável pelo admin: derivar do preço evita valor defasado.
     const months = BILLING_MONTHS_BY_PLAN[planId as SubscriptionPlan['id']];
     const derived =
-      data.price !== undefined && months
-        ? { monthlyEquivalent: roundCurrency(data.price / months) }
+      data.priceMinor !== undefined && months
+        ? { monthlyEquivalentMinor: Math.round(data.priceMinor / months) }
         : {};
 
     await this.adminPlansPort.updatePlan(planId, { ...data, ...derived });

=== server/domain/admin/types/subscriptionPlan.ts — diff ===
@@ -1,9 +1,11 @@
 export interface SubscriptionPlan {
   id: 'trial' | 'monthly' | 'semi-annual' | 'annual';
   name: string;
-  price: number;
+  /** Preço total do período, em centavos (AGENTS.md §1). */
+  priceMinor: number;
   period: string;
-  monthlyEquivalent: number | null;
+  /** Equivalente mensal em centavos, derivado do preço nos planos de 6 e 12 meses. */
+  monthlyEquivalentMinor: number | null;
   savingLabel: string | null;
   description: string;
   badge?: string;
@@ -12,12 +14,12 @@ export interface SubscriptionPlan {
 
 export interface UpdateSubscriptionPlanInput {
   name?: string;
-  price?: number;
+  priceMinor?: number;
   period?: string;
   description?: string;
   isActive?: boolean;
 }
 
 export type PersistedSubscriptionPlanUpdate = UpdateSubscriptionPlanInput & {
-  monthlyEquivalent?: number | null;
+  monthlyEquivalentMinor?: number | null;
 };

=== server/domain/payment/controllers/paymentController.test.ts — diff ===
@@ -81,7 +81,7 @@ describe('PaymentController', () => {
     vi.mocked(getPlanForPaymentApplicationUseCase).mockResolvedValueOnce({
       id: 'monthly',
       name: 'Plano Profissional',
-      price: 99.0,
+      priceMinor: 9900,
       isActive: true,
     } as any);
     vi.mocked(createPlanPaymentIntentUseCase).mockResolvedValueOnce({

=== server/domain/payment/controllers/paymentController.ts — diff ===
@@ -45,7 +45,7 @@ export class PaymentController {
         return res.status(400).json({ error: 'Plano inativo.' });
       }
 
-      const amountMinor = Math.round(Number(plan.price) * 100);
+      const amountMinor = plan.priceMinor;
       if (amountMinor <= 0) {
         return res
           .status(400)

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -149,14 +149,21 @@ export function PartnerPortalComposition() {
         <ReportsView partnerId={partnerId} items={items} events={events} />
       )}
       renderNotificationBell={(partnerId) => <NotificationBell partnerId={partnerId} />}
-      renderCheckoutModal={({ isOpen, onClose, itemId, itemName, amount, onPaymentSuccess }) =>
+      renderCheckoutModal={({
+        isOpen,
+        onClose,
+        itemId,
+        itemName,
+        amountMinor,
+        onPaymentSuccess,
+      }) =>
         isPaidPlanId(itemId) ? (
           <CheckoutModal
             isOpen={isOpen}
             onClose={onClose}
             planId={itemId}
             itemName={itemName}
-            amount={amount}
+            amountMinor={amountMinor}
             onPaymentSuccess={onPaymentSuccess}
           />
         ) : null

=== src/domain/admin/adapters/firestoreAdminPlansAdapter.ts — diff ===
@@ -14,12 +14,11 @@ function mapPlanRecord(id: string, data: Record<string, unknown>): SubscriptionP
   return {
     id: id as SubscriptionPlan['id'],
     name: typeof data.name === 'string' ? data.name : '',
-    price: typeof data.price === 'number' && Number.isFinite(data.price) ? data.price : 0,
+    priceMinor: Number.isInteger(data.priceMinor) ? (data.priceMinor as number) : 0,
     period: typeof data.period === 'string' ? data.period : '',
-    monthlyEquivalent:
-      typeof data.monthlyEquivalent === 'number' && Number.isFinite(data.monthlyEquivalent)
-        ? data.monthlyEquivalent
-        : null,
+    monthlyEquivalentMinor: Number.isInteger(data.monthlyEquivalentMinor)
+      ? (data.monthlyEquivalentMinor as number)
+      : null,
     savingLabel: typeof data.savingLabel === 'string' ? data.savingLabel : null,
     description: typeof data.description === 'string' ? data.description : '',
     badge: typeof data.badge === 'string' ? data.badge : undefined,
@@ -48,7 +47,7 @@ export class FirestoreAdminPlansAdapter implements AdminPlansPort {
     planId: string,
     data: {
       name?: string;
-      price?: number;
+      priceMinor?: number;
       period?: string;
       description?: string;
       isActive?: boolean;

=== src/domain/admin/application/usecases/updateSubscriptionPlanUseCase.ts — diff ===
@@ -4,7 +4,7 @@ export function updateSubscriptionPlanUseCase(
   planId: string,
   data: {
     name?: string;
-    price?: number;
+    priceMinor?: number;
     period?: string;
     description?: string;
     isActive?: boolean;

=== src/domain/admin/components/subcomponents/AdminPlansView.tsx — diff ===
@@ -30,7 +30,7 @@ function AdminPlanCard({ plan }: { plan: SubscriptionPlan }) {
     resolver: zodResolver(adminPlanFormSchema),
     defaultValues: {
       name: plan.name,
-      price: maskCurrency(String(Math.round(plan.price * 100))),
+      price: maskCurrency(String(plan.priceMinor)),
       period: plan.period,
       description: plan.description ?? '',
       isActive: plan.isActive,
@@ -45,7 +45,7 @@ function AdminPlanCard({ plan }: { plan: SubscriptionPlan }) {
       const parsed = adminPlanFormSchema.parse(values);
       await updateSubscriptionPlanUseCase(plan.id, {
         name: parsed.name,
-        price: unmaskCurrency(parsed.price),
+        priceMinor: Math.round(unmaskCurrency(parsed.price) * 100),
         period: parsed.period,
         description: parsed.description,
         isActive: parsed.isActive,

=== src/domain/admin/ports/adminPlansPort.ts — diff ===
@@ -9,7 +9,7 @@ export interface AdminPlansPort {
     planId: string,
     data: {
       name?: string;
-      price?: number;
+      priceMinor?: number;
       period?: string;
       description?: string;
       isActive?: boolean;

=== src/domain/admin/types/admin.ts — diff ===
@@ -12,9 +12,11 @@ export interface AdminStats {
 export interface SubscriptionPlan {
   id: 'trial' | 'monthly' | 'semi-annual' | 'annual';
   name: string;
-  price: number;
+  /** Preço total do período, em centavos. */
+  priceMinor: number;
   period: string;
-  monthlyEquivalent: number | null;
+  /** Equivalente mensal em centavos (planos de 6 e 12 meses). */
+  monthlyEquivalentMinor: number | null;
   savingLabel: string | null;
   description: string;
   badge?: string;

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -50,7 +50,7 @@ export interface PartnerPanelProps {
     onClose: () => void;
     itemId: string;
     itemName: string;
-    amount: number;
+    amountMinor: number;
     onPaymentSuccess: () => void;
   }) => React.ReactNode;
   renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
@@ -111,7 +111,7 @@ export function PartnerPanel({
   const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState({
     itemId: '',
     itemName: '',
-    amount: 0,
+    amountMinor: 0,
   });
 
   // O modal mostra a própria tela de sucesso; o perfil é recarregado quando o parceiro fecha.
@@ -589,8 +589,8 @@ export function PartnerPanel({
         userId={user.uid}
         partnerProfile={partnerProfile || undefined}
         plans={subscriptionPlans ?? []}
-        onSelectPaidPlan={(planId, planName, amount) => {
-          setCheckoutPlanInfo({ itemId: planId, itemName: planName, amount });
+        onSelectPaidPlan={(planId, planName, amountMinor) => {
+          setCheckoutPlanInfo({ itemId: planId, itemName: planName, amountMinor });
           setShowCheckoutModal(true);
         }}
       />
@@ -600,7 +600,7 @@ export function PartnerPanel({
         onClose: handleCheckoutClose,
         itemId: checkoutPlanInfo.itemId,
         itemName: checkoutPlanInfo.itemName,
-        amount: checkoutPlanInfo.amount,
+        amountMinor: checkoutPlanInfo.amountMinor,
         onPaymentSuccess: handleCheckoutSuccess,
       })}

=== src/domain/partners/components/subcomponents/PlansModal.tsx — diff ===
@@ -6,6 +6,8 @@ import { PartnerProfile, SubscriptionPlan } from '../../types/partner';
 import { useUI } from '../../../../shared/stores/useUIStore';
 import { activateTrialUseCase } from '../../application/usecases/activateTrialUseCase';
 import { Z_INDEX } from '../../../../shared/constants/zIndex';
+import { formatMoneyMinor } from '../../../../shared/utils/money';
+import { useTranslation } from 'react-i18next';
 
 interface PlansModalProps {
   isOpen: boolean;
@@ -13,7 +15,7 @@ interface PlansModalProps {
   userId: string;
   partnerProfile?: PartnerProfile;
   plans: SubscriptionPlan[];
-  onSelectPaidPlan: (planId: string, planName: string, amount: number) => void;
+  onSelectPaidPlan: (planId: string, planName: string, amountMinor: number) => void;
 }
 
 export function PlansModal({
@@ -29,6 +31,7 @@ export function PlansModal({
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const [showUpgradeView, setShowUpgradeView] = useState(false);
   const { showToast } = useUI();
+  const { i18n } = useTranslation();
 
   React.useEffect(() => {
     if (isOpen) {
@@ -108,21 +111,21 @@ export function PlansModal({
         onSelectPaidPlan(
           activeOption.id,
           `Selo de Empresa Verificada - ${activeOption.name}`,
-          activeOption.price
+          activeOption.priceMinor
         );
         onClose();
       }
     }
   };
 
-  const formatPrice = (price: number) => {
-    if (price === 0) return 'Grátis';
-    return `R$ ${price.toFixed(2).replace('.', ',')}`;
+  const formatPrice = (priceMinor: number) => {
+    if (priceMinor === 0) return 'Grátis';
+    return formatMoneyMinor(priceMinor, i18n.language);
   };
 
-  const formatMonthlyEquivalent = (val: number | null | undefined) => {
-    if (!val) return null;
-    return `R$ ${val.toFixed(2).replace('.', ',')}/mês`;
+  const formatMonthlyEquivalent = (valueMinor: number | null | undefined) => {
+    if (!valueMinor) return null;
+    return `${formatMoneyMinor(valueMinor, i18n.language)}/mês`;
   };
 
   return (
@@ -290,15 +293,15 @@ export function PlansModal({
                           <div className="text-right shrink-0">
                             <div className="flex items-baseline gap-1 justify-end">
                               <span className="text-lg font-black text-teal-400">
-                                {formatPrice(p.price)}
+                                {formatPrice(p.priceMinor)}
                               </span>
                               <span className="text-[10px] text-white/50 font-medium">
                                 {p.period}
                               </span>
                             </div>
-                            {p.monthlyEquivalent && (
+                            {p.monthlyEquivalentMinor && (
                               <span className="block text-[9px] text-teal-300/80 font-bold">
-                                {formatMonthlyEquivalent(p.monthlyEquivalent)}
+                                {formatMonthlyEquivalent(p.monthlyEquivalentMinor)}
                               </span>
                             )}
                           </div>

=== src/domain/partners/types/partner.ts — diff ===
@@ -102,9 +102,11 @@ export interface PartnerProfile {
 export interface SubscriptionPlan {
   id: 'trial' | 'monthly' | 'semi-annual' | 'annual';
   name: string;
-  price: number;
+  /** Preço total do período, em centavos. */
+  priceMinor: number;
   period: string;
-  monthlyEquivalent: number | null;
+  /** Equivalente mensal em centavos (planos de 6 e 12 meses). */
+  monthlyEquivalentMinor: number | null;
   savingLabel: string | null;
   description: string;
   badge?: string;

=== src/domain/payment/components/CheckoutModal.tsx — diff ===
@@ -16,7 +16,7 @@ interface CheckoutModalProps {
   planId: PaidPlanId;
   itemName: string;
   /** Valor do plano em reais, como vem do cadastro (o backend recalcula). */
-  amount: number;
+  amountMinor: number;
   onPaymentSuccess?: (paymentId: string) => void;
 }
 
@@ -25,7 +25,7 @@ export function CheckoutModal({
   onClose,
   planId,
   itemName,
-  amount,
+  amountMinor,
   onPaymentSuccess,
 }: CheckoutModalProps) {
   const { t, i18n } = useTranslation();
@@ -75,7 +75,7 @@ export function CheckoutModal({
             <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
               <span className="text-xs text-white/60">{t('payment.checkout.totalLabel')}</span>
               <span className="text-xl font-black text-teal-300">
-                {formatPlanAmount(amount, i18n.language)}
+                {formatPlanAmount(amountMinor, i18n.language)}
                 <span className="block text-[11px] font-medium text-white/60 text-right">
                   {t(`payment.period.${planId}`)}
                 </span>
@@ -99,7 +99,7 @@ export function CheckoutModal({
               <SubscriptionPlanCheckout
                 planId={planId}
                 itemName={itemName}
-                amount={amount}
+                amountMinor={amountMinor}
                 onClose={handleClose}
                 onActivated={onPaymentSuccess}
               />
@@ -109,7 +109,7 @@ export function CheckoutModal({
               <OneTimePlanCheckout
                 planId={planId}
                 itemName={itemName}
-                amount={amount}
+                amountMinor={amountMinor}
                 onClose={handleClose}
                 onPaymentSuccess={onPaymentSuccess}
               />

=== src/domain/payment/components/subcomponents/OneTimePlanCheckout.tsx — diff ===
@@ -10,7 +10,7 @@ import { SuccessPaymentGlass } from './SuccessPaymentGlass';
 interface OneTimePlanCheckoutProps {
   planId: PaidPlanId;
   itemName: string;
-  amount: number;
+  amountMinor: number;
   onClose: () => void;
   onPaymentSuccess?: (paymentId: string) => void;
 }
@@ -18,7 +18,7 @@ interface OneTimePlanCheckoutProps {
 export function OneTimePlanCheckout({
   planId,
   itemName,
-  amount,
+  amountMinor,
   onClose,
   onPaymentSuccess,
 }: OneTimePlanCheckoutProps) {
@@ -45,7 +45,7 @@ export function OneTimePlanCheckout({
     return (
       <SuccessPaymentGlass
         itemName={itemName}
-        amount={amount}
+        amountMinor={amountMinor}
         paymentId={paymentIntentId}
         onClose={onClose}
       />
@@ -76,7 +76,7 @@ export function OneTimePlanCheckout({
           clientSecret={clientSecret}
           orderId={paymentIntentId}
           submitLabel={t('payment.checkout.payButton', {
-            amount: formatPlanAmount(amount, i18n.language),
+            amount: formatPlanAmount(amountMinor, i18n.language),
           })}
           onError={(message) => setError(message)}
           onSuccess={(intentId) => confirmPaymentOnBackend(intentId)}

=== src/domain/payment/components/subcomponents/SubscriptionPlanCheckout.tsx — diff ===
@@ -10,7 +10,7 @@ import { CheckoutError, CheckoutLoading, CheckoutPending } from './CheckoutStatu
 interface SubscriptionPlanCheckoutProps {
   planId: PaidPlanId;
   itemName: string;
-  amount: number;
+  amountMinor: number;
   onClose: () => void;
   onActivated?: (subscriptionId: string) => void;
 }
@@ -18,7 +18,7 @@ interface SubscriptionPlanCheckoutProps {
 export function SubscriptionPlanCheckout({
   planId,
   itemName,
-  amount,
+  amountMinor,
   onClose,
   onActivated,
 }: SubscriptionPlanCheckoutProps) {
@@ -90,7 +90,7 @@ export function SubscriptionPlanCheckout({
             orderId={checkout.subscriptionId}
             intentType={checkout.intentType === 'setup' ? 'setup' : 'payment'}
             submitLabel={t('payment.checkout.subscribeButton', {
-              amount: formatPlanAmount(amount, i18n.language),
+              amount: formatPlanAmount(amountMinor, i18n.language),
               period: t(`payment.period.${planId}`),
             })}
             onError={fail}

=== src/domain/payment/components/subcomponents/SuccessPaymentGlass.tsx — diff ===
@@ -1,21 +1,24 @@
 import React from 'react';
 import { motion } from 'motion/react';
 import { Check, CreditCard, Calendar, ShieldCheck, Mail } from 'lucide-react';
+import { useTranslation } from 'react-i18next';
 import { GlassCard } from '../../../../ui/components/GlassCard';
+import { formatPlanAmount } from '../../utils/formatPlanAmount';
 
 interface SuccessPaymentGlassProps {
   itemName: string;
-  amount: number;
+  amountMinor: number;
   paymentId: string;
   onClose: () => void;
 }
 
 export function SuccessPaymentGlass({
   itemName,
-  amount,
+  amountMinor,
   paymentId,
   onClose,
 }: SuccessPaymentGlassProps) {
+  const { i18n } = useTranslation();
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.92 }}
@@ -50,7 +53,9 @@ export function SuccessPaymentGlass({
       <GlassCard className="w-full p-5 space-y-4 bg-slate-900/35 border border-white/10 backdrop-blur-xl rounded-2xl text-left">
         <div className="flex justify-between items-center pb-3 border-b border-white/5">
           <span className="text-xs text-white/50">Valor Pago</span>
-          <span className="text-lg font-black text-teal-400">R$ {amount.toFixed(2)}</span>
+          <span className="text-lg font-black text-teal-400">
+            {formatPlanAmount(amountMinor, i18n.language)}
+          </span>
         </div>
 
         <div className="grid grid-cols-2 gap-3 text-xs">

=== src/domain/payment/utils/formatPlanAmount.ts — diff ===
@@ -1,6 +1,8 @@
-/** Valor do plano em reais (como vem do cadastro) formatado em BRL no idioma ativo. */
-export function formatPlanAmount(amount: number, locale: string): string {
-  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(amount);
+import { formatMoneyMinor } from '../../../shared/utils/money';
+
+/** Valor do plano em centavos formatado em BRL no idioma ativo. */
+export function formatPlanAmount(amountMinor: number, locale: string): string {
+  return formatMoneyMinor(amountMinor, locale);
 }
 
 export function formatBillingDate(iso: string, locale: string): string {

=== src/shared/utils/money.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { formatMoneyMinor } from './money';

describe('formatMoneyMinor', () => {
  it('formata centavos em BRL no idioma ativo', () => {
    expect(formatMoneyMinor(4990, 'pt-BR')).toBe('R$ 49,90');
    expect(formatMoneyMinor(29990, 'en')).toBe('R$299.90');
  });
});

=== src/shared/utils/money.ts — ARQUIVO NOVO, conteúdo completo ===
/** Centavos (MoneyMinor) → BRL no idioma ativo. A moeda é sempre BRL (AGENTS.md §1, §12.4). */
export function formatMoneyMinor(amountMinor: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    amountMinor / 100
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 133 arquivos, 768 testes, `npm run build`.

No resumo, lembre-me (não execute): os planos de teste no Firestore precisam ter o preço digitado de novo no painel admin (o campo antigo `price` em reais deixa de ser lido).
Responda no formato do AGENTS.md §16.3.
~~~~
