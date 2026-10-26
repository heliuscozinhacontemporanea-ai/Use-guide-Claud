import { getPartnerProfileUseCase, listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { getPaymentAccountOwnersUseCase } from '../../../domain/payment';
import type { SellerAccountSummary } from './sellerAccountSummary';

/** Vendedor de cada CNPJ para as filas do admin (D16). */
export async function describeSellerAccountsApplicationUseCase(
  accountKeys: string[]
): Promise<Record<string, SellerAccountSummary>> {
  const owners = await getPaymentAccountOwnersUseCase(accountKeys);
  const ownerUids = [...new Set(Object.values(owners))];
  const byOwner = new Map(
    await Promise.all(
      ownerUids.map(
        async (uid) =>
          [
            uid,
            await Promise.all([
              getPartnerProfileUseCase(uid).catch(() => null),
              listOwnerSalesDocumentsUseCase(uid).catch(() => []),
            ]),
          ] as const
      )
    )
  );
  return Object.fromEntries(
    [...new Set(accountKeys)].map((key): [string, SellerAccountSummary] => {
      const found = owners[key] ? byOwner.get(owners[key]) : undefined;
      const document = found?.[1].find((entry) => entry.accountKey === key);
      // Os estabelecimentos que vendem por este CNPJ, pelo nome que o parceiro vinculou.
      const names = (found?.[0]?.businesses ?? [])
        .filter((business) => document?.itemIds.includes(business.businessId))
        .map((business) => business.businessName);
      const summary: SellerAccountSummary = {
        sellerName: names.length > 0 ? names.join(', ') : null,
        maskedDocument: document?.maskedDocument ?? null,
      };
      return [key, summary];
    })
  );
}
