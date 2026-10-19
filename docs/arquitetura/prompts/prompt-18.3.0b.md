# Prompt 18.3.0b — Conta do parceiro sem documento

> Lote 13, gerado do commit de referência `46236f5` da branch `claude/agents-md-v2`. Aplique depois do 18.3.0a. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3.0b — Conta do parceiro sem documento nem status pendente (D12, P0)

Decisão D12 (2026-10-19), item P0.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). Os parceiros de teste com cpfCnpj gravado podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13).

DECISÃO D12, P0 (docs/arquitetura/decisoes.md): a verificação é por estabelecimento (18.3.0a). O cadastro da conta deixa de pedir CPF/CNPJ, e o status da conta serve só para suspensão.

O QUE MUDA:
1) Backend (server/domain/partners):
   - registerPartnerSchema aceita só { formData: { termsAccepted: true } }, estrito;
   - PartnerStatus = 'active' | 'suspended' (sem 'pending'), também no updatePartnerStatusSchema;
   - cpfCnpj, cpfCnpjClean e a coleção partnerDocumentKeys saem do tipo, do mapper, do service e do adapter Firestore;
   - firestore.rules: o bloco match /partnerDocumentKeys sai.
2) Frontend (src/domain/partners e src/domain/admin):
   - Step1CompanyInfo sem campo de CPF/CNPJ e sem a prop mode;
   - step1Schema e partnerSubmissionSchema sem cpfCnpj;
   - FormState, PartnerProfile, PartnerSubmissionData e PartnerRegistrationPayload sem cpfCnpj;
   - a inscrição envia só { termsAccepted: true };
   - ListingEditor e PartnerPanel sem a prop cpfCnpj;
   - o status 'pending' sai: novo tipo PartnerAccountStatus; PartnerHeader mostra Ativa/Suspensa; AdminPartnersView sem selo Pendente e sem botão Aprovar;
   - updatePartnerStatusUseCase usa o schema de schemas/ (sem zod no caso de uso, §3.2).
3) PartnersModal dividido (529 → 257 linhas, §13):
   - utils/signupStepGates.ts (+ teste): condições do botão Avançar de cada etapa, antes repetidas;
   - sections/SignupStepActions.tsx, SignupStepPanel.tsx e SignupProcessingState.tsx.
4) Testes atualizados; docs/arquitetura/debitos.md (B23 resolvido) e solicitacoes-agents.md (S13).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)
- firestore.rules (alterar)
- server/application/usecases/getAdminPartnersUseCase.test.ts (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.test.ts (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.ts (alterar)
- server/domain/partners/controllers/partnerContentController.ts (alterar)
- server/domain/partners/dtos/RegisterPartnerDTO.ts (alterar)
- server/domain/partners/mappers/partnerMapper.test.ts (alterar)
- server/domain/partners/mappers/partnerMapper.ts (alterar)
- server/domain/partners/schemas/partnerContentSchema.ts (alterar)
- server/domain/partners/schemas/partnerSchema.test.ts (alterar)
- server/domain/partners/schemas/partnerSchema.ts (alterar)
- server/domain/partners/services/partnerService.test.ts (alterar)
- server/domain/partners/services/partnerService.ts (alterar)
- server/domain/partners/types/partnerTypes.ts (alterar)
- src/domain/admin/components/subcomponents/AdminPartnersView.tsx (alterar)
- src/domain/admin/types/admin.ts (alterar)
- src/domain/partners/adapters/apiPartnerAdapter.ts (alterar)
- src/domain/partners/application/mappers/partnerFormMapper.test.ts (alterar)
- src/domain/partners/application/mappers/partnerFormMapper.ts (alterar)
- src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts (alterar)
- src/domain/partners/application/usecases/updatePartnerStatusUseCase.ts (alterar)
- src/domain/partners/components/ListingEditor.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/PartnersModal.tsx (alterar)
- src/domain/partners/components/sections/SignupProcessingState.tsx (criar)
- src/domain/partners/components/sections/SignupStepActions.tsx (criar)
- src/domain/partners/components/sections/SignupStepPanel.tsx (criar)
- src/domain/partners/components/steps/Step1CompanyInfo.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerHeader.tsx (alterar)
- src/domain/partners/constants/formDefaults.ts (alterar)
- src/domain/partners/hooks/useListingEditorValidation.ts (alterar)
- src/domain/partners/hooks/usePartnerForm.test.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.test.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.ts (alterar)
- src/domain/partners/hooks/usePartnerRegistrationSubmission.test.ts (alterar)
- src/domain/partners/hooks/usePartnerRegistrationSubmission.ts (alterar)
- src/domain/partners/ports/partnerPort.ts (alterar)
- src/domain/partners/schemas/partnerSchema.test.ts (alterar)
- src/domain/partners/schemas/partnerSchema.ts (alterar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/partners/types/partsForm.ts (alterar)
- src/domain/partners/utils/signupStepGates.test.ts (criar)
- src/domain/partners/utils/signupStepGates.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -18,12 +18,12 @@
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 | B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
 | B22 | `listingVerificationService.assertCanSell`: até o Prompt 18.4, só o primeiro CNPJ aprovado de cada conta vende (`SALES_DOCUMENT_MISMATCH`) | D12 (P8): repasse por documento | médio — conta com dois CNPJs só vende por um deles | Prompt 18.4: conta Stripe por documento |
-| B23 | `partners/{uid}.cpfCnpj` e `partnerDocumentKeys/{cpfCnpj}` ainda existem (cadastro da conta com documento em texto puro) | §7.7 e D12 (P0) | alto — dado Restrito sem criptografia | Prompt 18.3.0b: cadastro da conta sem documento; o documento passa a existir só, cifrado, na verificação do estabelecimento |
 
 ## Resolvidos
 
 | ID | Resolução |
 |---|---|
+| B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |
 | B19 | Prompt 18.2.2 (decisão de 2026-10-19): o contato do evento fica só nos campos do topo (`phone`, `websiteLink`, `instagramLink`, `bookingLink`), como nos itens do guia; o objeto `contact` deixou de ser lido e gravado; `eventsService` dividido em `EventsService` (anúncios) e `EventOccurrencesService` (sessões), com as regras de acesso em `eventAccess.ts` |
 | Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -151,3 +151,13 @@
 
 **Texto proposto:**
 > A URL com prefixo de idioma (`/en`, `/fr`) sempre vale. Na home `/`, quando a preferência (escolha salva → idioma do navegador) não for português, o app redireciona para `/en` ou `/fr` sem criar entrada no histórico; robôs de busca nunca são redirecionados. Nas demais páginas em português, o app mantém o idioma do link e mostra um aviso para trocar ("Esta página está disponível em English — Mudar"); a resposta ao aviso grava a escolha (decisão D10).
+
+## S13 — §7.7: débito de `partnerDocumentKeys` resolvido (Prompt 18.3.0b)
+
+**Por quê:** o Prompt 18.3.0b tirou o documento da conta do parceiro (D12, P0). `partnerDocumentKeys` e os campos `cpfCnpj`/`cpfCnpjClean` não existem mais; CPF/CNPJ fica só na verificação de cada estabelecimento, cifrado e com índice cego. A frase do §7.7 passou a descrever um débito que não existe.
+
+**Texto atual (§7.7, fim do bloco "Blind index"):**
+> * IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII. Débito existente: `partnerDocumentKeys/{cpfCnpjLimpo}` e os campos `cpfCnpj`/`cpfCnpjClean` em `partners` estão em texto puro.
+
+**Texto proposto:**
+> * IDs de documento, caminhos do Storage, URLs e nomes de arquivos NUNCA contêm PII.

=== firestore.rules — diff ===
@@ -111,9 +111,6 @@ service cloud.firestore {
         );
       allow create, update, delete: if false;
     }
-    match /partnerDocumentKeys/{documentId} {
-      allow read, write: if false;
-    }
     match /publicPartners/{partnerId} {
       allow read: if true;
       allow write: if false;

=== server/application/usecases/getAdminPartnersUseCase.test.ts — diff ===
@@ -29,7 +29,7 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
       },
       {
         id: 'partner-2',
-        status: 'pending',
+        status: 'suspended',
         isVerified: false,
         businesses: [{ businessId: 'b-2', businessName: 'Restaurante B', type: 'item' }],
       },
@@ -71,12 +71,11 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
     });
   });
 
-  it('não expõe documento fiscal nem campos internos do parceiro ao painel admin', async () => {
+  it('não expõe campos internos do parceiro ao painel admin', async () => {
     mocks.getAllPartnersUseCase.mockResolvedValue([
       {
         id: 'partner-1',
         category: 'hotel',
-        cpfCnpj: '12345678000199',
         status: 'active',
         isVerified: true,
         verifiedUntil: null,
@@ -91,7 +90,6 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
     const result = await getAdminPartnersUseCase();
 
     expect(result).toHaveLength(1);
-    expect(result[0]).not.toHaveProperty('cpfCnpj');
     expect(result[0]).not.toHaveProperty('hasUsedTrial');
     expect(result[0]).not.toHaveProperty('termsAccepted');
     expect(Object.keys(result[0] ?? {}).sort()).toEqual(

=== server/domain/partners/adapters/firestorePartnerAdapter.test.ts — diff ===
@@ -8,7 +8,7 @@ import {
   normalizeDocument,
 } from '../services/documentIdentity';
 import { registerPartnerSchema } from '../schemas/partnerSchema';
-import type { PartnerBusiness, RegisterPartnerResult } from '../types/partnerTypes';
+import type { PartnerBusiness } from '../types/partnerTypes';
 
 interface StoreDoc {
   exists: boolean;
@@ -26,8 +26,7 @@ class TransactionConflictError extends Error {
 const { store, mockAdminDb } = vi.hoisted(() => {
   const store = new Map<string, StoreDoc>();
 
-  const getDocKey = (collection: string, id: string) =>
-    `${collection}/${id}`;
+  const getDocKey = (collection: string, id: string) => `${collection}/${id}`;
 
   const createRef = (collection: string, id: string) => {
     const key = getDocKey(collection, id);
@@ -49,10 +48,7 @@ const { store, mockAdminDb } = vi.hoisted(() => {
     };
   };
 
-  const commitTransaction = (
-    reads: Map<string, number>,
-    writes: Array<() => void>
-  ) => {
+  const commitTransaction = (reads: Map<string, number>, writes: Array<() => void>) => {
     for (const [path, version] of reads) {
       const current = store.get(path);
       const currentVersion = current?.version ?? 0;
@@ -80,10 +76,7 @@ const { store, mockAdminDb } = vi.hoisted(() => {
         data: Record<string, unknown>,
         options?: { merge?: boolean }
       ) => void;
-      update: (
-        ref: ReturnType<typeof createRef>,
-        data: Record<string, unknown>
-      ) => void;
+      update: (ref: ReturnType<typeof createRef>, data: Record<string, unknown>) => void;
       delete: (ref: ReturnType<typeof createRef>) => void;
     }) => Promise<unknown>
   ): Promise<unknown> => {
@@ -129,10 +122,7 @@ const { store, mockAdminDb } = vi.hoisted(() => {
           });
         },
 
-        update: (
-          ref: ReturnType<typeof createRef>,
-          data: Record<string, unknown>
-        ) => {
+        update: (ref: ReturnType<typeof createRef>, data: Record<string, unknown>) => {
           writes.push(() => {
             const current = store.get(ref.path);
             const version = (current?.version ?? 0) + 1;
@@ -162,16 +152,11 @@ const { store, mockAdminDb } = vi.hoisted(() => {
 
         return result;
       } catch (error) {
-        if (
-          !(error instanceof TransactionConflictError) ||
-          attempt === maxAttempts
-        ) {
+        if (!(error instanceof TransactionConflictError) || attempt === maxAttempts) {
           throw error;
         }
 
-        await new Promise((resolve) =>
-          setTimeout(resolve, 5 * attempt)
-        );
+        await new Promise((resolve) => setTimeout(resolve, 5 * attempt));
       }
     }
 
@@ -190,10 +175,7 @@ const { store, mockAdminDb } = vi.hoisted(() => {
         }> = [];
 
         store.forEach((value, key) => {
-          if (
-            key.startsWith(`${collectionName}/`) &&
-            value.exists
-          ) {
+          if (key.startsWith(`${collectionName}/`) && value.exists) {
             docs.push({
               id: key.slice(collectionName.length + 1),
               exists: true,
@@ -231,8 +213,7 @@ vi.mock('firebase-admin/firestore', () => ({
 describe('FirestorePartnerAdapter', () => {
   let adapter: FirestorePartnerAdapter;
 
-  const getDocKey = (collection: string, id: string) =>
-    `${collection}/${id}`;
+  const getDocKey = (collection: string, id: string) => `${collection}/${id}`;
 
   beforeEach(() => {
     store.clear();
@@ -242,17 +223,11 @@ describe('FirestorePartnerAdapter', () => {
 
   describe('document validation and normalization', () => {
     it('normaliza CPF/CNPJ e valores alfanuméricos', () => {
-      expect(
-        normalizeDocument(' 123.456.789-09 ')
-      ).toBe('12345678909');
+      expect(normalizeDocument(' 123.456.789-09 ')).toBe('12345678909');
 
-      expect(
-        normalizeDocument('12.345.678/0001-95')
-      ).toBe('12345678000195');
+      expect(normalizeDocument('12.345.678/0001-95')).toBe('12345678000195');
 
-      expect(
-        normalizeDocument('abc-123.xyz')
-      ).toBe('ABC123XYZ');
+      expect(normalizeDocument('abc-123.xyz')).toBe('ABC123XYZ');
     });
 
     it('rejeita CPF inválido', () => {
@@ -263,38 +238,25 @@ describe('FirestorePartnerAdapter', () => {
     });
 
     it('rejeita CNPJ inválido', () => {
-      expect(
-        isValidCNPJ('11111111111111')
-      ).toBe(false);
+      expect(isValidCNPJ('11111111111111')).toBe(false);
 
-      expect(
-        isValidCNPJ('12345678000100')
-      ).toBe(false);
+      expect(isValidCNPJ('12345678000100')).toBe(false);
 
       expect(isValidCNPJ('123')).toBe(false);
-      expect(
-        isValidCNPJ('00000000000191')
-      ).toBe(true);
+      expect(isValidCNPJ('00000000000191')).toBe(true);
     });
 
     it('valida CPF/CNPJ por identidade documental', () => {
-      expect(
-        isValidCpfCnpj('529.982.247-25')
-      ).toBe(true);
+      expect(isValidCpfCnpj('529.982.247-25')).toBe(true);
 
-      expect(
-        isValidCpfCnpj('00.000.000/0001-91')
-      ).toBe(true);
+      expect(isValidCpfCnpj('00.000.000/0001-91')).toBe(true);
 
-      expect(
-        isValidCpfCnpj('123.456.789-00')
-      ).toBe(false);
+      expect(isValidCpfCnpj('123.456.789-00')).toBe(false);
     });
 
     it('rejeita termsAccepted=false', () => {
       const result = registerPartnerSchema.safeParse({
         formData: {
-          cpfCnpj: '52998224725',
           termsAccepted: false,
         },
       });
@@ -304,21 +266,14 @@ describe('FirestorePartnerAdapter', () => {
   });
 
   describe('registerPartner', () => {
-    it('cria Partner, índice documental e publicPartners', async () => {
+    it('cria Partner e publicPartners sem documento (o documento é do estabelecimento, D12)', async () => {
       const uid = 'partner-user-1';
 
-      const result = await adapter.registerPartner(uid, {
-        cpfCnpj: '52998224725',
-        termsAccepted: true,
-      });
+      const result = await adapter.registerPartner(uid, { termsAccepted: true });
 
       expect(result.created).toBe(true);
-
-      expect(
-        store.get(getDocKey('partners', uid))?.data
-      ).toMatchObject({
-        cpfCnpj: '52998224725',
-        cpfCnpjClean: '52998224725',
+      const partner = store.get(getDocKey('partners', uid))?.data;
+      expect(partner).toMatchObject({
         isVerified: false,
         verifiedUntil: null,
         verificationType: null,
@@ -327,251 +282,51 @@ describe('FirestorePartnerAdapter', () => {
         termsAccepted: true,
         businesses: [],
       });
-
-      expect(
-        store.get(
-          getDocKey(
-            'partnerDocumentKeys',
-            '52998224725'
-          )
-        )?.data.partnerId
-      ).toBe(uid);
-
-      expect(
-        store.get(getDocKey('publicPartners', uid))?.data
-      ).toMatchObject({
+      expect(partner).not.toHaveProperty('cpfCnpj');
+      expect(partner).not.toHaveProperty('cpfCnpjClean');
+      expect([...store.keys()].some((key) => key.startsWith('partnerDocumentKeys/'))).toBe(false);
+      expect(store.get(getDocKey('publicPartners', uid))?.data).toMatchObject({
         id: uid,
         isVerified: false,
-        verifiedUntil: null,
-        isVerificationSuspended: false,
         status: 'active',
         businesses: [],
       });
     });
 
-    it('rejeita CPF/CNPJ já utilizado por outro parceiro', async () => {
-      store.set(
-        getDocKey(
-          'partnerDocumentKeys',
-          '52998224725'
-        ),
-        {
-          exists: true,
-          data: {
-            partnerId: 'partner-other',
-          },
-          version: 1,
-        }
-      );
-
-      await expect(
-        adapter.registerPartner('new-user', {
-          cpfCnpj: '529.982.247-25',
-          termsAccepted: true,
-        })
-      ).rejects.toThrow(
-        new PartnerDomainError(
-          'CONFLICT',
-          'CPF/CNPJ já cadastrado para outro parceiro.'
-        )
-      );
-    });
-
-    it('permite atualização do mesmo parceiro sem conflito', async () => {
-      const uid = 'partner-user-1';
-
-      await adapter.registerPartner(uid, {
-        cpfCnpj: '52998224725',
-        termsAccepted: true,
+    it('reenvio do mesmo parceiro só atualiza os termos e mantém o restante', async () => {
+      const uid = 'partner-user-2';
+      await adapter.registerPartner(uid, { termsAccepted: true });
+      await adapter.linkBusiness(uid, {
+        businessId: 'item-1',
+        businessName: 'Pousada',
+        type: 'item',
       });
 
-      const result = await adapter.registerPartner(uid, {
-        cpfCnpj: '529.982.247-25',
-        termsAccepted: true,
-      });
+      const result = await adapter.registerPartner(uid, { termsAccepted: true });
 
       expect(result.created).toBe(false);
-
-      expect(store.get(getDocKey('partners', uid))?.data).not.toHaveProperty('category');
-
-      expect(
-        store.get(
-          getDocKey(
-            'partnerDocumentKeys',
-            '52998224725'
-          )
-        )?.data.partnerId
-      ).toBe(uid);
-    });
-
-    it('remove o índice antigo quando o documento muda', async () => {
-      const uid = 'partner-user-1';
-
-      await adapter.registerPartner(uid, {
-        cpfCnpj: '52998224725',
-        termsAccepted: true,
-      });
-
-      await adapter.registerPartner(uid, {
-        cpfCnpj: '00.000.000/0001-91',
-        termsAccepted: true,
-      });
-
-      expect(
-        store.has(
-          getDocKey(
-            'partnerDocumentKeys',
-            '52998224725'
-          )
-        )
-      ).toBe(false);
-
-      expect(
-        store.has(
-          getDocKey(
-            'partnerDocumentKeys',
-            '00000000000191'
-          )
-        )
-      ).toBe(true);
-    });
-
-    it('remove o índice antigo para Partner legado sem cpfCnpjClean', async () => {
-      const uid = 'partner-legacy';
-
-      store.set(getDocKey('partners', uid), {
-        exists: true,
-        version: 1,
-        data: {
-          cpfCnpj: '529.982.247-25',
-          businesses: [],
-          isVerified: false,
-          verifiedUntil: null,
-          verificationType: null,
-          isVerificationSuspended: false,
-          status: 'active',
-          hasUsedTrial: false,
-          termsAccepted: true,
-        },
-      });
-
-      store.set(
-        getDocKey(
-          'partnerDocumentKeys',
-          '52998224725'
-        ),
-        {
-          exists: true,
-          version: 1,
-          data: {
-            partnerId: uid,
-          },
-        }
-      );
-
-      await adapter.registerPartner(uid, {
-        cpfCnpj: '00.000.000/0001-91',
-        termsAccepted: true,
-      });
-
-      expect(
-        store.has(
-          getDocKey(
-            'partnerDocumentKeys',
-            '52998224725'
-          )
-        )
-      ).toBe(false);
-
-      expect(
-        store.has(
-          getDocKey(
-            'partnerDocumentKeys',
-            '00000000000191'
-          )
-        )
-      ).toBe(true);
+      expect(store.get(getDocKey('partners', uid))?.data.businesses).toEqual([
+        { businessId: 'item-1', businessName: 'Pousada', type: 'item' },
+      ]);
     });
   });
 
   describe('deletePartnerProfile', () => {
-    it('remove índice documental de Partner legado', async () => {
-      const uid = 'partner-legacy-delete';
-
-      store.set(getDocKey('partners', uid), {
-        exists: true,
-        version: 1,
-        data: {
-          cpfCnpj: '529.982.247-25',
-          businesses: [],
-          isVerified: false,
-          verifiedUntil: null,
-          verificationType: null,
-          isVerificationSuspended: false,
-          status: 'active',
-          hasUsedTrial: false,
-          termsAccepted: true,
-        },
-      });
-
-      store.set(
-        getDocKey(
-          'partnerDocumentKeys',
-          '52998224725'
-        ),
-        {
-          exists: true,
-          version: 1,
-          data: {
-            partnerId: uid,
-          },
-        }
-      );
-
-      store.set(
-        getDocKey('publicPartners', uid),
-        {
-          exists: true,
-          version: 1,
-          data: {
-            id: uid,
-          },
-        }
-      );
+    it('remove Partner e publicPartners', async () => {
+      const uid = 'partner-user-3';
+      await adapter.registerPartner(uid, { termsAccepted: true });
 
       await adapter.deletePartnerProfile(uid);
 
-      expect(
-        store.has(getDocKey('partners', uid))
-      ).toBe(false);
-
-      expect(
-        store.has(getDocKey('publicPartners', uid))
-      ).toBe(false);
-
-      expect(
-        store.has(
-          getDocKey(
-            'partnerDocumentKeys',
-            '52998224725'
-          )
-        )
-      ).toBe(false);
+      expect(store.get(getDocKey('partners', uid))?.exists ?? false).toBe(false);
+      expect(store.get(getDocKey('publicPartners', uid))?.exists ?? false).toBe(false);
     });
   });
 
   describe('status', () => {
     it('retorna NOT_FOUND para Partner inexistente', async () => {
-      await expect(
-        adapter.updatePartnerStatus(
-          'missing-partner',
-          'suspended'
-        )
-      ).rejects.toThrow(
-        new PartnerDomainError(
-          'NOT_FOUND',
-          'Perfil de parceiro não encontrado'
-        )
+      await expect(adapter.updatePartnerStatus('missing-partner', 'suspended')).rejects.toThrow(
+        new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado')
       );
     });
 
@@ -579,22 +334,14 @@ describe('FirestorePartnerAdapter', () => {
       const uid = 'partner-status';
 
       await adapter.registerPartner(uid, {
-        cpfCnpj: '52998224725',
         termsAccepted: true,
       });
 
-      await adapter.updatePartnerStatus(
-        uid,
-        'suspended'
-      );
+      await adapter.updatePartnerStatus(uid, 'suspended');
 
-      expect(
-        store.get(getDocKey('partners', uid))?.data.status
-      ).toBe('suspended');
+      expect(store.get(getDocKey('partners', uid))?.data.status).toBe('suspended');
 
-      expect(
-        store.get(getDocKey('publicPartners', uid))?.data.status
-      ).toBe('suspended');
+      expect(store.get(getDocKey('publicPartners', uid))?.data.status).toBe('suspended');
     });
   });
 
@@ -609,7 +356,6 @@ describe('FirestorePartnerAdapter', () => {
 
     beforeEach(async () => {
       await adapter.registerPartner(uid, {
-        cpfCnpj: '52998224725',
         termsAccepted: true,
       });
     });
@@ -617,13 +363,9 @@ describe('FirestorePartnerAdapter', () => {
     it('linkBusiness adiciona negócio e sincroniza projeção pública', async () => {
       await adapter.linkBusiness(uid, business);
 
-      expect(
-        store.get(getDocKey('partners', uid))?.data.businesses
-      ).toEqual([business]);
+      expect(store.get(getDocKey('partners', uid))?.data.businesses).toEqual([business]);
 
-      expect(
-        store.get(getDocKey('publicPartners', uid))?.data.businesses
-      ).toEqual([business]);
+      expect(store.get(getDocKey('publicPartners', uid))?.data.businesses).toEqual([business]);
     });
 
     it('updateBusiness atualiza negócio existente', async () => {
@@ -634,18 +376,14 @@ describe('FirestorePartnerAdapter', () => {
         businessName: 'Pousada Encantada VIP',
       });
 
-      expect(
-        store.get(getDocKey('partners', uid))?.data.businesses
-      ).toEqual([
+      expect(store.get(getDocKey('partners', uid))?.data.businesses).toEqual([
         {
           ...business,
           businessName: 'Pousada Encantada VIP',
         },
       ]);
 
-      expect(
-        store.get(getDocKey('publicPartners', uid))?.data.businesses
-      ).toEqual([
+      expect(store.get(getDocKey('publicPartners', uid))?.data.businesses).toEqual([
         {
           ...business,
           businessName: 'Pousada Encantada VIP',
@@ -661,36 +399,21 @@ describe('FirestorePartnerAdapter', () => {
           type: 'item',
         })
       ).rejects.toThrow(
-        new PartnerDomainError(
-          'NOT_FOUND',
-          'Negócio não encontrado no perfil do parceiro'
-        )
+        new PartnerDomainError('NOT_FOUND', 'Negócio não encontrado no perfil do parceiro')
       );
     });
 
     it('unlinkBusiness remove negócio', async () => {
       await adapter.linkBusiness(uid, business);
-      await adapter.unlinkBusiness(
-        uid,
-        business.businessId
-      );
+      await adapter.unlinkBusiness(uid, business.businessId);
 
-      expect(
-        store.get(getDocKey('partners', uid))?.data.businesses
-      ).toEqual([]);
+      expect(store.get(getDocKey('partners', uid))?.data.businesses).toEqual([]);
 
-      expect(
-        store.get(getDocKey('publicPartners', uid))?.data.businesses
-      ).toEqual([]);
+      expect(store.get(getDocKey('publicPartners', uid))?.data.businesses).toEqual([]);
     });
 
     it('unlinkBusiness é idempotente para Partner inexistente', async () => {
-      await expect(
-        adapter.unlinkBusiness(
-          'missing-partner',
-          'item-101'
-        )
-      ).resolves.not.toThrow();
+      await expect(adapter.unlinkBusiness('missing-partner', 'item-101')).resolves.not.toThrow();
     });
   });
 
@@ -699,95 +422,25 @@ describe('FirestorePartnerAdapter', () => {
       const uid = 'partner-verification';
 
       await adapter.registerPartner(uid, {
-        cpfCnpj: '52998224725',
         termsAccepted: true,
       });
 
-      await adapter.updatePartnerVerificationProfile(
-        uid,
-        {
-          isVerified: true,
-          verifiedUntil: '2027-01-01T00:00:00.000Z',
-          verificationType: 'annual',
-          isVerificationSuspended: true,
-        }
-      );
-
-      expect(
-        store.get(getDocKey('partners', uid))?.data
-      ).toMatchObject({
+      await adapter.updatePartnerVerificationProfile(uid, {
         isVerified: true,
+        verifiedUntil: '2027-01-01T00:00:00.000Z',
+        verificationType: 'annual',
         isVerificationSuspended: true,
       });
 
-      expect(
-        store.get(getDocKey('publicPartners', uid))?.data
-      ).toMatchObject({
+      expect(store.get(getDocKey('partners', uid))?.data).toMatchObject({
         isVerified: true,
         isVerificationSuspended: true,
       });
-    });
-  });
-
-  describe('transactional document uniqueness', () => {
-    it('uma disputa concorrente pelo mesmo CPF/CNPJ possui apenas um vencedor', async () => {
-      const results = await Promise.allSettled([
-        adapter.registerPartner(
-          'partner-concurrent-A',
-          {
-            cpfCnpj: '52998224725',
-            termsAccepted: true,
-          }
-        ),
-        adapter.registerPartner(
-          'partner-concurrent-B',
-          {
-            cpfCnpj: '52998224725',
-            termsAccepted: true,
-          }
-        ),
-      ]);
 
-      const fulfilled = results.filter(
-        (
-          result
-        ): result is PromiseFulfilledResult<RegisterPartnerResult> =>
-          result.status === 'fulfilled'
-      );
-
-      const rejected = results.filter(
-        (
-          result
-        ): result is PromiseRejectedResult =>
-          result.status === 'rejected'
-      );
-
-      expect(fulfilled).toHaveLength(1);
-      expect(rejected).toHaveLength(1);
-
-      const rejectedError = rejected[0]?.reason;
-
-      expect(
-        rejectedError
-      ).toBeInstanceOf(PartnerDomainError);
-
-      expect(
-        (rejectedError as PartnerDomainError).code
-      ).toBe('CONFLICT');
-
-      const index = store.get(
-        getDocKey(
-          'partnerDocumentKeys',
-          '52998224725'
-        )
-      );
-
-      expect(index?.exists).toBe(true);
-
-      expect([
-        'partner-concurrent-A',
-        'partner-concurrent-B',
-      ]).toContain(index?.data.partnerId);
+      expect(store.get(getDocKey('publicPartners', uid))?.data).toMatchObject({
+        isVerified: true,
+        isVerificationSuspended: true,
+      });
     });
   });
 });

=== server/domain/partners/adapters/firestorePartnerAdapter.ts — diff ===
@@ -6,7 +6,6 @@ import {
   toPublicPartnerProfileDTO as toPublicPartnerProfile,
 } from '../mappers/partnerMapper';
 import { PartnerPort } from '../ports/partnerPort';
-import { normalizeDocument } from '../services/documentIdentity';
 import type {
   PartnerBusiness,
   PartnerProfileDocument,
@@ -17,27 +16,6 @@ import type {
   RegisterPartnerResult,
 } from '../types/partnerTypes';
 
-function getPersistedDocumentKey(
-  data: Record<string, unknown>
-): string | null {
-  const candidate =
-    typeof data.cpfCnpjClean === 'string' &&
-    data.cpfCnpjClean.trim()
-      ? data.cpfCnpjClean
-      : typeof data.cpfCnpj === 'string' &&
-          data.cpfCnpj.trim()
-        ? data.cpfCnpj
-        : null;
-
-  if (!candidate) {
-    return null;
-  }
-
-  const normalized = normalizeDocument(candidate);
-
-  return normalized || null;
-}
-
 export class FirestorePartnerAdapter implements PartnerPort {
   private async mutatePartnerAtomically(
     partnerId: string,
@@ -101,11 +79,6 @@ export class FirestorePartnerAdapter implements PartnerPort {
     await adminDb.runTransaction(async (transaction) => {
       const snap = await transaction.get(partnerRef);
       if (snap.exists) {
-        const data = (snap.data() || {}) as Record<string, unknown>;
-        const cleanDoc = getPersistedDocumentKey(data);
-        if (cleanDoc) {
-          transaction.delete(adminDb.collection('partnerDocumentKeys').doc(cleanDoc));
-        }
         transaction.delete(partnerRef);
       }
       transaction.delete(publicRef);
@@ -116,76 +89,34 @@ export class FirestorePartnerAdapter implements PartnerPort {
     uid: string,
     data: PartnerRegistrationData
   ): Promise<RegisterPartnerResult> {
-    const cleanDoc = normalizeDocument(data.cpfCnpj);
-    if (!cleanDoc) {
-      throw new PartnerDomainError('INVALID_ARGUMENT', 'CPF/CNPJ é obrigatório');
-    }
     const partnerRef = adminDb.collection('partners').doc(uid);
     const publicRef = adminDb.collection('publicPartners').doc(uid);
     let created = false;
 
     await adminDb.runTransaction(async (transaction) => {
-      const docKeyRef = adminDb.collection('partnerDocumentKeys').doc(cleanDoc);
-      const docKeySnap = await transaction.get(docKeyRef);
-      if (docKeySnap.exists) {
-        const keyData = docKeySnap.data() as { partnerId?: string } | undefined;
-        if (keyData?.partnerId && keyData.partnerId !== uid) {
-          throw new PartnerDomainError('CONFLICT', 'CPF/CNPJ já cadastrado para outro parceiro.');
-        }
-      }
-
       const partnerSnap = await transaction.get(partnerRef);
-      const exists = partnerSnap.exists;
-      created = !exists;
-
-      transaction.set(docKeyRef, {
-        partnerId: uid,
-        createdAt: FieldValue.serverTimestamp(),
-      });
-
-      if (exists) {
-        const oldData = (partnerSnap.data() || {}) as Record<string, unknown>;
-        const oldDoc = getPersistedDocumentKey(oldData);
-        if (oldDoc && oldDoc !== cleanDoc) {
-          transaction.delete(adminDb.collection('partnerDocumentKeys').doc(oldDoc));
-        }
-
-        const nextData = {
-          ...oldData,
-          cpfCnpjClean: cleanDoc,
-          cpfCnpj: data.cpfCnpj,
-          termsAccepted: data.termsAccepted,
-        };
+      created = !partnerSnap.exists;
 
+      if (!created) {
         transaction.update(partnerRef, {
-          cpfCnpjClean: cleanDoc,
-          cpfCnpj: data.cpfCnpj,
           termsAccepted: data.termsAccepted,
           updatedAt: FieldValue.serverTimestamp(),
         });
-
-        transaction.set(publicRef, toPublicPartnerProfile(uid, nextData));
-      } else {
-        const nextData = {
-          businesses: [],
-          cpfCnpjClean: cleanDoc,
-          cpfCnpj: data.cpfCnpj,
-          hasUsedTrial: false,
-          isVerified: false,
-          verificationType: null,
-          verifiedUntil: null,
-          isVerificationSuspended: false,
-          status: 'active',
-          termsAccepted: data.termsAccepted,
-        };
-
-        transaction.set(partnerRef, {
-          ...nextData,
-          createdAt: FieldValue.serverTimestamp(),
-        });
-
-        transaction.set(publicRef, toPublicPartnerProfile(uid, nextData));
+        return;
       }
+
+      const nextData = {
+        businesses: [],
+        hasUsedTrial: false,
+        isVerified: false,
+        verificationType: null,
+        verifiedUntil: null,
+        isVerificationSuspended: false,
+        status: 'active',
+        termsAccepted: data.termsAccepted,
+      };
+      transaction.set(partnerRef, { ...nextData, createdAt: FieldValue.serverTimestamp() });
+      transaction.set(publicRef, toPublicPartnerProfile(uid, nextData));
     });
 
     return { created };

=== server/domain/partners/controllers/partnerContentController.ts — diff ===
@@ -11,9 +11,7 @@ import { cancelEventOccurrenceAndRefundApplicationUseCase } from '../../../appli
 import { deleteEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/deleteEventOccurrenceSafelyApplicationUseCase';
 import { postponeEventOccurrenceAndNotifyApplicationUseCase } from '../../../application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase';
 import { updateEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/updateEventOccurrenceSafelyApplicationUseCase';
-import {
-  createEventOccurrenceUseCase,
-} from '../../events';
+import { createEventOccurrenceUseCase } from '../../events';
 import {
   getEventSalesAnalyticsUseCase,
   listEventCheckInsForPartnerOrAdminUseCase,

=== server/domain/partners/dtos/RegisterPartnerDTO.ts — diff ===
@@ -5,9 +5,6 @@ export class RegisterPartnerDTO {
   private constructor(public readonly formData: PartnerRegistrationData) {}
 
   static fromValidatedInput(input: RegisterPartnerInput): RegisterPartnerDTO {
-    return new RegisterPartnerDTO({
-      cpfCnpj: input.formData.cpfCnpj,
-      termsAccepted: input.formData.termsAccepted,
-    });
+    return new RegisterPartnerDTO({ termsAccepted: input.formData.termsAccepted });
   }
 }

=== server/domain/partners/mappers/partnerMapper.test.ts — diff ===
@@ -3,8 +3,6 @@ import { toPartnerProfileDTO, toPublicPartnerProfileDTO } from './partnerMapper'
 
 describe('partnerMapper', () => {
   const rawPersistenceData = {
-    cpfCnpj: '12.345.678/0001-90',
-    cpfCnpjClean: '12345678000190',
     businesses: [
       { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
       { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
@@ -21,12 +19,11 @@ describe('partnerMapper', () => {
   };
 
   describe('toPartnerProfileDTO', () => {
-    it('deve converter dados brutos em PartnerProfileDTO sem expor cpfCnpjClean', () => {
+    it('deve converter dados brutos em PartnerProfileDTO', () => {
       const dto = toPartnerProfileDTO('partner-123', rawPersistenceData);
 
       expect(dto).toEqual({
         id: 'partner-123',
-        cpfCnpj: '12.345.678/0001-90',
         businesses: [
           { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
           { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
@@ -41,15 +38,13 @@ describe('partnerMapper', () => {
         createdAt: '2026-01-01T00:00:00.000Z',
         updatedAt: '2026-01-02T00:00:00.000Z',
       });
-
-      expect((dto as any).cpfCnpjClean).toBeUndefined();
     });
 
-    it('deve lançar erro se status for inválido', () => {
+    it.each(['invalid-status', 'pending'])('deve lançar erro se status for %s', (status) => {
       expect(() =>
         toPartnerProfileDTO('partner-123', {
           ...rawPersistenceData,
-          status: 'invalid-status',
+          status,
         })
       ).toThrow('Status Partner inválido persistido no Firestore.');
     });
@@ -114,11 +109,9 @@ describe('partnerMapper', () => {
         status: 'active',
       });
 
-      expect((publicDto as any).cpfCnpj).toBeUndefined();
-      expect((publicDto as any).cpfCnpjClean).toBeUndefined();
-      expect((publicDto as any).termsAccepted).toBeUndefined();
-      expect((publicDto as any).hasUsedTrial).toBeUndefined();
-      expect((publicDto as any).verificationType).toBeUndefined();
+      expect(publicDto).not.toHaveProperty('termsAccepted');
+      expect(publicDto).not.toHaveProperty('hasUsedTrial');
+      expect(publicDto).not.toHaveProperty('verificationType');
     });
   });
 });

=== server/domain/partners/mappers/partnerMapper.ts — diff ===
@@ -9,7 +9,7 @@ import type {
 } from '../types/partnerTypes';
 
 function toPartnerStatus(value: unknown): PartnerStatus {
-  if (value === 'active' || value === 'pending' || value === 'suspended') {
+  if (value === 'active' || value === 'suspended') {
     return value;
   }
 
@@ -75,7 +75,6 @@ export function toPartnerProfileDTO(id: string, raw: Record<string, unknown>): P
   return {
     id,
     businesses,
-    cpfCnpj: typeof raw.cpfCnpj === 'string' ? raw.cpfCnpj : undefined,
     isVerified: raw.isVerified === true,
     verifiedUntil: toIsoString(raw.verifiedUntil),
     verificationType: toPartnerVerificationType(raw.verificationType),

=== server/domain/partners/schemas/partnerContentSchema.ts — diff ===
@@ -52,7 +52,10 @@ const operationalInfoSchema = z
     transferRoutes: z
       .array(
         z
-          .object({ from: z.string().trim().min(1).max(100), to: z.string().trim().min(1).max(100) })
+          .object({
+            from: z.string().trim().min(1).max(100),
+            to: z.string().trim().min(1).max(100),
+          })
           .strict()
       )
       .max(30)
@@ -103,7 +106,16 @@ const commonFields = {
 export const createPartnerItemSchema = z
   .object({
     ...commonFields,
-    category: z.enum(['restaurant', 'sight', 'tour', 'tips', 'hotel', 'transfer', 'rental', 'producer']),
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
 
@@ -180,7 +192,4 @@ export const createPartnerEventSchema = z
     }
   });
 
-export const updatePartnerEventSchema = z
-  .object(eventFields)
-  .partial()
-  .strict();
+export const updatePartnerEventSchema = z.object(eventFields).partial().strict();

=== server/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -3,59 +3,27 @@ import { activateTrialSchema, registerPartnerSchema, verifyPartnerSchema } from
 
 describe('Partner Validation Schemas (Backend)', () => {
   describe('registerPartnerSchema', () => {
-    it('should validate complete partner registration payload with valid CPF', () => {
-      const result = registerPartnerSchema.safeParse({
-        formData: {
-          cpfCnpj: '123.456.789-09',
-          termsAccepted: true,
-        },
-      });
-      expect(result.success).toBe(true);
-    });
-
-    it('should validate partner registration payload with valid numeric CNPJ', () => {
-      const result = registerPartnerSchema.safeParse({
-        formData: {
-          cpfCnpj: '00.000.000/0001-91',
-          termsAccepted: true,
-        },
-      });
-      expect(result.success).toBe(true);
-    });
-
-    it('should validate partner registration payload with valid alphanumeric CNPJ', () => {
-      const result = registerPartnerSchema.safeParse({
-        formData: {
-          cpfCnpj: '12.ABC.345/01DE-35',
-          termsAccepted: true,
-        },
-      });
-      expect(result.success).toBe(true);
+    it('aceita só o aceite dos termos: o documento é do estabelecimento (D12)', () => {
+      expect(registerPartnerSchema.safeParse({ formData: { termsAccepted: true } }).success).toBe(
+        true
+      );
     });
 
-    it('should fail when termsAccepted is false', () => {
+    it('recusa CPF/CNPJ na conta (campo extra)', () => {
       const result = registerPartnerSchema.safeParse({
-        formData: {
-          cpfCnpj: '123.456.789-09',
-          termsAccepted: false,
-        },
+        formData: { cpfCnpj: '529.982.247-25', termsAccepted: true },
       });
       expect(result.success).toBe(false);
     });
 
-    it('should fail when cpfCnpj is invalid', () => {
-      const result = registerPartnerSchema.safeParse({
-        formData: {
-          cpfCnpj: '123.456.789-00',
-          termsAccepted: true,
-        },
-      });
-      expect(result.success).toBe(false);
+    it('should fail when termsAccepted is false', () => {
+      expect(registerPartnerSchema.safeParse({ formData: { termsAccepted: false } }).success).toBe(
+        false
+      );
     });
 
     it('should fail when formData is missing', () => {
-      const result = registerPartnerSchema.safeParse({});
-      expect(result.success).toBe(false);
+      expect(registerPartnerSchema.safeParse({}).success).toBe(false);
     });
   });

=== server/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -1,13 +1,8 @@
 import { z } from 'zod';
-import { isValidCpfCnpj } from '../services/documentIdentity';
 
+// O documento é de cada estabelecimento, enviado na verificação (D12); a conta só aceita os termos.
 const registerPartnerFormSchema = z
   .object({
-    cpfCnpj: z
-      .string()
-      .trim()
-      .min(1, 'CPF/CNPJ é obrigatório')
-      .refine(isValidCpfCnpj, 'CPF/CNPJ inválido'),
     termsAccepted: z.literal(true),
   })
   .strict();
@@ -36,7 +31,7 @@ export const activateTrialSchema = z
 export const updatePartnerStatusSchema = z
   .object({
     partnerId: z.string().trim().min(1),
-    status: z.enum(['active', 'pending', 'suspended']),
+    status: z.enum(['active', 'suspended']),
   })
   .strict();

=== server/domain/partners/services/partnerService.test.ts — diff ===
@@ -105,42 +105,15 @@ describe('PartnerService', () => {
   });
 
   describe('registerPartner', () => {
-    it('deve chamar registerPartner no port quando os dados forem válidos', async () => {
-      await service.registerPartner('user-1', {
-        cpfCnpj: '52998224725',
-        termsAccepted: true,
-      });
-
-      expect(partnerPort.registerPartner).toHaveBeenCalledWith('user-1', {
-        cpfCnpj: '52998224725',
-        termsAccepted: true,
-      });
-    });
+    it('deve chamar registerPartner no port só com o aceite dos termos', async () => {
+      await service.registerPartner('user-1', { termsAccepted: true });
 
-    it('deve lançar erro se CPF/CNPJ for inválido', async () => {
-      await expect(
-        service.registerPartner('user-1', {
-          cpfCnpj: '12345678900',
-          termsAccepted: true,
-        })
-      ).rejects.toThrow('CPF/CNPJ inválido');
-    });
-
-    it('deve lançar erro se CPF/CNPJ estiver ausente', async () => {
-      await expect(
-        service.registerPartner('user-1', {
-          cpfCnpj: '' as never,
-          termsAccepted: true,
-        })
-      ).rejects.toThrow('CPF/CNPJ inválido');
+      expect(partnerPort.registerPartner).toHaveBeenCalledWith('user-1', { termsAccepted: true });
     });
 
     it('deve lançar erro se termsAccepted for false', async () => {
       await expect(
-        service.registerPartner('user-1', {
-          cpfCnpj: '52998224725',
-          termsAccepted: false as never,
-        })
+        service.registerPartner('user-1', { termsAccepted: false as never })
       ).rejects.toThrow('É necessário aceitar os termos de parceria');
     });
   });

=== server/domain/partners/services/partnerService.ts — diff ===
@@ -1,6 +1,5 @@
 import { PartnerDomainError } from '../errors/partnerDomainError';
 import { PartnerPort } from '../ports/partnerPort';
-import { isValidCpfCnpj } from '../services/documentIdentity';
 import type {
   PartnerBusiness,
   PartnerProfileDocument,
@@ -18,15 +17,12 @@ export class PartnerService {
     uid: string,
     data: PartnerRegistrationData
   ): Promise<RegisterPartnerResult> {
-    if (!uid || !uid.trim()) {
+    if (!uid?.trim()) {
       throw new PartnerDomainError(
         'INVALID_ARGUMENT',
         'UID do usuário é obrigatório para cadastrar como parceiro'
       );
     }
-    if (!data.cpfCnpj || !isValidCpfCnpj(data.cpfCnpj)) {
-      throw new PartnerDomainError('INVALID_ARGUMENT', 'CPF/CNPJ inválido');
-    }
     if (data.termsAccepted !== true) {
       throw new PartnerDomainError(
         'INVALID_ARGUMENT',
@@ -40,7 +36,7 @@ export class PartnerService {
     partnerId: string,
     verification: PartnerVerificationData
   ): Promise<void> {
-    if (!partnerId || !partnerId.trim()) {
+    if (!partnerId?.trim()) {
       throw new PartnerDomainError(
         'INVALID_ARGUMENT',
         'ID do parceiro é obrigatório para verificação'
@@ -81,7 +77,7 @@ export class PartnerService {
   }
 
   async getProfile(partnerId: string): Promise<PartnerProfileDocument | null> {
-    if (!partnerId || !partnerId.trim()) {
+    if (!partnerId?.trim()) {
       throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
     }
     return this.partnerPort.getPartnerProfile(partnerId);
@@ -92,7 +88,7 @@ export class PartnerService {
     partnerId: string,
     status: PartnerStatus
   ): Promise<void> {
-    if (!partnerId || !partnerId.trim()) {
+    if (!partnerId?.trim()) {
       throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
     }
     if (!actor.admin) {
@@ -113,12 +109,12 @@ export class PartnerService {
   }
 
   async deletePartnerProfile(partnerId: string): Promise<void> {
-    if (!partnerId || !partnerId.trim()) return;
+    if (!partnerId?.trim()) return;
     return this.partnerPort.deletePartnerProfile(partnerId);
   }
 
   async activateTrial(actor: { uid: string; admin?: boolean }, partnerId: string): Promise<string> {
-    if (!partnerId || !partnerId.trim()) {
+    if (!partnerId?.trim()) {
       throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
     }
     if (!actor.admin && actor.uid !== partnerId) {
@@ -137,7 +133,7 @@ export class PartnerService {
   }
 
   async restoreTrialState(partnerId: string, state: PartnerTrialState): Promise<void> {
-    if (!partnerId || !partnerId.trim()) {
+    if (!partnerId?.trim()) {
       throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
     }

=== server/domain/partners/types/partnerTypes.ts — diff ===
@@ -1,4 +1,5 @@
-export type PartnerStatus = 'active' | 'pending' | 'suspended';
+/** A verificação é por estabelecimento (D12); o status da conta só serve para suspensão. */
+export type PartnerStatus = 'active' | 'suspended';
 
 /** `admin`: selo concedido pelo admin, sem plano pago. */
 export type PartnerVerificationType =
@@ -18,7 +19,6 @@ export interface PartnerBusiness {
 }
 
 export interface PartnerRegistrationData {
-  cpfCnpj: string;
   termsAccepted: true;
 }
 
@@ -43,8 +43,6 @@ export interface PartnerTrialState {
 
 export interface PartnerPersistenceDocument {
   id: string;
-  cpfCnpj?: string;
-  cpfCnpjClean?: string;
   status: PartnerStatus;
   businesses: PartnerBusiness[];
   isVerified: boolean;
@@ -59,7 +57,6 @@ export interface PartnerPersistenceDocument {
 
 export interface PartnerProfileDTO {
   id: string;
-  cpfCnpj?: string;
   status: PartnerStatus;
   businesses: PartnerBusiness[];
   isVerified: boolean;

=== src/domain/admin/components/subcomponents/AdminPartnersView.tsx — diff ===
@@ -1,4 +1,3 @@
-import React from 'react';
 import { Users, CheckCircle, Clock, Trash2, RefreshCw, Ban } from 'lucide-react';
 import { cn } from '../../../../shared/utils/cn';
 import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
@@ -9,7 +8,6 @@ const STATUS_BADGE: Record<
   { label: string; className: string; icon: typeof Clock }
 > = {
   active: { label: 'Cadastro Ativo', className: 'text-emerald-400', icon: CheckCircle },
-  pending: { label: 'Pendente', className: 'text-amber-500', icon: Clock },
   suspended: { label: 'Suspenso', className: 'text-rose-400', icon: Ban },
 };
 
@@ -144,11 +142,7 @@ export function AdminPartnersView({
                 )}
                 id={`btn-status-${partner.id}`}
               >
-                {partner.status === 'suspended'
-                  ? 'Reativar'
-                  : partner.status === 'pending'
-                    ? 'Aprovar'
-                    : 'Suspender'}
+                {partner.status === 'suspended' ? 'Reativar' : 'Suspender'}
               </button>
 
               <button

=== src/domain/admin/types/admin.ts — diff ===
@@ -30,7 +30,7 @@ export interface AdminPartnerSummary {
   lastName: string;
   email: string;
   listingsCount: number;
-  status: 'active' | 'pending' | 'suspended';
+  status: 'active' | 'suspended';
   isVerified: boolean;
   verifiedUntil: string | null;
   verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;

=== src/domain/partners/adapters/apiPartnerAdapter.ts — diff ===
@@ -1,6 +1,6 @@
 import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
 import { PartnerPort } from '../ports/partnerPort';
-import { PartnerProfile, PartnerRegistrationPayload } from '../types/partner';
+import { PartnerAccountStatus, PartnerProfile, PartnerRegistrationPayload } from '../types/partner';
 
 export class ApiPartnerAdapter implements PartnerPort {
   async registerPartner(payload: PartnerRegistrationPayload): Promise<void> {
@@ -80,10 +80,7 @@ export class ApiPartnerAdapter implements PartnerPort {
     return response.json();
   }
 
-  async updatePartnerStatus(
-    partnerId: string,
-    status: 'active' | 'pending' | 'suspended'
-  ): Promise<void> {
+  async updatePartnerStatus(partnerId: string, status: PartnerAccountStatus): Promise<void> {
     const res = await firebaseApiFetch(
       '/api/partners/status',
       {

=== src/domain/partners/application/mappers/partnerFormMapper.test.ts — diff ===
@@ -29,24 +29,10 @@ describe('partnerFormMapper', () => {
   };
 
   describe('mapItemToFormData', () => {
-    it('deve mapear item do Guide para FormState preenchendo cpfCnpj com partnerCpfCnpj e sem acessar guideItem.cpfCnpj', () => {
-      const partnerCpfCnpj = '12.345.678/0001-90';
+    it('deve mapear item do Guide para FormState', () => {
+      const formData = mapItemToFormData(mockPartnerRecord);
 
-      const guideItemProxy = new Proxy(
-        { ...mockPartnerRecord } as PartnerContentRecord & { cpfCnpj?: string },
-        {
-          get(target, prop, receiver) {
-            if (prop === 'cpfCnpj') {
-              throw new Error('guideItem.cpfCnpj não deve ser acessado pelo mapper!');
-            }
-            return Reflect.get(target, prop, receiver);
-          },
-        }
-      );
-
-      const formData = mapItemToFormData(guideItemProxy, partnerCpfCnpj);
-
-      expect(formData.cpfCnpj).toBe(partnerCpfCnpj);
+      expect(formData).not.toHaveProperty('cpfCnpj');
       expect(formData.businessName).toBe('Restaurante Mar Aberto');
       expect(formData.category).toBe('restaurant');
       expect(formData.region).toBe('Jericoacoara');
@@ -54,7 +40,7 @@ describe('partnerFormMapper', () => {
     });
 
     it('deve formatar imagens com file === undefined estrito e sem casts', () => {
-      const formData = mapItemToFormData(mockPartnerRecord, '12345678900');
+      const formData = mapItemToFormData(mockPartnerRecord);
 
       expect(formData.images).toHaveLength(2);
       expect(formData.images[0]).toEqual({
@@ -72,7 +58,6 @@ describe('partnerFormMapper', () => {
 
       expect(emptyForm.category).toBe('hotel');
       expect(emptyForm.businessName).toBe('');
-      expect(emptyForm.cpfCnpj).toBe('');
       expect(emptyForm.images).toEqual([]);
       expect(emptyForm.termsAccepted).toBe(true);
     });

=== src/domain/partners/application/mappers/partnerFormMapper.ts — diff ===
@@ -6,7 +6,6 @@ export const getEmptyFormData = (category = ''): FormState => ({
   businessName: '',
   category,
   description: '',
-  cpfCnpj: '',
   phone: '',
   phoneDdi: '+55',
   instagram: '',
@@ -78,7 +77,7 @@ const ensureArray = (val: string[] | string | undefined): string[] => {
   return [val];
 };
 
-export const mapItemToFormData = (item: PartnerContentRecord, partnerCpfCnpj = ''): FormState => {
+export const mapItemToFormData = (item: PartnerContentRecord): FormState => {
   const opInfo = item.operationalInfo ?? {};
   const access = opInfo.access;
   const sightAccessType: 'pago' | 'gratuito' | '' =
@@ -88,7 +87,6 @@ export const mapItemToFormData = (item: PartnerContentRecord, partnerCpfCnpj = '
     businessName: item.name || '',
     category: item.category || '',
     description: item.description || '',
-    cpfCnpj: partnerCpfCnpj,
     phone: splitE164(item.phone).nationalNumber,
     phoneDdi: splitE164(item.phone).ddi,
     instagram: item.instagramLink || '',

=== src/domain/partners/application/mappers/partnerSubmissionToGuide.test.ts — diff ===
@@ -6,7 +6,6 @@ describe('mapPartnerSubmissionToGuideItem', () => {
   const baseData: PartnerSubmissionData = {
     businessName: 'Estabelecimento Teste',
     category: 'hotel',
-    cpfCnpj: '12.345.678/0001-90',
     description: 'Descrição de teste',
     region: 'Jericoacoara',
     address: 'Rua Principal, 100',

=== src/domain/partners/application/usecases/updatePartnerStatusUseCase.ts — diff ===
@@ -1,15 +1,11 @@
-import { z } from 'zod';
 import { partnerAdapter } from '../../factory';
-
-const updateStatusSchema = z.object({
-  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
-  status: z.enum(['active', 'pending', 'suspended']),
-});
+import { updatePartnerStatusSchema } from '../../schemas/partnerSchema';
+import type { PartnerAccountStatus } from '../../types/partner';
 
 export async function updatePartnerStatusUseCase(
   partnerId: string,
-  status: 'active' | 'pending' | 'suspended'
+  status: PartnerAccountStatus
 ): Promise<void> {
-  updateStatusSchema.parse({ partnerId, status });
+  updatePartnerStatusSchema.parse({ partnerId, status });
   return partnerAdapter.updatePartnerStatus(partnerId, status);
 }

=== src/domain/partners/components/ListingEditor.tsx — diff ===
@@ -29,8 +29,6 @@ export interface ListingEditorProps {
   /** Categorias que podem ser escolhidas num cadastro novo (padrão: todas as do parceiro). */
   allowedCategoryIds?: string[];
   currentUser: UserSession | null;
-  /** CPF/CNPJ da conta do parceiro; o admin edita sem ele. */
-  cpfCnpj?: string;
   onSave: (input: PartnerContentItemInput, itemId: string | null) => Promise<void>;
   onDelete?: (itemId: string) => Promise<void>;
   onClose: () => void;
@@ -44,14 +42,13 @@ export function ListingEditor({
   item,
   allowedCategoryIds,
   currentUser,
-  cpfCnpj,
   onSave,
   onDelete,
   onClose,
 }: ListingEditorProps) {
   const { showToast } = useUI();
   const [formData, setFormData] = useState<FormState>(() =>
-    item ? mapItemToFormData(item, cpfCnpj) : { ...getEmptyFormData(''), cpfCnpj: cpfCnpj ?? '' }
+    item ? mapItemToFormData(item) : getEmptyFormData('')
   );
   const [isSaving, setIsSaving] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
@@ -174,7 +171,6 @@ export function ListingEditor({
                   formData={formData}
                   setFormData={setFormData}
                   categories={categories}
-                  mode="editor"
                   lockCategory={Boolean(item?.id)}
                 />
               </div>

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -262,7 +262,6 @@ export function PartnerPanel({
           <ListingEditor
             item={editingListing}
             currentUser={user}
-            cpfCnpj={partnerProfile?.cpfCnpj}
             onSave={async (input, itemId) => {
               if (itemId) {
                 await updatePartnerContentItemUseCase(itemId, input);

=== src/domain/partners/components/PartnersModal.tsx — diff ===
@@ -1,18 +1,8 @@
-import React, { useState, useRef, useEffect } from 'react';
+import { useState, useRef, useEffect } from 'react';
 import { motion, AnimatePresence } from 'motion/react';
 import { FormProvider } from 'react-hook-form';
-import {
-  X,
-  CheckCircle2,
-  Rocket,
-  Handshake,
-  ChevronLeft,
-  ChevronRight,
-  Loader2,
-} from 'lucide-react';
+import { X, Handshake } from 'lucide-react';
 import { ModalLayout } from '../../../ui/layouts/ModalLayout';
-import { cn } from '../../../shared/utils/cn';
-import { useUI } from '../../../shared/stores/useUIStore';
 import { useScrollLock } from '../../../shared/hooks/useScrollLock';
 import { Step1CompanyInfo } from './steps/Step1CompanyInfo';
 import { Step2ContactInfo } from './steps/Step2ContactInfo';
@@ -22,10 +12,21 @@ import { Step5Media } from './steps/Step5Media';
 import { PartnerPresentation } from './sections/PartnerPresentation';
 import { StepNavigation } from './sections/StepNavigation';
 import { ErrorState } from './sections/ErrorState';
+import { SignupProcessingState } from './sections/SignupProcessingState';
+import { SignupStepActions } from './sections/SignupStepActions';
+import { SignupStepPanel } from './sections/SignupStepPanel';
 import { Step6Success } from './steps/Step6Success';
 import { usePartnerForm } from '../hooks/usePartnerForm';
 import { Z_INDEX } from '../../../shared/constants/zIndex';
 import { LISTING_CATEGORIES } from '../constants/listingCategories';
+import {
+  isSignupStep1Incomplete,
+  isSignupStep2Incomplete,
+  isSignupStep3Incomplete,
+  isSignupStep4Incomplete,
+  isSignupStep5Incomplete,
+} from '../utils/signupStepGates';
+import type { PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
 
 interface PartnersModalProps {
   isOpen: boolean;
@@ -42,7 +43,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
   const [currentStep, setCurrentStep] = useState(1);
   const scrollContainerRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
-  const phoneRef = useRef<any>(null);
+  const phoneRef = useRef<PhoneInputFieldRef | null>(null);
 
   const {
     methods,
@@ -64,7 +65,7 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
 
   useScrollLock(isOpen);
 
-  // Scroll to top when view or step changes
+  // biome-ignore lint/correctness/useExhaustiveDependencies: as dependências são os gatilhos para voltar ao topo, não valores lidos no efeito.
   useEffect(() => {
     if (scrollContainerRef.current) {
       scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
@@ -73,7 +74,6 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
 
   const handleClose = () => {
     onClose();
-    // Reset states when closing
     setTimeout(() => {
       setShowForm(false);
       setCurrentStep(1);
@@ -92,7 +92,9 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
     >
       <div style={{ zIndex: Z_INDEX.header }} className="absolute top-6 right-6">
         <button
+          type="button"
           onClick={handleClose}
+          aria-label="Fechar"
           className="p-3 rounded-full glassmorphism-vibrant border border-white/20 active:scale-90 transition-transform backdrop-blur-xl shadow-2xl shadow-black/80 group/close"
         >
           <X
@@ -131,65 +133,24 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
 
               <AnimatePresence mode="wait">
                 {currentStep === 1 && (
-                  <motion.div
-                    key="step1"
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    exit={{ opacity: 0, y: -10 }}
-                    className="space-y-6 py-4"
-                  >
+                  <SignupStepPanel key="step1" className="space-y-6 py-4">
                     <Step1CompanyInfo
                       formData={formData}
                       setFormData={setFormData}
                       categories={CATEGORIES}
                     />
-                    <div className="flex items-center gap-4 pt-4">
-                      <button
-                        type="button"
-                        onClick={() => setShowForm(false)}
-                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
-                      >
-                        <ChevronLeft size={14} />
-                        Voltar
-                      </button>
-                      <button
-                        type="button"
-                        disabled={
-                          !formData.category ||
-                          !formData.cpfCnpj ||
-                          (formData.category !== 'producer' &&
-                            (!formData.businessName || !formData.description))
-                        }
-                        onClick={() => {
-                          if (isStep1Valid()) {
-                            setCurrentStep(2);
-                          }
-                        }}
-                        className={cn(
-                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
-                          !formData.category ||
-                            !formData.cpfCnpj ||
-                            (formData.category !== 'producer' &&
-                              (!formData.businessName || !formData.description))
-                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
-                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
-                        )}
-                      >
-                        Avançar
-                        <ChevronRight size={14} />
-                      </button>
-                    </div>
-                  </motion.div>
+                    <SignupStepActions
+                      className=""
+                      onBack={() => setShowForm(false)}
+                      nextDisabled={isSignupStep1Incomplete(formData)}
+                      onNext={() => {
+                        if (isStep1Valid()) setCurrentStep(2);
+                      }}
+                    />
+                  </SignupStepPanel>
                 )}
-
                 {currentStep === 2 && (
-                  <motion.div
-                    key="step2"
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    exit={{ opacity: 0, y: -10 }}
-                    className="space-y-6 py-4"
-                  >
+                  <SignupStepPanel key="step2" className="space-y-6 py-4">
                     <Step2ContactInfo
                       formData={formData}
                       setFormData={setFormData}
@@ -198,60 +159,19 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                       phoneRef={phoneRef}
                       categories={CATEGORIES}
                     />
-                    <div className="flex items-center gap-4 pt-4 pb-10">
-                      <button
-                        type="button"
-                        onClick={() => setCurrentStep(1)}
-                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
-                      >
-                        <ChevronLeft size={14} />
-                        Voltar
-                      </button>
-                      <button
-                        type="button"
-                        disabled={(() => {
-                          if (!formData.phone) return true;
-                          if (formData.category !== 'producer') {
-                            if (!formData.region || !formData.googleMaps) return true;
-                            if (formData.category === 'hotel' && !formData.bookingLinks)
-                              return true;
-                          }
-                          return false;
-                        })()}
-                        onClick={() => {
-                          if (validateStep2()) {
-                            setCurrentStep(formData.category === 'producer' ? 5 : 3);
-                          }
-                        }}
-                        className={cn(
-                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
-                          (() => {
-                            if (!formData.phone) return true;
-                            if (formData.category !== 'producer') {
-                              if (!formData.region || !formData.googleMaps) return true;
-                              if (formData.category === 'hotel' && !formData.bookingLinks)
-                                return true;
-                            }
-                            return false;
-                          })()
-                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
-                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
-                        )}
-                      >
-                        Avançar
-                        <ChevronRight size={14} />
-                      </button>
-                    </div>
-                  </motion.div>
+                    <SignupStepActions
+                      onBack={() => setCurrentStep(1)}
+                      nextDisabled={isSignupStep2Incomplete(formData)}
+                      onNext={() => {
+                        if (validateStep2()) {
+                          setCurrentStep(formData.category === 'producer' ? 5 : 3);
+                        }
+                      }}
+                    />
+                  </SignupStepPanel>
                 )}
                 {currentStep === 3 && (
-                  <motion.div
-                    key="step3"
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    exit={{ opacity: 0, y: -10 }}
-                    className="space-y-8 py-4"
-                  >
+                  <SignupStepPanel key="step3" className="space-y-8 py-4">
                     <Step3Details
                       formData={formData}
                       setFormData={setFormData}
@@ -259,84 +179,17 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                       setErrors={setErrors}
                       categories={CATEGORIES}
                     />
-                    <div className="flex items-center gap-4 pt-4 pb-10">
-                      <button
-                        type="button"
-                        onClick={() => setCurrentStep(2)}
-                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
-                      >
-                        <ChevronLeft size={14} />
-                        Voltar
-                      </button>
-                      <button
-                        type="button"
-                        disabled={(() => {
-                          if (formData.category === 'hotel') {
-                            return (
-                              formData.servesBreakfast === null ||
-                              (formData.servesBreakfast && formData.breakfastIncluded === null) ||
-                              (formData.servesBreakfast &&
-                                formData.breakfastIncluded === false &&
-                                !formData.breakfastPrice)
-                            );
-                          }
-                          if (formData.category === 'restaurant') {
-                            return !formData.subcategory;
-                          }
-                          if (formData.category === 'sight') {
-                            return (
-                              !formData.sightAccessType ||
-                              (formData.sightAccessType === 'pago' && !formData.sightPrice)
-                            );
-                          }
-                          return false;
-                        })()}
-                        onClick={() => {
-                          if (validateStep3()) {
-                            setCurrentStep(4);
-                          }
-                        }}
-                        className={cn(
-                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
-                          (() => {
-                            if (formData.category === 'hotel') {
-                              return (
-                                formData.servesBreakfast === null ||
-                                (formData.servesBreakfast && formData.breakfastIncluded === null) ||
-                                (formData.servesBreakfast &&
-                                  formData.breakfastIncluded === false &&
-                                  !formData.breakfastPrice)
-                              );
-                            }
-                            if (formData.category === 'restaurant') {
-                              return !formData.subcategory;
-                            }
-                            if (formData.category === 'sight') {
-                              return (
-                                !formData.sightAccessType ||
-                                (formData.sightAccessType === 'pago' && !formData.sightPrice)
-                              );
-                            }
-                            return false;
-                          })()
-                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
-                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
-                        )}
-                      >
-                        Avançar
-                        <ChevronRight size={14} />
-                      </button>
-                    </div>
-                  </motion.div>
+                    <SignupStepActions
+                      onBack={() => setCurrentStep(2)}
+                      nextDisabled={isSignupStep3Incomplete(formData)}
+                      onNext={() => {
+                        if (validateStep3()) setCurrentStep(4);
+                      }}
+                    />
+                  </SignupStepPanel>
                 )}
                 {currentStep === 4 && (
-                  <motion.div
-                    key="step4"
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    exit={{ opacity: 0, y: -10 }}
-                    className="space-y-8 py-4"
-                  >
+                  <SignupStepPanel key="step4" className="space-y-8 py-4">
                     <Step4Additional
                       formData={formData}
                       setFormData={setFormData}
@@ -344,74 +197,17 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                       setErrors={setErrors}
                       categories={CATEGORIES}
                     />
-                    <div className="flex items-center gap-4 pt-4 pb-10">
-                      <button
-                        type="button"
-                        onClick={() => setCurrentStep(3)}
-                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
-                      >
-                        <ChevronLeft size={14} />
-                        Voltar
-                      </button>
-                      <button
-                        type="button"
-                        disabled={(() => {
-                          if (formData.category === 'hotel') {
-                            return (
-                              !formData.checkInFrom ||
-                              !formData.checkInTo ||
-                              !formData.checkOutFrom ||
-                              !formData.checkOutTo ||
-                              formData.childrenAllowed === null ||
-                              !formData.petsPolicy ||
-                              ((formData.petsPolicy === 'Sim' ||
-                                formData.petsPolicy === 'Mediante pedido') &&
-                                !formData.petsExtraCost)
-                            );
-                          }
-                          return false;
-                        })()}
-                        onClick={() => {
-                          if (validateStep4()) {
-                            setCurrentStep(5);
-                          }
-                        }}
-                        className={cn(
-                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
-                          (() => {
-                            if (formData.category === 'hotel') {
-                              return (
-                                !formData.checkInFrom ||
-                                !formData.checkInTo ||
-                                !formData.checkOutFrom ||
-                                !formData.checkOutTo ||
-                                formData.childrenAllowed === null ||
-                                !formData.petsPolicy ||
-                                ((formData.petsPolicy === 'Sim' ||
-                                  formData.petsPolicy === 'Mediante pedido') &&
-                                  !formData.petsExtraCost)
-                              );
-                            }
-                            return false;
-                          })()
-                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
-                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
-                        )}
-                      >
-                        Avançar
-                        <ChevronRight size={14} />
-                      </button>
-                    </div>
-                  </motion.div>
+                    <SignupStepActions
+                      onBack={() => setCurrentStep(3)}
+                      nextDisabled={isSignupStep4Incomplete(formData)}
+                      onNext={() => {
+                        if (validateStep4()) setCurrentStep(5);
+                      }}
+                    />
+                  </SignupStepPanel>
                 )}
                 {currentStep === 5 && (
-                  <motion.div
-                    key="step5"
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    exit={{ opacity: 0, y: -10 }}
-                    className="space-y-10 py-4"
-                  >
+                  <SignupStepPanel key="step5" className="space-y-10 py-4">
                     <Step5Media
                       formData={formData}
                       setFormData={setFormData}
@@ -420,106 +216,37 @@ export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersM
                       setCurrentStep={setCurrentStep}
                       fileInputRef={fileInputRef}
                     />
-                    <div className="flex items-center gap-4 pt-4 pb-10">
-                      <button
-                        type="button"
-                        onClick={() => setCurrentStep(formData.category === 'producer' ? 2 : 4)}
-                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all"
-                      >
-                        <ChevronLeft size={14} />
-                        Voltar
-                      </button>
-                      <button
-                        type="button"
-                        disabled={
-                          !formData.termsAccepted ||
-                          (formData.images.length === 0 && formData.category !== 'producer') ||
-                          (!currentUser &&
-                            (!formData.firstName ||
-                              !formData.email ||
-                              !formData.password ||
-                              formData.password.length < 8 ||
-                              formData.password.length > 20 ||
-                              !/[A-Z]/.test(formData.password) ||
-                              !/[a-z]/.test(formData.password) ||
-                              !/\d/.test(formData.password) ||
-                              formData.password !== formData.confirmPassword))
-                        }
-                        onClick={() => {
-                          if (validateStep5()) {
-                            handleSubmit();
-                          }
-                        }}
-                        className={cn(
-                          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl',
-                          !formData.termsAccepted ||
-                            (formData.images.length === 0 && formData.category !== 'producer') ||
-                            (!currentUser &&
-                              (!formData.firstName ||
-                                !formData.email ||
-                                !formData.password ||
-                                formData.password.length < 8 ||
-                                formData.password.length > 20 ||
-                                !/[A-Z]/.test(formData.password) ||
-                                !/[a-z]/.test(formData.password) ||
-                                !/\d/.test(formData.password) ||
-                                formData.password !== formData.confirmPassword))
-                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
-                            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
-                        )}
-                      >
-                        Finalizar Cadastro
-                        {isSubmitting ? (
-                          <Loader2 size={14} className="animate-spin" />
-                        ) : (
-                          <CheckCircle2 size={14} />
-                        )}
-                      </button>
-                    </div>
-                  </motion.div>
+                    <SignupStepActions
+                      isFinal
+                      isSubmitting={isSubmitting}
+                      onBack={() => setCurrentStep(formData.category === 'producer' ? 2 : 4)}
+                      nextDisabled={isSignupStep5Incomplete(formData, Boolean(currentUser))}
+                      onNext={() => {
+                        if (validateStep5()) handleSubmit();
+                      }}
+                    />
+                  </SignupStepPanel>
                 )}
                 {currentStep === 6 && (
-                  <motion.div
+                  <SignupStepPanel
                     key="step6"
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    exit={{ opacity: 0, y: -10 }}
                     className="flex flex-col items-center justify-center py-20 text-center space-y-8"
                   >
                     {isSubmitting ? (
-                      <>
-                        <div className="relative">
-                          <motion.div
-                            animate={{ rotate: 360 }}
-                            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
-                            className="w-24 h-24 rounded-[2rem] border-2 border-indigo-500/20 border-t-indigo-500"
-                          />
-                          <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
-                            <Rocket size={40} className="animate-pulse" />
-                          </div>
-                        </div>
-                        <div className="space-y-2">
-                          <h3 className="text-xl font-black text-white uppercase">
-                            Processando...
-                          </h3>
-                          <p className="text-white/50 text-sm max-w-[280px]">
-                            Estamos preparando seu perfil e subindo as informações. Quase lá!
-                          </p>
-                        </div>
-                      </>
+                      <SignupProcessingState />
                     ) : submitError ? (
                       <ErrorState message={submitError} onRetry={() => setCurrentStep(5)} />
                     ) : (
                       <Step6Success
                         businessName={formData.businessName}
-                        onClose={() => handleClose()}
+                        onClose={handleClose}
                         onAccessPanel={() => {
                           handleClose();
                           onOpenPartnerPanel();
                         }}
                       />
                     )}
-                  </motion.div>
+                  </SignupStepPanel>
                 )}
               </AnimatePresence>
             </motion.div>

=== src/domain/partners/components/sections/SignupProcessingState.tsx — ARQUIVO NOVO, conteúdo completo ===
import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';

export function SignupProcessingState() {
  return (
    <>
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="w-24 h-24 rounded-[2rem] border-2 border-indigo-500/20 border-t-indigo-500"
        />
        <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
          <Rocket size={40} className="animate-pulse" aria-hidden="true" />
        </div>
      </div>
      <div className="space-y-2" role="status">
        <h3 className="text-xl font-black text-white uppercase">Processando...</h3>
        <p className="text-white/50 text-sm max-w-[280px]">
          Estamos preparando seu perfil e subindo as informações. Quase lá!
        </p>
      </div>
    </>
  );
}

=== src/domain/partners/components/sections/SignupStepActions.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

interface SignupStepActionsProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  /** Última etapa: o botão envia a inscrição em vez de avançar. */
  isFinal?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export function SignupStepActions({
  onBack,
  onNext,
  nextDisabled,
  isFinal = false,
  isSubmitting = false,
  className = 'pb-10',
}: SignupStepActionsProps) {
  return (
    <div className={cn('flex items-center gap-4 pt-4', className)}>
      <button
        type="button"
        onClick={onBack}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Voltar
      </button>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className={cn(
          'flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl focus-visible:ring-2 focus-visible:ring-teal-400/50',
          nextDisabled
            ? 'bg-white/5 text-white/50 cursor-not-allowed'
            : 'bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer'
        )}
      >
        {isFinal ? 'Finalizar Cadastro' : 'Avançar'}
        {!isFinal && <ChevronRight size={14} aria-hidden="true" />}
        {isFinal &&
          (isSubmitting ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={14} aria-hidden="true" />
          ))}
      </button>
    </div>
  );
}

=== src/domain/partners/components/sections/SignupStepPanel.tsx — ARQUIVO NOVO, conteúdo completo ===
import type React from 'react';
import { motion } from 'motion/react';

/** Use com `key` por etapa: o `AnimatePresence` do modal anima a saída pela troca de chave. */
interface SignupStepPanelProps {
  className: string;
  children: React.ReactNode;
}

export function SignupStepPanel({ className, children }: SignupStepPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

=== src/domain/partners/components/steps/Step1CompanyInfo.tsx — diff ===
@@ -3,7 +3,7 @@ import { motion } from 'motion/react';
 import { Building2 } from 'lucide-react';
 import { useFormContext } from 'react-hook-form';
 import { cn } from '../../../../shared/utils/cn';
-import { maskCpfCnpj } from '../../../../shared/utils/documentValidator';
+import type { FormState } from '../../types/partsForm';
 
 interface Category {
   id: string;
@@ -12,16 +12,9 @@ interface Category {
 }
 
 interface Step1CompanyInfoProps {
-  formData: {
-    category: string;
-    businessName: string;
-    description: string;
-    cpfCnpj: string;
-  };
-  setFormData: React.Dispatch<React.SetStateAction<any>>;
+  formData: Pick<FormState, 'category' | 'businessName' | 'description'>;
+  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
   categories: Category[];
-  // No editor do painel o CPF/CNPJ já pertence à conta do parceiro e não é editado por item.
-  mode?: 'signup' | 'editor';
   // Trocar a categoria de um item existente mudaria o schema de operationalInfo já gravado.
   lockCategory?: boolean;
 }
@@ -30,7 +23,6 @@ export function Step1CompanyInfo({
   formData: propFormData,
   setFormData,
   categories,
-  mode = 'signup',
   lockCategory = false,
 }: Step1CompanyInfoProps) {
   const formContext = useFormContext();
@@ -43,22 +35,14 @@ export function Step1CompanyInfo({
     if (formContext) {
       formContext.setValue('category', catId, { shouldValidate: true });
     }
-    setFormData((prev: any) => ({ ...prev, category: catId }));
-  };
-
-  const handleCpfCnpjChange = (value: string) => {
-    const masked = maskCpfCnpj(value);
-    if (formContext) {
-      formContext.setValue('cpfCnpj', masked, { shouldValidate: true });
-    }
-    setFormData((prev: any) => ({ ...prev, cpfCnpj: masked }));
+    setFormData((prev) => ({ ...prev, category: catId }));
   };
 
   const handleBusinessNameChange = (value: string) => {
     if (formContext) {
       formContext.setValue('businessName', value, { shouldValidate: true });
     }
-    setFormData((prev: any) => ({ ...prev, businessName: value }));
+    setFormData((prev) => ({ ...prev, businessName: value }));
   };
 
   const handleDescriptionChange = (value: string) => {
@@ -66,11 +50,10 @@ export function Step1CompanyInfo({
     if (formContext) {
       formContext.setValue('description', sliced, { shouldValidate: true });
     }
-    setFormData((prev: any) => ({ ...prev, description: sliced }));
+    setFormData((prev) => ({ ...prev, description: sliced }));
   };
 
   const isEventProducer = formData.category === 'producer';
-  const showCpfCnpj = mode === 'signup';
 
   return (
     <div className="space-y-6">
@@ -138,32 +121,6 @@ export function Step1CompanyInfo({
             transition={{ duration: 0.3 }}
             className="space-y-6 pt-2 border-t border-white/5"
           >
-            {/* Somente se for produtor de eventos: campo CPF/CNPJ obrigatório acima do nome */}
-            {showCpfCnpj && isEventProducer && (
-              <div className="space-y-2">
-                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                  CPF ou CNPJ <span className="text-red-500">*</span>
-                </label>
-                <input
-                  type="text"
-                  value={formData.cpfCnpj || ''}
-                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
-                  placeholder="Ex: 00.000.000/0001-00 ou 000.000.000-00"
-                  className={cn(
-                    'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
-                    formErrors.cpfCnpj ? 'border-red-500/50' : 'border-white/10'
-                  )}
-                  maxLength={18}
-                  required
-                />
-                {formErrors.cpfCnpj && (
-                  <p className="text-xs text-red-400 font-medium ml-1">
-                    {formErrors.cpfCnpj.message?.toString()}
-                  </p>
-                )}
-              </div>
-            )}
-
             {/* Nome da Empresa */}
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
@@ -188,32 +145,6 @@ export function Step1CompanyInfo({
               )}
             </div>
 
-            {/* CPF ou CNPJ para Atrações turísticas, Hospedagem e Restaurantes */}
-            {showCpfCnpj && !isEventProducer && (
-              <div className="space-y-2">
-                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
-                  CPF ou CNPJ <span className="text-red-500">*</span>
-                </label>
-                <input
-                  type="text"
-                  value={formData.cpfCnpj || ''}
-                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
-                  placeholder="Ex: 00.000.000/0001-00 ou 000.000.000-00"
-                  className={cn(
-                    'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
-                    formErrors.cpfCnpj ? 'border-red-500/50' : 'border-white/10'
-                  )}
-                  maxLength={18}
-                  required
-                />
-                {formErrors.cpfCnpj && (
-                  <p className="text-xs text-red-400 font-medium ml-1">
-                    {formErrors.cpfCnpj.message?.toString()}
-                  </p>
-                )}
-              </div>
-            )}
-
             {/* Descrição - Removida para produtor de eventos */}
             {!isEventProducer && (
               <div className="space-y-2">

=== src/domain/partners/components/subcomponents/PartnerHeader.tsx — diff ===
@@ -69,12 +69,12 @@ export function PartnerHeader({
               <div
                 className={cn(
                   'w-2 h-2 rounded-full',
-                  partnerProfile?.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
+                  partnerProfile?.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'
                 )}
                 aria-hidden="true"
               />
               <span className="text-[10px] font-semibold text-white">
-                {partnerProfile?.status === 'pending' ? 'Em análise' : 'Ativo'}
+                {partnerProfile?.status === 'suspended' ? 'Suspensa' : 'Ativa'}
               </span>
             </div>
           </div>

=== src/domain/partners/constants/formDefaults.ts — diff ===
@@ -4,7 +4,6 @@ export const INITIAL_FORM_DATA: FormState = {
   businessName: '',
   category: '',
   description: '',
-  cpfCnpj: '',
   phone: '',
   phoneDdi: '+55',
   instagram: '',

=== src/domain/partners/hooks/useListingEditorValidation.ts — diff ===
@@ -18,15 +18,8 @@ function collectErrors(schema: SectionSchema, formData: FormState): ListingEdito
   return errors;
 }
 
-/**
- * Sem CPF/CNPJ no formulário (editor do admin), a identidade é validada só por nome e descrição;
- * o perfil de produtor não tem descrição obrigatória.
- */
 function isIdentityValid(formData: FormState): boolean {
-  if (!formData.category) return false;
-  if (formData.cpfCnpj) return step1Schema.safeParse(formData).success;
-  if (!formData.businessName?.trim()) return false;
-  return formData.category === 'producer' || Boolean(formData.description?.trim());
+  return step1Schema.safeParse(formData).success;
 }
 
 /** Validação do editor de cadastro: as mesmas regras da inscrição, seção por seção. */

=== src/domain/partners/hooks/usePartnerForm.test.ts — diff ===
@@ -1,9 +1,9 @@
 import { act, renderHook } from '@testing-library/react';
 import { beforeEach, describe, expect, it, vi } from 'vitest';
-import { subscribeToAuthStateUseCase } from '../../auth';
+import { subscribeToAuthStateUseCase, type UserSession } from '../../auth';
 import { usePartnerForm } from './usePartnerForm';
 
-let authCallback: ((session: any) => void) | null = null;
+let authCallback: ((session: UserSession | null) => void) | null = null;
 
 vi.mock('../../auth', () => ({
   subscribeToAuthStateUseCase: vi.fn((cb) => {
@@ -50,7 +50,7 @@ describe('usePartnerForm Hook', () => {
     expect(subscribeToAuthStateUseCase).toHaveBeenCalled();
     expect(result.current.currentUser).toBeNull();
 
-    const mockSession = { uid: 'user-777', email: 'parceiro@exemplo.com' };
+    const mockSession = { uid: 'user-777', email: 'parceiro@exemplo.com' } as UserSession;
 
     act(() => {
       if (authCallback) {
@@ -61,34 +61,31 @@ describe('usePartnerForm Hook', () => {
     expect(result.current.currentUser).toEqual(mockSession);
   });
 
-  it('category & CPF/CNPJ: valida etapa 1 e define erro quando CPF/CNPJ for inválido', () => {
+  it('etapa 1: exige o nome do estabelecimento', () => {
     const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));
 
     act(() => {
       result.current.methods.setValue('category', 'hotel');
-      result.current.methods.setValue('cpfCnpj', '111.111.111-11');
-      result.current.methods.setValue('businessName', 'Pousada Sol');
       result.current.methods.setValue(
         'description',
         'Pousada linda em Jericoacoara com vista para as dunas.'
       );
     });
 
-    let isValid = false;
+    let isValid = true;
     act(() => {
       isValid = result.current.isStep1Valid();
     });
 
     expect(isValid).toBe(false);
-    expect(result.current.errors.cpfCnpj).toBeDefined();
+    expect(result.current.errors.businessName).toBeDefined();
   });
 
-  it('category & CPF/CNPJ: valida etapa 1 e retorna true quando categoria e CPF/CNPJ forem válidos', () => {
+  it('etapa 1: válida com categoria, nome e descrição, sem CPF/CNPJ na conta (D12)', () => {
     const { result } = renderHook(() => usePartnerForm(categories, mockSetCurrentStep));
 
     act(() => {
       result.current.methods.setValue('category', 'hotel');
-      result.current.methods.setValue('cpfCnpj', '529.982.247-25');
       result.current.methods.setValue('businessName', 'Pousada Sol');
       result.current.methods.setValue(
         'description',

=== src/domain/partners/hooks/usePartnerProfile.test.ts — diff ===
@@ -49,7 +49,6 @@ describe('usePartnerProfile', () => {
     businessName: 'Pousada Sol',
     businessId: 'bus-1',
     businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
-    cpfCnpj: '12.345.678/0001-90',
     verificationType: 'annual',
     isVerified: true,
     verifiedUntil: '2026-12-31T23:59:59.000Z',
@@ -129,14 +128,12 @@ describe('usePartnerProfile', () => {
       status: 'active',
     };
 
-    expect((mockPublicPartner as any).cpfCnpj).toBeUndefined();
-    expect((mockPublicPartner as any).verificationType).toBeUndefined();
+    expect(mockPublicPartner).not.toHaveProperty('verificationType');
 
     await act(async () => {
       partnerProfileCallback?.(mockPublicPartner);
     });
 
-    expect(result.current.partnerProfile?.cpfCnpj).toBe('12.345.678/0001-90');
     expect(result.current.partnerProfile?.verificationType).toBe('annual');
     expect(result.current.partnerProfile?.verifiedUntil).toBe('2027-01-01T00:00:00.000Z');
   });

=== src/domain/partners/hooks/usePartnerProfile.ts — diff ===
@@ -129,7 +129,6 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
           businessId: firstBusiness?.businessId ?? loadedProfile?.businessId ?? null,
           businessName: firstBusiness?.businessName ?? loadedProfile?.businessName ?? '',
           businesses,
-          cpfCnpj: loadedProfile?.cpfCnpj,
           firstName: userProfileData?.firstName ?? loadedProfile?.firstName ?? '',
           lastName: userProfileData?.lastName ?? loadedProfile?.lastName ?? '',
           email: userProfileData?.email ?? loadedProfile?.email ?? '',

=== src/domain/partners/hooks/usePartnerRegistrationSubmission.test.ts — diff ===
@@ -3,23 +3,17 @@ import { INITIAL_FORM_DATA } from '../constants/formDefaults';
 import { mapPartnerRegistrationPayload } from './usePartnerRegistrationSubmission';
 
 describe('mapPartnerRegistrationPayload', () => {
-  it('envia só CPF/CNPJ e termos: a categoria pertence ao cadastro, não à conta (decisão D9)', () => {
+  it('envia só o aceite dos termos: categoria e documento são do estabelecimento (D9, D12)', () => {
     const payload = mapPartnerRegistrationPayload({
       ...INITIAL_FORM_DATA,
       category: 'producer',
-      cpfCnpj: ' 529.982.247-25 ',
       termsAccepted: true,
     });
     // O schema do servidor é estrito: qualquer campo a mais faz a inscrição falhar com 400.
-    expect(payload).toEqual({ cpfCnpj: '529.982.247-25', termsAccepted: true });
+    expect(payload).toEqual({ termsAccepted: true });
   });
 
-  it('recusa inscrição sem aceite dos termos ou sem CPF/CNPJ', () => {
-    expect(() =>
-      mapPartnerRegistrationPayload({ ...INITIAL_FORM_DATA, cpfCnpj: '529.982.247-25' })
-    ).toThrow();
-    expect(() =>
-      mapPartnerRegistrationPayload({ ...INITIAL_FORM_DATA, termsAccepted: true, cpfCnpj: ' ' })
-    ).toThrow();
+  it('recusa inscrição sem aceite dos termos', () => {
+    expect(() => mapPartnerRegistrationPayload(INITIAL_FORM_DATA)).toThrow();
   });
 });

=== src/domain/partners/hooks/usePartnerRegistrationSubmission.ts — diff ===
@@ -22,16 +22,7 @@ export function mapPartnerRegistrationPayload(formData: FormState): PartnerRegis
     throw new Error('Você precisa aceitar os termos de parceria.');
   }
 
-  const cpfCnpj = formData.cpfCnpj.trim();
-
-  if (!cpfCnpj) {
-    throw new Error('CPF/CNPJ é obrigatório.');
-  }
-
-  return {
-    cpfCnpj,
-    termsAccepted: true,
-  };
+  return { termsAccepted: true };
 }
 
 export interface UsePartnerRegistrationSubmissionProps {

=== src/domain/partners/ports/partnerPort.ts — diff ===
@@ -1,11 +1,11 @@
-import { PartnerProfile, PartnerRegistrationPayload } from '../types/partner';
+import { PartnerAccountStatus, PartnerProfile, PartnerRegistrationPayload } from '../types/partner';
 
 export interface PartnerPort {
   registerPartner(payload: PartnerRegistrationPayload): Promise<void>;
   activateTrial(partnerId: string): Promise<void>;
   getPartnerProfile(partnerId: string): Promise<PartnerProfile | null>;
   getAllPartners(): Promise<PartnerProfile[]>;
-  updatePartnerStatus(partnerId: string, status: 'active' | 'pending' | 'suspended'): Promise<void>;
+  updatePartnerStatus(partnerId: string, status: PartnerAccountStatus): Promise<void>;
   updatePartnerVerification(partnerId: string, isVerified: boolean): Promise<void>;
   deletePartnerProfile(partnerId: string): Promise<void>;
 }

=== src/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -1,3 +1,4 @@
+import type { UserSession } from '../../auth';
 import { describe, expect, it } from 'vitest';
 import {
   partnerSubmissionSchema,
@@ -9,58 +10,21 @@ import {
   updatePartnerVerificationSchema,
 } from './partnerSchema';
 
-// Valid CPF with correct checksum: 52998224725 / 529.982.247-25
-// Valid CNPJ with correct checksum: 00000000000191 / 00.000.000/0001-91
-const VALID_TEST_CPF = '529.982.247-25';
-const VALID_TEST_CNPJ = '00.000.000/0001-91';
-const INVALID_TEST_CPF = '111.111.111-11';
-const INVALID_TEST_CNPJ = '12.345.678/0001-00';
-
 describe('Partner Validation Schemas (Frontend)', () => {
-  describe('CPF/CNPJ e Categoria (step1Schema)', () => {
-    it('deve validar hotel com CPF/CNPJ válido (CNPJ)', () => {
-      const result = step1Schema.safeParse({
-        category: 'hotel',
-        businessName: 'Pousada Sol & Mar',
-        cpfCnpj: VALID_TEST_CNPJ,
-        description: 'Uma linda pousada em Jericoacoara com vista para o mar.',
-      });
-      expect(result.success).toBe(true);
-    });
-
-    it('deve validar hotel com CPF/CNPJ válido (CPF)', () => {
+  describe('Categoria e identidade (step1Schema)', () => {
+    it('deve validar hotel com nome e descrição', () => {
       const result = step1Schema.safeParse({
         category: 'hotel',
         businessName: 'Pousada Sol & Mar',
-        cpfCnpj: VALID_TEST_CPF,
         description: 'Uma linda pousada em Jericoacoara com vista para o mar.',
       });
       expect(result.success).toBe(true);
     });
 
-    it('deve falhar quando CPF/CNPJ for inválido (CPF ou CNPJ com formato/checksum incorreto)', () => {
-      const resultCpf = step1Schema.safeParse({
-        category: 'hotel',
-        businessName: 'Pousada Sol & Mar',
-        cpfCnpj: INVALID_TEST_CPF,
-        description: 'Descrição válida',
-      });
-      expect(resultCpf.success).toBe(false);
-
-      const resultCnpj = step1Schema.safeParse({
-        category: 'hotel',
-        businessName: 'Pousada Sol & Mar',
-        cpfCnpj: INVALID_TEST_CNPJ,
-        description: 'Descrição válida',
-      });
-      expect(resultCnpj.success).toBe(false);
-    });
-
     it('deve falhar quando a categoria for vazia', () => {
       const result = step1Schema.safeParse({
         category: '',
         businessName: 'Pousada Sol & Mar',
-        cpfCnpj: VALID_TEST_CNPJ,
         description: 'Descrição válida',
       });
       expect(result.success).toBe(false);
@@ -71,7 +35,6 @@ describe('Partner Validation Schemas (Frontend)', () => {
         const res = step1Schema.safeParse({
           category,
           businessName: 'Empresa Teste',
-          cpfCnpj: VALID_TEST_CPF,
           description: 'Descrição válida do estabelecimento',
         });
         expect(res.success).toBe(true);
@@ -81,14 +44,12 @@ describe('Partner Validation Schemas (Frontend)', () => {
       const resProducer = step1Schema.safeParse({
         category: 'producer',
         businessName: 'Produtora Sol',
-        cpfCnpj: VALID_TEST_CPF,
         description: '',
       });
       expect(resProducer.success).toBe(true);
       const producerWithoutName = step1Schema.safeParse({
         category: 'producer',
         businessName: '',
-        cpfCnpj: VALID_TEST_CPF,
         description: '',
       });
       expect(producerWithoutName.success).toBe(false);
@@ -238,7 +199,7 @@ describe('Partner Validation Schemas (Frontend)', () => {
 
     it('deve permitir cadastro sem senha se houver sessão de usuário existente (currentUser)', () => {
       const schema = step5SchemaContext({
-        currentUser: { uid: 'user_123', email: 'carlos@hotel.com' } as any,
+        currentUser: { uid: 'user_123', email: 'carlos@hotel.com' } as UserSession,
       });
 
       const result = schema.safeParse({
@@ -257,7 +218,6 @@ describe('Partner Validation Schemas (Frontend)', () => {
         category: 'hotel',
         phone: '85988888888',
         termsAccepted: true,
-        cpfCnpj: VALID_TEST_CNPJ,
       });
       expect(result.success).toBe(true);
     });
@@ -268,7 +228,6 @@ describe('Partner Validation Schemas (Frontend)', () => {
         category: 'invalid-cat',
         phone: '85988888888',
         termsAccepted: true,
-        cpfCnpj: VALID_TEST_CNPJ,
       });
       expect(resultCategory.success).toBe(false);
 
@@ -277,11 +236,16 @@ describe('Partner Validation Schemas (Frontend)', () => {
         category: 'hotel',
         phone: '85988888888',
         termsAccepted: false,
-        cpfCnpj: VALID_TEST_CNPJ,
       });
       expect(resultTerms.success).toBe(false);
     });
 
+    it('updatePartnerStatusSchema recusa o status pendente: a conta só é suspensa (D12)', () => {
+      expect(
+        updatePartnerStatusSchema.safeParse({ partnerId: 'partner-123', status: 'pending' }).success
+      ).toBe(false);
+    });
+
     it('deve validar updatePartnerStatusSchema', () => {
       const result = updatePartnerStatusSchema.safeParse({
         partnerId: 'partner-123',

=== src/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -1,5 +1,4 @@
 import { z } from 'zod';
-import { isValidCpfCnpj } from '../../../shared/utils/documentValidator';
 import type { UserSession } from '../../auth';
 
 // Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos.
@@ -16,10 +15,6 @@ const partnerCategorySchema = z.enum([
 export const step1Schema = z
   .object({
     category: z.string().min(1, 'Selecione uma categoria'),
-    cpfCnpj: z
-      .string()
-      .min(1, 'CPF/CNPJ é obrigatório')
-      .refine((val) => isValidCpfCnpj(val), 'CPF ou CNPJ inválido'),
     businessName: z.string().default(''),
     description: z.string().default(''),
   })
@@ -128,20 +123,15 @@ export const step3Schema = z
       require(Number.isFinite(hours) && hours > 0, 'tourDurationHours', 'Informe a duração');
       require(data.meetingPoint.trim() !== '', 'meetingPoint', 'Informe o ponto de encontro');
     } else if (data.category === 'transfer') {
-      require(
-        data.transferRoutes.some((route) => route.from.trim() && route.to.trim()),
-        'transferRoutes',
-        'Informe ao menos um trecho com origem e destino'
-      );
+      require(data.transferRoutes.some(
+        (route) => route.from.trim() && route.to.trim()
+      ), 'transferRoutes', 'Informe ao menos um trecho com origem e destino');
       require(data.transferVehicles.length > 0, 'transferVehicles', 'Escolha ao menos um veículo');
       require(Number.parseInt(data.maxPassengers, 10) > 0, 'maxPassengers', 'Informe a capacidade');
     } else if (data.category === 'rental') {
       require(data.rentalVehicles.length > 0, 'rentalVehicles', 'Escolha o que é alugado');
-      require(
-        Number.parseInt(data.minRentalHours, 10) > 0,
-        'minRentalHours',
-        'Informe o período mínimo'
-      );
+      require(Number.parseInt(data.minRentalHours, 10) >
+        0, 'minRentalHours', 'Informe o período mínimo');
     }
     if (data.category === 'hotel') {
       if (data.servesBreakfast === null || data.servesBreakfast === undefined) {
@@ -326,11 +316,6 @@ export const partnerSubmissionSchema = z.object({
   email: z.string().optional().default(''),
   password: z.string().optional().default(''),
   confirmPassword: z.string().optional().default(''),
-  cpfCnpj: z
-    .string()
-    .trim()
-    .min(1, 'CPF/CNPJ é obrigatório')
-    .refine(isValidCpfCnpj, 'CPF ou CNPJ inválido'),
   childrenAllowed: z.boolean().nullable().optional(),
   petsPolicy: z.string().optional().default(''),
   petsExtraCost: z.string().optional().default(''),
@@ -377,7 +362,7 @@ export const partnerIdSchema = z.object({
 
 export const updatePartnerStatusSchema = z.object({
   partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
-  status: z.enum(['active', 'pending', 'suspended']),
+  status: z.enum(['active', 'suspended']),
 });
 
 export const updatePartnerVerificationSchema = z

=== src/domain/partners/types/partner.ts — diff ===
@@ -14,17 +14,20 @@ export type PartnerSignupCategory =
   | 'rental'
   | 'producer';
 
+/** Status da conta só serve para suspensão; a verificação é por estabelecimento (D12). */
+export type PartnerAccountStatus = 'active' | 'suspended';
+
 export interface PublicPartnerProfile {
   id: string;
   businesses: PartnerBusiness[];
   isVerified: boolean;
   verifiedUntil: string | null;
   isVerificationSuspended: boolean;
-  status: 'active' | 'pending' | 'suspended';
+  status: PartnerAccountStatus;
 }
 
+/** A conta não tem documento: CPF/CNPJ é de cada estabelecimento, na verificação (D12). */
 export interface PartnerRegistrationPayload {
-  cpfCnpj: string;
   termsAccepted: true;
 }
 
@@ -44,7 +47,6 @@ export interface PartnerSubmissionData {
   firstName: string;
   lastName: string;
   email: string;
-  cpfCnpj: string;
   childrenAllowed?: boolean | null;
   petsPolicy?: string;
   petsExtraCost?: string;
@@ -98,7 +100,6 @@ export interface PartnerProfile {
   businessId?: string | null;
   businessName: string;
   businesses?: PartnerBusiness[];
-  cpfCnpj?: string;
   phone?: string;
   phoneDdi?: string;
   instagram?: string;
@@ -113,7 +114,7 @@ export interface PartnerProfile {
   verifiedUntil?: string | null;
   verificationType?: PartnerVerificationType;
   hasUsedTrial?: boolean;
-  status?: 'active' | 'pending' | 'suspended';
+  status?: PartnerAccountStatus;
   firstName?: string;
   lastName?: string;
   email?: string;

=== src/domain/partners/types/partsForm.ts — diff ===
@@ -14,7 +14,6 @@ export interface FormState {
   businessName: string;
   category: string;
   description: string;
-  cpfCnpj: string;
   phone: string;
   phoneDdi: string;
   instagram: string;

=== src/domain/partners/utils/signupStepGates.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import type { FormState } from '../types/partsForm';
import {
  isSignupStep1Incomplete,
  isSignupStep2Incomplete,
  isSignupStep3Incomplete,
  isSignupStep4Incomplete,
  isSignupStep5Incomplete,
} from './signupStepGates';

const form = (overrides: Partial<FormState>): FormState => ({ ...INITIAL_FORM_DATA, ...overrides });

describe('signupStepGates', () => {
  it('etapa 1 não pede documento: categoria, nome e descrição bastam (D12)', () => {
    expect(isSignupStep1Incomplete(form({}))).toBe(true);
    expect(isSignupStep1Incomplete(form({ category: 'hotel', businessName: 'Pousada' }))).toBe(
      true
    );
    expect(
      isSignupStep1Incomplete(
        form({ category: 'hotel', businessName: 'Pousada', description: 'Vista para as dunas' })
      )
    ).toBe(false);
    expect(isSignupStep1Incomplete(form({ category: 'producer' }))).toBe(false);
  });

  it('etapa 2 exige link de reserva só para hospedagem', () => {
    const base = { phone: '88999999999', region: 'Jericoacoara', googleMaps: 'https://maps' };
    expect(isSignupStep2Incomplete(form({ ...base, category: 'restaurant' }))).toBe(false);
    expect(isSignupStep2Incomplete(form({ ...base, category: 'hotel' }))).toBe(true);
    expect(isSignupStep2Incomplete(form({ category: 'producer', phone: '88999999999' }))).toBe(
      false
    );
  });

  it('etapa 3 pede o preço do café quando não está incluso', () => {
    const hotel = form({ category: 'hotel', servesBreakfast: true, breakfastIncluded: false });
    expect(isSignupStep3Incomplete(hotel)).toBe(true);
    expect(isSignupStep3Incomplete({ ...hotel, breakfastPrice: '30' })).toBe(false);
  });

  it('etapa 4 pede custo extra de pet quando o pet é aceito', () => {
    const hotel = form({
      category: 'hotel',
      checkInFrom: '14:00',
      checkInTo: '22:00',
      checkOutFrom: '08:00',
      checkOutTo: '12:00',
      childrenAllowed: true,
      petsPolicy: 'Sim',
    });
    expect(isSignupStep4Incomplete(hotel)).toBe(true);
    expect(isSignupStep4Incomplete({ ...hotel, petsExtraCost: '50' })).toBe(false);
    expect(isSignupStep4Incomplete(form({ category: 'restaurant' }))).toBe(false);
  });

  it('etapa 5 exige senha forte só de quem ainda não tem conta', () => {
    const data = form({
      category: 'producer',
      termsAccepted: true,
      firstName: 'Ana',
      email: 'ana@exemplo.com',
      password: 'fraca',
      confirmPassword: 'fraca',
    });
    expect(isSignupStep5Incomplete(data, false)).toBe(true);
    expect(isSignupStep5Incomplete(data, true)).toBe(false);
    expect(
      isSignupStep5Incomplete(
        { ...data, password: 'Forte1234', confirmPassword: 'Forte1234' },
        false
      )
    ).toBe(false);
  });
});

=== src/domain/partners/utils/signupStepGates.ts — ARQUIVO NOVO, conteúdo completo ===
import type { FormState } from '../types/partsForm';

/**
 * Campos mínimos para liberar o botão "Avançar" de cada etapa da inscrição.
 * A validação completa (com mensagens) continua nos schemas de cada etapa.
 */
export function isSignupStep1Incomplete(formData: FormState): boolean {
  if (!formData.category) return true;
  if (formData.category === 'producer') return false;
  return !formData.businessName || !formData.description;
}

export function isSignupStep2Incomplete(formData: FormState): boolean {
  if (!formData.phone) return true;
  if (formData.category === 'producer') return false;
  if (!formData.region || !formData.googleMaps) return true;
  return formData.category === 'hotel' && !formData.bookingLinks;
}

export function isSignupStep3Incomplete(formData: FormState): boolean {
  if (formData.category === 'hotel') {
    return (
      formData.servesBreakfast === null ||
      (formData.servesBreakfast && formData.breakfastIncluded === null) ||
      (formData.servesBreakfast && formData.breakfastIncluded === false && !formData.breakfastPrice)
    );
  }
  if (formData.category === 'restaurant') return !formData.subcategory;
  if (formData.category === 'sight') {
    return (
      !formData.sightAccessType || (formData.sightAccessType === 'pago' && !formData.sightPrice)
    );
  }
  return false;
}

export function isSignupStep4Incomplete(formData: FormState): boolean {
  if (formData.category !== 'hotel') return false;
  const petsNeedCost = formData.petsPolicy === 'Sim' || formData.petsPolicy === 'Mediante pedido';
  return (
    !formData.checkInFrom ||
    !formData.checkInTo ||
    !formData.checkOutFrom ||
    !formData.checkOutTo ||
    formData.childrenAllowed === null ||
    !formData.petsPolicy ||
    (petsNeedCost && !formData.petsExtraCost)
  );
}

function isPasswordWeak(password: string): boolean {
  return (
    password.length < 8 ||
    password.length > 20 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  );
}

/** Quem já está logado não preenche nome, e-mail e senha. */
export function isSignupStep5Incomplete(formData: FormState, hasSession: boolean): boolean {
  if (!formData.termsAccepted) return true;
  if (formData.images.length === 0 && formData.category !== 'producer') return true;
  if (hasSession) return false;
  return (
    !formData.firstName ||
    !formData.email ||
    !formData.password ||
    isPasswordWeak(formData.password) ||
    formData.password !== formData.confirmPassword
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 161 arquivos, 885 testes, `npm run build`;
- `npm run test:rules` → 4 arquivos, 61 testes;
- `grep -rn "cpfCnpj\|partnerDocumentKeys" server src firestore.rules` só pode achar testes que garantem a ausência do campo.

Responda no formato do AGENTS.md §16.3.
~~~~
