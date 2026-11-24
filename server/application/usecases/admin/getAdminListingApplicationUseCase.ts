import { getGuideListingSetupUseCase, type GuideListingSetup } from '../../../domain/guide';
import { getUserProfilesBatchUseCase } from '../../../domain/users';
import { isUseGuideOwner } from '../../../shared/kernel/useGuideOwner';

export type AdminListingOwner = { kind: 'useguide' } | { kind: 'partner'; name: string };

/** O anúncio aberto pelo admin no editor do parceiro (escolhas da F4), com o dono no topo. */
export type AdminListingView = Omit<GuideListingSetup, 'ownerId'> & { owner: AdminListingOwner };

export async function getAdminListingApplicationUseCase(
  itemId: string
): Promise<AdminListingView | null> {
  const listing = await getGuideListingSetupUseCase(itemId);
  if (!listing) return null;
  const { ownerId, ...setup } = listing;
  if (isUseGuideOwner(ownerId)) return { ...setup, owner: { kind: 'useguide' } };
  const profile = (await getUserProfilesBatchUseCase([ownerId]))[ownerId];
  return {
    ...setup,
    owner: {
      kind: 'partner',
      name: [profile?.firstName, profile?.lastName].filter(Boolean).join(' '),
    },
  };
}
