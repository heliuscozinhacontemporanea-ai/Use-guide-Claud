import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './userService';
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
    it('deve delegar upload de foto para o userPort e retornar o URL', async () => {
      vi.mocked(userPortMock.uploadUserPhoto).mockResolvedValueOnce(
        'https://storage.googleapis.com/test-bucket/profiles/user-123'
      );

      const photoUrl = await userService.uploadPhoto(
        'user-123',
        'base64-image-string',
        'image/jpeg'
      );

      expect(photoUrl).toBe('https://storage.googleapis.com/test-bucket/profiles/user-123');
      expect(userPortMock.uploadUserPhoto).toHaveBeenCalledWith(
        'user-123',
        'base64-image-string',
        'image/jpeg'
      );
    });

    it('deve lançar erro se UID for vazio no upload de foto', async () => {
      await expect(userService.uploadPhoto('', 'base64-string', 'image/jpeg')).rejects.toThrow(
        'UID do usuário é obrigatório'
      );
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
});
