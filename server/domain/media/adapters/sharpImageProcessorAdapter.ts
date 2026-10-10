import sharp from 'sharp';
import type { ImageProcessorPort, ProcessedImage } from '../ports/imageProcessorPort';

export class SharpImageProcessorAdapter implements ImageProcessorPort {
  async process(input: Buffer, options: { maxDimension: number }): Promise<ProcessedImage> {
    // O sharp descarta EXIF/XMP/ICC por padrão; rotate() aplica a orientação antes do descarte.
    const { data, info } = await sharp(input, { failOn: 'error', limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: options.maxDimension,
        height: options.maxDimension,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, contentType: 'image/webp', width: info.width, height: info.height };
  }
}
