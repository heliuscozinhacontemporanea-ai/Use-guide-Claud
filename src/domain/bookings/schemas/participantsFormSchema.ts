import { z } from 'zod';

/** Um nome (2–80 caracteres) por participante; mensagens são chaves de tradução. */
export function participantsFormSchema(count: number) {
  return z.object({
    names: z
      .array(
        z
          .string()
          .trim()
          .min(2, 'bookings.validation.required')
          .max(80, 'bookings.validation.tooLong')
      )
      .length(count),
  });
}
