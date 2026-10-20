import { randomUUID } from 'crypto';
import { MediaDomainError } from '../errors/mediaDomainError';
import type { ImageProcessorPort } from '../ports/imageProcessorPort';
import type { ObjectStoragePort } from '../ports/objectStoragePort';
import { MAX_IMAGE_BYTES, VERIFICATION_FILES_PREFIX } from '../types/mediaTypes';
import { detectDocumentType } from '../utils/detectDocumentType';

const MAX_DOCUMENT_DIMENSION = 2400;

export interface StoredPrivateDocument {
  path: string;
  contentType: string;
}

/** Documentos de verificação (D12): pasta privada, nome gerado pelo servidor, fotos sem metadados (EXIF/GPS). */
export class PrivateDocumentService {
  constructor(
    private readonly processor: ImageProcessorPort,
    private readonly storage: ObjectStoragePort
  ) {}

  async storeVerificationFile(params: {
    uid: string;
    fileBase64: string;
  }): Promise<StoredPrivateDocument> {
    const clean = params.fileBase64.replace(/^data:[a-z/+.-]+;base64,/i, '');
    const buffer = Buffer.from(clean, 'base64');
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new MediaDomainError('IMAGE_TOO_LARGE', 'Arquivo acima de 6 MB.', 413);
    }
    const type = detectDocumentType(buffer);
    if (!type) {
      throw new MediaDomainError(
        'INVALID_DOCUMENT_FILE',
        'Envie um PDF ou uma foto JPEG, PNG ou WebP.',
        400
      );
    }

    let data: Buffer = buffer;
    let contentType: string = type;
    if (type !== 'application/pdf') {
      try {
        const processed = await this.processor.process(buffer, {
          maxDimension: MAX_DOCUMENT_DIMENSION,
        });
        data = processed.buffer;
        contentType = processed.contentType;
      } catch {
        throw new MediaDomainError('INVALID_DOCUMENT_FILE', 'Não foi possível ler a foto.', 400);
      }
    }

    const extension = contentType === 'application/pdf' ? 'pdf' : 'webp';
    const path = `${VERIFICATION_FILES_PREFIX}/${params.uid}/${randomUUID()}.${extension}`;
    try {
      await this.storage.savePrivate(path, data, contentType);
    } catch {
      throw new MediaDomainError('STORAGE_UNAVAILABLE', 'Falha ao salvar o arquivo.', 503);
    }
    return { path, contentType };
  }

  /** Só caminhos da pasta privada do próprio dono; impede referenciar o arquivo de outra conta. */
  isOwnVerificationFile(uid: string, path: string): boolean {
    return (
      path.startsWith(`${VERIFICATION_FILES_PREFIX}/${uid}/`) &&
      !path.includes('..') &&
      /^[\w/.-]+$/.test(path)
    );
  }

  readVerificationFile(path: string): Promise<{ data: Buffer; contentType: string } | null> {
    if (!path.startsWith(`${VERIFICATION_FILES_PREFIX}/`)) return Promise.resolve(null);
    return this.storage.readPrivate(path);
  }

  async deleteVerificationFile(path: string): Promise<void> {
    if (!path.startsWith(`${VERIFICATION_FILES_PREFIX}/`)) return;
    await this.storage.delete(path);
  }
}
