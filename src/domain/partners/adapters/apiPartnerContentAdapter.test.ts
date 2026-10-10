import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { ApiPartnerContentAdapter } from './apiPartnerContentAdapter';

vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: vi.fn(),
}));

describe('ApiPartnerContentAdapter', () => {
  let adapter: ApiPartnerContentAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new ApiPartnerContentAdapter();
  });

  describe('deleteItem / deleteEvent (DELETE 204)', () => {
    it('deve resolver Promise<void> com sucesso quando DELETE retornar status 204', async () => {
      vi.mocked(firebaseApiFetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: vi.fn().mockResolvedValue(null),
      } as unknown as Response);

      await expect(adapter.deleteItem('item-123')).resolves.toBeUndefined();

      expect(firebaseApiFetch).toHaveBeenCalledWith(
        '/api/partners/items/item-123',
        { method: 'DELETE' },
        { requireAuth: true, requireAppCheck: true }
      );
    });

    it('deve resolver Promise<void> com sucesso para deleteEvent com status 204', async () => {
      vi.mocked(firebaseApiFetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: vi.fn().mockResolvedValue(null),
      } as unknown as Response);

      await expect(adapter.deleteEvent('event-456')).resolves.toBeUndefined();

      expect(firebaseApiFetch).toHaveBeenCalledWith(
        '/api/partners/events/event-456',
        { method: 'DELETE' },
        { requireAuth: true, requireAppCheck: true }
      );
    });
  });

  const mockItemInput = {
    name: 'Novo Restaurante',
    category: 'restaurant' as const,
    description: 'Descrição do restaurante',
    image: 'https://example.com/img1.jpg',
    images: ['https://example.com/img1.jpg'],
    location: 'jeri',
  };

  describe('createItem', () => {
    it('deve retornar id quando POST create item responder com id válido', async () => {
      vi.mocked(firebaseApiFetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue({ id: 'new-item-789' }),
      } as unknown as Response);

      const result = await adapter.createItem(mockItemInput);

      expect(result).toBe('new-item-789');
    });

    it('deve lançar erro quando POST create item responder sem id', async () => {
      vi.mocked(firebaseApiFetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response);

      await expect(adapter.createItem(mockItemInput)).rejects.toThrow(
        'Resposta inválida da API ao criar item do parceiro.'
      );
    });

    it('deve lançar erro com a mensagem do backend quando a resposta não for ok', async () => {
      vi.mocked(firebaseApiFetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: 'Validação inválida' }),
      } as unknown as Response);

      await expect(adapter.createItem(mockItemInput)).rejects.toThrow('Validação inválida');
    });
  });
});
