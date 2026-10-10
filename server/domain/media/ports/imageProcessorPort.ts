export interface ProcessedImage {
  buffer: Buffer;
  contentType: 'image/webp';
  width: number;
  height: number;
}

export interface ImageProcessorPort {
  /** Aplica a orientação EXIF, redimensiona, converte para WebP e descarta todos os metadados. */
  process(input: Buffer, options: { maxDimension: number }): Promise<ProcessedImage>;
}
