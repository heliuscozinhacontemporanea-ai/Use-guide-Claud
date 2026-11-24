/**
 * Dono reservado do conteúdo que o Use Guide cadastra (escolhas da F4, D34): anúncios, dicas e
 * eventos. Não é conta de login (sem Firebase Auth nem perfil); quem administra é quem tem a claim
 * `admin`. Anúncio com este dono é o que o dono do lugar pode assumir ("Sou o dono", D35).
 */
export const USE_GUIDE_OWNER_ID = 'useguide';

export function isUseGuideOwner(ownerId: unknown): boolean {
  return ownerId === USE_GUIDE_OWNER_ID;
}
