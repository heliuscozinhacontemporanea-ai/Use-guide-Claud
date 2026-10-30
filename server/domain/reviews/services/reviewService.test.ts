import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReviewService } from './reviewService';
import type { ReviewPort, SubmitReviewResult } from '../ports/reviewPort';
import type { ReviewNotificationPort } from '../ports/reviewNotificationPort';
import { CreateReviewDTO } from '../dtos/CreateReviewDTO';

const ticketingMocks = vi.hoisted(() => ({
  getVerifiedAttendanceForReviewUseCase: vi.fn(),
}));

vi.mock('../../ticketing', () => ({
  getVerifiedAttendanceForReviewUseCase: ticketingMocks.getVerifiedAttendanceForReviewUseCase,
}));

const bookingMocks = vi.hoisted(() => ({ getVerifiedServiceForReviewUseCase: vi.fn() }));

vi.mock('../../bookings', () => ({
  getVerifiedServiceForReviewUseCase: bookingMocks.getVerifiedServiceForReviewUseCase,
}));

function createReviewPortMock(): ReviewPort {
  return {
    submitReviewAndRecalculateRating: vi.fn(),
    respondToReview: vi.fn(),
    deleteReview: vi.fn(),
    deleteReviewsByUser: vi.fn(),
    getReviewsStats: vi.fn(),
  };
}

function createReviewNotificationPortMock(): ReviewNotificationPort {
  return {
    notifyReviewReceived: vi.fn(),
  };
}

describe('ReviewService', () => {
  let reviewPort: ReviewPort;
  let notificationPort: ReviewNotificationPort;
  let service: ReviewService;

  beforeEach(() => {
    vi.clearAllMocks();

    reviewPort = createReviewPortMock();
    notificationPort = createReviewNotificationPortMock();

    service = new ReviewService(reviewPort, notificationPort);
  });

  describe('submitReview', () => {
    it('deve rejeitar quando itemId estiver vazio', async () => {
      const dto = {
        itemId: '',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 5,
        comment: 'Legal',
      } as CreateReviewDTO;

      await expect(service.submitReview(dto)).rejects.toThrow('ID do item avaliado é obrigatório');
    });

    it('deve rejeitar quando rating for menor que 1 ou maior que 5', async () => {
      const dtoLow = {
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 0,
        comment: 'Legal',
      } as CreateReviewDTO;

      const dtoHigh = {
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 6,
        comment: 'Legal',
      } as CreateReviewDTO;

      await expect(service.submitReview(dtoLow)).rejects.toThrow(
        'Nota de avaliação deve ser um número inteiro entre 1 e 5'
      );
      await expect(service.submitReview(dtoHigh)).rejects.toThrow(
        'Nota de avaliação deve ser um número inteiro entre 1 e 5'
      );
    });

    it('deve rejeitar quando comentário estiver ausente', async () => {
      const dto = {
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 5,
        comment: '',
      } as CreateReviewDTO;

      await expect(service.submitReview(dto)).rejects.toThrow('Comentário é obrigatório');
    });

    it('deve submeter e notificar quando houver parceiro vinculado', async () => {
      const mockResult: SubmitReviewResult = {
        reviewId: 'items__item-1__user-1',
        isUpdate: false,
        itemId: 'item-1',
        itemCollection: 'items',
        rating: 5,
        target: {
          partnerId: 'partner-1',
          name: 'Passeio Marítimo',
        },
        author: {
          name: 'Maria Silva',
        },
      };

      vi.mocked(reviewPort.submitReviewAndRecalculateRating).mockResolvedValue(mockResult);

      const dto = CreateReviewDTO.fromRaw({
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 5,
        comment: 'Excelente passeio!',
      });

      const reviewId = await service.submitReview(dto);

      expect(reviewId).toBe('items__item-1__user-1');
      expect(notificationPort.notifyReviewReceived).toHaveBeenCalledWith({
        recipientPartnerId: 'partner-1',
        itemName: 'Passeio Marítimo',
        userName: 'Maria Silva',
        rating: 5,
        itemId: 'item-1',
        itemCollection: 'items',
        isUpdate: false,
      });
    });

    it('deve submeter com isUpdate=true quando for atualização', async () => {
      const mockResult: SubmitReviewResult = {
        reviewId: 'items__item-1__user-1',
        isUpdate: true,
        itemId: 'item-1',
        itemCollection: 'items',
        rating: 4,
        target: {
          partnerId: 'partner-1',
          name: 'Passeio Marítimo',
        },
        author: {
          name: 'Maria Silva',
        },
      };

      vi.mocked(reviewPort.submitReviewAndRecalculateRating).mockResolvedValue(mockResult);

      const dto = CreateReviewDTO.fromRaw({
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 4,
        comment: 'Atualizando nota',
      });

      await service.submitReview(dto);

      expect(notificationPort.notifyReviewReceived).toHaveBeenCalledWith(
        expect.objectContaining({
          isUpdate: true,
          rating: 4,
        })
      );
    });

    it('não deve notificar quando partnerId for null', async () => {
      const mockResult: SubmitReviewResult = {
        reviewId: 'items__item-1__user-1',
        isUpdate: false,
        itemId: 'item-1',
        itemCollection: 'items',
        rating: 5,
        target: {
          partnerId: null,
          name: 'Ponto Turístico Público',
        },
        author: {
          name: 'Maria Silva',
        },
      };

      vi.mocked(reviewPort.submitReviewAndRecalculateRating).mockResolvedValue(mockResult);

      const dto = CreateReviewDTO.fromRaw({
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 5,
        comment: 'Excelente',
      });

      const reviewId = await service.submitReview(dto);

      expect(reviewId).toBe('items__item-1__user-1');
      expect(notificationPort.notifyReviewReceived).not.toHaveBeenCalled();
    });

    it('não deve quebrar submitReview se o envio da notificação falhar', async () => {
      const mockResult: SubmitReviewResult = {
        reviewId: 'items__item-1__user-1',
        isUpdate: false,
        itemId: 'item-1',
        itemCollection: 'items',
        rating: 5,
        target: {
          partnerId: 'partner-1',
          name: 'Passeio',
        },
        author: {
          name: 'Maria',
        },
      };

      vi.mocked(reviewPort.submitReviewAndRecalculateRating).mockResolvedValue(mockResult);
      vi.mocked(notificationPort.notifyReviewReceived).mockRejectedValue(
        new Error('Falha no serviço de notificação')
      );

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const dto = CreateReviewDTO.fromRaw({
        itemId: 'item-1',
        itemCollection: 'items',
        userId: 'user-1',
        rating: 5,
        comment: 'Excelente',
      });

      const reviewId = await service.submitReview(dto);

      expect(reviewId).toBe('items__item-1__user-1');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('deve rejeitar avaliação de evento legada sem occurrenceId e ticketId', async () => {
      const dto = CreateReviewDTO.fromRaw({
        itemId: 'event-123',
        itemCollection: 'events',
        userId: 'user-1',
        rating: 5,
        comment: 'Evento muito bom',
      });

      await expect(service.submitReview(dto)).rejects.toThrow(
        'Para avaliar um evento é obrigatório possuir ingresso com presença verificada'
      );
      expect(reviewPort.submitReviewAndRecalculateRating).not.toHaveBeenCalled();
    });

    it('deve permitir avaliação de evento quando a presença for verificada pelo Ticketing', async () => {
      ticketingMocks.getVerifiedAttendanceForReviewUseCase.mockResolvedValue({
        eligible: true,
        eventListingId: 'event-123',
        occurrenceId: 'occ-1',
        ticketId: 'tkt-1',
        checkedInAt: '2026-01-10T22:00:00.000Z',
      });

      vi.mocked(reviewPort.submitReviewAndRecalculateRating).mockResolvedValue({
        reviewId: 'events__event-123__occ-1__user-1',
        isUpdate: false,
        itemId: 'event-123',
        itemCollection: 'events',
        rating: 5,
        target: { partnerId: 'partner-1', name: 'Show de Verão' },
        author: { name: 'João' },
      });

      const dto = CreateReviewDTO.fromRaw({
        itemId: 'event-123',
        itemCollection: 'events',
        occurrenceId: 'occ-1',
        ticketId: 'tkt-1',
        userId: 'user-1',
        rating: 5,
        comment: 'Show espetacular!',
      });

      const reviewId = await service.submitReview(dto);
      expect(reviewId).toBe('events__event-123__occ-1__user-1');
      expect(ticketingMocks.getVerifiedAttendanceForReviewUseCase).toHaveBeenCalledWith({
        userId: 'user-1',
        occurrenceId: 'occ-1',
        ticketId: 'tkt-1',
      });
    });
  });

  describe('submitReview com reserva (D20)', () => {
    function bookingDto(itemId = 'item-1') {
      return CreateReviewDTO.fromRaw({
        itemId,
        itemCollection: 'items',
        bookingId: 'bk_1',
        userId: 'user-1',
        rating: 5,
        comment: 'Passeio incrível!',
      });
    }

    it('confere o serviço da reserva e grava a avaliação', async () => {
      bookingMocks.getVerifiedServiceForReviewUseCase.mockResolvedValue({ guideItemId: 'item-1' });
      vi.mocked(reviewPort.submitReviewAndRecalculateRating).mockResolvedValue({
        reviewId: 'items__item-1__user-1',
        isUpdate: false,
        itemId: 'item-1',
        itemCollection: 'items',
        rating: 5,
        target: { partnerId: null, name: 'Buggy' },
        author: { name: 'João' },
      });
      await expect(service.submitReview(bookingDto())).resolves.toBe('items__item-1__user-1');
      expect(bookingMocks.getVerifiedServiceForReviewUseCase).toHaveBeenCalledWith({
        userId: 'user-1',
        bookingId: 'bk_1',
      });
    });

    it('recusa reserva de outro item ou sem serviço comprovado', async () => {
      bookingMocks.getVerifiedServiceForReviewUseCase.mockResolvedValue({ guideItemId: 'item-2' });
      await expect(service.submitReview(bookingDto())).rejects.toThrow('não pertence');
      bookingMocks.getVerifiedServiceForReviewUseCase.mockRejectedValue(new Error('sem prova'));
      await expect(service.submitReview(bookingDto())).rejects.toThrow('sem prova');
      expect(reviewPort.submitReviewAndRecalculateRating).not.toHaveBeenCalled();
    });
  });

  describe('respondToReview', () => {
    it('deve rejeitar quando reviewId for vazio', async () => {
      await expect(service.respondToReview('', 'Obrigado!', 'partner-1')).rejects.toThrow(
        'ID da avaliação é obrigatório'
      );
    });

    it('deve rejeitar quando resposta for vazia', async () => {
      await expect(service.respondToReview('review-1', '   ', 'partner-1')).rejects.toThrow(
        'Conteúdo da resposta é obrigatório'
      );
    });

    it('deve chamar reviewPort com parâmetros normalizados', async () => {
      await service.respondToReview('review-1', '  Obrigado pelo feedback!  ', 'partner-1', false);

      expect(reviewPort.respondToReview).toHaveBeenCalledWith(
        'review-1',
        'Obrigado pelo feedback!',
        'partner-1',
        false
      );
    });
  });
});
