import express from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetAuthTokenVerifier,
  setAuthTokenVerifier,
} from '../../../infrastructure/auth/authMiddleware';
import { GuideController } from '../controllers/guideController';
import { itemRouter } from './guideRoutes';

const mocks = vi.hoisted(() => ({
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

vi.mock('../../../infrastructure/auth/adapters/firebaseAuthTokenVerifier', () => ({
  defaultAuthTokenVerifier: {
    verifyToken: vi.fn(),
  },
}));

vi.mock('../factory', () => ({
  guideService: {
    createItem: mocks.createItem,
    updateItem: mocks.updateItem,
    deleteItem: mocks.deleteItem,
  },
}));

describe('guideRoutes admin-only security boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createItem.mockResolvedValue('item-1');
    mocks.updateItem.mockResolvedValue(undefined);
    mocks.deleteItem.mockResolvedValue(undefined);

    setAuthTokenVerifier({
      async verifyToken(token: string) {
        const authTime = Math.floor(Date.now() / 1000);
        if (token === 'admin-token') {
          return {
            uid: 'admin-uid',
            email: 'admin@useguide.com.br',
            admin: true,
            emailVerified: true,
            authTime,
          };
        }
        if (token === 'partner-token') {
          return {
            uid: 'partner-uid',
            email: 'partner@useguide.com.br',
            admin: false,
            emailVerified: true,
            authTime,
          };
        }
        if (token === 'user-token') {
          return {
            uid: 'user-uid',
            email: 'user@useguide.com.br',
            admin: false,
            emailVerified: true,
            authTime,
          };
        }
        throw new Error('Invalid token');
      },
    });
  });

  afterEach(() => {
    resetAuthTokenVerifier();
  });

  function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use('/api/items', itemRouter);
    return app;
  }

  async function sendRequest(
    method: 'POST' | 'PUT' | 'DELETE',
    path: string,
    token?: string,
    body?: Record<string, unknown>
  ): Promise<{ status: number; body: Record<string, unknown> }> {
    const app = createTestApp();
    const server = app.listen(0);
    try {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Failed to start test server');
      }
      const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = (await response.json()) as Record<string, unknown>;
      return { status: response.status, body: json };
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  const validItemPayload = {
    name: 'Dica Jeri',
    description: 'Dica editorial',
    category: 'tips',
    image: 'https://useguide.com.br/img.jpg',
    images: ['https://useguide.com.br/img.jpg'],
    location: 'Jericoacoara',
  };

  it.each(['POST', 'PUT', 'DELETE'] as const)(
    'retorna 401 para requisição anônima em %s /api/items',
    async (method) => {
      const itemPath = method === 'POST' ? '/api/items' : '/api/items/item-1';
      const itemRes = await sendRequest(method, itemPath, undefined, validItemPayload);

      expect(itemRes.status).toBe(401);
    }
  );

  it.each(['POST', 'PUT', 'DELETE'] as const)(
    'retorna 403 para usuário comum em %s /api/items',
    async (method) => {
      const itemPath = method === 'POST' ? '/api/items' : '/api/items/item-1';
      const itemRes = await sendRequest(method, itemPath, 'user-token', validItemPayload);

      expect(itemRes.status).toBe(403);
    }
  );

  it.each(['POST', 'PUT', 'DELETE'] as const)(
    'retorna 403 para partner tentando usar rota genérica %s /api/items',
    async (method) => {
      const itemPath = method === 'POST' ? '/api/items' : '/api/items/item-1';
      const itemRes = await sendRequest(method, itemPath, 'partner-token', validItemPayload);

      expect(itemRes.status).toBe(403);
      expect(mocks.createItem).not.toHaveBeenCalled();
    }
  );

  it('permite admin em POST, PUT e DELETE de /api/items', async () => {
    expect(GuideController).toBeDefined();

    const createItemRes = await sendRequest('POST', '/api/items', 'admin-token', validItemPayload);
    expect(createItemRes.status).toBe(201);

    const updateItemRes = await sendRequest(
      'PUT',
      '/api/items/item-1',
      'admin-token',
      validItemPayload
    );
    expect(updateItemRes.status).toBe(200);

    const deleteItemRes = await sendRequest('DELETE', '/api/items/item-1', 'admin-token');
    expect(deleteItemRes.status).toBe(200);
  });
});

