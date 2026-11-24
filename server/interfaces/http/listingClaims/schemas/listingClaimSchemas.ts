import { z } from 'zod';

const FILE_ID = z.string().min(1).max(200);
const ID = z
  .string()
  .min(1)
  .max(260)
  .regex(/^[\w-]+$/);

export const ListingClaimItemParamsSchema = z.object({ itemId: ID }).strict();
export const ListingClaimParamsSchema = z.object({ claimId: ID }).strict();

export const ListingClaimFileParamsSchema = z
  .object({ claimId: ID, kind: z.enum(['cnpjCard', 'identity', 'authorization']) })
  .strict();

/** Os mesmos campos da verificação (D12, D35 4a); os Termos do parceiro, só para quem não é parceiro. */
export const SubmitListingClaimSchema = z
  .object({
    documentType: z.enum(['cpf', 'cnpj']),
    document: z.string().min(11).max(20),
    holderRole: z.enum(['owner', 'representative']),
    files: z
      .object({
        cnpjCard: FILE_ID.optional(),
        identity: FILE_ID.optional(),
        authorization: FILE_ID.optional(),
      })
      .strict(),
    cadastur: z.string().trim().max(30).nullable().optional(),
    termsAccepted: z.literal(true).optional(),
  })
  .strict();

export const ReviewListingClaimSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    reason: z.string().max(500).optional(),
  })
  .strict();

export const ListListingClaimsQuerySchema = z
  .object({
    status: z.enum(['pending', 'approved', 'rejected', 'returned']).default('pending'),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: ID.optional(),
  })
  .strict();
