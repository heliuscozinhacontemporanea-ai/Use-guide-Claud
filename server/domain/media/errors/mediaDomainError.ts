export type MediaErrorCode =
  | 'INVALID_IMAGE'
  | 'IMAGE_TOO_LARGE'
  | 'INVALID_DOCUMENT_FILE'
  | 'STORAGE_UNAVAILABLE';

export class MediaDomainError extends Error {
  constructor(
    public readonly code: MediaErrorCode,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'MediaDomainError';
  }
}
