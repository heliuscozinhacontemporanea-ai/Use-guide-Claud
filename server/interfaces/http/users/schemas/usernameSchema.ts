import { z } from 'zod';

/** Formato fino fica no serviço (normalizeUsername); aqui só tamanho e campos permitidos. */
export const usernameSchema = z.object({ username: z.string().trim().min(3).max(31) }).strict();
