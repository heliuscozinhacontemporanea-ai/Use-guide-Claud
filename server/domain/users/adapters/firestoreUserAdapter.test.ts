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
    updateUser: (uid: string, data: any) => mockUpdateUser(uid, data),
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
      const notFoundError: any = new Error('User not found');
      notFoundError.code = 'auth/user-not-found';
      mockDeleteUser.mockRejectedValueOnce(notFoundError);

      await expect(adapter.deleteUserAccount('uid-already-deleted')).resolves.not.toThrow();
    });

    it('deve propagar outros erros do Firebase Auth', async () => {
      mockFileDelete.mockResolvedValueOnce(undefined);
      mockDocDelete.mockResolvedValue(undefined);
      const networkError: any = new Error('Network timeout');
      networkError.code = 'auth/internal-error';
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

  describe('uploadUserPhoto — Validação por Magic Bytes e Propagação de Erros', () => {
    const jpegBase64 = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]).toString('base64');
    const pngBase64 = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
    ]).toString('base64');
    const webpBase64 = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]).toString('base64');

    it('Caso 1 — JPEG válido: deve salvar no Storage com contentType image/jpeg e atualizar Auth e Firestore', async () => {
      mockFileSave.mockResolvedValueOnce(undefined);
      mockDocSet.mockResolvedValue(undefined);
      mockUpdateUser.mockResolvedValueOnce(undefined);

      const url = await adapter.uploadUserPhoto(
        'user-1',
        `data:image/jpeg;base64,${jpegBase64}`,
        'image/jpeg'
      );

      expect(url).toBe('https://storage.googleapis.com/test-bucket/profiles/user-1');
      expect(mockFileSave).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          metadata: { contentType: 'image/jpeg' },
          public: true,
        })
      );
      expect(mockUpdateUser).toHaveBeenCalledWith('user-1', { photoURL: url });
      expect(mockDocSet).toHaveBeenCalled();
    });

    it('Caso 2 — PNG válido: deve derivar contentType image/png dos bytes', async () => {
      mockFileSave.mockResolvedValueOnce(undefined);
      mockDocSet.mockResolvedValue(undefined);
      mockUpdateUser.mockResolvedValueOnce(undefined);

      await adapter.uploadUserPhoto('user-1', pngBase64, 'image/png');

      expect(mockFileSave).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          metadata: { contentType: 'image/png' },
        })
      );
    });

    it('Caso 3 — WEBP válido: deve derivar contentType image/webp dos bytes', async () => {
      mockFileSave.mockResolvedValueOnce(undefined);
      mockDocSet.mockResolvedValue(undefined);
      mockUpdateUser.mockResolvedValueOnce(undefined);

      await adapter.uploadUserPhoto('user-1', webpBase64, 'image/webp');

      expect(mockFileSave).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          metadata: { contentType: 'image/webp' },
        })
      );
    });

    it('Caso 4 — Conteúdo inválido: deve rejeitar buffer de texto mesmo declarando image/jpeg', async () => {
      const textBase64 = Buffer.from('Hello world this is plain text content').toString('base64');

      await expect(adapter.uploadUserPhoto('user-1', textBase64, 'image/jpeg')).rejects.toThrow(
        'Formato de imagem inválido'
      );
    });

    it('Caso 5 — MIME declarado incorreto: deve usar o MIME verdadeiro extraído dos bytes (PNG)', async () => {
      mockFileSave.mockResolvedValueOnce(undefined);
      mockDocSet.mockResolvedValue(undefined);
      mockUpdateUser.mockResolvedValueOnce(undefined);

      // Declara image/jpeg mas os bytes são de PNG
      await adapter.uploadUserPhoto('user-1', pngBase64, 'image/jpeg');

      expect(mockFileSave).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          metadata: { contentType: 'image/png' },
        })
      );
    });

    it('Caso 6 — Arquivo > 5 MB: deve rejeitar antes do upload', async () => {
      const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);
      bigBuffer[0] = 0xff;
      bigBuffer[1] = 0xd8;
      bigBuffer[2] = 0xff;
      const bigBase64 = bigBuffer.toString('base64');

      await expect(adapter.uploadUserPhoto('user-1', bigBase64, 'image/jpeg')).rejects.toThrow(
        'Imagem excede o tamanho máximo permitido'
      );
    });

    it('Caso 7 — Storage falha: deve propagar o erro sem captura silenciosa', async () => {
      mockFileSave.mockRejectedValueOnce(new Error('Storage write quota exceeded'));

      await expect(adapter.uploadUserPhoto('user-1', jpegBase64, 'image/jpeg')).rejects.toThrow(
        'Storage write quota exceeded'
      );
    });

    it('Caso 8 — Firebase Auth falha: deve propagar o erro sem captura silenciosa', async () => {
      mockFileSave.mockResolvedValueOnce(undefined);
      mockDocSet.mockResolvedValue(undefined);
      mockUpdateUser.mockRejectedValueOnce(new Error('Auth service unavailable'));

      await expect(adapter.uploadUserPhoto('user-1', jpegBase64, 'image/jpeg')).rejects.toThrow(
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
