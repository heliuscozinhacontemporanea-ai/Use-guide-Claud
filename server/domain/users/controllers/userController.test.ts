import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserController } from './userController';
import { userService } from '../factory';
import { Response } from 'express';
import type { UserProfileDto } from '../dtos/userDto';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { deleteUserAccountApplicationUseCase } from '../../../application/usecases/deleteUserAccountApplicationUseCase';

vi.mock('../../../application/usecases/deleteUserAccountApplicationUseCase', () => ({
  deleteUserAccountApplicationUseCase: vi.fn(),
}));

vi.mock('../factory', () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    uploadPhoto: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

describe('UserController', () => {
  let mockRes: Response;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockRes = { status: statusMock, json: jsonMock } as unknown as Response;
  });

  describe('getProfile', () => {
    it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
      const req = { user: undefined } as unknown as AuthenticatedRequest;
      await UserController.getProfile(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Não autenticado' });
    });

    it('deve retornar 200 com os dados do perfil quando autenticado', async () => {
      const req = { user: { uid: 'user-1' } } as unknown as AuthenticatedRequest;
      const profile = { uid: 'user-1', firstName: 'Ana', email: 'ana@test.com' };
      vi.mocked(userService.getProfile).mockResolvedValueOnce(profile as unknown as UserProfileDto);

      await UserController.getProfile(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(profile);
    });

    it('deve retornar 500 com mensagem sanitizada se o serviço falhar', async () => {
      const req = { user: { uid: 'user-1' } } as unknown as AuthenticatedRequest;
      vi.mocked(userService.getProfile).mockRejectedValueOnce(
        new Error('Internal Firestore Failure')
      );

      await UserController.getProfile(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Não foi possível obter os dados do perfil.',
      });
    });
  });

  describe('updateProfile', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const req = {
        user: undefined,
        body: { firstName: 'Carlos' },
      } as unknown as AuthenticatedRequest;
      await UserController.updateProfile(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('deve retornar 400 quando o body for inválido segundo o Zod schema', async () => {
      const req = {
        user: { uid: 'user-1' },
        body: { firstName: 'a'.repeat(60) }, // excede max(50)
      } as unknown as AuthenticatedRequest;

      await UserController.updateProfile(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Dados de perfil inválidos',
        })
      );
    });

    it('deve retornar 200 com os dados atualizados quando o body for válido', async () => {
      const req = {
        user: { uid: 'user-1' },
        body: { firstName: 'Carlos', lastName: 'Silva', phone: '11999999999' },
      } as unknown as AuthenticatedRequest;

      const updated = {
        uid: 'user-1',
        firstName: 'Carlos',
        lastName: 'Silva',
        phone: '11999999999',
        email: 'carlos@test.com',
        role: 'user',
      };
      vi.mocked(userService.updateProfile).mockResolvedValueOnce(
        updated as unknown as UserProfileDto
      );

      await UserController.updateProfile(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updated);
    });

    it('deve retornar 500 com mensagem sanitizada se a atualização falhar', async () => {
      const req = {
        user: { uid: 'user-1' },
        body: { firstName: 'Carlos', lastName: 'Silva', phone: '11999999999' },
      } as unknown as AuthenticatedRequest;

      vi.mocked(userService.updateProfile).mockRejectedValueOnce(new Error('Write lock failure'));

      await UserController.updateProfile(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Não foi possível atualizar o perfil.' });
    });
  });

  describe('uploadPhoto', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const req = {
        user: undefined,
        body: { photoBase64: 'base64str' },
      } as unknown as AuthenticatedRequest;
      await UserController.uploadPhoto(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('deve retornar 400 quando o body não contiver photoBase64', async () => {
      const req = {
        user: { uid: 'user-1' },
        body: {},
      } as unknown as AuthenticatedRequest;

      await UserController.uploadPhoto(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Imagem inválida',
        })
      );
    });

    it('deve retornar 200 com photoURL em caso de sucesso', async () => {
      const req = {
        user: { uid: 'user-1' },
        body: { photoBase64: 'data:image/png;base64,abc12345' },
      } as unknown as AuthenticatedRequest;

      vi.mocked(userService.uploadPhoto).mockResolvedValueOnce(
        'https://storage.googleapis.com/bucket/profiles/user-1'
      );

      await UserController.uploadPhoto(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        photoURL: 'https://storage.googleapis.com/bucket/profiles/user-1',
      });
    });

    it('deve retornar 500 com mensagem sanitizada se o upload falhar', async () => {
      const req = {
        user: { uid: 'user-1' },
        body: { photoBase64: 'data:image/jpeg;base64,abc12345' },
      } as unknown as AuthenticatedRequest;

      vi.mocked(userService.uploadPhoto).mockRejectedValueOnce(new Error('Storage failure'));

      await UserController.uploadPhoto(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Não foi possível realizar o upload da foto.',
      });
    });
  });

  describe('deleteAccount', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const req = { user: undefined } as unknown as AuthenticatedRequest;
      await UserController.deleteAccount(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('deve retornar 200 com sucesso após exclusão orquestrada da conta', async () => {
      const req = { user: { uid: 'user-1' } } as unknown as AuthenticatedRequest;
      vi.mocked(deleteUserAccountApplicationUseCase).mockResolvedValueOnce(undefined);

      await UserController.deleteAccount(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        message: 'Conta e dados associados excluídos com sucesso',
      });
      expect(deleteUserAccountApplicationUseCase).toHaveBeenCalledWith('user-1');
    });

    it('deve retornar 500 com mensagem sanitizada em erro interno', async () => {
      const req = { user: { uid: 'user-1' } } as unknown as AuthenticatedRequest;
      vi.mocked(deleteUserAccountApplicationUseCase).mockRejectedValueOnce(
        new Error('Cascade deletion crash')
      );

      await UserController.deleteAccount(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Não foi possível excluir a conta.' });
    });
  });

  describe('updatePreferences', () => {
    function preferencesResponse() {
      const res = { status: vi.fn(), json: vi.fn(), end: vi.fn() };
      res.status.mockReturnValue(res);
      return res;
    }

    it('grava o idioma e responde 204', async () => {
      const res = preferencesResponse();
      const req = {
        user: { uid: 'user-1' },
        body: { preferredLocale: 'en' },
      } as unknown as AuthenticatedRequest;
      await UserController.updatePreferences(req, res as unknown as Response);
      expect(userService.updatePreferences).toHaveBeenCalledWith('user-1', {
        preferredLocale: 'en',
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('idioma não suportado ou campo extra responde 400 VALIDATION_ERROR', async () => {
      for (const body of [{ preferredLocale: 'es' }, { preferredLocale: 'en', role: 'admin' }]) {
        const res = preferencesResponse();
        const req = { user: { uid: 'user-1' }, body } as unknown as AuthenticatedRequest;
        await UserController.updatePreferences(req, res as unknown as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0]?.[0].error.code).toBe('VALIDATION_ERROR');
      }
      expect(userService.updatePreferences).not.toHaveBeenCalled();
    });

    it('sem login responde 401', async () => {
      const res = preferencesResponse();
      const req = { body: { preferredLocale: 'en' } } as unknown as AuthenticatedRequest;
      await UserController.updatePreferences(req, res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
