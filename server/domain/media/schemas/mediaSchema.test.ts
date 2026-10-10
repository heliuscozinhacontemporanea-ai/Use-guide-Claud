import { describe, expect, it } from 'vitest';
import { UploadContentImageSchema } from './mediaSchema';

const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

describe('UploadContentImageSchema', () => {
  it('aceita pasta permitida', () => {
    expect(UploadContentImageSchema.safeParse({ imageBase64, folder: 'guia_local' }).success).toBe(true);
  });

  it('recusa pasta fora da lista', () => {
    expect(UploadContentImageSchema.safeParse({ imageBase64, folder: '../profiles' }).success).toBe(false);
  });

  it('recusa campo extra (allowlist)', () => {
    expect(
      UploadContentImageSchema.safeParse({ imageBase64, folder: 'partners', ownerId: 'outro' }).success
    ).toBe(false);
  });
});
