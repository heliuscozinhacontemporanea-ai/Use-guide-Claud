import { describe, expect, it } from 'vitest';
import { buildReviewId } from './buildReviewId';

describe('buildReviewId', () => {
  it('deve gerar ID determinístico para a mesma coleção, item e usuário', () => {
    const first = buildReviewId('items', 'item-1', 'Pe3yiZ2oG421JIwcwhO6');
    const second = buildReviewId('items', 'item-1', 'Pe3yiZ2oG421JIwcwhO6');
    expect(first).toBe(second);
  });

  it('deve gerar IDs diferentes para usuários diferentes', () => {
    expect(buildReviewId('items', 'item-1', 'user-1')).not.toBe(
      buildReviewId('items', 'item-1', 'user-2')
    );
  });

  it('deve gerar IDs diferentes para itens diferentes', () => {
    expect(buildReviewId('items', 'item-1', 'user-1')).not.toBe(
      buildReviewId('items', 'item-2', 'user-1')
    );
  });

  it('deve gerar IDs diferentes para coleções diferentes', () => {
    expect(buildReviewId('items', 'item-1', 'user-1')).not.toBe(
      buildReviewId('events', 'item-1', 'user-1')
    );
  });

  it('deve codificar caracteres reservados do identificador', () => {
    expect(buildReviewId('items', 'item/123', 'user/456')).toBe('items__item%2F123__user%2F456');
  });
});
