import { createHash } from 'node:crypto';

/**
 * Uma denúncia por resposta: o ID junta a avaliação e o hash do texto denunciado. Se o
 * estabelecimento trocar a resposta, a nova pode ser denunciada de novo.
 */
export function buildReviewReportId(reviewId: string, responseText: string): string {
  const hash = createHash('sha256').update(responseText.trim()).digest('hex').slice(0, 16);
  return `${reviewId}__${hash}`;
}
