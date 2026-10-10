import { describe, expect, it, vi } from 'vitest';
import { MediaDomainError } from '../errors/mediaDomainError';
import type { ImageProcessorPort } from '../ports/imageProcessorPort';
import type { ObjectStoragePort } from '../ports/objectStoragePort';
import { MediaService } from './mediaService';

const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

function createService() {
  const processor: ImageProcessorPort = {
    process: vi.fn().mockResolvedValue({
      buffer: Buffer.from('webp'),
      contentType: 'image/webp',
      width: 100,
      height: 100,
    }),
  };
  const storage: ObjectStoragePort = {
    savePublic: vi.fn(async (path: string) => ({ path, url: `https://cdn.test/${path}` })),
    delete: vi.fn(),
  };
  return { service: new MediaService(processor, storage), processor, storage };
}

describe('MediaService', () => {
  it('recusa imagem acima de 6 MB com IMAGE_TOO_LARGE', async () => {
    const { service } = createService();
    const big = Buffer.alloc(6 * 1024 * 1024 + 1);
    JPEG_HEADER.copy(big);
    await expect(
      service.uploadContentImage({ uid: 'u1', folder: 'guia_local', imageBase64: big.toString('base64') })
    ).rejects.toMatchObject({ code: 'IMAGE_TOO_LARGE', statusCode: 413 });
  });

  it('recusa GIF e SVG com INVALID_IMAGE (validação pelo conteúdo, não pela extensão)', () => {
    const { service } = createService();
    const gif = Buffer.from('GIF89a-xxxxxxxx').toString('base64');
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>').toString('base64');
    expect(() => service.decodeBase64Image(gif)).toThrow(MediaDomainError);
    expect(() => service.decodeBase64Image(`data:image/png;base64,${svg}`)).toThrow(MediaDomainError);
  });

  it('processa e grava em content/<pasta>/<uid>/<uuid>.webp', async () => {
    const { service, processor, storage } = createService();
    const stored = await service.uploadContentImage({
      uid: 'u1',
      folder: 'guia_local',
      imageBase64: `data:image/jpeg;base64,${JPEG_HEADER.toString('base64')}`,
    });
    expect(processor.process).toHaveBeenCalledWith(expect.any(Buffer), { maxDimension: 2048 });
    expect(stored.path).toMatch(/^content\/guia_local\/u1\/[0-9a-f-]{36}\.webp$/);
    expect(storage.savePublic).toHaveBeenCalledWith(stored.path, Buffer.from('webp'), 'image/webp');
  });

  it('converte falha do processador em INVALID_IMAGE', async () => {
    const { service, processor } = createService();
    vi.mocked(processor.process).mockRejectedValueOnce(new Error('corrupt'));
    await expect(service.processImage(JPEG_HEADER, 1024)).rejects.toMatchObject({ code: 'INVALID_IMAGE' });
  });

  it('converte falha do storage em STORAGE_UNAVAILABLE', async () => {
    const { service, storage } = createService();
    vi.mocked(storage.savePublic).mockRejectedValueOnce(new Error('quota'));
    await expect(
      service.uploadContentImage({ uid: 'u1', folder: 'partners', imageBase64: JPEG_HEADER.toString('base64') })
    ).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE', statusCode: 503 });
  });
});
