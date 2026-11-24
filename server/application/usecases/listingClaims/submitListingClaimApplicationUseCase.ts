import { getItemByIdUseCase } from '../../../domain/guide';
import { isOwnVerificationFileUseCase } from '../../../domain/media';
import {
  acceptPartnerTermsUseCase,
  ListingClaimError,
  type ListingClaimView,
  recordPartnerPanelTourUseCase,
  type SubmitListingClaimInput,
  submitListingClaimUseCase,
} from '../../../domain/partners';
import { getUserProfileUseCase } from '../../../domain/users';
import { PARTNER_TERMS_VERSION } from '../../../shared/kernel/legalTerms';
import { registerPartnerApplicationUseCase } from '../registerPartnerApplicationUseCase';

/**
 * "Assumir anúncio" (D35): confere o e-mail, o anúncio e os arquivos; quem ainda não é parceiro aceita
 * os Termos do parceiro e vira parceiro ao enviar, como no "Seja parceiro". O anúncio não muda até a
 * aprovação do admin.
 */
export async function submitListingClaimApplicationUseCase(
  actor: { uid: string; emailVerified: boolean },
  itemId: string,
  input: SubmitListingClaimInput & { termsAccepted?: boolean }
): Promise<ListingClaimView> {
  // E-mail confirmado antes de virar parceiro (AGENTS.md §7.10, A07).
  if (!actor.emailVerified) {
    throw new ListingClaimError('EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de enviar.');
  }
  const item = await getItemByIdUseCase(itemId);
  if (!item) throw new ListingClaimError('NOT_FOUND', 'Anúncio não encontrado.');
  for (const path of Object.values(input.files)) {
    if (path && !isOwnVerificationFileUseCase(actor.uid, path)) {
      throw new ListingClaimError('FORBIDDEN', 'Arquivo de verificação inválido.');
    }
  }
  const profile = await getUserProfileUseCase(actor.uid);
  const isPartner = profile?.role === 'partner';
  if (!isPartner && input.termsAccepted !== true) {
    throw new ListingClaimError('TERMS_REQUIRED', 'Aceite os Termos do parceiro para continuar.');
  }
  const { termsAccepted: _terms, ...claim } = input;
  const view = await submitListingClaimUseCase(
    actor.uid,
    {
      id: itemId,
      ownerId: typeof item.ownerId === 'string' ? item.ownerId : '',
      category: typeof item.category === 'string' ? item.category : '',
      publication: typeof item.publication === 'string' ? item.publication : '',
      isActive: item.isActive === true,
    },
    claim
  );
  if (!isPartner) {
    await registerPartnerApplicationUseCase(actor, { termsAccepted: true });
    // A pessoa marcou os Termos do parceiro no pedido: a versão aceita fica gravada, como prova (D15).
    await acceptPartnerTermsUseCase(actor.uid, PARTNER_TERMS_VERSION);
    // Quem entra pelo "Sou o dono" começa pelo pedido no Início, sem o tour antigo (como na F1).
    await recordPartnerPanelTourUseCase(actor.uid, 'done').catch(() => undefined);
  }
  return view;
}
