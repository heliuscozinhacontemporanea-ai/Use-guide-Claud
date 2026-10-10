import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuideDomainError } from '../errors/guideDomainError';
import { GuidePort } from '../ports/guidePort';
import { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
import { GuideService } from './guideService';

function createGuidePortMock(): GuidePort {
  return {
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    getItemById: vi.fn(),
    updateVerificationByOwner: vi.fn(),
    updateReviewAggregate: vi.fn(),
    deleteResourcesByOwner: vi.fn(),
    getAllItems: vi.fn(),
  };
}

describe('GuideService', () => {
  let port: GuidePort;
  let service: GuideService;

  beforeEach(() => {
    vi.clearAllMocks();
    port = createGuidePortMock();
    service = new GuideService(port);
  });

  const adminUser: AuthenticatedUserContext = {
    uid: 'admin-1',
    role: 'admin',
    admin: true,
  };

  const partnerUser: AuthenticatedUserContext = {
    uid: 'partner-1',
    role: 'partner',
    admin: false,
  };

  const clientUser: AuthenticatedUserContext = {
    uid: 'client-1',
    role: 'user',
    admin: false,
  };

  describe('createItem', () => {
    it('deve permitir parceiro criar item', async () => {
      vi.mocked(port.createItem).mockResolvedValue('item-123');

      const result = await service.createItem(partnerUser, {
        name: 'Praia do Amor',
        description: 'Bela praia',
        category: 'sight',
        image: 'https://img.jpg',
        images: [],
        location: 'pipa',
      });

      expect(result).toBe('item-123');
      expect(port.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Praia do Amor',
          ownerId: 'partner-1',
        })
      );
    });

    it('deve impedir usuário comum (client) de criar item', async () => {
      await expect(
        service.createItem(clientUser, {
          name: 'Praia do Amor',
          description: 'Bela praia',
          category: 'sight',
          image: 'https://img.jpg',
          images: [],
          location: 'pipa',
        })
      ).rejects.toThrow(GuideDomainError);
    });

    it('deve permitir admin criar tips, tour e sight', async () => {
      vi.mocked(port.createItem).mockResolvedValue('item-admin');

      for (const category of ['tips', 'tour', 'sight'] as const) {
        const result = await service.createItem(adminUser, {
          name: `Conteúdo ${category}`,
          description: 'Editorial',
          category,
          image: 'https://img.jpg',
          images: [],
          location: 'Jericoacoara',
        });
        expect(result).toBe('item-admin');
      }
    });

    it('deve bloquear admin de criar hotel ou restaurant com FORBIDDEN', async () => {
      for (const category of ['hotel', 'restaurant'] as const) {
        await expect(
          service.createItem(adminUser, {
            name: `Estabelecimento ${category}`,
            description: 'Privado',
            category,
            image: 'https://img.jpg',
            images: [],
            location: 'Jericoacoara',
          })
        ).rejects.toMatchObject({
          code: 'FORBIDDEN',
        });
      }
      expect(port.createItem).not.toHaveBeenCalled();
    });

    it('deve permitir partner criar hotel, restaurant e sight', async () => {
      vi.mocked(port.createItem).mockResolvedValue('item-partner');

      for (const category of ['hotel', 'restaurant', 'sight'] as const) {
        const result = await service.createItem(partnerUser, {
          name: `Parceiro ${category}`,
          description: 'Descrição',
          category,
          image: 'https://img.jpg',
          images: [],
          location: 'Jericoacoara',
        });
        expect(result).toBe('item-partner');
      }
    });

    it('deve bloquear partner de criar tips ou tour com FORBIDDEN', async () => {
      for (const category of ['tips', 'tour'] as const) {
        await expect(
          service.createItem(partnerUser, {
            name: `Editorial ${category}`,
            description: 'Descrição',
            category,
            image: 'https://img.jpg',
            images: [],
            location: 'Jericoacoara',
          })
        ).rejects.toMatchObject({
          code: 'FORBIDDEN',
        });
      }
      expect(port.createItem).not.toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('deve permitir admin atualizar item de qualquer dono', async () => {
      vi.mocked(port.getItemById).mockResolvedValue({
        id: 'item-1',
        name: 'Restaurante A',
        description: 'Desc',
        category: 'restaurant',
        image: 'img.jpg',
        images: [],
        location: 'pipa',
        ownerId: 'other-owner',
        isActive: true,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        verifiedUntil: null,
        verificationType: null,
        isVerificationSuspended: false,
      });

      await service.updateItem(adminUser, 'item-1', {
        name: 'Restaurante A Atualizado',
      });

      expect(port.updateItem).toHaveBeenCalledWith('item-1', {
        name: 'Restaurante A Atualizado',
      });
    });

    it('deve impedir parceiro de atualizar item de outro parceiro', async () => {
      vi.mocked(port.getItemById).mockResolvedValue({
        id: 'item-1',
        name: 'Restaurante A',
        description: 'Desc',
        category: 'restaurant',
        image: 'img.jpg',
        images: [],
        location: 'pipa',
        ownerId: 'different-partner',
        isActive: true,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        verifiedUntil: null,
        verificationType: null,
        isVerificationSuspended: false,
      });

      await expect(
        service.updateItem(partnerUser, 'item-1', {
          name: 'Tentativa Hacker',
        })
      ).rejects.toThrow(GuideDomainError);
    });
  });

  describe('deleteItem', () => {
    it('deve permitir parceiro deletar o próprio item', async () => {
      vi.mocked(port.getItemById).mockResolvedValue({
        id: 'item-1',
        name: 'Restaurante A',
        description: 'Desc',
        category: 'restaurant',
        image: 'img.jpg',
        images: [],
        location: 'pipa',
        ownerId: 'partner-1',
        isActive: true,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        verifiedUntil: null,
        verificationType: null,
        isVerificationSuspended: false,
      });

      await service.deleteItem(partnerUser, 'item-1');
      expect(port.deleteItem).toHaveBeenCalledWith('item-1');
    });

    it('deve lançar NOT_FOUND se item não existir', async () => {
      vi.mocked(port.getItemById).mockResolvedValue(null);

      await expect(service.deleteItem(partnerUser, 'item-inexistente')).rejects.toThrow(
        'Item não encontrado'
      );
    });
  });

  describe('updateOwnerVerification', () => {
    it('delegates verification update to the Guide port', async () => {
      await service.updateOwnerVerification('partner-1', {
        isVerified: true,
        verifiedUntil: '2026-12-31T23:59:59.000Z',
        verificationType: 'annual',
        isVerificationSuspended: false,
      });
      expect(port.updateVerificationByOwner).toHaveBeenCalledWith('partner-1', {
        isVerified: true,
        verifiedUntil: '2026-12-31T23:59:59.000Z',
        verificationType: 'annual',
        isVerificationSuspended: false,
      });
    });

    it('rejeita ownerId vazio', async () => {
      await expect(
        service.updateOwnerVerification('   ', {
          isVerified: true,
          verifiedUntil: null,
          verificationType: null,
          isVerificationSuspended: false,
        })
      ).rejects.toMatchObject({
        code: 'INVALID_ID',
      });
      expect(port.updateVerificationByOwner).not.toHaveBeenCalled();
    });
  });
});
