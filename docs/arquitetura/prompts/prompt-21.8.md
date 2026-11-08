# Prompt 21.8 — Confirmação de e-mail com link nativo no endereço oficial (D22)

> Lote 18, gerado dos commits de referência `fd42053..734ae3e` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.8), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.8 — Confirmação de e-mail com link nativo no endereço oficial (D22)

Telas aprovadas em 2026-10-31.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Cadastro por e-mail e senha envia o link de confirmação do Firebase no idioma ativo; depois da escolha do @ abre o aviso "Confirme seu e-mail" com "Já confirmei", "Enviar outro link" (60 s entre envios) e "Agora não". Conta Google já vem confirmada.
2) Página /conta/acao (URL de ação dos e-mails do Firebase): confirma o e-mail (applyActionCode) ou abre a nova senha (mode=resetPassword); /reset-password deixa de existir. continueUrl sempre https://useguide.com.br, exceto em localhost.
3) Depois de confirmar, o app relê a conta e renova o ID token (o backend lê email_verified do token); também relê ao voltar para a tela.
4) Backend exige e-mail confirmado para comprar ingresso e cadastrar parceiro (EMAIL_NOT_VERIFIED, 403, formato padrão de erro). Compra de ingresso, reserva, cadastro de parceiro e link de transferência abrem o aviso.
5) Cadastro de parceiro com conta nova para até a confirmação e continua ao enviar de novo, já logado.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/registerPartnerApplicationUseCase.test.ts (criar)
- server/application/usecases/registerPartnerApplicationUseCase.ts (alterar)
- server/domain/partners/controllers/partnerController.ts (alterar)
- server/domain/partners/errors/partnerDomainError.ts (alterar)
- server/domain/seo/utils/routeSeo.ts (alterar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/errors/ticketingDomainError.ts (alterar)
- server/domain/ticketing/services/ticketingAccess.ts (alterar)
- server/domain/ticketing/usecases/createTicketOrderUseCase.test.ts (criar)
- server/domain/ticketing/usecases/createTicketOrderUseCase.ts (alterar)
- server/interfaces/http/ticketTransfers/ticketTransferController.ts (alterar)
- src/app/App.tsx (alterar)
- src/app/AppRouter.tsx (alterar)
- src/app/EmailVerificationGate.tsx (criar)
- src/app/routes/AppRoutes.tsx (alterar)
- src/domain/auth/adapters/firebaseAuthAdapter.test.ts (alterar)
- src/domain/auth/adapters/firebaseAuthAdapter.ts (alterar)
- src/domain/auth/application/usecases/applyEmailVerificationCodeUseCase.ts (criar)
- src/domain/auth/application/usecases/authUseCases.test.ts (alterar)
- src/domain/auth/application/usecases/index.ts (alterar)
- src/domain/auth/application/usecases/openEmailVerificationPromptUseCase.ts (criar)
- src/domain/auth/application/usecases/refreshEmailVerifiedUseCase.ts (criar)
- src/domain/auth/application/usecases/sendEmailVerificationUseCase.ts (criar)
- src/domain/auth/application/usecases/startEmailVerificationUseCase.ts (criar)
- src/domain/auth/components/AccountActionPage.test.tsx (criar)
- src/domain/auth/components/AccountActionPage.tsx (criar)
- src/domain/auth/components/EmailVerificationPrompt.test.tsx (criar)
- src/domain/auth/components/EmailVerificationPrompt.tsx (criar)
- src/domain/auth/components/index.ts (alterar)
- src/domain/auth/factory.ts (alterar)
- src/domain/auth/hooks/useAuth.ts (alterar)
- src/domain/auth/hooks/useEmailVerification.ts (criar)
- src/domain/auth/index.ts (alterar)
- src/domain/auth/stores/useAuthStore.ts (alterar)
- src/domain/auth/stores/useEmailVerificationPromptStore.ts (criar)
- src/domain/auth/types/authPort.ts (alterar)
- src/domain/bookings/hooks/useBookingCheckout.ts (alterar)
- src/domain/partners/adapters/apiPartnerAdapter.ts (alterar)
- src/domain/partners/hooks/usePartnerRegistrationSubmission.ts (alterar)
- src/domain/ticketing/adapters/httpTicketingAdapter.ts (alterar)
- src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx (alterar)
- src/domain/ticketing/hooks/useTicketCheckout.ts (alterar)
- src/shared/constants/accountActionPath.ts (criar)
- src/shared/constants/siteUrl.ts (criar)
- src/shared/i18n/emailVerificationResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketCheckoutResources.ts (alterar)
- src/shared/utils/seo.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/registerPartnerApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/partners', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../domain/partners')>()),
  registerPartnerUseCase: vi.fn(),
  deletePartnerProfileUseCase: vi.fn(),
}));
vi.mock('../../domain/users', () => ({ upgradeUserToPartnerUseCase: vi.fn() }));

import { registerPartnerUseCase } from '../../domain/partners';
import type { PartnerRegistrationData } from '../../domain/partners';
import { upgradeUserToPartnerUseCase } from '../../domain/users';
import { registerPartnerApplicationUseCase } from './registerPartnerApplicationUseCase';

const DATA = {} as PartnerRegistrationData;

describe('registerPartnerApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recusa conta sem e-mail confirmado antes de gravar qualquer coisa', async () => {
    await expect(
      registerPartnerApplicationUseCase({ uid: 'u1', emailVerified: false }, DATA)
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
    expect(registerPartnerUseCase).not.toHaveBeenCalled();
    expect(upgradeUserToPartnerUseCase).not.toHaveBeenCalled();
  });

  it('cadastra quem confirmou o e-mail', async () => {
    vi.mocked(registerPartnerUseCase).mockResolvedValue({ created: true } as never);
    await registerPartnerApplicationUseCase({ uid: 'u1', emailVerified: true }, DATA);
    expect(registerPartnerUseCase).toHaveBeenCalledWith('u1', DATA);
    expect(upgradeUserToPartnerUseCase).toHaveBeenCalledWith('u1');
  });
});

=== server/application/usecases/registerPartnerApplicationUseCase.ts — diff ===
@@ -1,11 +1,23 @@
-import { deletePartnerProfileUseCase, registerPartnerUseCase } from '../../domain/partners';
+import {
+  deletePartnerProfileUseCase,
+  PartnerDomainError,
+  registerPartnerUseCase,
+} from '../../domain/partners';
 import { upgradeUserToPartnerUseCase } from '../../domain/users';
 import type { PartnerRegistrationData } from '../../domain/partners';
 
 export async function registerPartnerApplicationUseCase(
-  uid: string,
+  actor: { uid: string; emailVerified: boolean },
   data: PartnerRegistrationData
 ): Promise<void> {
+  // E-mail confirmado antes de virar parceiro (AGENTS.md §7.10, A07).
+  if (!actor.emailVerified) {
+    throw new PartnerDomainError(
+      'EMAIL_NOT_VERIFIED',
+      'Confirme seu e-mail antes de cadastrar seu negócio.'
+    );
+  }
+  const { uid } = actor;
   const registration = await registerPartnerUseCase(uid, data);
   try {
     await upgradeUserToPartnerUseCase(uid);

=== server/domain/partners/controllers/partnerController.ts — diff ===
@@ -17,6 +17,8 @@ function handleControllerError(res: Response, error: unknown, defaultMessage: st
         return res.status(404).json({ error: error.message });
       case 'CONFLICT':
         return res.status(409).json({ error: error.message });
+      case 'EMAIL_NOT_VERIFIED':
+        return res.status(403).json({ error: { code: error.code, message: error.message } });
       default:
         return res.status(400).json({ error: error.message });
     }
@@ -68,7 +70,10 @@ export class PartnerController {
       }
 
       const dto = RegisterPartnerDTO.fromValidatedInput(parsed.data);
-      await registerPartnerApplicationUseCase(uid, dto.formData);
+      await registerPartnerApplicationUseCase(
+        { uid, emailVerified: req.user?.emailVerified === true },
+        dto.formData
+      );
       return res
         .status(200)
         .json({ status: 'success', message: 'Parceiro cadastrado com sucesso' });

=== server/domain/partners/errors/partnerDomainError.ts — diff ===
@@ -3,7 +3,8 @@ export type PartnerErrorCode =
   | 'NOT_FOUND'
   | 'FORBIDDEN'
   | 'CONFLICT'
-  | 'PARTNER_TERMS_NOT_ACCEPTED';
+  | 'PARTNER_TERMS_NOT_ACCEPTED'
+  | 'EMAIL_NOT_VERIFIED';
 
 export class PartnerDomainError extends Error {
   constructor(

=== server/domain/seo/utils/routeSeo.ts — diff ===
@@ -190,9 +190,10 @@ export const NON_LOCALIZED_ROUTE_SEO: Record<string, SeoMetadata> = {
     robots: 'noindex, nofollow',
     type: 'website',
   },
-  '/reset-password': {
-    title: 'Recuperar Senha | Use Guide',
-    description: 'Redefinição de senha de acesso ao Use Guide.',
+  // Página dos links dos e-mails da conta (D22), igual a ACCOUNT_ACTION_PATH do frontend.
+  '/conta/acao': {
+    title: 'Conta Use Guide | Use Guide',
+    description: 'Confirmação de e-mail e nova senha da conta Use Guide.',
     robots: 'noindex, nofollow',
     type: 'website',
   },

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -47,6 +47,7 @@ function getActor(req: AuthenticatedRequest) {
     uid: req.user?.uid || '',
     admin: req.user?.admin === true,
     role: req.user?.admin === true ? 'admin' : 'user',
+    emailVerified: req.user?.emailVerified === true,
   };
 }
 
@@ -72,6 +73,8 @@ function handleTicketingError(res: Response, error: unknown): Response {
         return res.status(404).json({ error: error.message });
       case 'TRANSFER_LINK_EXPIRED':
         return res.status(410).json({ error: error.message });
+      case 'EMAIL_NOT_VERIFIED':
+        return res.status(403).json({ error: { code: error.code, message: error.message } });
       case 'SERVICE_UNAVAILABLE':
         return res.status(503).json({ error: error.message });
     }

=== server/domain/ticketing/errors/ticketingDomainError.ts — diff ===
@@ -9,6 +9,7 @@ export type TicketingErrorCode =
   | 'TRANSFER_LINK_INVALID'
   | 'TRANSFER_LINK_EXPIRED'
   | 'TRANSFER_LINK_OWN'
+  | 'EMAIL_NOT_VERIFIED'
   | 'SERVICE_UNAVAILABLE';
 
 export class TicketingDomainError extends Error {

=== server/domain/ticketing/services/ticketingAccess.ts — diff ===
@@ -5,6 +5,8 @@ export interface TicketingActorContext {
   uid: string;
   admin?: boolean;
   role?: string;
+  /** Do token verificado; só a compra exige (AGENTS.md §7.10, A07). */
+  emailVerified?: boolean;
 }
 
 export function isActorAdmin(actor: TicketingActorContext): boolean {

=== server/domain/ticketing/usecases/createTicketOrderUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../factory', () => ({ ticketOrderService: { createTicketOrder: vi.fn() } }));

import { ticketOrderService } from '../factory';
import { createTicketOrderUseCase } from './createTicketOrderUseCase';

const INPUT = {} as Parameters<typeof createTicketOrderUseCase>[1];

describe('createTicketOrderUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exige e-mail confirmado para comprar ingresso', async () => {
    await expect(
      createTicketOrderUseCase({ uid: 'u1', emailVerified: false }, INPUT)
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
    await expect(createTicketOrderUseCase({ uid: 'u1' }, INPUT)).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
    });
    expect(ticketOrderService.createTicketOrder).not.toHaveBeenCalled();
  });

  it('cria o pedido para quem confirmou o e-mail', async () => {
    vi.mocked(ticketOrderService.createTicketOrder).mockResolvedValue({} as never);
    await createTicketOrderUseCase({ uid: 'u1', emailVerified: true }, INPUT);
    expect(ticketOrderService.createTicketOrder).toHaveBeenCalledTimes(1);
  });
});

=== server/domain/ticketing/usecases/createTicketOrderUseCase.ts — diff ===
@@ -1,4 +1,5 @@
 import { ticketOrderService } from '../factory';
+import { TicketingDomainError } from '../errors/ticketingDomainError';
 import type { TicketingActorContext } from '../services/ticketingAccess';
 import type { Ticket, TicketOrder, TicketOrderItem } from '../types/ticketingTypes';
 
@@ -12,5 +13,11 @@ export async function createTicketOrderUseCase(
   isIdempotentReplay: boolean;
   serverNow: string;
 }> {
+  if (actor.emailVerified !== true) {
+    throw new TicketingDomainError(
+      'EMAIL_NOT_VERIFIED',
+      'Confirme seu e-mail antes de comprar ingressos.'
+    );
+  }
   return ticketOrderService.createTicketOrder(actor, input);
 }

=== server/interfaces/http/ticketTransfers/ticketTransferController.ts — diff ===
@@ -30,6 +30,7 @@ const TICKETING_STATUS: Record<TicketingDomainError['code'], number> = {
   TRANSFER_LINK_INVALID: 404,
   TRANSFER_LINK_EXPIRED: 410,
   TRANSFER_LINK_OWN: 422,
+  EMAIL_NOT_VERIFIED: 403,
   SERVICE_UNAVAILABLE: 503,
 };

=== src/app/App.tsx — diff ===
@@ -2,6 +2,7 @@ import { AppProviders } from './AppProviders';
 import { AppRouter } from './AppRouter';
 import { TransferLinkReceiver } from './TransferLinkReceiver';
 import { UsernameGate } from './UsernameGate';
+import { EmailVerificationGate } from './EmailVerificationGate';
 import { ErrorBoundary } from './ErrorBoundary';
 import { LocalePreference } from './locale/LocalePreference';
 
@@ -12,6 +13,7 @@ export default function App() {
         <AppRouter />
         <UsernameGate />
         <TransferLinkReceiver />
+        <EmailVerificationGate />
         <LocalePreference />
       </AppProviders>
     </ErrorBoundary>

=== src/app/AppRouter.tsx — diff ===
@@ -29,6 +29,7 @@ import { SideMenu } from './menu/SideMenu';
 import { useSideMenu } from './menu/useSideMenu';
 import { useScrollContainer } from './useScrollContainer';
 import { AppRoutes } from './routes/AppRoutes';
+import { ACCOUNT_ACTION_PATH } from '../shared/constants/accountActionPath';
 
 export function AppRouter() {
   const { user, refreshProfile } = useAuthContext();
@@ -218,10 +219,10 @@ export function AppRouter() {
     setIsSearchSticky(false);
   }, [location.pathname]);
 
-  const isResetPasswordPage = location.pathname === '/reset-password';
+  const isAccountActionPage = location.pathname === ACCOUNT_ACTION_PATH;
   const isAdminOpen = searchParams.get('admin') === '1';
   const isHideGlobalUI =
-    isResetPasswordPage || isAdminOpen || isPartnerPortalOpen || location.pathname === '/admin';
+    isAccountActionPage || isAdminOpen || isPartnerPortalOpen || location.pathname === '/admin';
 
   const isRetracted = isLoginModalOpen && !isMenuOpen && !isLoginClosingBySwipe;
 
@@ -270,7 +271,7 @@ export function AppRouter() {
               key={location.pathname}
               className={cn(
                 'min-h-full max-w-2xl mx-auto w-full',
-                isExplorePage ? 'pt-[70px]' : isResetPasswordPage ? 'pt-0' : 'pt-28'
+                isExplorePage ? 'pt-[70px]' : isAccountActionPage ? 'pt-0' : 'pt-28'
               )}
             >
               <AppRoutes

=== src/app/EmailVerificationGate.tsx — ARQUIVO NOVO, conteúdo completo ===
import { EmailVerificationPrompt, useAuthContext } from '../domain/auth';

/**
 * Aviso "Confirme seu e-mail" (D22). Espera a escolha do @ (UsernameGate), que vem antes logo
 * depois do cadastro, para os dois passos não abrirem juntos.
 */
export function EmailVerificationGate() {
  const { user, profile, loading } = useAuthContext();
  if (loading || !user || user.isAnonymous || !profile?.username) return null;
  return <EmailVerificationPrompt />;
}

=== src/app/routes/AppRoutes.tsx — diff ===
@@ -1,10 +1,11 @@
 import type { ReactNode } from 'react';
 import { Route, Routes, type Location } from 'react-router-dom';
 import { AdminPanelComposition } from '../compositions/AdminPanelComposition';
-import { ResetPassword } from '../../domain/auth/components/ResetPassword';
+import { AccountActionPage } from '../../domain/auth';
 import type { GuideItem } from '../../domain/guide';
 import { ExploreView } from '../../domain/guide/components/ExploreView';
 import { GridView } from '../../domain/guide/components/GridView';
+import { ACCOUNT_ACTION_PATH } from '../../shared/constants/accountActionPath';
 import { LOCALIZED_ROUTES, type RouteKey, SUPPORTED_LOCALES } from '../../shared/i18n';
 import { NotFoundView } from '../../ui/components/NotFoundView';
 import { PageLayout } from '../../ui/layouts/PageLayout';
@@ -67,7 +68,7 @@ export function AppRoutes({ location, onSelectItem, onStickyChange }: AppRoutesP
       )}
       <Route path="/checkout/result" element={<CheckoutResultComposition />} />
       <Route path="/admin" element={<AdminPanelComposition />} />
-      <Route path="/reset-password" element={<ResetPassword />} />
+      <Route path={ACCOUNT_ACTION_PATH} element={<AccountActionPage />} />
       <Route path="*" element={<NotFoundView />} />
     </Routes>
   );

=== src/domain/auth/adapters/firebaseAuthAdapter.test.ts — diff ===
@@ -1,5 +1,5 @@
 import { describe, it, expect, vi, beforeEach } from 'vitest';
-import { FirebaseAuthAdapter } from './firebaseAuthAdapter';
+import { authActionContinueUrl, FirebaseAuthAdapter } from './firebaseAuthAdapter';
 import * as firebaseAuth from 'firebase/auth';
 
 vi.mock('firebase/auth', () => ({
@@ -20,6 +20,8 @@ vi.mock('firebase/auth', () => ({
     PROVIDER_ID: 'password',
   },
   updatePassword: vi.fn(),
+  sendEmailVerification: vi.fn(),
+  applyActionCode: vi.fn(),
 }));
 
 vi.mock('../../../shared/infrastructure/firebase/firebaseAuth', () => ({
@@ -53,7 +55,7 @@ describe('FirebaseAuthAdapter', () => {
       },
     };
     vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce(
-      mockUserCredential as any
+      mockUserCredential as never
     );
 
     const session = await adapter.loginWithEmail('test@example.com', 'password123');
@@ -88,7 +90,7 @@ describe('FirebaseAuthAdapter', () => {
   });
 
   it('loginWithSocialGoogle propaga erro quando popup é cancelado pelo usuário', async () => {
-    const cancelError = new Error('Popup closed') as any;
+    const cancelError = Object.assign(new Error('Popup closed'), { code: '' });
     cancelError.code = 'auth/popup-closed-by-user';
     vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(cancelError);
 
@@ -96,7 +98,7 @@ describe('FirebaseAuthAdapter', () => {
   });
 
   it('loginWithSocialGoogle propaga erro de popup bloqueado sem tentar redirecionamento', async () => {
-    const blockedError = new Error('Popup blocked') as any;
+    const blockedError = Object.assign(new Error('Popup blocked'), { code: '' });
     blockedError.code = 'auth/popup-blocked';
     vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(blockedError);
 
@@ -104,7 +106,7 @@ describe('FirebaseAuthAdapter', () => {
   });
 
   it('loginWithSocialGoogle propaga auth/unauthorized-domain sem tentar alterar config', async () => {
-    const domainError = new Error('Domain not authorized') as any;
+    const domainError = Object.assign(new Error('Domain not authorized'), { code: '' });
     domainError.code = 'auth/unauthorized-domain';
     vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(domainError);
 
@@ -120,7 +122,7 @@ describe('FirebaseAuthAdapter', () => {
   });
 
   it('verifyResetCode propaga erro se código for inválido ou expirado', async () => {
-    const invalidError = new Error('Invalid code') as any;
+    const invalidError = Object.assign(new Error('Invalid code'), { code: '' });
     invalidError.code = 'auth/invalid-action-code';
     vi.mocked(firebaseAuth.verifyPasswordResetCode).mockRejectedValueOnce(invalidError);
 
@@ -128,14 +130,14 @@ describe('FirebaseAuthAdapter', () => {
   });
 
   it('reauthenticate executa reautenticação com senha', async () => {
-    vi.mocked(firebaseAuth.EmailAuthProvider.credential).mockReturnValueOnce({} as any);
-    vi.mocked(firebaseAuth.reauthenticateWithCredential).mockResolvedValueOnce({} as any);
+    vi.mocked(firebaseAuth.EmailAuthProvider.credential).mockReturnValueOnce({} as never);
+    vi.mocked(firebaseAuth.reauthenticateWithCredential).mockResolvedValueOnce({} as never);
     await adapter.reauthenticate('user@example.com', 'password123');
     expect(firebaseAuth.reauthenticateWithCredential).toHaveBeenCalled();
   });
 
   it('reauthenticateWithGoogle dispara popup com googleProvider', async () => {
-    vi.mocked(firebaseAuth.reauthenticateWithPopup).mockResolvedValueOnce({} as any);
+    vi.mocked(firebaseAuth.reauthenticateWithPopup).mockResolvedValueOnce({} as never);
     await adapter.reauthenticateWithGoogle();
     expect(firebaseAuth.reauthenticateWithPopup).toHaveBeenCalled();
   });
@@ -149,4 +151,31 @@ describe('FirebaseAuthAdapter', () => {
     await adapter.changePassword('newPass123!');
     expect(firebaseAuth.updatePassword).toHaveBeenCalledWith(expect.anything(), 'newPass123!');
   });
+
+  it('envia o link de confirmação no idioma ativo', async () => {
+    vi.mocked(firebaseAuth.sendEmailVerification).mockResolvedValueOnce();
+    await adapter.sendEmailVerification('fr');
+    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(expect.anything(), {
+      url: authActionContinueUrl(window.location.hostname, window.location.origin),
+    });
+  });
+
+  it('volta sempre para o site oficial, exceto no teste local (D22)', () => {
+    expect(authActionContinueUrl('ais-dev-123.run.app', 'https://ais-dev-123.run.app')).toBe(
+      'https://useguide.com.br'
+    );
+    expect(authActionContinueUrl('useguide.com.br', 'https://useguide.com.br')).toBe(
+      'https://useguide.com.br'
+    );
+    expect(authActionContinueUrl('localhost', 'http://localhost:3000')).toBe(
+      'http://localhost:3000'
+    );
+  });
+
+  it('traduz o limite de envios do Firebase para TOO_MANY_REQUESTS', async () => {
+    vi.mocked(firebaseAuth.sendEmailVerification).mockRejectedValueOnce({
+      code: 'auth/too-many-requests',
+    });
+    await expect(adapter.sendEmailVerification('pt-BR')).rejects.toThrow('TOO_MANY_REQUESTS');
+  });
 });

=== src/domain/auth/adapters/firebaseAuthAdapter.ts — diff ===
@@ -4,6 +4,8 @@ import {
   signInWithPopup as fbSignInWithPopup,
   signOut as fbSignOut,
   sendPasswordResetEmail as fbSendPasswordResetEmail,
+  sendEmailVerification as fbSendEmailVerification,
+  applyActionCode,
   verifyPasswordResetCode,
   confirmPasswordReset,
   onAuthStateChanged,
@@ -12,10 +14,30 @@ import {
   EmailAuthProvider,
   updatePassword,
 } from 'firebase/auth';
+import { SITE_URL } from '../../../shared/constants/siteUrl';
 import { auth, googleProvider } from '../../../shared/infrastructure/firebase/firebaseAuth';
 import { UserRole, UserSession, AuthIdentity } from '../types/auth';
 import { AuthPort } from '../types/authPort';
 
+/**
+ * Para onde o botão "continuar" do Firebase leva depois da ação. Fora do teste local é sempre o site
+ * oficial (D22): os e-mails nunca mostram o endereço do AI Studio. O link do e-mail em si é o URL de
+ * ação configurado no console (Authentication › Modelos).
+ */
+export function authActionContinueUrl(hostname: string, origin: string): string {
+  return hostname === 'localhost' || hostname === '127.0.0.1' ? origin : SITE_URL;
+}
+
+function continueUrl(): string {
+  if (typeof window === 'undefined') return SITE_URL;
+  return authActionContinueUrl(window.location.hostname, window.location.origin);
+}
+
+function authErrorCode(error: unknown): string | undefined {
+  const code = (error as { code?: unknown } | null)?.code;
+  return typeof code === 'string' ? code : undefined;
+}
+
 export class FirebaseAuthAdapter implements AuthPort {
   async registerWithEmail(email: string, password: string): Promise<UserSession> {
     try {
@@ -67,13 +89,14 @@ export class FirebaseAuthAdapter implements AuthPort {
         role,
         isAnonymous: user.isAnonymous,
       };
-    } catch (error: any) {
+    } catch (error: unknown) {
+      const code = authErrorCode(error);
       if (
-        error?.code === 'auth/invalid-credential' ||
-        error?.code === 'auth/user-not-found' ||
-        error?.code === 'auth/wrong-password'
+        code === 'auth/invalid-credential' ||
+        code === 'auth/user-not-found' ||
+        code === 'auth/wrong-password'
       ) {
-        console.warn('[FirebaseAuthAdapter] loginWithEmail invalid credentials:', error.message);
+        console.warn('[FirebaseAuthAdapter] loginWithEmail invalid credentials:', code);
       } else {
         console.error('[FirebaseAuthAdapter] loginWithEmail error:', error);
       }
@@ -105,8 +128,8 @@ export class FirebaseAuthAdapter implements AuthPort {
         role,
         isAnonymous: user.isAnonymous,
       };
-    } catch (error: any) {
-      if (error?.code !== 'auth/popup-closed-by-user') {
+    } catch (error: unknown) {
+      if (authErrorCode(error) !== 'auth/popup-closed-by-user') {
         console.error('[FirebaseAuthAdapter] loginWithSocialGoogle error:', error);
       }
 
@@ -125,22 +148,40 @@ export class FirebaseAuthAdapter implements AuthPort {
 
   async resetPassword(email: string): Promise<void> {
     try {
-      const isLocalhost =
-        typeof window !== 'undefined' &&
-        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
-      const baseUrl = isLocalhost ? window.location.origin : 'https://useguide.com.br';
-
-      const actionCodeSettings = {
-        url: `${baseUrl}/reset-password`,
-        handleCodeInApp: true,
-      };
-      await fbSendPasswordResetEmail(auth, email, actionCodeSettings);
+      await fbSendPasswordResetEmail(auth, email, { url: continueUrl() });
     } catch (error) {
       console.error('[FirebaseAuthAdapter] resetPassword error:', error);
       throw error;
     }
   }
 
+  async sendEmailVerification(locale: string): Promise<void> {
+    const user = auth.currentUser;
+    if (!user) throw new Error('NOT_AUTHENTICATED');
+    auth.languageCode = locale;
+    try {
+      await fbSendEmailVerification(user, { url: continueUrl() });
+    } catch (error: unknown) {
+      throw new Error(
+        authErrorCode(error) === 'auth/too-many-requests' ? 'TOO_MANY_REQUESTS' : 'SEND_FAILED'
+      );
+    }
+  }
+
+  async refreshEmailVerified(): Promise<boolean> {
+    const user = auth.currentUser;
+    if (!user) return false;
+    await user.reload();
+    // O backend lê `email_verified` do ID token: sem renovar, ele continuaria vendo false.
+    if (user.emailVerified) await user.getIdToken(true);
+    return user.emailVerified;
+  }
+
+  async applyEmailVerificationCode(code: string): Promise<void> {
+    await applyActionCode(auth, code);
+    if (auth.currentUser) await this.refreshEmailVerified();
+  }
+
   async verifyResetCode(code: string): Promise<string> {
     try {
       return await verifyPasswordResetCode(auth, code);

=== src/domain/auth/application/usecases/applyEmailVerificationCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AuthPort } from '../../types/authPort';

export function createApplyEmailVerificationCodeUseCase(authPort: AuthPort) {
  return (code: string): Promise<void> => authPort.applyEmailVerificationCode(code);
}

=== src/domain/auth/application/usecases/authUseCases.test.ts — diff ===
@@ -36,11 +36,14 @@ describe('Auth Use Cases (DIP & Injected AuthPort)', () => {
       reauthenticateWithGoogle: vi.fn(),
       hasPasswordSignIn: vi.fn(),
       changePassword: vi.fn(),
+      sendEmailVerification: vi.fn(),
+      refreshEmailVerified: vi.fn(),
+      applyEmailVerificationCode: vi.fn(),
     };
   });
 
   it('createLoginWithEmailUseCase invokes injected AuthPort.loginWithEmail', async () => {
-    vi.mocked(mockPort.loginWithEmail).mockResolvedValueOnce({ uid: 'u123' } as any);
+    vi.mocked(mockPort.loginWithEmail).mockResolvedValueOnce({ uid: 'u123' } as never);
     const loginWithEmailUseCase = createLoginWithEmailUseCase(mockPort);
     const result = await loginWithEmailUseCase('test@example.com', 'password123');
     expect(mockPort.loginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
@@ -48,7 +51,7 @@ describe('Auth Use Cases (DIP & Injected AuthPort)', () => {
   });
 
   it('createRegisterWithEmailUseCase invokes injected AuthPort.registerWithEmail', async () => {
-    vi.mocked(mockPort.registerWithEmail).mockResolvedValueOnce({ uid: 'u123' } as any);
+    vi.mocked(mockPort.registerWithEmail).mockResolvedValueOnce({ uid: 'u123' } as never);
     const registerWithEmailUseCase = createRegisterWithEmailUseCase(mockPort);
     const result = await registerWithEmailUseCase('test@example.com', 'password123');
     expect(mockPort.registerWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
@@ -56,7 +59,7 @@ describe('Auth Use Cases (DIP & Injected AuthPort)', () => {
   });
 
   it('createLoginWithGoogleUseCase invokes injected AuthPort.loginWithSocialGoogle', async () => {
-    vi.mocked(mockPort.loginWithSocialGoogle).mockResolvedValueOnce({ uid: 'u123' } as any);
+    vi.mocked(mockPort.loginWithSocialGoogle).mockResolvedValueOnce({ uid: 'u123' } as never);
     const loginWithGoogleUseCase = createLoginWithGoogleUseCase(mockPort);
     const result = await loginWithGoogleUseCase();
     expect(mockPort.loginWithSocialGoogle).toHaveBeenCalledTimes(1);
@@ -79,7 +82,7 @@ describe('Auth Use Cases (DIP & Injected AuthPort)', () => {
   });
 
   it('createGetCurrentAuthUserUseCase invokes injected AuthPort.getCurrentUser', () => {
-    vi.mocked(mockPort.getCurrentUser).mockReturnValueOnce({ uid: 'u123' } as any);
+    vi.mocked(mockPort.getCurrentUser).mockReturnValueOnce({ uid: 'u123' } as never);
     const getCurrentAuthUserUseCase = createGetCurrentAuthUserUseCase(mockPort);
     const user = getCurrentAuthUserUseCase();
     expect(mockPort.getCurrentUser).toHaveBeenCalledTimes(1);

=== src/domain/auth/application/usecases/index.ts — diff ===
@@ -12,3 +12,6 @@ export * from './reauthenticateUseCase';
 export * from './reauthenticateWithGoogleUseCase';
 export * from './hasPasswordSignInUseCase';
 export * from './changePasswordUseCase';
+export * from './sendEmailVerificationUseCase';
+export * from './refreshEmailVerifiedUseCase';
+export * from './applyEmailVerificationCodeUseCase';

=== src/domain/auth/application/usecases/openEmailVerificationPromptUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEmailVerificationPromptStore } from '../../stores/useEmailVerificationPromptStore';

/**
 * Abre o aviso "Confirme seu e-mail" (D22). Outros domínios chamam quando o servidor responde que a
 * ação exige e-mail confirmado (ex.: comprar ingresso, reservar, virar parceiro).
 */
export function openEmailVerificationPromptUseCase(): void {
  useEmailVerificationPromptStore.getState().open('required');
}

=== src/domain/auth/application/usecases/refreshEmailVerifiedUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AuthPort } from '../../types/authPort';

export function createRefreshEmailVerifiedUseCase(authPort: AuthPort) {
  return (): Promise<boolean> => authPort.refreshEmailVerified();
}

=== src/domain/auth/application/usecases/sendEmailVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AuthPort } from '../../types/authPort';

export function createSendEmailVerificationUseCase(authPort: AuthPort) {
  return (locale: string): Promise<void> => authPort.sendEmailVerification(locale);
}

=== src/domain/auth/application/usecases/startEmailVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { sendEmailVerificationUseCase } from '../../factory';
import { useEmailVerificationPromptStore } from '../../stores/useEmailVerificationPromptStore';

/**
 * Conta nova por e-mail (D22): envia o link de confirmação e abre o aviso. Se o envio falhar, o
 * aviso abre do mesmo jeito e oferece outro envio.
 */
export async function startEmailVerificationUseCase(locale: string): Promise<void> {
  const prompt = useEmailVerificationPromptStore.getState();
  await sendEmailVerificationUseCase(locale)
    .then(() => prompt.markSent(Date.now()))
    .catch(() => undefined);
  prompt.open('signup');
}

=== src/domain/auth/components/AccountActionPage.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

vi.mock('../factory', () => ({ applyEmailVerificationCodeUseCase: vi.fn() }));
vi.mock('./ResetPassword', () => ({ ResetPassword: () => <p>tela de nova senha</p> }));
vi.mock('../../../shared/hooks/useLocalizedRouting', () => ({
  useLocalizedRouting: () => ({ goTo: vi.fn() }),
}));

import { applyEmailVerificationCodeUseCase } from '../factory';
import { AccountActionPage } from './AccountActionPage';

function open(query: string) {
  render(
    <MemoryRouter initialEntries={[`/conta/acao${query}`]}>
      <Routes>
        <Route path="/conta/acao" element={<AccountActionPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AccountActionPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('confirma o e-mail com o código do link', async () => {
    vi.mocked(applyEmailVerificationCodeUseCase).mockResolvedValue();
    open('?mode=verifyEmail&oobCode=abc123');
    expect(await screen.findByText('E-mail confirmado')).toBeTruthy();
    expect(applyEmailVerificationCodeUseCase).toHaveBeenCalledWith('abc123');
  });

  it('link vencido ou já usado', async () => {
    vi.mocked(applyEmailVerificationCodeUseCase).mockRejectedValue(new Error('expired'));
    open('?mode=verifyEmail&oobCode=abc123');
    expect(await screen.findByText('Link inválido')).toBeTruthy();
  });

  it('abre a nova senha no modo resetPassword', () => {
    open('?mode=resetPassword&oobCode=abc123');
    expect(screen.getByText('tela de nova senha')).toBeTruthy();
  });

  it('modo desconhecido é link inválido', () => {
    open('?mode=outro');
    expect(screen.getByText('Link inválido')).toBeTruthy();
    expect(applyEmailVerificationCodeUseCase).not.toHaveBeenCalled();
  });
});

=== src/domain/auth/components/AccountActionPage.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { applyEmailVerificationCodeUseCase } from '../factory';
import { useAuthStore } from '../stores/useAuthStore';
import { ResetPassword } from './ResetPassword';

type VerifyState = 'verifying' | 'verified' | 'invalid';

/**
 * Página de ação da conta (D22), o URL de ação dos modelos de e-mail do Firebase:
 * https://useguide.com.br/conta/acao?mode=...&oobCode=... Confirma o e-mail ou abre a nova senha.
 */
export function AccountActionPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const code = searchParams.get('oobCode');
  if (mode === 'resetPassword') return <ResetPassword />;
  if (mode === 'verifyEmail' && code) return <VerifyEmail code={code} />;
  return <ActionResult state="invalid" />;
}

function VerifyEmail({ code }: { code: string }) {
  const [state, setState] = useState<VerifyState>('verifying');

  useEffect(() => {
    let active = true;
    applyEmailVerificationCodeUseCase(code)
      .then(() => {
        if (!active) return;
        // Se a conta estiver aberta neste navegador, o app já mostra o e-mail como confirmado.
        if (useAuthStore.getState().user) useAuthStore.getState().setEmailVerified(true);
        setState('verified');
      })
      .catch(() => active && setState('invalid'));
    return () => {
      active = false;
    };
  }, [code]);

  return <ActionResult state={state} />;
}

function ActionResult({ state }: { state: VerifyState }) {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  const Icon =
    state === 'verifying' ? LoaderCircle : state === 'verified' ? CircleCheck : CircleAlert;

  return (
    <main className="min-h-dvh bg-app flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-surface border border-line p-8 text-center space-y-4">
        <Icon
          size={40}
          aria-hidden="true"
          className={
            state === 'verifying'
              ? 'mx-auto text-accent animate-spin motion-reduce:animate-none'
              : state === 'verified'
                ? 'mx-auto text-success'
                : 'mx-auto text-danger'
          }
        />
        {state === 'verifying' ? (
          <p role="status" className="text-[15px] text-ink/80">
            {t('emailVerification.action.verifying')}
          </p>
        ) : (
          <>
            <h1 className="text-[22px] font-display font-bold text-ink">
              {t(
                state === 'verified'
                  ? 'emailVerification.action.verifiedTitle'
                  : 'emailVerification.action.invalidTitle'
              )}
            </h1>
            <p className="text-[15px] text-ink/70">
              {t(
                state === 'verified'
                  ? 'emailVerification.action.verifiedText'
                  : 'emailVerification.action.invalidText'
              )}
            </p>
            <button
              type="button"
              onClick={() => goTo('explore', '', { replace: true })}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('emailVerification.action.goToApp')}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

=== src/domain/auth/components/EmailVerificationPrompt.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { UserRole } from '../types/auth';

vi.mock('../factory', () => ({
  refreshEmailVerifiedUseCase: vi.fn(),
  sendEmailVerificationUseCase: vi.fn(),
}));

import { refreshEmailVerifiedUseCase, sendEmailVerificationUseCase } from '../factory';
import { useAuthStore } from '../stores/useAuthStore';
import { useEmailVerificationPromptStore } from '../stores/useEmailVerificationPromptStore';
import { EmailVerificationPrompt } from './EmailVerificationPrompt';

function signIn(emailVerified: boolean) {
  useAuthStore.setState({
    user: {
      uid: 'u1',
      email: 'ana@exemplo.com',
      displayName: 'Ana',
      photoURL: null,
      emailVerified,
      role: UserRole.USER,
      isAnonymous: false,
    },
  });
}

describe('EmailVerificationPrompt', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    useEmailVerificationPromptStore.setState({ reason: null, sentAt: null });
    signIn(false);
  });

  it('fica fechado sem pedido de abertura', () => {
    render(<EmailVerificationPrompt />);
    expect(screen.queryByText('Confirme seu e-mail')).toBeNull();
  });

  it('depois do cadastro mostra o e-mail e espera 60 s para enviar outro link', () => {
    useEmailVerificationPromptStore.setState({ reason: 'signup', sentAt: Date.now() });
    render(<EmailVerificationPrompt />);
    expect(screen.getByText(/Enviamos um link para ana@exemplo.com/)).toBeTruthy();
    const resend = screen.getByRole('button', { name: /Enviar outro link em 60 s/ });
    expect((resend as HTMLButtonElement).disabled).toBe(true);
  });

  it('"Já confirmei" avisa quando o e-mail ainda não foi confirmado', async () => {
    vi.mocked(refreshEmailVerifiedUseCase).mockResolvedValue(false);
    act(() => useEmailVerificationPromptStore.getState().open('required'));
    render(<EmailVerificationPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Já confirmei' }));
    expect(await screen.findByText(/Ainda não aparece confirmado/)).toBeTruthy();
  });

  it('"Já confirmei" marca a conta como confirmada', async () => {
    vi.mocked(refreshEmailVerifiedUseCase).mockResolvedValue(true);
    act(() => useEmailVerificationPromptStore.getState().open('required'));
    render(<EmailVerificationPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Já confirmei' }));
    expect(await screen.findByText('E-mail confirmado.')).toBeTruthy();
    expect(useAuthStore.getState().user?.emailVerified).toBe(true);
  });

  it('envia outro link no idioma ativo e mostra o limite do Firebase', async () => {
    vi.mocked(sendEmailVerificationUseCase)
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('TOO_MANY_REQUESTS'));
    act(() => useEmailVerificationPromptStore.getState().open('required'));
    render(<EmailVerificationPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar outro link' }));
    expect(await screen.findByText('Link enviado para ana@exemplo.com.')).toBeTruthy();
    expect(sendEmailVerificationUseCase).toHaveBeenCalledWith('pt-BR');

    act(() => useEmailVerificationPromptStore.setState({ sentAt: null }));
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Enviar outro link' }) as HTMLButtonElement).disabled
      ).toBe(false)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Enviar outro link' }));
    expect(await screen.findByText(/Muitos envios seguidos/)).toBeTruthy();
  });
});

=== src/domain/auth/components/EmailVerificationPrompt.tsx — ARQUIVO NOVO, conteúdo completo ===
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { StatusText, type StatusTone } from '../../../ui/components/StatusText';
import { TextButton } from '../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { useEmailVerification, useEmailVerificationSync } from '../hooks/useEmailVerification';
import { useEmailVerificationPromptStore } from '../stores/useEmailVerificationPromptStore';

type Feedback = { tone: StatusTone; key: string };

/**
 * Aviso "Confirme seu e-mail" (D22): abre depois do cadastro por e-mail e quando uma ação exige
 * e-mail confirmado. Enquanto a conta não está confirmada, relê a conta quando o app volta à tela.
 */
export function EmailVerificationPrompt() {
  const { t } = useTranslation();
  const reason = useEmailVerificationPromptStore((state) => state.reason);
  const close = useEmailVerificationPromptStore((state) => state.close);
  const verification = useEmailVerification();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  useEmailVerificationSync(!verification.verified, verification.refresh);

  if (!reason) return null;

  const dismiss = () => {
    setFeedback(null);
    close();
  };

  const check = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const verified = await verification.refresh();
      if (!verified) setFeedback({ tone: 'warn', key: 'emailVerification.notYet' });
    } catch {
      setFeedback({ tone: 'danger', key: 'emailVerification.errors.failed' });
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await verification.send();
      setFeedback({ tone: 'success', key: 'emailVerification.sent' });
    } catch (err: unknown) {
      const tooMany = err instanceof Error && err.message === 'TOO_MANY_REQUESTS';
      setFeedback({
        tone: 'danger',
        key: tooMany
          ? 'emailVerification.errors.TOO_MANY_REQUESTS'
          : 'emailVerification.errors.failed',
      });
    } finally {
      setBusy(false);
    }
  };

  const email = verification.email;

  return (
    <Dialog
      open
      nested={reason === 'required'}
      onOpenChange={(open) => !open && dismiss()}
      title={t('emailVerification.title')}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <MailCheck size={20} aria-hidden="true" />
          </span>
          <p className="text-[15px] text-ink/80 leading-snug break-words">
            {t(
              reason === 'signup'
                ? 'emailVerification.sentAfterSignup'
                : 'emailVerification.required',
              { email }
            )}
          </p>
        </div>

        {verification.verified ? (
          <>
            <StatusText tone="success">{t('emailVerification.verified')}</StatusText>
            <button type="button" onClick={dismiss} className={`${BUTTON_PRIMARY} w-full`}>
              {t('emailVerification.close')}
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] text-ink/70">{t('emailVerification.spamHint')}</p>
            {feedback && (
              <p role={feedback.tone === 'danger' ? 'alert' : 'status'}>
                <StatusText tone={feedback.tone}>{t(feedback.key, { email })}</StatusText>
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void check()}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('emailVerification.checked')}
            </button>
            <div className="flex flex-wrap justify-center gap-x-6">
              <TextButton
                tone="accent"
                disabled={busy || verification.cooldown > 0}
                onClick={() => void resend()}
              >
                {verification.cooldown > 0
                  ? t('emailVerification.resendIn', { seconds: verification.cooldown })
                  : t('emailVerification.resend')}
              </TextButton>
              <TextButton tone="ink" onClick={dismiss}>
                {t('emailVerification.later')}
              </TextButton>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

=== src/domain/auth/components/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export { LoginModal } from './LoginModal';
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { ForgotPasswordForm } from './ForgotPasswordForm';
export { AccountActionPage } from './AccountActionPage';
export { EmailVerificationPrompt } from './EmailVerificationPrompt';
export { AuthModalShell } from './AuthModalShell';
export { PasswordField } from './PasswordField';
export { AuthErrorMessage } from './AuthErrorMessage';

=== src/domain/auth/factory.ts — diff ===
@@ -15,6 +15,9 @@ import {
   createReauthenticateWithGoogleUseCase,
   createHasPasswordSignInUseCase,
   createChangePasswordUseCase,
+  createSendEmailVerificationUseCase,
+  createRefreshEmailVerifiedUseCase,
+  createApplyEmailVerificationCodeUseCase,
 } from './application/usecases';
 
 const authPort: AuthPort = new FirebaseAuthAdapter();
@@ -33,3 +36,6 @@ export const reauthenticateUseCase = createReauthenticateUseCase(authPort);
 export const reauthenticateWithGoogleUseCase = createReauthenticateWithGoogleUseCase(authPort);
 export const hasPasswordSignInUseCase = createHasPasswordSignInUseCase(authPort);
 export const changePasswordUseCase = createChangePasswordUseCase(authPort);
+export const sendEmailVerificationUseCase = createSendEmailVerificationUseCase(authPort);
+export const refreshEmailVerifiedUseCase = createRefreshEmailVerifiedUseCase(authPort);
+export const applyEmailVerificationCodeUseCase = createApplyEmailVerificationCodeUseCase(authPort);

=== src/domain/auth/hooks/useAuth.ts — diff ===
@@ -1,4 +1,5 @@
 import { useState } from 'react';
+import { useTranslation } from 'react-i18next';
 import { useAuthContext } from '../context/AuthContext';
 import {
   loginWithEmailUseCase,
@@ -7,11 +8,13 @@ import {
   resetPasswordUseCase,
   logoutUseCase,
 } from '../factory';
+import { startEmailVerificationUseCase } from '../application/usecases/startEmailVerificationUseCase';
 import { getCurrentUserUseCase } from '../../user/application/usecases/getCurrentUserUseCase';
 import { updateCurrentUserUseCase } from '../../user/application/usecases/updateCurrentUserUseCase';
 
 export function useAuth() {
   const { user, profile, loading: contextLoading, refreshProfile } = useAuthContext();
+  const { i18n } = useTranslation();
 
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
@@ -48,6 +51,7 @@ export function useAuth() {
         lastName,
         phone: phone || '',
       });
+      await startEmailVerificationUseCase(i18n.language);
       await refreshProfile();
       return session;
     } catch (err: unknown) {
@@ -65,7 +69,7 @@ export function useAuth() {
     try {
       const session = await loginWithGoogleUseCase();
       const existingProfile = await getCurrentUserUseCase();
-      if (!existingProfile || !existingProfile.firstName) {
+      if (!existingProfile?.firstName) {
         const rawName = (session.displayName || 'Novo Usuário').trim();
         const nameParts = rawName.split(/\s+/).filter(Boolean);
         const firstName = (nameParts[0] || 'Novo').slice(0, 50);

=== src/domain/auth/hooks/useEmailVerification.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { refreshEmailVerifiedUseCase, sendEmailVerificationUseCase } from '../factory';
import { useAuthStore } from '../stores/useAuthStore';
import { useEmailVerificationPromptStore } from '../stores/useEmailVerificationPromptStore';

// Espera entre envios do link: o Firebase também limita e responde too-many-requests.
const RESEND_COOLDOWN_MS = 60_000;

function secondsLeft(sentAt: number | null): number {
  if (sentAt === null) return 0;
  return Math.max(0, Math.ceil((sentAt + RESEND_COOLDOWN_MS - Date.now()) / 1000));
}

/** Envio do link e leitura da confirmação do e-mail da conta atual (D22). */
export function useEmailVerification() {
  const { i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setEmailVerified = useAuthStore((state) => state.setEmailVerified);
  const sentAt = useEmailVerificationPromptStore((state) => state.sentAt);
  const markSent = useEmailVerificationPromptStore((state) => state.markSent);
  const [cooldown, setCooldown] = useState(() => secondsLeft(sentAt));

  useEffect(() => {
    setCooldown(secondsLeft(sentAt));
    if (secondsLeft(sentAt) === 0) return;
    const timer = window.setInterval(() => {
      const left = secondsLeft(sentAt);
      setCooldown(left);
      if (left === 0) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sentAt]);

  const send = useCallback(async () => {
    await sendEmailVerificationUseCase(i18n.language);
    markSent(Date.now());
  }, [i18n.language, markSent]);

  const refresh = useCallback(async () => {
    const verified = await refreshEmailVerifiedUseCase();
    if (verified) setEmailVerified(true);
    return verified;
  }, [setEmailVerified]);

  return {
    email: user?.email ?? '',
    verified: user?.emailVerified === true,
    cooldown,
    send,
    refresh,
  };
}

/** Ao voltar para o app (depois de abrir o link em outra aba ou no celular), relê a conta. */
export function useEmailVerificationSync(enabled: boolean, refresh: () => Promise<boolean>) {
  useEffect(() => {
    if (!enabled) return;
    const check = () => {
      if (document.visibilityState === 'visible') void refresh().catch(() => false);
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [enabled, refresh]);
}

=== src/domain/auth/index.ts — diff ===
@@ -7,3 +7,5 @@ export * from './components';
 export * from './schemas/authSchema';
 export * from './schemas/passwordSchema';
 export * from './utils/passwordRequirements';
+export { startEmailVerificationUseCase } from './application/usecases/startEmailVerificationUseCase';
+export { openEmailVerificationPromptUseCase } from './application/usecases/openEmailVerificationPromptUseCase';

=== src/domain/auth/stores/useAuthStore.ts — diff ===
@@ -12,6 +12,8 @@ export interface AuthStoreState {
   setProfile: (profile: UserProfile | null) => void;
   setPhotoURL: (photoURL: string | null) => void;
   setLoading: (loading: boolean) => void;
+  /** O Firebase não avisa quando o e-mail é confirmado; quem relê a conta atualiza aqui. */
+  setEmailVerified: (emailVerified: boolean) => void;
   setSession: (session: UserSession | null, profile?: UserProfile | null) => void;
   clearAuth: () => void;
 }
@@ -47,6 +49,8 @@ export const useAuthStore = create<AuthStoreState>((set) => ({
       profile: state.profile ? { ...state.profile, photoURL } : null,
     })),
   setLoading: (loading) => set({ loading }),
+  setEmailVerified: (emailVerified) =>
+    set((state) => ({ user: state.user ? { ...state.user, emailVerified } : null })),
   setSession: (session, profile = null) =>
     set((state) => {
       if (!session) {

=== src/domain/auth/stores/useEmailVerificationPromptStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { create } from 'zustand';

export type EmailVerificationPromptReason = 'signup' | 'required';

interface EmailVerificationPromptState {
  reason: EmailVerificationPromptReason | null;
  /** Último envio do link, para a espera entre envios valer mesmo com o aviso fechado. */
  sentAt: number | null;
  open: (reason: EmailVerificationPromptReason) => void;
  close: () => void;
  markSent: (at: number) => void;
}

/** Aviso "Confirme seu e-mail" aberto depois do cadastro ou quando uma ação exige (D22). */
export const useEmailVerificationPromptStore = create<EmailVerificationPromptState>((set) => ({
  reason: null,
  sentAt: null,
  open: (reason) => set({ reason }),
  close: () => set({ reason: null }),
  markSent: (sentAt) => set({ sentAt }),
}));

=== src/domain/auth/types/authPort.ts — diff ===
@@ -11,6 +11,15 @@ export interface AuthPort {
 
   resetPassword(email: string): Promise<void>;
 
+  /** Envia o link de confirmação do e-mail da conta atual, no idioma informado (D22). */
+  sendEmailVerification(locale: string): Promise<void>;
+
+  /** Relê a conta no Firebase; se o e-mail já foi confirmado, renova o token para o backend saber. */
+  refreshEmailVerified(): Promise<boolean>;
+
+  /** Aplica o código do link de confirmação (página de ação da conta). */
+  applyEmailVerificationCode(code: string): Promise<void>;
+
   verifyResetCode(code: string): Promise<string>;
 
   confirmReset(code: string, newPass: string): Promise<void>;

=== src/domain/bookings/hooks/useBookingCheckout.ts — diff ===
@@ -1,6 +1,7 @@
 import { useCallback, useEffect, useRef, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { DEFAULT_LOCALE, normalizeLocale } from '../../../shared/i18n';
+import { openEmailVerificationPromptUseCase } from '../../auth';
 import { createBookingUseCase } from '../application/usecases/createBookingUseCase';
 import { getBookingUseCase } from '../application/usecases/getBookingUseCase';
 import type { CreateBookingPayload, CreateBookingResponse } from '../types/bookings';
@@ -47,6 +48,9 @@ export function useBookingCheckout() {
         setCheckout(response);
         setStatus(response.status === 'confirmed' ? 'confirmed' : 'ready');
       } catch (err: unknown) {
+        if (err instanceof Error && err.message === 'EMAIL_NOT_VERIFIED') {
+          openEmailVerificationPromptUseCase();
+        }
         setError(getBookingErrorMessage(err));
         setStatus('failed');
       }

=== src/domain/partners/adapters/apiPartnerAdapter.ts — diff ===
@@ -18,6 +18,7 @@ export class ApiPartnerAdapter implements PartnerPort {
 
     if (!res.ok) {
       const errorData = await res.json().catch(() => ({}));
+      if (errorData?.error?.code === 'EMAIL_NOT_VERIFIED') throw new Error('EMAIL_NOT_VERIFIED');
       throw new Error(errorData.error || 'Erro ao realizar upgrade para parceiro no backend');
     }
   }

=== src/domain/partners/hooks/usePartnerRegistrationSubmission.ts — diff ===
@@ -1,6 +1,12 @@
 import { useCallback, useState } from 'react';
 import type { Path, UseFormReturn } from 'react-hook-form';
-import { registerWithEmailUseCase, type UserSession } from '../../auth';
+import { i18n } from '../../../shared/i18n';
+import {
+  openEmailVerificationPromptUseCase,
+  registerWithEmailUseCase,
+  startEmailVerificationUseCase,
+  type UserSession,
+} from '../../auth';
 import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
 import { createOrUpdatePartnerProfileUseCase } from '../application/usecases/createOrUpdatePartnerProfileUseCase';
 import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
@@ -73,6 +79,10 @@ export function usePartnerRegistrationSubmission({
           throw new Error('E-mail e senha são obrigatórios para cadastro.');
         }
         await registerWithEmailUseCase(values.email, values.password);
+        // Parceiro precisa de e-mail confirmado (AGENTS.md §7.10): o cadastro para aqui e continua
+        // quando a pessoa confirmar e enviar de novo, já logada (D22).
+        await startEmailVerificationUseCase(i18n.language);
+        throw new Error('EMAIL_NOT_VERIFIED');
       }
 
       const registrationPayload = mapPartnerRegistrationPayload(values);
@@ -90,6 +100,12 @@ export function usePartnerRegistrationSubmission({
       if (setCurrentStep) setCurrentStep(5);
 
       let errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
+      if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
+        if (currentUser) openEmailVerificationPromptUseCase();
+        setSubmitError(i18n.t('emailVerification.partnerRequired'));
+        setIsSubmitting(false);
+        return;
+      }
       if (
         isFirebaseAuthError(error, 'auth/email-already-in-use') ||
         (error instanceof Error && error.message.includes('auth/email-already-in-use'))

=== src/domain/ticketing/adapters/httpTicketingAdapter.ts — diff ===
@@ -130,6 +130,7 @@ export class HttpTicketingAdapter implements TicketingPort {
     );
     const body = await res.json().catch(() => ({}));
     if (!res.ok) {
+      if (body?.error?.code === 'EMAIL_NOT_VERIFIED') throw new Error('EMAIL_NOT_VERIFIED');
       throw new Error(body?.error || body?.message || 'Não foi possível reservar os ingressos.');
     }
     const payload = (body?.data ?? body) as CreateOrderResult;

=== src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx — diff ===
@@ -6,6 +6,7 @@ import { Dialog } from '../../../../ui/components/Dialog';
 import { StatusText } from '../../../../ui/components/StatusText';
 import { TextButton } from '../../../../ui/components/TextButton';
 import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
+import { openEmailVerificationPromptUseCase } from '../../../auth';
 import { acceptTransferLinkUseCase } from '../../application/usecases/acceptTransferLinkUseCase';
 import { previewTransferLinkUseCase } from '../../application/usecases/previewTransferLinkUseCase';
 import type { TicketTransferLinkPreview } from '../../types/ticketing';
@@ -62,7 +63,9 @@ export function TransferLinkReceiverDialog({
       await acceptTransferLinkUseCase(link.linkId, link.token);
       setAccepted(true);
     } catch (err: unknown) {
-      setErrorKey(errorCode(err));
+      const code = errorCode(err);
+      if (code === 'RECIPIENT_NOT_VERIFIED') openEmailVerificationPromptUseCase();
+      setErrorKey(code);
     } finally {
       setBusy(false);
     }

=== src/domain/ticketing/hooks/useTicketCheckout.ts — diff ===
@@ -2,7 +2,7 @@ import QRCode from 'qrcode';
 import { useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { BUYER_TERMS_VERSION } from '../../../shared/constants/legalTerms';
-import { useAuthContext } from '../../auth';
+import { openEmailVerificationPromptUseCase, useAuthContext } from '../../auth';
 import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
 import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
 import { createTicketOrderUseCase } from '../application/usecases/createTicketOrderUseCase';
@@ -157,6 +157,12 @@ export function useTicketCheckout({
       return setError(t('ticketCheckout.errors.buyerRequired'));
     }
     if (!termsAccepted) return setError(t('legal.accept.required'));
+    // O servidor também recusa (AGENTS.md §7.10); aqui só evita a viagem e abre o aviso (D22).
+    if (!user.emailVerified) {
+      setError(t('ticketCheckout.errors.emailNotVerified'));
+      openEmailVerificationPromptUseCase();
+      return;
+    }
 
     setSubmitting(true);
     setError(null);
@@ -202,7 +208,12 @@ export function useTicketCheckout({
         setPaymentIntentId(intent.paymentIntentId);
       }
     } catch (err) {
-      setError(err instanceof Error ? err.message : t('ticketCheckout.errors.createFailed'));
+      if (err instanceof Error && err.message === 'EMAIL_NOT_VERIFIED') {
+        setError(t('ticketCheckout.errors.emailNotVerified'));
+        openEmailVerificationPromptUseCase();
+      } else {
+        setError(err instanceof Error ? err.message : t('ticketCheckout.errors.createFailed'));
+      }
     } finally {
       setSubmitting(false);
     }

=== src/shared/constants/accountActionPath.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Página que recebe os links dos e-mails da conta (confirmação e nova senha). É o "URL de ação" dos
 * modelos do Firebase Auth: https://useguide.com.br/conta/acao (D22).
 */
export const ACCOUNT_ACTION_PATH = '/conta/acao';

=== src/shared/constants/siteUrl.ts — ARQUIVO NOVO, conteúdo completo ===
/** Endereço oficial do site: links enviados por e-mail e URLs canônicas apontam para ele. */
export const SITE_URL = 'https://useguide.com.br';

=== src/shared/i18n/emailVerificationResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da confirmação de e-mail e da página de ação da conta (D22). pt-BR é a fonte. */
export interface EmailVerificationTranslation {
  title: string;
  sentAfterSignup: string;
  required: string;
  spamHint: string;
  checked: string;
  resend: string;
  resendIn: string;
  sent: string;
  notYet: string;
  verified: string;
  later: string;
  close: string;
  partnerRequired: string;
  errors: {
    TOO_MANY_REQUESTS: string;
    failed: string;
  };
  action: {
    verifying: string;
    verifiedTitle: string;
    verifiedText: string;
    goToApp: string;
    invalidTitle: string;
    invalidText: string;
  };
}

export const emailVerificationPtBR: EmailVerificationTranslation = {
  title: 'Confirme seu e-mail',
  sentAfterSignup:
    'Enviamos um link para {{email}}. Abra o e-mail e toque no link para confirmar sua conta.',
  required:
    'Para continuar, confirme seu e-mail. Enviamos o link para {{email}} quando você criou a conta.',
  spamHint: 'Não chegou? Veja a caixa de spam ou peça outro link.',
  checked: 'Já confirmei',
  resend: 'Enviar outro link',
  resendIn: 'Enviar outro link em {{seconds}} s',
  sent: 'Link enviado para {{email}}.',
  notYet: 'Ainda não aparece confirmado. Toque no link do e-mail e tente de novo.',
  verified: 'E-mail confirmado.',
  later: 'Agora não',
  close: 'Fechar',
  partnerRequired:
    'Confirme seu e-mail para concluir o cadastro do seu negócio. Depois, toque em enviar de novo.',
  errors: {
    TOO_MANY_REQUESTS: 'Muitos envios seguidos. Espere alguns minutos e tente de novo.',
    failed: 'Não foi possível enviar o link. Tente de novo.',
  },
  action: {
    verifying: 'Confirmando seu e-mail…',
    verifiedTitle: 'E-mail confirmado',
    verifiedText: 'Pronto. Sua conta no Use Guide está confirmada.',
    goToApp: 'Ir para o Use Guide',
    invalidTitle: 'Link inválido',
    invalidText: 'Este link venceu ou já foi usado. No app, peça um novo link.',
  },
};

export const emailVerificationEn: EmailVerificationTranslation = {
  title: 'Confirm your email',
  sentAfterSignup:
    'We sent a link to {{email}}. Open the email and tap the link to confirm your account.',
  required:
    'To continue, confirm your email. We sent the link to {{email}} when you created your account.',
  spamHint: 'Didn’t get it? Check your spam folder or ask for another link.',
  checked: 'I’ve confirmed it',
  resend: 'Send another link',
  resendIn: 'Send another link in {{seconds}} s',
  sent: 'Link sent to {{email}}.',
  notYet: 'It doesn’t show as confirmed yet. Tap the link in the email and try again.',
  verified: 'Email confirmed.',
  later: 'Not now',
  close: 'Close',
  partnerRequired: 'Confirm your email to finish registering your business. Then tap send again.',
  errors: {
    TOO_MANY_REQUESTS: 'Too many requests in a row. Wait a few minutes and try again.',
    failed: 'We couldn’t send the link. Try again.',
  },
  action: {
    verifying: 'Confirming your email…',
    verifiedTitle: 'Email confirmed',
    verifiedText: 'All set. Your Use Guide account is confirmed.',
    goToApp: 'Go to Use Guide',
    invalidTitle: 'Invalid link',
    invalidText: 'This link has expired or was already used. Ask for a new one in the app.',
  },
};

export const emailVerificationFr: EmailVerificationTranslation = {
  title: 'Confirmez votre e-mail',
  sentAfterSignup:
    'Nous avons envoyé un lien à {{email}}. Ouvrez l’e-mail et touchez le lien pour confirmer votre compte.',
  required:
    'Pour continuer, confirmez votre e-mail. Nous avons envoyé le lien à {{email}} lors de la création du compte.',
  spamHint: 'Rien reçu ? Vérifiez les spams ou demandez un autre lien.',
  checked: 'C’est confirmé',
  resend: 'Envoyer un autre lien',
  resendIn: 'Envoyer un autre lien dans {{seconds}} s',
  sent: 'Lien envoyé à {{email}}.',
  notYet: 'Pas encore confirmé. Touchez le lien de l’e-mail et réessayez.',
  verified: 'E-mail confirmé.',
  later: 'Plus tard',
  close: 'Fermer',
  partnerRequired:
    'Confirmez votre e-mail pour terminer l’inscription de votre établissement. Puis touchez à nouveau envoyer.',
  errors: {
    TOO_MANY_REQUESTS: 'Trop d’envois d’affilée. Attendez quelques minutes et réessayez.',
    failed: 'Impossible d’envoyer le lien. Réessayez.',
  },
  action: {
    verifying: 'Confirmation de votre e-mail…',
    verifiedTitle: 'E-mail confirmé',
    verifiedText: 'C’est fait. Votre compte Use Guide est confirmé.',
    goToApp: 'Aller sur Use Guide',
    invalidTitle: 'Lien invalide',
    invalidText: 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau dans l’app.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -116,6 +116,12 @@ import {
   usernameFr,
   usernamePtBR,
 } from './usernameResources';
+import {
+  type EmailVerificationTranslation,
+  emailVerificationEn,
+  emailVerificationFr,
+  emailVerificationPtBR,
+} from './emailVerificationResources';
 import {
   type EventSessionsTranslation,
   eventSessionsEn,
@@ -157,6 +163,7 @@ export interface TranslationResource {
   ticketWallet: TicketWalletTranslation;
   ticketGate: TicketGateTranslation;
   username: UsernameTranslation;
+  emailVerification: EmailVerificationTranslation;
   eventSessions: EventSessionsTranslation;
   gateMode: GateModeTranslation;
   legal: LegalTranslation;
@@ -392,6 +399,7 @@ const ptBR: TranslationResource = {
   ticketWallet: ticketWalletPtBR,
   ticketGate: ticketGatePtBR,
   username: usernamePtBR,
+  emailVerification: emailVerificationPtBR,
   eventSessions: eventSessionsPtBR,
   gateMode: gateModePtBR,
   legal: legalPtBR,
@@ -687,6 +695,7 @@ const en: TranslationResource = {
   ticketWallet: ticketWalletEn,
   ticketGate: ticketGateEn,
   username: usernameEn,
+  emailVerification: emailVerificationEn,
   eventSessions: eventSessionsEn,
   gateMode: gateModeEn,
   legal: legalEn,
@@ -976,6 +985,7 @@ const fr: TranslationResource = {
   ticketWallet: ticketWalletFr,
   ticketGate: ticketGateFr,
   username: usernameFr,
+  emailVerification: emailVerificationFr,
   eventSessions: eventSessionsFr,
   gateMode: gateModeFr,
   legal: legalFr,

=== src/shared/i18n/ticketCheckoutResources.ts — diff ===
@@ -29,6 +29,7 @@ export interface TicketCheckoutTranslation {
   errors: {
     expired: string;
     loginRequired: string;
+    emailNotVerified: string;
     selectSession: string;
     selectTicket: string;
     buyerRequired: string;
@@ -99,6 +100,7 @@ export const ticketCheckoutPtBR: TicketCheckoutTranslation = {
   errors: {
     expired: 'Sua reserva expirou. Selecione os ingressos novamente.',
     loginRequired: 'Entre na sua conta Use Guide para reservar ou comprar ingressos.',
+    emailNotVerified: 'Confirme seu e-mail para comprar ingressos.',
     selectSession: 'Selecione uma sessão do evento.',
     selectTicket: 'Selecione ao menos 1 ingresso.',
     buyerRequired: 'Preencha o nome e o e-mail do comprador.',
@@ -169,6 +171,7 @@ export const ticketCheckoutEn: TicketCheckoutTranslation = {
   errors: {
     expired: 'Your reservation expired. Select the tickets again.',
     loginRequired: 'Sign in to your Use Guide account to reserve or buy tickets.',
+    emailNotVerified: 'Confirm your email to buy tickets.',
     selectSession: 'Select an event session.',
     selectTicket: 'Select at least 1 ticket.',
     buyerRequired: 'Fill in the buyer name and email.',
@@ -239,6 +242,7 @@ export const ticketCheckoutFr: TicketCheckoutTranslation = {
   errors: {
     expired: 'Votre réservation a expiré. Sélectionnez à nouveau les billets.',
     loginRequired: 'Connectez-vous à votre compte Use Guide pour réserver ou acheter des billets.',
+    emailNotVerified: 'Confirmez votre e-mail pour acheter des billets.',
     selectSession: 'Sélectionnez une séance de l’événement.',
     selectTicket: 'Sélectionnez au moins 1 billet.',
     buyerRequired: 'Renseignez le nom et l’e-mail de l’acheteur.',

=== src/shared/utils/seo.ts — diff ===
@@ -1,3 +1,5 @@
+import { ACCOUNT_ACTION_PATH } from '../constants/accountActionPath';
+import { SITE_URL } from '../constants/siteUrl';
 import { DEFAULT_LOCALE, i18n, type Locale, localizedPath, parseLocalizedPath } from '../i18n';
 
 export interface SEOMetadata {
@@ -27,7 +29,7 @@ interface DefaultSEOMetadata {
   author: string;
 }
 
-const BASE_URL = 'https://useguide.com.br';
+const BASE_URL = SITE_URL;
 const DEFAULT_IMAGE =
   'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0788355965.firebasestorage.app/o/Marca%2F412E6CA0-01A8-48B1-B07B-BA4233C81769.png?alt=media&token=ff7e5442-a701-4854-aefc-1e36bb5fbd34';
 
@@ -62,9 +64,9 @@ const NON_LOCALIZED_ROUTE_SEO: Record<string, SEOMetadata> = {
     description: 'Área de gestão e moderação de conteúdo do Use Guide.',
     robots: 'noindex, nofollow',
   },
-  '/reset-password': {
-    title: 'Recuperar Senha',
-    description: 'Redefinição de senha de acesso ao Use Guide.',
+  [ACCOUNT_ACTION_PATH]: {
+    title: 'Conta Use Guide',
+    description: 'Confirmação de e-mail e nova senha da conta Use Guide.',
     robots: 'noindex, nofollow',
   },
 };

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/registerPartnerApplicationUseCase.test.ts server/application/usecases/registerPartnerApplicationUseCase.ts server/domain/partners/controllers/partnerController.ts server/domain/partners/errors/partnerDomainError.ts server/domain/seo/utils/routeSeo.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/errors/ticketingDomainError.ts server/domain/ticketing/services/ticketingAccess.ts server/domain/ticketing/usecases/createTicketOrderUseCase.test.ts server/domain/ticketing/usecases/createTicketOrderUseCase.ts server/interfaces/http/ticketTransfers/ticketTransferController.ts src/app/App.tsx src/app/AppRouter.tsx src/app/EmailVerificationGate.tsx src/app/routes/AppRoutes.tsx src/domain/auth/adapters/firebaseAuthAdapter.test.ts src/domain/auth/adapters/firebaseAuthAdapter.ts src/domain/auth/application/usecases/applyEmailVerificationCodeUseCase.ts src/domain/auth/application/usecases/authUseCases.test.ts src/domain/auth/application/usecases/index.ts src/domain/auth/application/usecases/openEmailVerificationPromptUseCase.ts src/domain/auth/application/usecases/refreshEmailVerifiedUseCase.ts src/domain/auth/application/usecases/sendEmailVerificationUseCase.ts src/domain/auth/application/usecases/startEmailVerificationUseCase.ts src/domain/auth/components/AccountActionPage.test.tsx src/domain/auth/components/AccountActionPage.tsx src/domain/auth/components/EmailVerificationPrompt.test.tsx src/domain/auth/components/EmailVerificationPrompt.tsx src/domain/auth/components/index.ts src/domain/auth/factory.ts src/domain/auth/hooks/useAuth.ts src/domain/auth/hooks/useEmailVerification.ts src/domain/auth/index.ts src/domain/auth/stores/useAuthStore.ts src/domain/auth/stores/useEmailVerificationPromptStore.ts src/domain/auth/types/authPort.ts src/domain/bookings/hooks/useBookingCheckout.ts src/domain/partners/adapters/apiPartnerAdapter.ts src/domain/partners/hooks/usePartnerRegistrationSubmission.ts src/domain/ticketing/adapters/httpTicketingAdapter.ts src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx src/domain/ticketing/hooks/useTicketCheckout.ts src/shared/constants/accountActionPath.ts src/shared/constants/siteUrl.ts src/shared/i18n/emailVerificationResources.ts src/shared/i18n/resources.ts src/shared/i18n/ticketCheckoutResources.ts src/shared/utils/seo.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Firebase console › Authentication › Modelos › Verificação de endereço de e-mail: ajuste nome do remetente, assunto e texto; idioma do modelo: português (Brasil).
2. No mesmo modelo, "Personalizar URL de ação": `https://useguide.com.br/conta/acao` (vale para todos os modelos, inclusive redefinição de senha).
3. Em Modelos, "Personalizar domínio": `useguide.com.br`. Crie no provedor do domínio os registros DNS mostrados e espere a verificação para o remetente virar `noreply@useguide.com.br`.
4. Configurações do projeto › Geral › Nome público: `Use Guide`.
5. Authentication › Configurações › Domínios autorizados: confirme `useguide.com.br`.
6. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código.
