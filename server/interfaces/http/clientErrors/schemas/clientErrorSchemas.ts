import { z } from 'zod';

/** Erro que o app manda (AGENTS.md §7.3): só os campos esperados, com tamanho máximo. */
export const clientErrorSchema = z
  .object({
    kind: z.enum(['error', 'unhandledrejection', 'react']),
    name: z.string().trim().min(1).max(100),
    message: z.string().max(500),
    stack: z.string().max(4000).optional(),
    componentStack: z.string().max(2000).optional(),
    route: z.string().min(1).max(200).startsWith('/'),
  })
  .strict();
