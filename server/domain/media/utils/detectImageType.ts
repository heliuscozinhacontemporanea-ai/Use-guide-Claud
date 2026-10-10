export type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/webp';

export function detectImageType(buffer: Buffer): SupportedImageType | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  if (isRiff && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}
