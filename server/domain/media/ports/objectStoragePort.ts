export interface StoredObject {
  path: string;
  url: string;
}

export interface ObjectStoragePort {
  savePublic(path: string, data: Buffer, contentType: string): Promise<StoredObject>;
  delete(path: string): Promise<void>;
}
