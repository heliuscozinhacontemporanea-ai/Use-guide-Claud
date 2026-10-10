import { describe, expect, it } from 'vitest';
import {
  reviewItemCollectionSchema,
  submitReviewSchema,
  respondReviewSchema,
} from './reviewSchema';
import { buildReviewId } from '../utils/buildReviewId';

describe('reviewSchema', () => {
  describe('reviewItemCollectionSchema', () => {
    it('deve aceitar coleções válidas', () => {
      expect(reviewItemCollectionSchema.safeParse('items').success).toBe(true);
      expect(reviewItemCollectionSchema.safeParse('events').success).toBe(true);
    });

    it('deve rejeitar coleções inválidas', () => {
      expect(reviewItemCollectionSchema.safeParse('other').success).toBe(false);
      expect(reviewItemCollectionSchema.safeParse('').success).toBe(false);
    });
  });

  describe('submitReviewSchema', () => {
    it('deve validar payload correto', () => {
      const result = submitReviewSchema.safeParse({
        itemId: 'item-123',
        itemCollection: 'items',
        rating: 5,
        comment: 'Excelente experiência!',
      });
      expect(result.success).toBe(true);
    });

    it('deve validar payload correto para evento', () => {
      const result = submitReviewSchema.safeParse({
        itemId: 'event-456',
        itemCollection: 'events',
        rating: 4,
        comment: 'Ótimo evento!',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar payload sem itemCollection', () => {
      const result = submitReviewSchema.safeParse({
        itemId: 'item-123',
        rating: 5,
        comment: 'Muito bom',
      });
      expect(result.success).toBe(false);
    });

    it('deve rejeitar rating fracionado', () => {
      const result = submitReviewSchema.safeParse({
        itemId: 'item-123',
        itemCollection: 'items',
        rating: 4.5,
        comment: 'Muito bom',
      });
      expect(result.success).toBe(false);
    });

    it('deve rejeitar rating fora do intervalo de 1 a 5', () => {
      expect(
        submitReviewSchema.safeParse({
          itemId: 'item-123',
          itemCollection: 'items',
          rating: 0,
          comment: 'Muito bom',
        }).success
      ).toBe(false);

      expect(
        submitReviewSchema.safeParse({
          itemId: 'item-123',
          itemCollection: 'items',
          rating: 6,
          comment: 'Muito bom',
        }).success
      ).toBe(false);
    });

    it('deve rejeitar comentário vazio', () => {
      const result = submitReviewSchema.safeParse({
        itemId: 'item-123',
        itemCollection: 'items',
        rating: 5,
        comment: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('deve rejeitar campos extras (strict)', () => {
      const result = submitReviewSchema.safeParse({
        itemId: 'item-123',
        itemCollection: 'items',
        rating: 5,
        comment: 'Bom',
        extraField: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('respondReviewSchema', () => {
    it('deve aceitar resposta válida', () => {
      const result = respondReviewSchema.safeParse({
        response: 'Obrigado pelo feedback!',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar resposta vazia', () => {
      const result = respondReviewSchema.safeParse({
        response: '   ',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('buildReviewId', () => {
    it('deve gerar IDs diferentes para collections diferentes com mesmo itemId e userId', () => {
      expect(buildReviewId('items', 'same-id', 'same-user')).not.toBe(
        buildReviewId('events', 'same-id', 'same-user')
      );
    });
  });
});
