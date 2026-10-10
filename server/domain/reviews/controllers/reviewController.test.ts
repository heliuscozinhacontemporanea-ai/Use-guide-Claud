import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewController } from './reviewController';

const mocks = vi.hoisted(() => ({
  reviewService: {
    submitReview: vi.fn(),
    respondToReview: vi.fn(),
  },
}));

vi.mock('../factory', () => ({
  reviewService: mocks.reviewService,
}));

function createMockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('ReviewController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitReview', () => {
    it('deve rejeitar requisição sem autenticação', async () => {
      const req: any = {
        body: { itemId: 'item-1', itemCollection: 'items', rating: 5, comment: 'Muito bom' },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Não autenticado' });
      expect(mocks.reviewService.submitReview).not.toHaveBeenCalled();
    });

    it('deve rejeitar payload sem itemId', async () => {
      const req: any = {
        user: { uid: 'user-123' },
        body: { itemCollection: 'items', rating: 5, comment: 'Muito bom' },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Erro de validação no payload da avaliação',
        })
      );
      expect(mocks.reviewService.submitReview).not.toHaveBeenCalled();
    });

    it('deve rejeitar nota menor que 1', async () => {
      const req: any = {
        user: { uid: 'user-123' },
        body: { itemId: 'item-1', itemCollection: 'items', rating: 0, comment: 'Muito bom' },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mocks.reviewService.submitReview).not.toHaveBeenCalled();
    });

    it('deve rejeitar nota maior que 5', async () => {
      const req: any = {
        user: { uid: 'user-123' },
        body: { itemId: 'item-1', itemCollection: 'items', rating: 6, comment: 'Muito bom' },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mocks.reviewService.submitReview).not.toHaveBeenCalled();
    });

    it('deve rejeitar nota decimal', async () => {
      const req: any = {
        user: { uid: 'user-123' },
        body: { itemId: 'item-1', itemCollection: 'items', rating: 4.5, comment: 'Muito bom' },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mocks.reviewService.submitReview).not.toHaveBeenCalled();
    });

    it('deve rejeitar comentário vazio', async () => {
      const req: any = {
        user: { uid: 'user-123' },
        body: { itemId: 'item-1', itemCollection: 'items', rating: 5, comment: '   ' },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mocks.reviewService.submitReview).not.toHaveBeenCalled();
    });

    it('não deve permitir que cliente escolha userId (impersonation)', async () => {
      const req: any = {
        user: { uid: 'real-user-id' },
        body: {
          itemId: 'item-1',
          itemCollection: 'items',
          rating: 5,
          comment: 'Muito bom',
          userId: 'attacker-target-id',
        },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mocks.reviewService.submitReview).not.toHaveBeenCalled();
    });

    it('deve processar com sucesso avaliação válida usando uid do token autenticado', async () => {
      mocks.reviewService.submitReview.mockResolvedValue('item-1__real-user-id');

      const req: any = {
        user: { uid: 'real-user-id' },
        body: {
          itemId: 'item-1',
          itemCollection: 'items',
          rating: 5,
          comment: 'Excelente atendimento!',
        },
      };
      const res = createMockResponse();

      await ReviewController.submitReview(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        id: 'item-1__real-user-id',
      });
      expect(mocks.reviewService.submitReview).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 'item-1',
          itemCollection: 'items',
          userId: 'real-user-id',
          rating: 5,
          comment: 'Excelente atendimento!',
        })
      );
    });
  });
});
