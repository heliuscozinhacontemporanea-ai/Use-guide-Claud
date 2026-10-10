import { describe, expect, it } from 'vitest';
import {
  createItemSchema,
  updateItemSchema,
} from './guideSchema';

describe('guideSchema - Validação de campos proibidos e strictness', () => {
  const validBaseItem = {
    name: 'Restaurante Teste',
    description: 'Descrição válida',
    category: 'restaurant' as const,
    image: 'https://exemplo.com/foto.jpg',
    images: ['https://exemplo.com/foto1.jpg'],
    location: 'Jericoacoara',
  };

  it('rejeita campo rating na criação de item', () => {
    const result = createItemSchema.safeParse({
      ...validBaseItem,
      rating: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita campo ownerId na criação de item', () => {
    const result = createItemSchema.safeParse({
      ...validBaseItem,
      ownerId: 'outro-user',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita campo isVerified na criação de item', () => {
    const result = createItemSchema.safeParse({
      ...validBaseItem,
      isVerified: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita campos proibidos no updateItemSchema', () => {
    expect(updateItemSchema.safeParse({ rating: 5 }).success).toBe(false);
    expect(updateItemSchema.safeParse({ ownerId: 'hacker' }).success).toBe(false);
    expect(updateItemSchema.safeParse({ isVerified: true }).success).toBe(false);
    expect(updateItemSchema.safeParse({ verifiedUntil: '2027-01-01' }).success).toBe(false);
  });

  it('aceita updateItem parcial sem exigir campos ausentes', () => {
    const result = updateItemSchema.safeParse({
      name: 'Novo Nome',
    });
    expect(result.success).toBe(true);
  });
});

