import { AdminDispatcher } from '../../domain/admin';
import { isBookingServiceEvidence, ServiceEvidenceList } from '../../domain/bookings';
import { ListingVerificationQueue } from '../../domain/partners';
import { AdminFinanceQueues } from '../../domain/payment';
import { ReviewModerationQueue } from '../../domain/reviews';
import { AdminEventsTab } from './admin/AdminEventsTab';
import { AdminGuideTab } from './admin/AdminGuideTab';
import { AdminPanelStack } from './admin/AdminPanelStack';

/**
 * Painel admin com os editores do parceiro (D34, escolhas da F4): o Guia local e a Agenda abrem os
 * anúncios, as dicas e os eventos em páginas empilhadas. Junto, a fila de verificação dos
 * estabelecimentos (D12), as filas financeiras (D16) e as denúncias de respostas (D19).
 */
export function AdminPanelComposition() {
  return (
    <AdminPanelStack
      root={
        <AdminDispatcher
          renderGuideTab={() => <AdminGuideTab />}
          renderEventsTab={() => <AdminEventsTab />}
          renderVerificationQueue={() => <ListingVerificationQueue />}
          renderFinanceQueues={() => (
            <AdminFinanceQueues
              renderClaimEvidence={(claim) =>
                isBookingServiceEvidence(claim.serviceEvidence) ? (
                  <ServiceEvidenceList evidence={claim.serviceEvidence} />
                ) : null
              }
            />
          )}
          renderModerationQueue={() => <ReviewModerationQueue />}
        />
      }
    />
  );
}
