import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GuideController } from './guideController';
import { guideService } from '../factory';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

vi.mock('../factory', () => ({
  guideService: {
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  },
}));

describe('GuideController Context & CRUD Operations', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it('uses resolved admin guideUserContext when present', async () => {
    req = {
      user: {
        uid: 'admin-uid',
        email: 'admin@example.com',
        admin: true,
        emailVerified: true,
        authTime: 1700000000,
      },
      guideUserContext: {
        uid: 'admin-uid',
        email: 'admin@example.com',
        admin: true,
        role: 'admin',
      },
      body: {
        name: 'Mirante',
        description: 'Belo mirante com vista para o mar',
        category: 'sight',
        image: 'https://images.unsplash.com/photo-1',
        images: [],
        location: 'pipa',
      },
    };

    vi.mocked(guideService.createItem).mockResolvedValueOnce('item-1');

    await GuideController.createItem(req as AuthenticatedRequest, res);

    expect(guideService.createItem).toHaveBeenCalledWith(
      {
        uid: 'admin-uid',
        email: 'admin@example.com',
        admin: true,
        role: 'admin',
      },
      expect.objectContaining({ name: 'Mirante' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('uses resolved partner guideUserContext when present', async () => {
    req = {
      user: {
        uid: 'partner-uid',
        email: 'partner@example.com',
        admin: false,
        emailVerified: true,
        authTime: 1700000000,
      },
      guideUserContext: {
        uid: 'partner-uid',
        email: 'partner@example.com',
        admin: false,
        role: 'partner',
      },
      body: {
        name: 'Pousada Tropical',
        description: 'Excelente acomodação pertinho do centro',
        category: 'hotel',
        image: 'https://images.unsplash.com/photo-2',
        images: [],
        location: 'tibau-do-sul',
      },
    };

    vi.mocked(guideService.createItem).mockResolvedValueOnce('item-2');

    await GuideController.createItem(req as AuthenticatedRequest, res);

    expect(guideService.createItem).toHaveBeenCalledWith(
      {
        uid: 'partner-uid',
        email: 'partner@example.com',
        admin: false,
        role: 'partner',
      },
      expect.objectContaining({ name: 'Pousada Tropical' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('falls back cleanly if guideUserContext is not set', async () => {
    req = {
      user: {
        uid: 'client-uid',
        email: 'client@example.com',
        admin: false,
        emailVerified: true,
        authTime: 1700000000,
      },
      body: {
        name: 'Restaurante Sabor',
        description: 'Melhor gastronomia da região litorânea',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-3',
        images: [],
        location: 'pipa',
      },
    };

    vi.mocked(guideService.createItem).mockResolvedValueOnce('item-3');

    await GuideController.createItem(req as AuthenticatedRequest, res);

    expect(guideService.createItem).toHaveBeenCalledWith(
      {
        uid: 'client-uid',
        email: 'client@example.com',
        admin: false,
        role: 'user',
      },
      expect.objectContaining({ name: 'Restaurante Sabor' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
