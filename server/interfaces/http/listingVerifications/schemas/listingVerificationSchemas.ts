import { z } from 'zod';

const FILE_ID = z.string().min(1).max(200);
const ITEM_ID = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[\w-]+$/);

export const ListingVerificationParamsSchema = z.object({ itemId: ITEM_ID }).strict();

export const VerificationFileParamsSchema = z
  .object({ itemId: ITEM_ID, kind: z.enum(['cnpjCard', 'identity', 'authorization']) })
  .strict();

export const SubmitListingVerificationSchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('document'),
      documentType: z.enum(['cpf', 'cnpj']),
      document: z.string().min(11).max(20),
      holderRole: z.enum(['owner', 'representative']).optional(),
      files: z
        .object({
          cnpjCard: FILE_ID.optional(),
          identity: FILE_ID.optional(),
          authorization: FILE_ID.optional(),
        })
        .strict()
        .optional(),
      cadastur: z.string().trim().max(30).nullable().optional(),
    })
    .strict(),
  z.object({ mode: z.literal('linked'), sourceItemId: ITEM_ID }).strict(),
]);

export const ReviewListingVerificationSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    reason: z.string().max(500).optional(),
  })
  .strict();

export const ListListingVerificationsQuerySchema = z
  .object({
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: ITEM_ID.optional(),
  })
  .strict();
