/** Um passo do anúncio, com o que falta (mesmo formato do guia de passos do parceiro, D34). */
export interface AdminListingStep {
  id: 'name' | 'photos' | 'about' | 'where' | 'details' | 'contacts';
  done: boolean;
  missing: string[];
}

export type AdminListingOwner = { kind: 'useguide' } | { kind: 'partner'; name: string };

/** O anúncio aberto pelo admin no editor do parceiro (escolhas da F4). */
export interface AdminListingView {
  publication: 'draft' | 'published';
  /** Os passos do parceiro: o ✓ ou o que falta em cada bloco. */
  setupSteps: AdminListingStep[];
  /** O que libera "Publicar": o mínimo no anúncio do Use Guide, os passos inteiros no do parceiro. */
  publishSteps: AdminListingStep[];
  owner: AdminListingOwner;
}
