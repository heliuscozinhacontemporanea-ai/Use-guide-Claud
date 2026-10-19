export interface StoredObject {
  path: string;
  url: string;
}

export interface ObjectStoragePort {
  savePublic(path: string, data: Buffer, contentType: string): Promise<StoredObject>;
  delete(path: string): Promise<void>;
  /** Sem URL pública nem token: o arquivo só é lido pelo backend (documentos de verificação). */
  savePrivate(path: string, data: Buffer, contentType: string): Promise<void>;
  readPrivate(path: string): Promise<{ data: Buffer; contentType: string } | null>;
}
