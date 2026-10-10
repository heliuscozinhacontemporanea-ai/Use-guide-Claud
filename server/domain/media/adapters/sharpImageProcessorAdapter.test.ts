import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { SharpImageProcessorAdapter } from './sharpImageProcessorAdapter';

describe('SharpImageProcessorAdapter', () => {
  it('converte para WebP, limita a dimensão e remove EXIF', async () => {
    const input = await sharp({
      create: { width: 3000, height: 1500, channels: 3, background: '#2dd4bf' },
    })
      .withExif({ IFD0: { Copyright: 'teste', Artist: 'gps-simulado' } })
      .jpeg()
      .toBuffer();
    expect((await sharp(input).metadata()).exif).toBeDefined();

    const output = await new SharpImageProcessorAdapter().process(input, { maxDimension: 2048 });
    const metadata = await sharp(output.buffer).metadata();

    expect(output.contentType).toBe('image/webp');
    expect(metadata.format).toBe('webp');
    expect(metadata.exif).toBeUndefined();
    expect(Math.max(output.width, output.height)).toBe(2048);
  });

  it('não amplia imagens menores que o limite', async () => {
    const input = await sharp({
      create: { width: 400, height: 300, channels: 3, background: '#000000' },
    })
      .png()
      .toBuffer();
    const output = await new SharpImageProcessorAdapter().process(input, { maxDimension: 2048 });
    expect(output.width).toBe(400);
    expect(output.height).toBe(300);
  });
});
