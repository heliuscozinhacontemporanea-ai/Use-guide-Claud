import type { AuthenticatedUserContext } from '../../shared/kernel/authenticatedUserContext';
import {
  archiveOffersOfGuideItemUseCase,
  hasActiveBookingsForGuideItemUseCase,
} from '../../domain/bookings';
import { countOpenEstablishmentEventsUseCase } from '../../domain/events';
import { GuideDomainError, getItemByIdUseCase, deleteGuideItemUseCase } from '../../domain/guide';
import { deleteListingPlanUseCase, deleteListingVerificationUseCase } from '../../domain/partners';
import { cancelListingPlanSubscriptionUseCase } from '../../domain/payment';
import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';
import { linkOwnerBusiness, unlinkOwnerBusiness } from './ownerBusinessLink';

function isNotFoundError(error: unknown): boolean {
  if (!error) return false;
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'NOT_FOUND'
  ) {
    return true;
  }
  if (error instanceof Error && error.message.toLowerCase().includes('não encontrado')) {
    return true;
  }
  return false;
}

export async function deletePartnerItemApplicationUseCase(
  user: AuthenticatedUserContext,
  id: string
): Promise<void> {
  const existing = await getItemByIdUseCase(id);

  if (!existing) {
    return;
  }

  const ownerId = existing.ownerId;

  if (typeof ownerId !== 'string' || !ownerId) {
    throw new Error('Proprietário do item não encontrado.');
  }

  // Dono ou admin antes de qualquer mudança: o vínculo do dono não é tocado por quem não pode (A01).
  if (!user.admin && user.uid !== ownerId) {
    throw new GuideDomainError(
      'FORBIDDEN',
      'Você não possui permissão para modificar este conteúdo'
    );
  }

  // Excluir não cancela nada: reserva ativa ou evento ligado prende o anúncio (D34, F2). O parceiro
  // cancela os horários pela agenda (com reembolso e multa) ou usa "Pausar no guia".
  if (await hasActiveBookingsForGuideItemUseCase(id)) {
    throw new GuideDomainError(
      'LISTING_HAS_BOOKINGS',
      'Este anúncio tem reservas ativas. Cancele os horários ou use Pausar no guia.'
    );
  }
  if ((await countOpenEstablishmentEventsUseCase(id)) > 0) {
    throw new GuideDomainError(
      'LISTING_HAS_EVENTS',
      'Este anúncio tem eventos ligados. Exclua ou mude os eventos, ou use Pausar no guia.'
    );
  }

  await unlinkOwnerBusiness(ownerId, id);

  try {
    await deleteGuideItemUseCase(user, id);
  } catch (error) {
    if (!isNotFoundError(error)) {
      try {
        await linkOwnerBusiness(ownerId, {
          businessId: id,
          businessName: existing.name || '',
          type: 'item',
        });
      } catch (rollbackError) {
        console.error(
          '[deletePartnerItemApplicationUseCase] Falha no rollback do vínculo Partner:',
          rollbackError
        );
      }
    }

    throw error;
  }

  // Documento e arquivos de verificação saem junto com o estabelecimento (LGPD, §7.5).
  await deleteVerificationFiles(await deleteListingVerificationUseCase(id));
  // O plano sai junto: a assinatura do estabelecimento para de cobrar na hora (B24).
  await cancelListingPlanSubscriptionUseCase(id);
  await deleteListingPlanUseCase(id);
  // As ofertas saem do app junto com o anúncio; sem isso, continuariam vendáveis por link direto.
  await archiveOffersOfGuideItemUseCase(id);
}
