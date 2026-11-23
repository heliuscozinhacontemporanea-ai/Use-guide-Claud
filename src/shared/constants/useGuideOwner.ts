/** Espelho de server/shared/kernel/useGuideOwner.ts (o teste de paridade garante que são iguais). */
export const USE_GUIDE_OWNER_ID = 'useguide';

export function isUseGuideOwner(ownerId: unknown): boolean {
  return ownerId === USE_GUIDE_OWNER_ID;
}
