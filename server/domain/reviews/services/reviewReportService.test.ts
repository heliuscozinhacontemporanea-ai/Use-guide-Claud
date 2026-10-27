import { describe, expect, it } from 'vitest';
import { InMemoryReviewReportAdapter } from '../adapters/inMemoryReviewReportAdapter';
import type { ReviewForReport } from '../types/reviewReport';
import { REVIEW_REPORTS_PER_DAY, ReviewReportService } from './reviewReportService';

const NOW = new Date('2026-10-27T12:00:00.000Z');
const REVIEW: ReviewForReport = {
  id: 'items_tamarindo_u1',
  userId: 'u1',
  itemId: 'tamarindo',
  itemCollection: 'items',
  rating: 2,
  comment: 'Demorou muito.',
  partnerResponse: 'Mentira sua, você nem veio.',
  responderId: 'partner-1',
};

function setup() {
  const repo = new InMemoryReviewReportAdapter();
  repo.reviews.set(REVIEW.id, REVIEW);
  return { repo, service: new ReviewReportService(repo, () => NOW) };
}

describe('denúncia de resposta (D19)', () => {
  it('o autor denuncia; prazo de 3 dias e cópia do que foi denunciado', async () => {
    const { repo, service } = setup();
    const mine = await service.report('u1', {
      reviewId: REVIEW.id,
      reason: 'offensive',
      details: ' ofensivo ',
    });
    expect(mine).toMatchObject({ status: 'open', decideBy: '2026-10-30T12:00:00.000Z' });
    const saved = repo.reports.get(mine.id);
    expect(saved).toMatchObject({
      reporterUid: 'u1',
      details: 'ofensivo',
      responseText: REVIEW.partnerResponse,
      placeName: 'Restaurante Tamarindo',
    });
  });

  it('outra pessoa, avaliação sem resposta ou inexistente são recusadas', async () => {
    const { repo, service } = setup();
    await expect(
      service.report('u2', { reviewId: REVIEW.id, reason: 'fraud' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    repo.reviews.set('r2', { ...REVIEW, id: 'r2', partnerResponse: '  ' });
    await expect(service.report('u1', { reviewId: 'r2', reason: 'fraud' })).rejects.toMatchObject({
      code: 'NO_RESPONSE_TO_REPORT',
    });
    await expect(service.report('u1', { reviewId: 'nada', reason: 'fraud' })).rejects.toMatchObject(
      { code: 'NOT_FOUND' }
    );
  });

  it('a mesma resposta só uma vez; resposta nova pode ser denunciada de novo', async () => {
    const { repo, service } = setup();
    await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    await expect(
      service.report('u1', { reviewId: REVIEW.id, reason: 'other' })
    ).rejects.toMatchObject({ code: 'ALREADY_REPORTED' });
    repo.reviews.set(REVIEW.id, { ...REVIEW, partnerResponse: 'Outra resposta ofensiva.' });
    await expect(
      service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' })
    ).resolves.toMatchObject({ status: 'open' });
  });

  it('limite de denúncias por dia', async () => {
    const { repo, service } = setup();
    for (let i = 0; i < REVIEW_REPORTS_PER_DAY; i += 1) {
      repo.reviews.set(`r${i}`, { ...REVIEW, id: `r${i}` });
      await service.report('u1', { reviewId: `r${i}`, reason: 'other' });
    }
    await expect(
      service.report('u1', { reviewId: REVIEW.id, reason: 'other' })
    ).rejects.toMatchObject({ code: 'REPORT_LIMIT_REACHED' });
  });

  it('aceita remove a resposta se ainda é a mesma; decidir de novo é recusado', async () => {
    const { repo, service } = setup();
    const mine = await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    const decided = await service.decide('admin-1', mine.id, 'upheld');
    expect(decided).toMatchObject({
      status: 'upheld',
      decidedBy: 'admin-1',
      responseRemoved: true,
    });
    expect(repo.reviews.get(REVIEW.id)?.partnerResponse).toBeNull();
    await expect(service.decide('admin-1', mine.id, 'dismissed')).rejects.toMatchObject({
      code: 'ALREADY_DECIDED',
    });
  });

  it('resposta trocada antes da decisão não é removida; recusada mantém a resposta', async () => {
    const { repo, service } = setup();
    const first = await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    repo.reviews.set(REVIEW.id, { ...REVIEW, partnerResponse: 'Pedimos desculpas.' });
    expect(await service.decide('admin-1', first.id, 'upheld')).toMatchObject({
      responseRemoved: false,
    });
    expect(repo.reviews.get(REVIEW.id)?.partnerResponse).toBe('Pedimos desculpas.');
    const second = await service.report('u1', { reviewId: REVIEW.id, reason: 'other' });
    expect(await service.decide('admin-1', second.id, 'dismissed')).toMatchObject({
      status: 'dismissed',
    });
    expect(repo.reviews.get(REVIEW.id)?.partnerResponse).toBe('Pedimos desculpas.');
  });

  it('exclusão de conta apaga as denúncias da pessoa', async () => {
    const { repo, service } = setup();
    await service.report('u1', { reviewId: REVIEW.id, reason: 'offensive' });
    await service.deleteByReporter('u1');
    expect(repo.reports.size).toBe(0);
  });
});
