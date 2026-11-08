# Prompt 18.2.4 — Idioma do navegador na primeira visita (D10)

> Lote 12, gerado do commit de referência `93c6c9b` da branch `claude/agents-md-v2`. Aplique depois do 18.2.3. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.2.4 — Idioma do navegador na primeira visita (D10)

Decisão D10 (2026-10-19, opção B).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13).

CONTEXTO: hoje quem tem o navegador em inglês e abre a home recebe português, porque o português fica na raiz / e a URL tem prioridade. Além disso, o app grava o idioma da URL como preferência, então a pessoa fica presa em português.

DECISÃO D10 (opção B), já no AGENTS.md §12.1 e §12.7 pelo prompt A3:
- prioridade do idioma: URL com prefixo (/en, /fr) → escolha salva (conta ou navegador) → idioma do navegador → pt-BR;
- a home / redireciona para /en ou /fr quando a preferência não é português, sem criar entrada no histórico; robôs de busca nunca;
- página em português aberta por link mostra um aviso para trocar; os dois botões gravam a escolha;
- o idioma só é gravado quando a pessoa escolhe.

O QUE MUDA:
1) src/shared/i18n:
   - locale.ts: resolveInitialLocale vira resolvePreferredLocale (escolha salva → navegador → pt-BR); readSavedLocale é exportada;
   - initialLocale.ts (novo): isCrawler, resolveHomeRedirect, resolveInitialLocale(pathname, search, userAgent) e suggestedLocaleFor;
   - localeChoice.ts (novo): saveLocaleChoice e onLocaleChoice, a única forma de gravar o idioma;
   - config.ts: o idioma inicial vem de resolveInitialLocale, e o evento languageChanged só atualiza o <html lang>;
   - resources.ts: chaves localeSuggestion nos três idiomas.
2) src/main.tsx: antes do primeiro render, aplica resolveHomeRedirect com history.replaceState.
3) useLocalizedRouting.switchLocale grava a escolha (é usado pela tela de idioma das Configurações).
4) src/app/locale/ (novo):
   - LocalePreference, montado no App.tsx ao lado do AppRouter;
   - LocaleSuggestionBanner, com o texto no idioma sugerido;
   - useAccountLocaleSync: a escolha da conta vale neste aparelho; escolha feita antes do login sobe para a conta que ainda não tem.
   Z_INDEX ganha banner: 120.
5) Domínio users (servidor): PUT /api/users/me/preferences { preferredLocale } (schema strict, 204); preferredLocale no DTO privado do perfil.
   Domínio user (cliente): updatePreferredLocaleUseCase, adapter e tipo.
6) Avisos do lint corrigidos nos arquivos tocados (any → unknown, switch case sem efeito).

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/domain/users/adapters/firestoreUserAdapter.test.ts (alterar)
- server/domain/users/adapters/firestoreUserAdapter.ts (alterar)
- server/domain/users/controllers/userController.test.ts (alterar)
- server/domain/users/controllers/userController.ts (alterar)
- server/domain/users/dtos/userDto.test.ts (criar)
- server/domain/users/dtos/userDto.ts (alterar)
- server/domain/users/ports/userPort.ts (alterar)
- server/domain/users/routes/userRoutes.ts (alterar)
- server/domain/users/schemas/userSchema.ts (alterar)
- server/domain/users/services/userService.test.ts (alterar)
- server/domain/users/services/userService.ts (alterar)
- src/app/App.tsx (alterar)
- src/app/locale/LocalePreference.test.tsx (criar)
- src/app/locale/LocalePreference.tsx (criar)
- src/app/locale/LocaleSuggestionBanner.tsx (criar)
- src/app/locale/useAccountLocaleSync.ts (criar)
- src/domain/user/adapters/apiUserAdapter.ts (alterar)
- src/domain/user/application/usecases/updatePreferredLocaleUseCase.test.ts (criar)
- src/domain/user/application/usecases/updatePreferredLocaleUseCase.ts (criar)
- src/domain/user/index.ts (alterar)
- src/domain/user/ports/userPort.ts (alterar)
- src/domain/user/schemas/userSchema.ts (alterar)
- src/domain/user/types/user.ts (alterar)
- src/main.tsx (alterar)
- src/shared/constants/zIndex.ts (alterar)
- src/shared/hooks/useLocalizedRouting.ts (alterar)
- src/shared/i18n/config.test.ts (alterar)
- src/shared/i18n/config.ts (alterar)
- src/shared/i18n/index.ts (alterar)
- src/shared/i18n/initialLocale.test.ts (criar)
- src/shared/i18n/initialLocale.ts (criar)
- src/shared/i18n/locale.test.ts (alterar)
- src/shared/i18n/locale.ts (alterar)
- src/shared/i18n/localeChoice.ts (criar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/domain/users/adapters/firestoreUserAdapter.test.ts — diff ===
@@ -22,7 +22,7 @@ vi.mock('../../../infrastructure/firebase/adminClient', () => ({
   },
   adminAuth: {
     deleteUser: (uid: string) => mockDeleteUser(uid),
-    updateUser: (uid: string, data: any) => mockUpdateUser(uid, data),
+    updateUser: (uid: string, data: unknown) => mockUpdateUser(uid, data),
   },
   adminStorage: {
     bucket: () => ({
@@ -97,6 +97,7 @@ describe('FirestoreUserAdapter', () => {
         phone: '11999999999',
         photoURL: '',
         role: 'user',
+        preferredLocale: null,
         createdAt: '',
         updatedAt: '',
       });
@@ -149,8 +150,9 @@ describe('FirestoreUserAdapter', () => {
     it('deve ser idempotente quando o usuário já foi excluído do Firebase Auth', async () => {
       mockFileDelete.mockResolvedValueOnce(undefined);
       mockDocDelete.mockResolvedValue(undefined);
-      const notFoundError: any = new Error('User not found');
-      notFoundError.code = 'auth/user-not-found';
+      const notFoundError = Object.assign(new Error('User not found'), {
+        code: 'auth/user-not-found',
+      });
       mockDeleteUser.mockRejectedValueOnce(notFoundError);
 
       await expect(adapter.deleteUserAccount('uid-already-deleted')).resolves.not.toThrow();
@@ -159,8 +161,9 @@ describe('FirestoreUserAdapter', () => {
     it('deve propagar outros erros do Firebase Auth', async () => {
       mockFileDelete.mockResolvedValueOnce(undefined);
       mockDocDelete.mockResolvedValue(undefined);
-      const networkError: any = new Error('Network timeout');
-      networkError.code = 'auth/internal-error';
+      const networkError = Object.assign(new Error('Network timeout'), {
+        code: 'auth/internal-error',
+      });
       mockDeleteUser.mockRejectedValueOnce(networkError);
 
       await expect(adapter.deleteUserAccount('uid-123')).rejects.toThrow('Network timeout');
@@ -177,7 +180,9 @@ describe('FirestoreUserAdapter', () => {
   });
 
   describe('uploadUserPhoto — gravação e propagação de erros', () => {
-    const webpImage = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
+    const webpImage = Buffer.from([
+      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
+    ]);
 
     it('grava a imagem já processada com o contentType recebido e atualiza Auth e Firestore', async () => {
       mockFileSave.mockResolvedValueOnce(undefined);
@@ -186,7 +191,9 @@ describe('FirestoreUserAdapter', () => {
 
       const url = await adapter.uploadUserPhoto('user-1', webpImage, 'image/webp');
 
-      expect(url).toMatch(/^https:\/\/storage\.googleapis\.com\/test-bucket\/profiles\/user-1\?v=\d+$/);
+      expect(url).toMatch(
+        /^https:\/\/storage\.googleapis\.com\/test-bucket\/profiles\/user-1\?v=\d+$/
+      );
       expect(mockFileSave).toHaveBeenCalledWith(
         webpImage,
         expect.objectContaining({

=== server/domain/users/adapters/firestoreUserAdapter.ts — diff ===
@@ -1,6 +1,6 @@
 import { UserPort } from '../ports/userPort';
 import { UserProfileDto, toUserProfileDto } from '../dtos/userDto';
-import { UpdateUserProfileInput } from '../schemas/userSchema';
+import { UpdateUserPreferencesInput, UpdateUserProfileInput } from '../schemas/userSchema';
 import { adminDb, adminAuth, adminStorage } from '../../../infrastructure/firebase/adminClient';
 import { FieldValue } from 'firebase-admin/firestore';
 
@@ -59,6 +59,16 @@ export class FirestoreUserAdapter implements UserPort {
     return toUserProfileDto(updatedSnap.data(), uid);
   }
 
+  async updateUserPreferences(uid: string, data: UpdateUserPreferencesInput): Promise<void> {
+    await adminDb
+      .collection('users')
+      .doc(uid)
+      .set(
+        { preferredLocale: data.preferredLocale, updatedAt: new Date().toISOString() },
+        { merge: true }
+      );
+  }
+
   async uploadUserPhoto(uid: string, image: Buffer, contentType: string): Promise<string> {
     const bucket = adminStorage.bucket();
     const file = bucket.file(`profiles/${uid}`);
@@ -108,8 +118,9 @@ export class FirestoreUserAdapter implements UserPort {
 
     try {
       await adminAuth.deleteUser(uid);
-    } catch (error: any) {
-      if (error?.code !== 'auth/user-not-found') {
+    } catch (error) {
+      // Exclusão idempotente: a conta pode já ter saído do Firebase Auth numa tentativa anterior.
+      if ((error as { code?: unknown } | null)?.code !== 'auth/user-not-found') {
         throw error;
       }
     }

=== server/domain/users/controllers/userController.test.ts — diff ===
@@ -2,6 +2,7 @@ import { describe, it, expect, vi, beforeEach } from 'vitest';
 import { UserController } from './userController';
 import { userService } from '../factory';
 import { Response } from 'express';
+import type { UserProfileDto } from '../dtos/userDto';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
 import { deleteUserAccountApplicationUseCase } from '../../../application/usecases/deleteUserAccountApplicationUseCase';
 
@@ -13,24 +14,22 @@ vi.mock('../factory', () => ({
   userService: {
     getProfile: vi.fn(),
     updateProfile: vi.fn(),
+    updatePreferences: vi.fn(),
     uploadPhoto: vi.fn(),
     deleteAccount: vi.fn(),
   },
 }));
 
 describe('UserController', () => {
-  let mockRes: Partial<Response>;
-  let statusMock: any;
-  let jsonMock: any;
+  let mockRes: Response;
+  let statusMock: ReturnType<typeof vi.fn>;
+  let jsonMock: ReturnType<typeof vi.fn>;
 
   beforeEach(() => {
     vi.clearAllMocks();
     jsonMock = vi.fn();
     statusMock = vi.fn().mockReturnValue({ json: jsonMock });
-    mockRes = {
-      status: statusMock,
-      json: jsonMock,
-    };
+    mockRes = { status: statusMock, json: jsonMock } as unknown as Response;
   });
 
   describe('getProfile', () => {
@@ -45,7 +44,7 @@ describe('UserController', () => {
     it('deve retornar 200 com os dados do perfil quando autenticado', async () => {
       const req = { user: { uid: 'user-1' } } as unknown as AuthenticatedRequest;
       const profile = { uid: 'user-1', firstName: 'Ana', email: 'ana@test.com' };
-      vi.mocked(userService.getProfile).mockResolvedValueOnce(profile as any);
+      vi.mocked(userService.getProfile).mockResolvedValueOnce(profile as unknown as UserProfileDto);
 
       await UserController.getProfile(req, mockRes as Response);
 
@@ -109,7 +108,9 @@ describe('UserController', () => {
         email: 'carlos@test.com',
         role: 'user',
       };
-      vi.mocked(userService.updateProfile).mockResolvedValueOnce(updated as any);
+      vi.mocked(userService.updateProfile).mockResolvedValueOnce(
+        updated as unknown as UserProfileDto
+      );
 
       await UserController.updateProfile(req, mockRes as Response);
 
@@ -228,4 +229,44 @@ describe('UserController', () => {
       expect(jsonMock).toHaveBeenCalledWith({ error: 'Não foi possível excluir a conta.' });
     });
   });
+
+  describe('updatePreferences', () => {
+    function preferencesResponse() {
+      const res = { status: vi.fn(), json: vi.fn(), end: vi.fn() };
+      res.status.mockReturnValue(res);
+      return res;
+    }
+
+    it('grava o idioma e responde 204', async () => {
+      const res = preferencesResponse();
+      const req = {
+        user: { uid: 'user-1' },
+        body: { preferredLocale: 'en' },
+      } as unknown as AuthenticatedRequest;
+      await UserController.updatePreferences(req, res as unknown as Response);
+      expect(userService.updatePreferences).toHaveBeenCalledWith('user-1', {
+        preferredLocale: 'en',
+      });
+      expect(res.status).toHaveBeenCalledWith(204);
+      expect(res.end).toHaveBeenCalled();
+    });
+
+    it('idioma não suportado ou campo extra responde 400 VALIDATION_ERROR', async () => {
+      for (const body of [{ preferredLocale: 'es' }, { preferredLocale: 'en', role: 'admin' }]) {
+        const res = preferencesResponse();
+        const req = { user: { uid: 'user-1' }, body } as unknown as AuthenticatedRequest;
+        await UserController.updatePreferences(req, res as unknown as Response);
+        expect(res.status).toHaveBeenCalledWith(400);
+        expect(res.json.mock.calls[0]?.[0].error.code).toBe('VALIDATION_ERROR');
+      }
+      expect(userService.updatePreferences).not.toHaveBeenCalled();
+    });
+
+    it('sem login responde 401', async () => {
+      const res = preferencesResponse();
+      const req = { body: { preferredLocale: 'en' } } as unknown as AuthenticatedRequest;
+      await UserController.updatePreferences(req, res as unknown as Response);
+      expect(res.status).toHaveBeenCalledWith(401);
+    });
+  });
 });

=== server/domain/users/controllers/userController.ts — diff ===
@@ -2,7 +2,11 @@ import { Response } from 'express';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
 import { userService } from '../factory';
 import { MediaDomainError } from '../../media';
-import { updateUserProfileSchema, uploadUserPhotoSchema } from '../schemas/userSchema';
+import {
+  updateUserPreferencesSchema,
+  updateUserProfileSchema,
+  uploadUserPhotoSchema,
+} from '../schemas/userSchema';
 import { deleteUserAccountApplicationUseCase } from '../../../application/usecases/deleteUserAccountApplicationUseCase';
 
 export class UserController {
@@ -15,7 +19,7 @@ export class UserController {
 
       const profile = await userService.getProfile(uid);
       return res.status(200).json(profile || {});
-    } catch (error: any) {
+    } catch (error) {
       console.error('[UserController.getProfile Error]:', error);
       return res.status(500).json({ error: 'Não foi possível obter os dados do perfil.' });
     }
@@ -38,12 +42,38 @@ export class UserController {
 
       const updatedProfile = await userService.updateProfile(uid, parseResult.data);
       return res.status(200).json(updatedProfile);
-    } catch (error: any) {
+    } catch (error) {
       console.error('[UserController.updateProfile Error]:', error);
       return res.status(500).json({ error: 'Não foi possível atualizar o perfil.' });
     }
   }
 
+  static async updatePreferences(req: AuthenticatedRequest, res: Response) {
+    const uid = req.user?.uid;
+    if (!uid) {
+      return res
+        .status(401)
+        .json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login para salvar o idioma.' } });
+    }
+    const parseResult = updateUserPreferencesSchema.safeParse(req.body);
+    if (!parseResult.success) {
+      return res
+        .status(400)
+        .json({ error: { code: 'VALIDATION_ERROR', message: 'Idioma não suportado.' } });
+    }
+    try {
+      await userService.updatePreferences(uid, parseResult.data);
+      return res.status(204).end();
+    } catch (error) {
+      console.error('[UserController.updatePreferences Error]:', {
+        name: error instanceof Error ? error.name : 'UnknownError',
+      });
+      return res.status(500).json({
+        error: { code: 'INTERNAL_ERROR', message: 'Não foi possível salvar o idioma.' },
+      });
+    }
+  }
+
   static async uploadPhoto(req: AuthenticatedRequest, res: Response) {
     try {
       const uid = req.user?.uid;
@@ -61,7 +91,7 @@ export class UserController {
 
       const photoURL = await userService.uploadPhoto(uid, parseResult.data.photoBase64);
       return res.status(200).json({ photoURL });
-    } catch (error: any) {
+    } catch (error) {
       if (error instanceof MediaDomainError) {
         return res
           .status(error.statusCode)
@@ -83,7 +113,7 @@ export class UserController {
       return res
         .status(200)
         .json({ status: 'success', message: 'Conta e dados associados excluídos com sucesso' });
-    } catch (error: any) {
+    } catch (error) {
       console.error('[UserController.deleteAccount Error]:', error);
       return res.status(500).json({ error: 'Não foi possível excluir a conta.' });
     }

=== server/domain/users/dtos/userDto.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { toPrivateUserProfileDto } from './userDto';

describe('toPrivateUserProfileDto', () => {
  it('devolve o idioma salvo quando é suportado', () => {
    expect(toPrivateUserProfileDto({ preferredLocale: 'fr' }, 'u1').preferredLocale).toBe('fr');
  });

  it('devolve null quando a pessoa nunca escolheu ou o valor não é suportado', () => {
    expect(toPrivateUserProfileDto({}, 'u1').preferredLocale).toBeNull();
    expect(toPrivateUserProfileDto({ preferredLocale: 'es' }, 'u1').preferredLocale).toBeNull();
  });
});

=== server/domain/users/dtos/userDto.ts — diff ===
@@ -1,3 +1,4 @@
+import { type Locale, SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
 import { UserRole } from '../types/userTypes';
 
 export interface PrivateUserProfileDto {
@@ -8,6 +9,7 @@ export interface PrivateUserProfileDto {
   phone: string;
   photoURL?: string;
   role: UserRole;
+  preferredLocale: Locale | null;
   createdAt?: string;
   updatedAt?: string;
 }
@@ -33,6 +35,7 @@ export function toPrivateUserProfileDto(raw: unknown, uid: string): PrivateUserP
     phone: typeof data.phone === 'string' ? data.phone : '',
     photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
     role,
+    preferredLocale: SUPPORTED_LOCALES.find((locale) => locale === data.preferredLocale) ?? null,
     createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
     updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
   };

=== server/domain/users/ports/userPort.ts — diff ===
@@ -1,10 +1,11 @@
 import { UserProfileDto } from '../dtos/userDto';
-import { UpdateUserProfileInput } from '../schemas/userSchema';
+import { UpdateUserPreferencesInput, UpdateUserProfileInput } from '../schemas/userSchema';
 
 export interface UserPort {
   getUserProfile(uid: string): Promise<UserProfileDto | null>;
   getUserProfilesBatch(uids: string[]): Promise<Record<string, UserProfileDto>>;
   updateUserProfile(uid: string, data: UpdateUserProfileInput): Promise<UserProfileDto>;
+  updateUserPreferences(uid: string, data: UpdateUserPreferencesInput): Promise<void>;
   uploadUserPhoto(uid: string, image: Buffer, contentType: string): Promise<string>;
   upgradeRoleToPartner(uid: string): Promise<void>;
   deleteUserAccount(uid: string): Promise<void>;

=== server/domain/users/routes/userRoutes.ts — diff ===
@@ -9,6 +9,7 @@ const router = Router();
 
 router.get('/me', verifyAuthToken, UserController.getProfile);
 router.put('/me', verifyAuthToken, UserController.updateProfile);
+router.put('/me/preferences', verifyAuthToken, UserController.updatePreferences);
 router.post(
   '/me/photo',
   verifyAuthToken,

=== server/domain/users/schemas/userSchema.ts — diff ===
@@ -1,4 +1,5 @@
 import { z } from 'zod';
+import { SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
 
 export const loginUserSchema = z.object({
   email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
@@ -46,6 +47,13 @@ export const updateUserProfileSchema = z
   })
   .strict();
 
+/** Idioma escolhido pela pessoa; vale em todos os aparelhos e nos e-mails (decisão D10, AGENTS.md §12.5). */
+export const updateUserPreferencesSchema = z
+  .object({
+    preferredLocale: z.enum(SUPPORTED_LOCALES),
+  })
+  .strict();
+
 const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
 const MAX_PROFILE_PHOTO_BASE64_LENGTH = Math.ceil(MAX_PROFILE_PHOTO_BYTES / 3) * 4 + 256;
 
@@ -62,4 +70,5 @@ export type LoginUserInput = z.infer<typeof loginUserSchema>;
 export type RegisterUserInput = z.infer<typeof registerUserSchema>;
 export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
 export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
+export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
 export type UploadUserPhotoInput = z.infer<typeof uploadUserPhotoSchema>;

=== server/domain/users/services/userService.test.ts — diff ===
@@ -15,6 +15,7 @@ describe('UserService', () => {
       getUserProfile: vi.fn(),
       getUserProfilesBatch: vi.fn(),
       updateUserProfile: vi.fn(),
+      updateUserPreferences: vi.fn(),
       uploadUserPhoto: vi.fn(),
       upgradeRoleToPartner: vi.fn(),
       deleteUserAccount: vi.fn(),
@@ -33,6 +34,7 @@ describe('UserService', () => {
         lastName: 'Silva',
         phone: '11999999999',
         role: 'user' as UserRole,
+        preferredLocale: null,
       };
       vi.mocked(userPortMock.getUserProfile).mockResolvedValueOnce(mockProfile);
 
@@ -56,6 +58,7 @@ describe('UserService', () => {
         lastName: 'Souza',
         phone: '11988888888',
         role: 'user' as UserRole,
+        preferredLocale: null,
       };
       vi.mocked(userPortMock.updateUserProfile).mockResolvedValueOnce(updatedProfile);
 
@@ -91,7 +94,11 @@ describe('UserService', () => {
       const photoUrl = await userService.uploadPhoto('user-123', 'base64-image-string');
 
       expect(prepareImageForStorageUseCase).toHaveBeenCalledWith('base64-image-string', 1024);
-      expect(userPortMock.uploadUserPhoto).toHaveBeenCalledWith('user-123', processed, 'image/webp');
+      expect(userPortMock.uploadUserPhoto).toHaveBeenCalledWith(
+        'user-123',
+        processed,
+        'image/webp'
+      );
       expect(photoUrl).toBe('https://storage.googleapis.com/test-bucket/profiles/user-123?v=1');
     });
 
@@ -128,4 +135,11 @@ describe('UserService', () => {
       );
     });
   });
+
+  it('grava o idioma escolhido na conta', async () => {
+    await userService.updatePreferences('user-123', { preferredLocale: 'fr' });
+    expect(userPortMock.updateUserPreferences).toHaveBeenCalledWith('user-123', {
+      preferredLocale: 'fr',
+    });
+  });
 });

=== server/domain/users/services/userService.ts — diff ===
@@ -1,7 +1,7 @@
 import { prepareImageForStorageUseCase } from '../../media';
 import { UserPort } from '../ports/userPort';
 import { UserProfileDto } from '../dtos/userDto';
-import { UpdateUserProfileInput } from '../schemas/userSchema';
+import { UpdateUserPreferencesInput, UpdateUserProfileInput } from '../schemas/userSchema';
 
 export class UserService {
   constructor(private userPort: UserPort) {}
@@ -27,6 +27,13 @@ export class UserService {
     return this.userPort.updateUserProfile(uid, input);
   }
 
+  async updatePreferences(uid: string, input: UpdateUserPreferencesInput): Promise<void> {
+    if (!uid) {
+      throw new Error('UID do usuário é obrigatório');
+    }
+    await this.userPort.updateUserPreferences(uid, input);
+  }
+
   async uploadPhoto(uid: string, photoBase64: string): Promise<string> {
     if (!uid) {
       throw new Error('UID do usuário é obrigatório');

=== src/app/App.tsx — diff ===
@@ -1,12 +1,14 @@
 import { AppProviders } from './AppProviders';
 import { AppRouter } from './AppRouter';
 import { ErrorBoundary } from './ErrorBoundary';
+import { LocalePreference } from './locale/LocalePreference';
 
 export default function App() {
   return (
     <ErrorBoundary>
       <AppProviders>
         <AppRouter />
+        <LocalePreference />
       </AppProviders>
     </ErrorBoundary>
   );

=== src/app/locale/LocalePreference.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n, LOCALE_STORAGE_KEY } from '../../shared/i18n';
import { LocalePreference } from './LocalePreference';

const auth = vi.hoisted(() => ({
  value: { user: null as { uid: string } | null, profile: null as Record<string, unknown> | null },
}));
const updatePreferredLocaleUseCase = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('../../domain/auth/context/AuthContext', () => ({ useAuthContext: () => auth.value }));
vi.mock('../../domain/user', () => ({ updatePreferredLocaleUseCase }));

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <LocalePreference />
              <CurrentPath />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(navigator, 'languages', { configurable: true, value: languages });
  Object.defineProperty(navigator, 'language', { configurable: true, value: languages[0] });
}

describe('LocalePreference (decisão D10)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    auth.value = { user: null, profile: null };
    vi.clearAllMocks();
  });
  afterEach(async () => {
    setBrowserLanguages(['pt-BR']);
    await i18n.changeLanguage('pt-BR');
  });

  it('página em português aberta por link mostra o aviso no idioma do navegador', () => {
    setBrowserLanguages(['en-US']);
    renderAt('/eventos');
    expect(screen.getByText('This page is also available in English.')).toBeTruthy();
  });

  it('"View in English" grava a escolha e leva para a mesma página em inglês', () => {
    setBrowserLanguages(['en-US']);
    renderAt('/eventos');
    fireEvent.click(screen.getByRole('button', { name: 'View in English' }));
    expect(screen.getByTestId('path').textContent).toBe('/en/events');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(screen.queryByText('This page is also available in English.')).toBeNull();
  });

  it('"Continue in Portuguese" grava português e o aviso não volta', () => {
    setBrowserLanguages(['fr-FR']);
    renderAt('/eventos');
    fireEvent.click(screen.getByRole('button', { name: 'Continuer en portugais' }));
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('pt-BR');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('sem aviso com navegador em português ou em página com idioma na URL', () => {
    setBrowserLanguages(['pt-BR']);
    const { unmount } = renderAt('/eventos');
    expect(screen.queryByRole('region')).toBeNull();
    unmount();
    setBrowserLanguages(['en-US']);
    renderAt('/en/events');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('a escolha feita com login sobe para a conta', () => {
    setBrowserLanguages(['en-US']);
    auth.value = { user: { uid: 'u1' }, profile: { uid: 'u1', preferredLocale: 'en' } };
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    renderAt('/eventos');
    fireEvent.click(screen.getByRole('button', { name: 'View in English' }));
    expect(updatePreferredLocaleUseCase).toHaveBeenCalledWith('en');
  });

  it('o idioma salvo na conta vale neste aparelho', () => {
    setBrowserLanguages(['pt-BR']);
    auth.value = { user: { uid: 'u1' }, profile: { uid: 'u1', preferredLocale: 'fr' } };
    renderAt('/eventos');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    expect(screen.getByText('Cette page est aussi disponible en français.')).toBeTruthy();
    expect(updatePreferredLocaleUseCase).not.toHaveBeenCalled();
  });

  it('conta sem idioma recebe a escolha feita antes do login', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fr');
    auth.value = { user: { uid: 'u1' }, profile: { uid: 'u1', preferredLocale: null } };
    await act(async () => {
      renderAt('/fr');
    });
    expect(updatePreferredLocaleUseCase).toHaveBeenCalledWith('fr');
  });
});

=== src/app/locale/LocalePreference.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import {
  DEFAULT_LOCALE,
  onLocaleChoice,
  saveLocaleChoice,
  suggestedLocaleFor,
} from '../../shared/i18n';
import { LocaleSuggestionBanner } from './LocaleSuggestionBanner';
import { useAccountLocaleSync } from './useAccountLocaleSync';

/** Aviso de idioma e sincronização com a conta (decisão D10); o redirecionamento da home fica no main.tsx. */
export function LocalePreference() {
  const { pathname } = useLocation();
  const { switchLocale } = useLocalizedRouting();
  const [, setChoiceVersion] = useState(0);
  // Inscrito antes da sincronização com a conta, que pode gravar uma escolha no mesmo ciclo.
  useEffect(() => onLocaleChoice(() => setChoiceVersion((version) => version + 1)), []);
  useAccountLocaleSync();

  const suggestion = suggestedLocaleFor(pathname, navigator.userAgent);
  if (!suggestion) return null;

  return (
    <LocaleSuggestionBanner
      target={suggestion}
      onSwitch={() => switchLocale(suggestion)}
      onKeep={() => saveLocaleChoice(DEFAULT_LOCALE)}
    />
  );
}

=== src/app/locale/LocaleSuggestionBanner.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Languages } from 'lucide-react';
import { i18n, type Locale } from '../../shared/i18n';
import { Z_INDEX } from '../../shared/constants/zIndex';

interface LocaleSuggestionBannerProps {
  target: Locale;
  onSwitch: () => void;
  onKeep: () => void;
}

/** Aviso numa página em português aberta por link: o texto sai no idioma sugerido, não no da página. */
export function LocaleSuggestionBanner({ target, onSwitch, onKeep }: LocaleSuggestionBannerProps) {
  const t = i18n.getFixedT(target);

  return (
    <section
      lang={target}
      aria-label={t('localeSuggestion.label')}
      style={{
        zIndex: Z_INDEX.banner,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)',
      }}
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-lg px-4"
    >
      <div className="glassmorphism-vibrant rounded-3xl border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <p className="flex items-start gap-2 text-sm font-semibold text-white">
          <Languages size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-300" />
          {t('localeSuggestion.message')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSwitch}
            className="flex-1 min-h-[44px] rounded-xl bg-teal-500 px-4 text-sm font-bold text-black hover:bg-teal-400 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('localeSuggestion.switch')}
          </button>
          <button
            type="button"
            onClick={onKeep}
            className="flex-1 min-h-[44px] rounded-xl bg-white/5 border border-white/10 px-4 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('localeSuggestion.keep')}
          </button>
        </div>
      </div>
    </section>
  );
}

=== src/app/locale/useAccountLocaleSync.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect } from 'react';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { updatePreferredLocaleUseCase } from '../../domain/user';
import {
  type Locale,
  normalizeLocale,
  onLocaleChoice,
  readSavedLocale,
  saveLocaleChoice,
} from '../../shared/i18n';

function saveOnAccount(locale: Locale): void {
  updatePreferredLocaleUseCase(locale).catch((error: unknown) => {
    console.error('[useAccountLocaleSync] idioma não salvo na conta:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
  });
}

/**
 * Mantém a escolha de idioma igual entre o navegador e a conta (decisão D10): a escolha da conta
 * vale em qualquer aparelho; uma escolha feita antes do login sobe para a conta que ainda não tem.
 */
export function useAccountLocaleSync(): void {
  const { user, profile } = useAuthContext();
  const uid = user?.uid ?? null;
  const accountLocale = profile ? normalizeLocale(profile.preferredLocale) : undefined;

  useEffect(() => {
    if (!uid) return undefined;
    return onLocaleChoice((locale, source) => {
      if (source === 'user') saveOnAccount(locale);
    });
  }, [uid]);

  useEffect(() => {
    if (!uid || accountLocale === undefined) return;
    const savedLocale = readSavedLocale();
    if (accountLocale && accountLocale !== savedLocale) {
      saveLocaleChoice(accountLocale, 'account');
    } else if (!accountLocale && savedLocale) {
      saveOnAccount(savedLocale);
    }
  }, [uid, accountLocale]);
}

=== src/domain/user/adapters/apiUserAdapter.ts — diff ===
@@ -1,4 +1,5 @@
 import { UserPort } from '../ports/userPort';
+import type { Locale } from '../../../shared/i18n';
 import { UserProfile, UserData } from '../types/user';
 import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
 
@@ -39,6 +40,21 @@ export class ApiUserAdapter implements UserPort {
     return await response.json();
   }
 
+  async updatePreferredLocale(locale: Locale): Promise<void> {
+    const response = await firebaseApiFetch(
+      '/api/users/me/preferences',
+      {
+        method: 'PUT',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ preferredLocale: locale }),
+      },
+      { requireAuth: true }
+    );
+    if (!response.ok) {
+      throw new Error(`USER_PREFERENCES_${response.status}`);
+    }
+  }
+
   async deleteCurrentUser(): Promise<void> {
     const response = await firebaseApiFetch(
       '/api/users/me',
@@ -51,9 +67,9 @@ export class ApiUserAdapter implements UserPort {
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       if (response.status === 401 && errorData.error === 'REAUTHENTICATION_REQUIRED') {
-        const error = new Error('REAUTHENTICATION_REQUIRED');
-        (error as any).code = 'REAUTHENTICATION_REQUIRED';
-        throw error;
+        throw Object.assign(new Error('REAUTHENTICATION_REQUIRED'), {
+          code: 'REAUTHENTICATION_REQUIRED',
+        });
       }
       throw new Error(errorData.error || 'Falha ao excluir conta via API');
     }

=== src/domain/user/application/usecases/updatePreferredLocaleUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userAdapter } from '../../factory';
import { updatePreferredLocaleUseCase } from './updatePreferredLocaleUseCase';

vi.mock('../../factory', () => ({
  userAdapter: { updatePreferredLocale: vi.fn() },
}));

describe('updatePreferredLocaleUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envia o idioma suportado para a conta', async () => {
    await updatePreferredLocaleUseCase('en');
    expect(userAdapter.updatePreferredLocale).toHaveBeenCalledWith('en');
  });

  it('recusa idioma não suportado', async () => {
    await expect(updatePreferredLocaleUseCase('es' as never)).rejects.toThrow();
    expect(userAdapter.updatePreferredLocale).not.toHaveBeenCalled();
  });
});

=== src/domain/user/application/usecases/updatePreferredLocaleUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Locale } from '../../../../shared/i18n';
import { userAdapter } from '../../factory';
import { preferredLocaleSchema } from '../../schemas/userSchema';

/** Grava na conta o idioma escolhido, para valer em todos os aparelhos e nos e-mails (decisão D10). */
export async function updatePreferredLocaleUseCase(locale: Locale): Promise<void> {
  await userAdapter.updatePreferredLocale(preferredLocaleSchema.parse(locale));
}

=== src/domain/user/index.ts — diff ===
@@ -18,6 +18,7 @@ export type { UserPort } from './ports/userPort';
 
 export { getCurrentUserUseCase } from './application/usecases/getCurrentUserUseCase';
 export { updateCurrentUserUseCase } from './application/usecases/updateCurrentUserUseCase';
+export { updatePreferredLocaleUseCase } from './application/usecases/updatePreferredLocaleUseCase';
 export { updatePasswordUseCase } from './application/usecases/updatePasswordUseCase';
 export { deleteCurrentUserUseCase } from './application/usecases/deleteCurrentUserUseCase';

=== src/domain/user/ports/userPort.ts — diff ===
@@ -1,7 +1,9 @@
+import type { Locale } from '../../../shared/i18n';
 import { UserProfile, UserData } from '../types/user';
 
 export interface UserPort {
   getCurrentUser(): Promise<UserProfile | null>;
   updateCurrentUser(data: UserData): Promise<UserProfile>;
+  updatePreferredLocale(locale: Locale): Promise<void>;
   deleteCurrentUser(): Promise<void>;
 }

=== src/domain/user/schemas/userSchema.ts — diff ===
@@ -1,5 +1,6 @@
 import { z } from 'zod';
 import { checkPasswordRequirements } from '../../auth';
+import { SUPPORTED_LOCALES } from '../../../shared/i18n';
 
 export const updateProfileSchema = z.object({
   firstName: z
@@ -15,6 +16,8 @@ export const updateProfileSchema = z.object({
 
 export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
 
+export const preferredLocaleSchema = z.enum(SUPPORTED_LOCALES);
+
 export const updatePasswordSchema = z
   .object({
     current: z.string().min(1, 'Senha atual é obrigatória'),

=== src/domain/user/types/user.ts — diff ===
@@ -1,3 +1,5 @@
+import type { Locale } from '../../../shared/i18n';
+
 export type UserRole = 'user' | 'partner';
 
 export interface UserProfile {
@@ -9,6 +11,8 @@ export interface UserProfile {
   phone?: string;
   photoURL?: string | null;
   role?: UserRole;
+  /** Idioma escolhido pela pessoa; `null` enquanto ela não escolheu (decisão D10). */
+  preferredLocale?: Locale | null;
   createdAt?: string | Date;
   updatedAt?: string | Date;
 }

=== src/main.tsx — diff ===
@@ -4,10 +4,22 @@ import { BrowserRouter } from 'react-router-dom';
 import './shared/i18n/config';
 import { registerSW } from 'virtual:pwa-register';
 import App from './app/App.tsx';
+import { resolveHomeRedirect } from './shared/i18n';
 import './index.css';
 
 registerSW({ immediate: true });
 
+// Antes do primeiro render: a home já abre no idioma da pessoa, sem piscar em português nem criar
+// entrada no histórico (decisão D10).
+const homeRedirect = resolveHomeRedirect(
+  window.location.pathname,
+  window.location.search,
+  navigator.userAgent
+);
+if (homeRedirect) {
+  window.history.replaceState(window.history.state, '', homeRedirect);
+}
+
 createRoot(document.getElementById('root')!).render(
   <StrictMode>
     <BrowserRouter>

=== src/shared/constants/zIndex.ts — diff ===
@@ -7,6 +7,7 @@ export const Z_INDEX = {
   card: 10,
   header: 100,
   bottomNav: 110,
+  banner: 120,
   dropdown: 200,
   overlay: 1000,
   modal: 1100,

=== src/shared/hooks/useLocalizedRouting.ts — diff ===
@@ -8,6 +8,7 @@ import {
   normalizeLocale,
   parseLocalizedPath,
   type RouteKey,
+  saveLocaleChoice,
   switchLocalePath,
 } from '../i18n';
 
@@ -28,8 +29,10 @@ export function useLocalizedRouting() {
     [navigate, locale]
   );
 
+  /** Troca escolhida pela pessoa: grava a escolha e leva para a mesma página no novo idioma. */
   const switchLocale = useCallback(
     (target: Locale) => {
+      saveLocaleChoice(target);
       if (parsed) {
         navigate(switchLocalePath(location.pathname, location.search, target));
       }

=== src/shared/i18n/config.test.ts — diff ===
@@ -1,9 +1,7 @@
 import { afterEach, describe, expect, it } from 'vitest';
-import {
-  DEFAULT_LOCALE,
-  LOCALE_STORAGE_KEY,
-} from './locale';
+import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './locale';
 import { i18n } from './config';
+import { saveLocaleChoice } from './localeChoice';
 describe('i18n config', () => {
   afterEach(async () => {
     await i18n.changeLanguage(DEFAULT_LOCALE);
@@ -12,21 +10,20 @@ describe('i18n config', () => {
   it('inicializa com um locale suportado', () => {
     expect(['pt-BR', 'en', 'fr']).toContain(i18n.language);
   });
-  it('altera o idioma e persiste a preferência', async () => {
+  it('troca o idioma e o <html lang> sem gravar a escolha (decisão D10)', async () => {
     await i18n.changeLanguage('en');
     expect(i18n.resolvedLanguage).toBe('en');
-    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
     expect(document.documentElement.lang).toBe('en');
+    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
+  });
+
+  it('grava o idioma só quando a pessoa escolhe', () => {
+    saveLocaleChoice('fr');
+    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
   });
   it('possui recursos nos três idiomas', () => {
-    expect(i18n.t('header.pageTitles.events', { lng: 'pt-BR' })).toBe(
-      'Eventos & Experiências'
-    );
-    expect(i18n.t('header.pageTitles.events', { lng: 'en' })).toBe(
-      'Events & Experiences'
-    );
-    expect(i18n.t('header.pageTitles.events', { lng: 'fr' })).toBe(
-      'Événements & Expériences'
-    );
+    expect(i18n.t('header.pageTitles.events', { lng: 'pt-BR' })).toBe('Eventos & Experiências');
+    expect(i18n.t('header.pageTitles.events', { lng: 'en' })).toBe('Events & Experiences');
+    expect(i18n.t('header.pageTitles.events', { lng: 'fr' })).toBe('Événements & Expériences');
   });
 });

=== src/shared/i18n/config.ts — diff ===
@@ -1,17 +1,13 @@
 import i18n from 'i18next';
 import { initReactI18next } from 'react-i18next';
-import {
-  DEFAULT_LOCALE,
-  normalizeLocale,
-  persistLocale,
-  resolveInitialLocale,
-} from './locale';
-import { resolveLocaleFromPathname } from './localizedRoutes';
+import { resolveInitialLocale } from './initialLocale';
+import { DEFAULT_LOCALE, normalizeLocale, resolvePreferredLocale } from './locale';
 import { resources } from './resources';
-// A URL tem prioridade sobre o idioma salvo (decisão D6); fora das rotas localizadas vale a preferência.
+
 const initialLocale =
-  (typeof window !== 'undefined' ? resolveLocaleFromPathname(window.location.pathname) : null) ??
-  resolveInitialLocale();
+  typeof window !== 'undefined'
+    ? resolveInitialLocale(window.location.pathname, window.location.search, navigator.userAgent)
+    : resolvePreferredLocale();
 i18n.use(initReactI18next).init({
   resources,
   lng: initialLocale,
@@ -28,12 +24,12 @@ i18n.use(initReactI18next).init({
     useSuspense: false,
   },
 });
+// Só atualiza o <html lang>: gravar o idioma é papel de saveLocaleChoice (decisão D10).
 function syncLocale(locale: string): void {
   const normalizedLocale = normalizeLocale(locale);
   if (!normalizedLocale) {
     return;
   }
-  persistLocale(normalizedLocale);
   if (typeof document !== 'undefined') {
     document.documentElement.lang = normalizedLocale;
   }

=== src/shared/i18n/index.ts — diff ===
@@ -3,12 +3,19 @@ export {
   LOCALE_STORAGE_KEY,
   SUPPORTED_LOCALES,
   normalizeLocale,
-  persistLocale,
-  resolveInitialLocale,
+  readSavedLocale,
+  resolvePreferredLocale,
   getLocaleDisplayLabel,
   type Locale,
 } from './locale';
 export { i18n } from './config';
+export {
+  isCrawler,
+  resolveHomeRedirect,
+  resolveInitialLocale,
+  suggestedLocaleFor,
+} from './initialLocale';
+export { onLocaleChoice, saveLocaleChoice, type LocaleChoiceSource } from './localeChoice';
 export {
   LOCALIZED_ROUTES,
   localizedPath,

=== src/shared/i18n/initialLocale.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  isCrawler,
  resolveHomeRedirect,
  resolveInitialLocale,
  suggestedLocaleFor,
} from './initialLocale';
import { LOCALE_STORAGE_KEY } from './locale';

const BROWSER = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(navigator, 'languages', { configurable: true, value: languages });
  Object.defineProperty(navigator, 'language', { configurable: true, value: languages[0] });
}

describe('idioma na primeira visita (decisão D10)', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => setBrowserLanguages(['pt-BR']));

  it('reconhece robôs de busca e de pré-visualização de link', () => {
    expect(isCrawler(GOOGLEBOT)).toBe(true);
    expect(isCrawler('WhatsApp/2.23.20.0')).toBe(true);
    expect(isCrawler(BROWSER)).toBe(false);
  });

  it('a home vai para /en com o navegador em inglês', () => {
    setBrowserLanguages(['en-US', 'en']);
    expect(resolveHomeRedirect('/', '', BROWSER)).toBe('/en');
    expect(resolveHomeRedirect('/', '?utm_source=instagram', BROWSER)).toBe(
      '/en?utm_source=instagram'
    );
    expect(resolveInitialLocale('/', '', BROWSER)).toBe('en');
  });

  it('a escolha salva vale mais que o navegador', () => {
    setBrowserLanguages(['en-US']);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'pt-BR');
    expect(resolveHomeRedirect('/', '', BROWSER)).toBeNull();
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fr');
    expect(resolveHomeRedirect('/', '', BROWSER)).toBe('/fr');
  });

  it('não redireciona robôs, navegador em português nem link para conteúdo', () => {
    setBrowserLanguages(['en-US']);
    expect(resolveHomeRedirect('/', '', GOOGLEBOT)).toBeNull();
    expect(resolveHomeRedirect('/', '?item=abc&type=items', BROWSER)).toBeNull();
    expect(resolveHomeRedirect('/eventos', '', BROWSER)).toBeNull();
    setBrowserLanguages(['pt-BR']);
    expect(resolveHomeRedirect('/', '', BROWSER)).toBeNull();
  });

  it('a URL com prefixo de idioma sempre vale', () => {
    setBrowserLanguages(['fr-FR']);
    expect(resolveInitialLocale('/en/events', '', BROWSER)).toBe('en');
    expect(resolveInitialLocale('/eventos', '', BROWSER)).toBe('pt-BR');
  });

  it('página em português aberta por link sugere o idioma da pessoa', () => {
    setBrowserLanguages(['en-US']);
    expect(suggestedLocaleFor('/eventos', BROWSER)).toBe('en');
    expect(suggestedLocaleFor('/en/events', BROWSER)).toBeNull();
    expect(suggestedLocaleFor('/admin', BROWSER)).toBeNull();
    expect(suggestedLocaleFor('/eventos', GOOGLEBOT)).toBeNull();
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'pt-BR');
    expect(suggestedLocaleFor('/eventos', BROWSER)).toBeNull();
  });
});

=== src/shared/i18n/initialLocale.ts — ARQUIVO NOVO, conteúdo completo ===
import { DEFAULT_LOCALE, type Locale, resolvePreferredLocale } from './locale';
import { localizedPath, parseLocalizedPath } from './localizedRoutes';

const CRAWLER_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|embedly|preview|lighthouse/i;

/** Robôs de busca e de pré-visualização de link nunca são redirecionados nem veem o aviso (decisão D10). */
export function isCrawler(userAgent: string): boolean {
  return CRAWLER_PATTERN.test(userAgent);
}

function isBareHome(pathname: string, search: string): boolean {
  if (pathname !== localizedPath('explore', DEFAULT_LOCALE)) return false;
  // Parâmetros de campanha não tornam o link um conteúdo específico; `?item=` e afins tornam.
  return [...new URLSearchParams(search).keys()].every((key) => key.startsWith('utm_'));
}

/**
 * Destino da home `/` na primeira carga, ou `null` para ficar onde está. Links para conteúdo em
 * português não são redirecionados: mostram o aviso de idioma (`suggestedLocaleFor`).
 */
export function resolveHomeRedirect(
  pathname: string,
  search: string,
  userAgent: string,
  preferred: Locale = resolvePreferredLocale()
): string | null {
  if (preferred === DEFAULT_LOCALE || isCrawler(userAgent) || !isBareHome(pathname, search)) {
    return null;
  }
  return `${localizedPath('explore', preferred)}${search}`;
}

/** Idioma inicial: URL com idioma → (home) preferência → idioma da página → preferência. */
export function resolveInitialLocale(pathname: string, search: string, userAgent: string): Locale {
  const preferred = resolvePreferredLocale();
  if (resolveHomeRedirect(pathname, search, userAgent, preferred)) return preferred;
  return parseLocalizedPath(pathname)?.locale ?? preferred;
}

/** Idioma a sugerir numa página em português aberta por link, ou `null` quando não há aviso. */
export function suggestedLocaleFor(
  pathname: string,
  userAgent: string,
  preferred: Locale = resolvePreferredLocale()
): Locale | null {
  if (preferred === DEFAULT_LOCALE || isCrawler(userAgent)) return null;
  return parseLocalizedPath(pathname)?.locale === DEFAULT_LOCALE ? preferred : null;
}

=== src/shared/i18n/locale.test.ts — diff ===
@@ -5,7 +5,7 @@ import {
   getLocaleDisplayLabel,
   normalizeLocale,
   persistLocale,
-  resolveInitialLocale,
+  resolvePreferredLocale,
 } from './locale';
 describe('locale', () => {
   beforeEach(() => {
@@ -28,7 +28,7 @@ describe('locale', () => {
   });
   it('prioriza o locale persistido', () => {
     window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
-    expect(resolveInitialLocale()).toBe('en');
+    expect(resolvePreferredLocale()).toBe('en');
   });
   it('usa pt-BR como fallback final', () => {
     window.localStorage.removeItem(LOCALE_STORAGE_KEY);
@@ -40,7 +40,7 @@ describe('locale', () => {
       configurable: true,
       value: 'de-DE',
     });
-    expect(resolveInitialLocale()).toBe(DEFAULT_LOCALE);
+    expect(resolvePreferredLocale()).toBe(DEFAULT_LOCALE);
   });
   it('persiste somente o locale canônico recebido', () => {
     persistLocale('pt-BR');

=== src/shared/i18n/locale.ts — diff ===
@@ -18,7 +18,8 @@ export function normalizeLocale(value: string | null | undefined): Locale | null
   }
   return null;
 }
-function readPersistedLocale(): Locale | null {
+/** Idioma escolhido pela pessoa (Configurações ou aviso de idioma); `null` se nunca escolheu. */
+export function readSavedLocale(): Locale | null {
   if (typeof window === 'undefined') {
     return null;
   }
@@ -33,14 +34,15 @@ function readBrowserLocales(): string[] {
     return [];
   }
   const languages = Array.isArray(navigator.languages) ? navigator.languages : [];
-  return [...languages, navigator.language].filter(
-    (language): language is string => Boolean(language)
+  return [...languages, navigator.language].filter((language): language is string =>
+    Boolean(language)
   );
 }
-export function resolveInitialLocale(): Locale {
-  const persistedLocale = readPersistedLocale();
-  if (persistedLocale) {
-    return persistedLocale;
+/** Preferência sem olhar a URL: escolha salva → idioma do navegador → pt-BR (decisão D10). */
+export function resolvePreferredLocale(): Locale {
+  const savedLocale = readSavedLocale();
+  if (savedLocale) {
+    return savedLocale;
   }
   for (const candidate of readBrowserLocales()) {
     const locale = normalizeLocale(candidate);
@@ -72,7 +74,6 @@ export function getLocaleDisplayLabel(targetLocale: Locale, currentLocale: Local
         return 'English';
       case 'fr':
         return 'Anglais';
-      case 'pt-BR':
       default:
         return 'Inglês';
     }
@@ -84,7 +85,6 @@ export function getLocaleDisplayLabel(targetLocale: Locale, currentLocale: Local
         return 'Français';
       case 'en':
         return 'French';
-      case 'pt-BR':
       default:
         return 'Francês';
     }
@@ -92,4 +92,3 @@ export function getLocaleDisplayLabel(targetLocale: Locale, currentLocale: Local
 
   return targetLocale;
 }
-

=== src/shared/i18n/localeChoice.ts — ARQUIVO NOVO, conteúdo completo ===
import { type Locale, persistLocale } from './locale';

/** `user`: escolha feita agora nesta tela; `account`: preferência trazida da conta. */
export type LocaleChoiceSource = 'user' | 'account';
type LocaleChoiceListener = (locale: Locale, source: LocaleChoiceSource) => void;

const listeners = new Set<LocaleChoiceListener>();

/** Única forma de gravar o idioma: mudança causada pela URL não passa por aqui (decisão D10). */
export function saveLocaleChoice(locale: Locale, source: LocaleChoiceSource = 'user'): void {
  persistLocale(locale);
  for (const listener of listeners) listener(locale, source);
}

export function onLocaleChoice(listener: LocaleChoiceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

=== src/shared/i18n/resources.ts — diff ===
@@ -178,6 +178,12 @@ export interface TranslationResource {
     partnerSuspendedTitle: string;
     partnerSuspended: string;
   };
+  localeSuggestion: {
+    label: string;
+    message: string;
+    switch: string;
+    keep: string;
+  };
   settings: {
     title: string;
     subtitle: string;
@@ -409,6 +415,12 @@ const ptBR: TranslationResource = {
     partnerSuspended:
       'Seu acesso ao painel foi suspenso pela equipe do Use Guide. Fale com o suporte para saber como reativar.',
   },
+  localeSuggestion: {
+    label: 'Sugestão de idioma',
+    message: 'Esta página também está disponível em português.',
+    switch: 'Ver em português',
+    keep: 'Continuar em português',
+  },
   settings: {
     title: 'Configurações',
     subtitle: 'Preferências do app',
@@ -641,6 +653,12 @@ const en: TranslationResource = {
     partnerSuspended:
       'Your dashboard access was suspended by the Use Guide team. Contact support to find out how to reactivate it.',
   },
+  localeSuggestion: {
+    label: 'Language suggestion',
+    message: 'This page is also available in English.',
+    switch: 'View in English',
+    keep: 'Continue in Portuguese',
+  },
   settings: {
     title: 'Settings',
     subtitle: 'App preferences',
@@ -881,6 +899,12 @@ const fr: TranslationResource = {
     partnerSuspended:
       'Votre accès au tableau de bord a été suspendu par l’équipe Use Guide. Contactez le support pour savoir comment le réactiver.',
   },
+  localeSuggestion: {
+    label: 'Suggestion de langue',
+    message: 'Cette page est aussi disponible en français.',
+    switch: 'Voir en français',
+    keep: 'Continuer en portugais',
+  },
   settings: {
     title: 'Paramètres',
     subtitle: 'Préférences de l’app',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 154 arquivos, 846 testes, `npm run build`.
- No navegador:
  - com o idioma do navegador em inglês, abrir / leva para /en;
  - abrir /eventos mostra "This page is also available in English."; "View in English" leva para /en/events.
Responda no formato do AGENTS.md §16.3.
~~~~
