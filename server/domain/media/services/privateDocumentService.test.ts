import { describe, expect, it, vi } from 'vitest';
import type { ImageProcessorPort } from '../ports/imageProcessorPort';
import type { ObjectStoragePort } from '../ports/objectStoragePort';
import { PrivateDocumentService } from './privateDocumentService';

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const PDF = Buffer.from('%PDF-1.7\n1 0 obj\n');

function setup() {
  const processor: ImageProcessorPort = {
    process: vi.fn().mockResolvedValue({
      buffer: Buffer.from('webp-sem-exif'),
      contentType: 'image/webp',
      width: 10,
      height: 10,
    }),
  };
  const storage: ObjectStoragePort = {
    savePublic: vi.fn(),
    delete: vi.fn(),
    savePrivate: vi.fn(),
    readPrivate: vi.fn(),
  };
  return { service: new PrivateDocumentService(processor, storage), processor, storage };
}

describe('PrivateDocumentService (D12)', () => {
  it('foto vira WebP sem metadados, em pasta privada com nome do servidor', async () => {
    const { service, processor, storage } = setup();
    const stored = await service.storeVerificationFile({
      uid: 'u1',
      fileBase64: `data:image/jpeg;base64,${JPEG.toString('base64')}`,
    });
    expect(processor.process).toHaveBeenCalled();
    expect(stored.path).toMatch(/^verification\/u1\/[0-9a-f-]{36}\.webp$/);
    expect(storage.savePrivate).toHaveBeenCalledWith(
      stored.path,
      Buffer.from('webp-sem-exif'),
      'image/webp'
    );
    expect(storage.savePublic).not.toHaveBeenCalled();
  });

  it('PDF é guardado como PDF, sem reprocessar', async () => {
    const { service, processor, storage } = setup();
    const stored = await service.storeVerificationFile({
      uid: 'u1',
      fileBase64: PDF.toString('base64'),
    });
    expect(processor.process).not.toHaveBeenCalled();
    expect(stored.contentType).toBe('application/pdf');
    expect(storage.savePrivate).toHaveBeenCalledWith(stored.path, PDF, 'application/pdf');
  });

  it('recusa SVG e HTML pelo conteúdo', async () => {
    const { service } = setup();
    for (const text of ['<svg xmlns="http://www.w3.org/2000/svg"/>', '<html><script>x</script>']) {
      await expect(
        service.storeVerificationFile({
          uid: 'u1',
          fileBase64: Buffer.from(text).toString('base64'),
        })
      ).rejects.toMatchObject({ code: 'INVALID_DOCUMENT_FILE' });
    }
  });

  it('só aceita referência a arquivo da pasta do próprio dono', () => {
    const { service } = setup();
    expect(service.isOwnVerificationFile('u1', 'verification/u1/a.pdf')).toBe(true);
    expect(service.isOwnVerificationFile('u1', 'verification/u2/a.pdf')).toBe(false);
    expect(service.isOwnVerificationFile('u1', 'verification/u1/../u2/a.pdf')).toBe(false);
    expect(service.isOwnVerificationFile('u1', 'content/partners/u1/a.webp')).toBe(false);
  });

  it('não lê nem apaga fora da pasta de verificação', async () => {
    const { service, storage } = setup();
    expect(await service.readVerificationFile('profiles/u1')).toBeNull();
    await service.deleteVerificationFile('content/x.webp');
    expect(storage.readPrivate).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });
});
