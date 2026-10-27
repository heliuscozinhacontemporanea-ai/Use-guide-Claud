import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { getEventListingByIdUseCase } from '../../events';
import { getItemByIdUseCase } from '../../guide';
import type { ReviewReportRepositoryPort } from '../ports/reviewReportPort';
import type { ReviewForReport, ReviewReport } from '../types/reviewReport';

const REPORTS = 'reviewReports';
const REVIEWS = 'reviews';
const DELETE_BATCH = 400;

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestoreReviewReportAdapter implements ReviewReportRepositoryPort {
  async getReview(reviewId: string): Promise<ReviewForReport | null> {
    const snapshot = await adminDb.collection(REVIEWS).doc(reviewId).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data() ?? {};
    return {
      id: snapshot.id,
      userId: String(data.userId ?? ''),
      itemId: String(data.itemId ?? ''),
      itemCollection: data.itemCollection === 'events' ? 'events' : 'items',
      rating: typeof data.rating === 'number' ? data.rating : 0,
      comment: typeof data.comment === 'string' ? data.comment : '',
      partnerResponse: typeof data.partnerResponse === 'string' ? data.partnerResponse : null,
      responderId: typeof data.responderId === 'string' ? data.responderId : null,
    };
  }

  async placeNameOf(itemId: string, itemCollection: 'items' | 'events'): Promise<string | null> {
    if (itemCollection === 'events') {
      const event = await getEventListingByIdUseCase(itemId);
      return event?.title || event?.name || null;
    }
    return (await getItemByIdUseCase(itemId))?.name || null;
  }

  async countByReporterSince(reporterUid: string, sinceIso: string): Promise<number> {
    const snapshot = await adminDb
      .collection(REPORTS)
      .where('reporterUid', '==', reporterUid)
      .where('createdAt', '>=', sinceIso)
      .count()
      .get();
    return snapshot.data().count;
  }

  async createIfAbsent(report: ReviewReport): Promise<{ report: ReviewReport; created: boolean }> {
    const ref = adminDb.collection(REPORTS).doc(report.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return { report: snapshot.data() as ReviewReport, created: false };
      tx.set(ref, report);
      return { report, created: true };
    });
  }

  async listByReporter(reporterUid: string, limit: number): Promise<ReviewReport[]> {
    const snapshot = await adminDb
      .collection(REPORTS)
      .where('reporterUid', '==', reporterUid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as ReviewReport);
  }

  async listOpen(limit: number, cursor?: string): Promise<ReviewReport[]> {
    let query = adminDb
      .collection(REPORTS)
      .where('status', '==', 'open')
      .orderBy('createdAt', 'asc')
      .limit(limit);
    if (cursor) {
      const last = await adminDb.collection(REPORTS).doc(cursor).get();
      if (last.exists) query = query.startAfter(last);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as ReviewReport);
  }

  async decide(
    id: string,
    change: (current: ReviewReport) => ReviewReport,
    removeResponse: boolean
  ): Promise<ReviewReport | null> {
    const ref = adminDb.collection(REPORTS).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as ReviewReport;
      const reviewRef = adminDb.collection(REVIEWS).doc(current.reviewId);
      const review = removeResponse ? await tx.get(reviewRef) : null;
      const next = change(current);
      // Só remove se a resposta ainda é a denunciada: uma resposta nova não passou pela análise.
      const sameResponse =
        review?.exists === true &&
        typeof review.data()?.partnerResponse === 'string' &&
        String(review.data()?.partnerResponse).trim() === current.responseText;
      if (sameResponse) {
        tx.update(reviewRef, {
          partnerResponse: FieldValue.delete(),
          respondedAt: FieldValue.delete(),
          responderId: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      const saved = removeResponse ? { ...next, responseRemoved: sameResponse } : next;
      tx.set(ref, saved);
      return saved;
    });
  }

  async deleteByReporter(reporterUid: string): Promise<void> {
    for (;;) {
      const snapshot = await adminDb
        .collection(REPORTS)
        .where('reporterUid', '==', reporterUid)
        .limit(DELETE_BATCH)
        .get();
      if (snapshot.empty) return;
      const batch = adminDb.batch();
      for (const doc of snapshot.docs) batch.delete(doc.ref);
      await batch.commit();
    }
  }
}
