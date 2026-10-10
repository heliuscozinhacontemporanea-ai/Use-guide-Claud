import { i18n } from '../../../shared/i18n';

const IMAGE_UPLOAD_ERROR_CODES = [
  'IMAGE_TOO_LARGE',
  'INVALID_IMAGE',
  'UPLOAD_FAILED',
  'STORAGE_UNAVAILABLE',
] as const;

type ImageUploadErrorCode = (typeof IMAGE_UPLOAD_ERROR_CODES)[number];

function isImageUploadErrorCode(value: string): value is ImageUploadErrorCode {
  return (IMAGE_UPLOAD_ERROR_CODES as readonly string[]).includes(value);
}

export function getImageUploadErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return i18n.t(`errors.media.${isImageUploadErrorCode(code) ? code : 'UPLOAD_FAILED'}`);
}
