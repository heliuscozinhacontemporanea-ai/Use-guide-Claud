import {
  getDocumentUseCase,
  queryDocumentsPageUseCase,
  queryDocumentsUseCase,
  subscribeToCollectionUseCase,
  type DatabaseCursor,
  type DatabaseOrderClause,
  type DatabasePage,
} from '../../database';
import { ReviewPort } from '../ports/reviewPort';
import { FirestoreReview, ReviewSortOption } from '../types/review';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { buildReviewId } from '../utils/buildReviewId';

function getOrderClauses(sortBy: ReviewSortOption): DatabaseOrderClause[] {
  switch (sortBy) {
    case 'highest':
      return [
        { field: 'rating', direction: 'desc' },
        { field: 'createdAt', direction: 'desc' },
      ];
    case 'lowest':
      return [
        { field: 'rating', direction: 'asc' },
        { field: 'createdAt', direction: 'desc' },
      ];
    default:
      return [{ field: 'createdAt', direction: 'desc' }];
  }
}

export class FirestoreReviewAdapter implements ReviewPort {
  async getReviews(
    itemId: string,
    itemCollection: 'items' | 'events',
    limitCount: number,
    sortBy: ReviewSortOption,
    cursor?: DatabaseCursor | null
  ): Promise<DatabasePage<FirestoreReview>> {
    const orderClauses = getOrderClauses(sortBy);
    return queryDocumentsPageUseCase<FirestoreReview>(
      'reviews',
      [
        {
          field: 'itemId',
          op: '==',
          value: itemId,
        },
        {
          field: 'itemCollection',
          op: '==',
          value: itemCollection,
        },
      ],
      orderClauses,
      limitCount,
      cursor
    );
  }

  subscribeToReviews(
    itemId: string,
    itemCollection: 'items' | 'events',
    limitCount: number,
    sortBy: ReviewSortOption,
    onUpdate: (reviews: FirestoreReview[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const orderClauses = getOrderClauses(sortBy);
    return subscribeToCollectionUseCase<FirestoreReview>(
      'reviews',
      onUpdate,
      onError,
      [
        {
          field: 'itemId',
          op: '==',
          value: itemId,
        },
        {
          field: 'itemCollection',
          op: '==',
          value: itemCollection,
        },
      ],
      orderClauses,
      limitCount
    );
  }

  async getUserReview(
    itemId: string,
    itemCollection: 'items' | 'events',
    userId: string,
    occurrenceId?: string
  ): Promise<FirestoreReview | null> {
    const deterministicId = buildReviewId(itemCollection, itemId, userId, occurrenceId);
    return getDocumentUseCase<FirestoreReview>('reviews', deterministicId);
  }

  async getAllReviews(): Promise<FirestoreReview[]> {
    return queryDocumentsUseCase<FirestoreReview>('reviews');
  }

  async submitReview(
    itemId: string,
    itemCollection: 'items' | 'events',
    rating: number,
    comment: string,
    options?: { occurrenceId?: string; ticketId?: string }
  ): Promise<void> {
    const response = await firebaseApiFetch(
      '/api/reviews',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          itemCollection,
          rating,
          comment,
          ...(options?.occurrenceId ? { occurrenceId: options.occurrenceId } : {}),
          ...(options?.ticketId ? { ticketId: options.ticketId } : {}),
        }),
      },
      { requireAuth: true }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Erro ao enviar avaliação no servidor');
    }
  }

  async respondToReview(reviewId: string, partnerResponse: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/reviews/${encodeURIComponent(reviewId)}/respond`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: partnerResponse,
        }),
      },
      { requireAuth: true }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Erro ao registrar resposta no servidor');
    }
  }

  async listUserReviews(
    userId: string,
    limitCount: number,
    cursor?: DatabaseCursor | null
  ): Promise<DatabasePage<FirestoreReview>> {
    return queryDocumentsPageUseCase<FirestoreReview>(
      'reviews',
      [{ field: 'userId', op: '==', value: userId }],
      [{ field: 'createdAt', direction: 'desc' }],
      limitCount,
      cursor
    );
  }

  async deleteReview(reviewId: string): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/reviews/${encodeURIComponent(reviewId)}`,
      {
        method: 'DELETE',
      },
      { requireAuth: true }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Erro ao excluir avaliação no servidor');
    }
  }
}
