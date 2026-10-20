import { z } from 'zod';
import { CONTENT_IMAGE_FOLDERS } from '../types/mediaTypes';

/** PDF ou foto de documento (D12); tipo conferido pelo conteúdo no service. */
export const UploadVerificationFileSchema = z
  .object({
    fileBase64: z.string().min(16).max(8_500_000),
  })
  .strict();

export const UploadContentImageSchema = z
  .object({
    imageBase64: z.string().min(16).max(8_500_000),
    folder: z.enum(CONTENT_IMAGE_FOLDERS),
  })
  .strict();
