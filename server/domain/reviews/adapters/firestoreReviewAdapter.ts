import { AggregateField, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { CreateReviewDTO } from '../dtos/CreateReviewDTO';
import { ReviewPort, SubmitReviewResult } from '../ports/reviewPort';
import { buildReviewId } from '../utils/buildReviewId';
import { getUserPublicProfileUseCase } from '../../users';
import {
  getResourceOwnerIdUseCase,
  getItemByIdUseCase,
  updateReviewAggregateUseCase,
} from '../../guide';
import { getEventListingByIdUseCase, updateEventRatingSummaryUseCase } from '../../events';

export class FirestoreReviewAdapter implements ReviewPort {
  async submitReviewAndRecalculateRating(dto: CreateReviewDTO): Promise<SubmitReviewResult> {
    const itemCollection = dto.itemCollection ?? 'items';
    let resourceOwnerId: string | null = null;
    if (itemCollection === 'events') {
      const eventListing = await getEventListingByIdUseCase(dto.itemId);
      resourceOwnerId = eventListing?.ownerId ?? null;
    } else {
      resourceOwnerId = await getResourceOwnerIdUseCase('items', dto.itemId);
    }

    if (resourceOwnerId && dto.userId === resourceOwnerId) {
      throw new Error('Parceiros não podem avaliar seus próprios estabelecimentos ou eventos');
    }

    let targetName = 'este estabelecimento';
    if (itemCollection === 'events') {
      const event = await getEventListingByIdUseCase(dto.itemId);
      if (!event) {
        throw new Error('Evento não encontrado');
      }
      targetName = event.title || event.name || 'este evento';
    } else {
      const item = await getItemByIdUseCase(dto.itemId);
      if (!item) {
        throw new Error('Estabelecimento não encontrado');
      }
      targetName = item.name || 'este estabelecimento';
    }

    const authorProfile = await getUserPublicProfileUseCase(dto.userId);
    const userName = authorProfile?.displayName || 'Visitante';
    const userPhoto = authorProfile?.photoURL || null;

    const reviewId = buildReviewId(itemCollection, dto.itemId, dto.userId, dto.occurrenceId);
    const reviewRef = adminDb.collection('reviews').doc(reviewId);

    const existingSnap = await reviewRef.get();
    const isUpdate = existingSnap.exists;
    const newRating = dto.rating;
    const isVerifiedAttendance = Boolean(dto.occurrenceId && dto.ticketId);

    if (isUpdate) {
      await reviewRef.update({
        rating: newRating,
        comment: dto.comment,
        userName,
        userPhoto,
        partnerId: resourceOwnerId ?? null,
        ...(dto.occurrenceId ? { occurrenceId: dto.occurrenceId } : {}),
        ...(dto.ticketId
          ? { ticketId: dto.ticketId, verifiedAttendance: isVerifiedAttendance }
          : {}),
        // Reserva já conferida no serviço; o ID dela não vai para a avaliação, que é pública (§7.5).
        ...(dto.bookingId ? { verifiedAttendance: true } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await reviewRef.set({
        itemId: dto.itemId,
        itemCollection,
        userId: dto.userId,
        userName,
        userPhoto,
        rating: newRating,
        comment: dto.comment,
        partnerId: resourceOwnerId ?? null,
        ...(dto.occurrenceId ? { occurrenceId: dto.occurrenceId } : {}),
        ...(dto.ticketId
          ? { ticketId: dto.ticketId, verifiedAttendance: isVerifiedAttendance }
          : {}),
        // Reserva já conferida no serviço; o ID dela não vai para a avaliação, que é pública (§7.5).
        ...(dto.bookingId ? { verifiedAttendance: true } : {}),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Recalcular agregação a partir da coleção reviews
    const allReviewsSnap = await adminDb
      .collection('reviews')
      .where('itemId', '==', dto.itemId)
      .where('itemCollection', '==', itemCollection)
      .get();

    let totalRating = 0;
    let reviewCount = 0;
    allReviewsSnap.forEach((doc) => {
      const r = doc.data();
      if (typeof r.rating === 'number' && Number.isFinite(r.rating)) {
        totalRating += r.rating;
        reviewCount += 1;
      }
    });

    const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;

    try {
      if (itemCollection === 'events') {
        await updateEventRatingSummaryUseCase(dto.itemId, {
          average: averageRating,
          count: reviewCount,
        });
      } else {
        await updateReviewAggregateUseCase('items', dto.itemId, averageRating, reviewCount);
      }
    } catch (err) {
      console.error(
        `[submitReviewAndRecalculateRating] Erro ao sincronizar agregação para ${itemCollection}/${dto.itemId}:`,
        err
      );
    }

    return {
      reviewId,
      isUpdate,
      itemId: dto.itemId,
      itemCollection,
      rating: dto.rating,
      target: {
        partnerId: resourceOwnerId ?? null,
        name: targetName,
      },
      author: {
        name: userName,
      },
    };
  }

  async respondToReview(
    reviewId: string,
    response: string,
    responderId: string,
    isAdmin = false
  ): Promise<void> {
    const reviewRef = adminDb.collection('reviews').doc(reviewId);

    const reviewSnap = await reviewRef.get();
    if (!reviewSnap.exists) {
      throw new Error('Avaliação não encontrada');
    }

    if (!isAdmin) {
      const reviewData = reviewSnap.data() ?? {};
      const itemId = typeof reviewData.itemId === 'string' ? reviewData.itemId.trim() : '';
      const itemCollection: 'items' | 'events' =
        reviewData.itemCollection === 'events' ? 'events' : 'items';

      if (!itemId) {
        throw new Error('Não autorizado a responder esta avaliação');
      }

      const resourceOwnerId =
        itemCollection === 'events'
          ? ((await getEventListingByIdUseCase(itemId))?.ownerId ?? null)
          : await getResourceOwnerIdUseCase('items', itemId);
      if (!resourceOwnerId || responderId !== resourceOwnerId) {
        throw new Error('Não autorizado a responder esta avaliação');
      }
    }

    await reviewRef.update({
      partnerResponse: response,
      respondedAt: FieldValue.serverTimestamp(),
      responderId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async deleteReview(reviewId: string, requesterId: string, isAdmin = false): Promise<void> {
    const reviewRef = adminDb.collection('reviews').doc(reviewId);
    const reviewSnap = await reviewRef.get();

    if (!reviewSnap.exists) {
      throw new Error('Avaliação não encontrada');
    }

    const reviewData = reviewSnap.data() ?? {};
    if (!isAdmin && reviewData.userId !== requesterId) {
      throw new Error('Não autorizado a excluir esta avaliação');
    }

    const itemId = typeof reviewData.itemId === 'string' ? reviewData.itemId.trim() : '';
    const itemCollection: 'items' | 'events' =
      reviewData.itemCollection === 'events' ? 'events' : 'items';

    await reviewRef.delete();

    if (itemId) {
      try {
        const remainingSnap = await adminDb
          .collection('reviews')
          .where('itemId', '==', itemId)
          .where('itemCollection', '==', itemCollection)
          .get();

        let totalRating = 0;
        let remainingCount = 0;
        remainingSnap.forEach((doc) => {
          const r = doc.data();
          if (typeof r.rating === 'number' && Number.isFinite(r.rating)) {
            totalRating += r.rating;
            remainingCount += 1;
          }
        });

        const newRating =
          remainingCount > 0 ? Number((totalRating / remainingCount).toFixed(1)) : 0;

        if (itemCollection === 'events') {
          await updateEventRatingSummaryUseCase(itemId, {
            average: newRating,
            count: remainingCount,
          });
        } else {
          await updateReviewAggregateUseCase('items', itemId, newRating, remainingCount);
        }
      } catch (err) {
        console.error(
          `[deleteReview] Erro ao recalcular aggregate para ${itemCollection}/${itemId}:`,
          err
        );
      }
    }
  }

  async deleteReviewsByUser(userId: string): Promise<void> {
    const reviewsSnap = await adminDb.collection('reviews').where('userId', '==', userId).get();
    if (reviewsSnap.empty) {
      return;
    }

    const affectedTargets = new Map<
      string,
      {
        itemId: string;
        itemCollection: 'items' | 'events';
        reviewIds: string[];
      }
    >();

    reviewsSnap.forEach((reviewDoc) => {
      const data = reviewDoc.data();
      const itemId = typeof data.itemId === 'string' ? data.itemId.trim() : '';
      if (!itemId) {
        return;
      }
      const itemCollection: 'items' | 'events' =
        data.itemCollection === 'events' ? 'events' : 'items';
      const key = `${itemCollection}:${itemId}`;
      const existing = affectedTargets.get(key);
      if (existing) {
        existing.reviewIds.push(reviewDoc.id);
        return;
      }
      affectedTargets.set(key, {
        itemId,
        itemCollection,
        reviewIds: [reviewDoc.id],
      });
    });

    // Deletar as reviews em batch
    const batch = adminDb.batch();
    reviewsSnap.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Recalcular as agregações
    for (const target of affectedTargets.values()) {
      try {
        const remainingSnap = await adminDb
          .collection('reviews')
          .where('itemId', '==', target.itemId)
          .where('itemCollection', '==', target.itemCollection)
          .get();

        let totalRating = 0;
        let remainingCount = 0;
        remainingSnap.forEach((doc) => {
          const r = doc.data();
          if (typeof r.rating === 'number' && Number.isFinite(r.rating)) {
            totalRating += r.rating;
            remainingCount += 1;
          }
        });

        const newRating =
          remainingCount > 0 ? Number((totalRating / remainingCount).toFixed(1)) : 0;

        if (target.itemCollection === 'events') {
          await updateEventRatingSummaryUseCase(target.itemId, {
            average: newRating,
            count: remainingCount,
          });
        } else {
          await updateReviewAggregateUseCase('items', target.itemId, newRating, remainingCount);
        }
      } catch (error) {
        console.error(
          `[deleteReviewsByUser] Erro ao recalcular aggregate para ${target.itemCollection}/${target.itemId}:`,
          error
        );
      }
    }
  }

  async getReviewsStats(): Promise<{ totalReviews: number; avgRating: number }> {
    const snapshot = await adminDb
      .collection('reviews')
      .aggregate({
        totalReviews: AggregateField.count(),
        avgRating: AggregateField.average('rating'),
      })
      .get();
    const { totalReviews, avgRating } = snapshot.data();
    return { totalReviews, avgRating: avgRating ?? 0 };
  }
}
