import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreUserAdapter } from './firestoreUserAdapter';

const mockDocGet = vi.fn();
const mockDocSet = vi.fn();
const mockDocUpdate = vi.fn();
const mockDocDelete = vi.fn();
const mockDoc = vi.fn((_id: string) => ({
  get: mockDocGet,
  set: mockDocSet,
  update: mockDocUpdate,
  delete: mockDocDelete,
}));

const mockCollection = vi.fn((_name: string) => ({
  doc: mockDoc,
}));

vi.mock('../../../infrastructure/firebase/adminClient', () => ({
  adminDb: {
    collection: (name: string) => mockCollection(name),
  },
  adminAuth: {
    deleteUser: (uid: string) => mockDeleteUser(uid),
    updateUser: (uid: string, data: unknown) => mockUpdateUser(uid, data),
  },
  adminStorage: {
    bucket: () => ({
      name: 'test-bucket',
      file: () => ({
        delete: mockFileDelete,
        save: mockFileSave,
      }),
    }),
  },
}));

const mockDeleteUser = vi.fn();
const mockUpdateUser = vi.fn();
vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    deleteUser: mockDeleteUser,
    updateUser: mockUpdateUser,
  }),
}));

const mockFileDelete = vi.fn();
const mockFileSave = vi.fn();
vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({
    bucket: () => ({
      name: 'test-bucket',
      file: () => ({
        delete: mockFileDelete,
        save: mockFileSave,
      }),
    }),
  }),
}));

describe('FirestoreUserAdapter', () => {
  let adapter: FirestoreUserAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirestoreUserAdapter();
  });

  describe('getUserProfile', () => {
    it('deve retornar null se o documento do usuário não existir', async () => {
      mockDocGet.mockResolvedValueOnce({ exists: false });

      const result = await adapter.getUserProfile('uid-123');
      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockDoc).toHaveBeenCalledWith('uid-123');
    });

    it('deve retornar o DTO quando o documento existir', async () => {
      mockDocGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          email: 'test@example.com',
          firstName: 'João',
          lastName: 'Santos',
          phone: '11999999999',
          role: 'user',
        }),
      });

      const result = await adapter.getUserProfile('uid-123');
      expect(result).toEqual({
        uid: 'uid-123',
        email: 'test@example.com',
        firstName: 'João',
        lastName: 'Santos',
        phone: '11999999999',
        photoURL: '',
        role: 'user',
        preferredLocale: null,
        username: null,
        usernameChangedAt: null,
        createdAt: '',
        updatedAt: '',
      });
    });
  });

  describe('updateUserProfile', () => {
    it('deve persistir em users e sincronizar publicProfiles', async () => {
      mockDocSet.mockResolvedValue(undefined);
      mockDocGet.mockResolvedValue({
        exists: true,
        data: () => ({
          email: 'test@example.com',
          firstName: 'João',
          lastName: 'Santos',
          phone: '11999999999',
          role: 'user',
          photoURL: 'https://example.com/avatar.jpg',
        }),
      });

      const result = await adapter.updateUserProfile('uid-123', {
        firstName: 'João',
        lastName: 'Santos',
        phone: '11999999999',
      });

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockCollection).toHaveBeenCalledWith('publicProfiles');
      expect(mockDocSet).toHaveBeenCalled();
      expect(result.firstName).toBe('João');
      expect(result.lastName).toBe('Santos');
    });
  });

  describe('deleteUserAccount — Idempotência e Limpeza', () => {
    it('deve excluir avatar, publicProfiles, users e chamar deleteUser no Auth', async () => {
      mockFileDelete.mockResolvedValueOnce(undefined);
      mockDocDelete.mockResolvedValue(undefined);
      mockDeleteUser.mockResolvedValueOnce(undefined);

      await adapter.deleteUserAccount('uid-123');

      expect(mockFileDelete).toHaveBeenCalledWith({ ignoreNotFound: true });
      expect(mockCollection).toHaveBeenCalledWith('publicProfiles');
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockDeleteUser).toHaveBeenCalledWith('uid-123');
    });

    it('deve ser idempotente quando o usuário já foi excluído do Firebase Auth', async () => {
      mockFileDelete.mockResolvedValueOnce(undefined);
      mockDocDelete.mockResolvedValue(undefined);
      const notFoundError = Object.assign(new Error('User not found'), {
        code: 'auth/user-not-found',
      });
      mockDeleteUser.mockRejectedValueOnce(notFoundError);

      await expect(adapter.deleteUserAccount('uid-already-deleted')).resolves.not.toThrow();
    });

    it('deve propagar outros erros do Firebase Auth', async () => {
      mockFileDelete.mockResolvedValueOnce(undefined);
      mockDocDelete.mockResolvedValue(undefined);
      const networkError = Object.assign(new Error('Network timeout'), {
        code: 'auth/internal-error',
      });
      mockDeleteUser.mockRejectedValueOnce(networkError);

      await expect(adapter.deleteUserAccount('uid-123')).rejects.toThrow('Network timeout');
    });

    it('deve propagar erros do Storage delete que não sejam ignorados', async () => {
      const storageErr = new Error('Storage permission denied');
      mockFileDelete.mockRejectedValueOnce(storageErr);

      await expect(adapter.deleteUserAccount('uid-123')).rejects.toThrow(
        'Storage permission denied'
      );
    });
  });

  describe('uploadUserPhoto — gravação e propagação de erros', () => {
    const webpImage = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);

    it('grava a imagem já processada com o contentType recebido e atualiza Auth e Firestore', async () => {
      mockFileSave.mockResolvedValueOnce(undefined);
      mockDocSet.mockResolvedValue(undefined);
      mockUpdateUser.mockResolvedValueOnce(undefined);

      const url = await adapter.uploadUserPhoto('user-1', webpImage, 'image/webp');

      expect(url).toMatch(
        /^https:\/\/storage\.googleapis\.com\/test-bucket\/profiles\/user-1\?v=\d+$/
      );
      expect(mockFileSave).toHaveBeenCalledWith(
        webpImage,
        expect.objectContaining({
          metadata: { contentType: 'image/webp' },
          public: true,
        })
      );
      expect(mockUpdateUser).toHaveBeenCalledWith('user-1', { photoURL: url });
      expect(mockDocSet).toHaveBeenCalled();
    });

    it('propaga falha do Storage sem captura silenciosa', async () => {
      mockFileSave.mockRejectedValueOnce(new Error('Storage write quota exceeded'));

      await expect(adapter.uploadUserPhoto('user-1', webpImage, 'image/webp')).rejects.toThrow(
        'Storage write quota exceeded'
      );
    });

    it('propaga falha do Firebase Auth sem captura silenciosa', async () => {
      mockFileSave.mockResolvedValueOnce(undefined);
      mockDocSet.mockResolvedValue(undefined);
      mockUpdateUser.mockRejectedValueOnce(new Error('Auth service unavailable'));

      await expect(adapter.uploadUserPhoto('user-1', webpImage, 'image/webp')).rejects.toThrow(
        'Auth service unavailable'
      );
    });
  });

  describe('upgradeRoleToPartner', () => {
    it('deve chamar update com role partner e updatedAt sem usar set merge', async () => {
      mockDocUpdate.mockResolvedValueOnce(undefined);

      await adapter.upgradeRoleToPartner('partner-uid-1');

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockDoc).toHaveBeenCalledWith('partner-uid-1');
      expect(mockDocUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'partner',
        })
      );
      expect(mockDocSet).not.toHaveBeenCalled();
    });
  });
});
