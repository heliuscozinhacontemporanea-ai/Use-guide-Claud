import type { Locale } from '../../../../shared/i18n';
import { userAdapter } from '../../factory';
import { preferredLocaleSchema } from '../../schemas/userSchema';

/** Grava na conta o idioma escolhido, para valer em todos os aparelhos e nos e-mails (decisão D10). */
export async function updatePreferredLocaleUseCase(locale: Locale): Promise<void> {
  await userAdapter.updatePreferredLocale(preferredLocaleSchema.parse(locale));
}
