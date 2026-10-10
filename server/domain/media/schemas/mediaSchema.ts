import { z } from 'zod';
import { CONTENT_IMAGE_FOLDERS } from '../types/mediaTypes';

export const UploadContentImageSchema = z
  .object({
    imageBase64: z.string().min(16).max(8_500_000),
    folder: z.enum(CONTENT_IMAGE_FOLDERS),
  })
  .strict();
