import { describe, it, expect, vi } from 'vitest';
import { createItemSchema, updateItemSchema } from '../domain/guide/schemas/guideSchema';
import { updateUserProfileSchema } from '../domain/users/schemas/userSchema';
import { CreatePlanPaymentIntentSchema } from '../domain/payment/schemas/paymentSchema';
import { GuideService } from '../domain/guide/services/guideService';
import { GuidePort } from '../domain/guide/ports/guidePort';
import { GuideDomainError } from '../domain/guide/errors/guideDomainError';
import { InsightsService } from '../domain/insights/services/insightsService';
import { InsightsRepositoryPort } from '../domain/insights/ports/insightsRepositoryPort';
import { getResourceOwnerIdUseCase } from '../domain/guide/usecases/getResourceOwnerIdUseCase';

vi.mock('../domain/guide/usecases/getResourceOwnerIdUseCase', () => ({
  getResourceOwnerIdUseCase: vi.fn(),
}));

describe('Security Audit - Mass Assignment and Cross-Owner Defenses', () => {
  describe('Mass Assignment Protections', () => {
    it('Guide Item: rejects injected ownerId, rating, isVerified, or reviewCount in createItemSchema', () => {
      const payload = {
        name: 'Restaurante Exemplo',
        description: 'Descrição completa do local',
        category: 'restaurant',
        image: 'https://exemplo.com/foto.jpg',
        images: [],
        location: 'pipa',
        ownerId: 'hacker-uid',
        rating: 5,
        isVerified: true,
        reviewCount: 999,
      };

      const result = createItemSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('Guide Item: rejects injected ownerId, isVerified, rating in updateItemSchema', () => {
      expect(updateItemSchema.safeParse({ ownerId: 'hacker-uid' }).success).toBe(false);
      expect(updateItemSchema.safeParse({ isVerified: true }).success).toBe(false);
      expect(updateItemSchema.safeParse({ rating: 5 }).success).toBe(false);
      expect(updateItemSchema.safeParse({ verifiedUntil: '2030-01-01' }).success).toBe(false);
    });

    it('User Profile: rejects injected role or admin fields in updateUserProfileSchema', () => {
      const maliciousPayload = {
        firstName: 'Carlos',
        lastName: 'Silva',
        role: 'admin',
        isAdmin: true,
      };

      const result = updateUserProfileSchema.safeParse(maliciousPayload);
      expect(result.success).toBe(false);
    });

    it('Payment: rejects arbitrary amount, fee override, or status in CreatePlanPaymentIntentSchema', () => {
      const maliciousPayload = {
        itemId: 'plan-pro',
        amount: 0.5,
        status: 'succeeded',
        idempotencyKey: 'key-test-12345',
      };

      const result = CreatePlanPaymentIntentSchema.safeParse(maliciousPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('Cross-Owner Authorization Defenses', () => {
    it('GuideService: blocks partner A from updating item owned by partner B', async () => {
      const mockPort: GuidePort = {
        createItem: vi.fn(),
        updateItem: vi.fn(),
        deleteItem: vi.fn(),
        getItemById: vi.fn().mockResolvedValue({
          id: 'item-100',
          name: 'Restaurante B',
          ownerId: 'partner-B',
          category: 'restaurant',
          isActive: true,
        }),
        updateVerificationByOwner: vi.fn(),
        updateReviewAggregate: vi.fn(),
        deleteResourcesByOwner: vi.fn(),
        getAllItems: vi.fn(),
      };

      const guideService = new GuideService(mockPort);

      await expect(
        guideService.updateItem({ uid: 'partner-A', role: 'partner', admin: false }, 'item-100', {
          name: 'Tentativa de Hack',
        })
      ).rejects.toThrow(GuideDomainError);

      expect(mockPort.updateItem).not.toHaveBeenCalled();
    });

    it('GuideService: blocks partner A from deleting item owned by partner B', async () => {
      const mockPort: GuidePort = {
        createItem: vi.fn(),
        updateItem: vi.fn(),
        deleteItem: vi.fn(),
        getItemById: vi.fn().mockResolvedValue({
          id: 'item-200',
          name: 'Passeio B',
          ownerId: 'partner-B',
          category: 'tour',
          isActive: true,
        }),
        updateVerificationByOwner: vi.fn(),
        updateReviewAggregate: vi.fn(),
        deleteResourcesByOwner: vi.fn(),
        getAllItems: vi.fn(),
      };

      const guideService = new GuideService(mockPort);

      await expect(
        guideService.deleteItem({ uid: 'partner-A', role: 'partner', admin: false }, 'item-200')
      ).rejects.toThrow(GuideDomainError);

      expect(mockPort.deleteItem).not.toHaveBeenCalled();
    });

    it('InsightsService: blocks non-owner from accessing private item insights', async () => {
      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('partner-legitimate-owner');
      const mockRepo: InsightsRepositoryPort = {
        recordInteraction: vi.fn(),
        getItemStats: vi.fn(),
      };

      const insightsService = new InsightsService(mockRepo);

      await expect(
        insightsService.getItemStats('item-secret-id', 'items', {
          uid: 'intruder-user-id',
          admin: false,
        })
      ).rejects.toThrow('FORBIDDEN');
    });

    it('InsightsService: allows item owner to access their item stats', async () => {
      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('partner-legitimate-owner');
      const mockStats = {
        views: 120,
        whatsapp_click: 15,
        share: 5,
        favorite: 10,
        history: [],
      };

      const mockRepo: InsightsRepositoryPort = {
        recordInteraction: vi.fn(),
        getItemStats: vi.fn().mockResolvedValue(mockStats),
      };

      const insightsService = new InsightsService(mockRepo);

      const stats = await insightsService.getItemStats('item-secret-id', 'items', {
        uid: 'partner-legitimate-owner',
        admin: false,
      });

      expect(stats.views).toBe(120);
      expect(stats.whatsapp_click).toBe(15);
    });

    it('InsightsService: allows admin to access any item stats', async () => {
      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('partner-legitimate-owner');
      const mockStats = {
        views: 50,
        whatsapp_click: 5,
        share: 2,
        favorite: 3,
        history: [],
      };

      const mockRepo: InsightsRepositoryPort = {
        recordInteraction: vi.fn(),
        getItemStats: vi.fn().mockResolvedValue(mockStats),
      };

      const insightsService = new InsightsService(mockRepo);

      const stats = await insightsService.getItemStats('item-secret-id', 'items', {
        uid: 'admin-user-id',
        admin: true,
      });

      expect(stats.views).toBe(50);
    });
  });
});
