import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prepareImageForStorageUseCase } from '../../media';
import { UserService } from './userService';

vi.mock('../../media', () => ({ prepareImageForStorageUseCase: vi.fn() }));
import { UserPort } from '../ports/userPort';
import { UserRole } from '../types/userTypes';

describe('UserService', () => {
  let userPortMock: UserPort;
  let userService: UserService;

  beforeEach(() => {
    userPortMock = {
      getUserProfile: vi.fn(),
      getUserProfilesBatch: vi.fn(),
      updateUserProfile: vi.fn(),
      updateUserPreferences: vi.fn(),
      uploadUserPhoto: vi.fn(),
      upgradeRoleToPartner: vi.fn(),
      deleteUserAccount: vi.fn(),
      getUsersCount: vi.fn(),
    };

    userService = new UserService(userPortMock);
  });

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário quando o UID for válido', async () => {
      const mockProfile = {
        uid: 'user-123',
        email: 'test@example.com',
        firstName: 'Carlos',
        lastName: 'Silva',
        phone: '11999999999',
        role: 'user' as UserRole,
        preferredLocale: null,
        username: null,
        usernameChangedAt: null,
      };
      vi.mocked(userPortMock.getUserProfile).mockResolvedValueOnce(mockProfile);

      const result = await userService.getProfile('user-123');
      expect(result).toEqual(mockProfile);
      expect(userPortMock.getUserProfile).toHaveBeenCalledWith('user-123');
    });

    it('deve lançar erro se UID for vazio', async () => {
      await expect(userService.getProfile('')).rejects.toThrow('UID do usuário é obrigatório');
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar o perfil via userPort', async () => {
      const input = { firstName: 'Maria', lastName: 'Souza', phone: '11988888888' };
      const updatedProfile = {
        uid: 'user-123',
        email: 'maria@example.com',
        firstName: 'Maria',
        lastName: 'Souza',
        phone: '11988888888',
        role: 'user' as UserRole,
        preferredLocale: null,
        username: null,
        usernameChangedAt: null,
      };
      vi.mocked(userPortMock.updateUserProfile).mockResolvedValueOnce(updatedProfile);

      const result = await userService.updateProfile('user-123', input);
      expect(result).toEqual(updatedProfile);
      expect(userPortMock.updateUserProfile).toHaveBeenCalledWith('user-123', input);
    });

    it('deve lançar erro se UID for vazio na atualização', async () => {
      await expect(
        userService.updateProfile('', {
          firstName: 'Test',
          lastName: 'Silva',
          phone: '11999999999',
        })
      ).rejects.toThrow('UID do usuário é obrigatório');
    });
  });

  describe('uploadPhoto', () => {
    it('processa a imagem no domínio media e grava o resultado pelo userPort', async () => {
      const processed = Buffer.from('webp-bytes');
      vi.mocked(prepareImageForStorageUseCase).mockResolvedValueOnce({
        buffer: processed,
        contentType: 'image/webp',
        width: 512,
        height: 512,
      });
      vi.mocked(userPortMock.uploadUserPhoto).mockResolvedValueOnce(
        'https://storage.googleapis.com/test-bucket/profiles/user-123?v=1'
      );

      const photoUrl = await userService.uploadPhoto('user-123', 'base64-image-string');

      expect(prepareImageForStorageUseCase).toHaveBeenCalledWith('base64-image-string', 1024);
      expect(userPortMock.uploadUserPhoto).toHaveBeenCalledWith(
        'user-123',
        processed,
        'image/webp'
      );
      expect(photoUrl).toBe('https://storage.googleapis.com/test-bucket/profiles/user-123?v=1');
    });

    it('deve lançar erro se UID for vazio no upload de foto', async () => {
      await expect(userService.uploadPhoto('', 'base64-string')).rejects.toThrow(
        'UID do usuário é obrigatório'
      );
      expect(prepareImageForStorageUseCase).not.toHaveBeenCalled();
    });
  });

  describe('upgradeRoleToPartner', () => {
    it('deve chamar upgradeRoleToPartner do port', async () => {
      await userService.upgradeRoleToPartner('user-789');
      expect(userPortMock.upgradeRoleToPartner).toHaveBeenCalledWith('user-789');
    });

    it('deve lançar erro se UID for vazio no upgrade', async () => {
      await expect(userService.upgradeRoleToPartner('')).rejects.toThrow(
        'UID do usuário é obrigatório'
      );
    });
  });

  describe('deleteAccount', () => {
    it('deve chamar deleteUserAccount do port', async () => {
      await userService.deleteAccount('user-456');
      expect(userPortMock.deleteUserAccount).toHaveBeenCalledWith('user-456');
    });

    it('deve lançar erro se UID for vazio na exclusão', async () => {
      await expect(userService.deleteAccount('')).rejects.toThrow(
        'UID do usuário é obrigatório para exclusão'
      );
    });
  });

  it('grava o idioma escolhido na conta', async () => {
    await userService.updatePreferences('user-123', { preferredLocale: 'fr' });
    expect(userPortMock.updateUserPreferences).toHaveBeenCalledWith('user-123', {
      preferredLocale: 'fr',
    });
  });
});
