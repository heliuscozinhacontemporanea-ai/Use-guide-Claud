import { AdminDispatcher, type AdminListingEditorProps } from '../../domain/admin';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { EventSessionsField } from '../../domain/events';
import {
  createGuideItemUseCase,
  deleteGuideItemUseCase,
  type GuideCreateItemInput,
  type GuideItem,
  type GuideItemOperationalInfo,
  updateGuideItemUseCase,
} from '../../domain/guide';
import {
  AdminListingSealControl,
  ListingEditor,
  ListingVerificationQueue,
  type PartnerContentItemInput,
  type PartnerContentRecord,
} from '../../domain/partners';
import { AdminFinanceQueues } from '../../domain/payment';
import { PartnerEventTicketingManager } from '../../domain/ticketing';

// Cadastros novos que o admin pode criar pelo editor do parceiro (o servidor permite só estes ao admin).
const ADMIN_LISTING_CATEGORIES = ['sight', 'tour'];

function toListingRecord(item: GuideItem): PartnerContentRecord {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image,
    images: item.images,
    location: item.location,
    instagramLink: item.instagramLink,
    websiteLink: item.websiteLink,
    bookingLink: item.bookingLink,
    phone: item.phone,
    googleMapsLink: item.googleMapsLink,
    address: item.address,
    tags: item.tags,
    operationalInfo: item.operationalInfo,
  };
}

function toGuideInput(input: PartnerContentItemInput): GuideCreateItemInput {
  return {
    name: input.name,
    description: input.description,
    category: input.category,
    image: input.image,
    images: input.images,
    location: input.location,
    instagramLink: input.instagramLink,
    websiteLink: input.websiteLink,
    bookingLink: input.bookingLink,
    phone: input.phone,
    googleMapsLink: input.googleMapsLink,
    address: input.address,
    tags: input.tags,
    // Montado por buildOperationalInfo, com os mesmos campos de GuideItemOperationalInfo.
    operationalInfo: input.operationalInfo as GuideItemOperationalInfo | undefined,
  };
}

function AdminListingEditor({ item, onClose }: AdminListingEditorProps) {
  const { user } = useAuthContext();
  return (
    <ListingEditor
      item={item ? toListingRecord(item) : null}
      allowedCategoryIds={ADMIN_LISTING_CATEGORIES}
      currentUser={user}
      onSave={async (input, itemId) => {
        if (itemId) {
          await updateGuideItemUseCase(itemId, toGuideInput(input));
        } else {
          await createGuideItemUseCase(toGuideInput(input));
        }
      }}
      onDelete={deleteGuideItemUseCase}
      onClose={onClose}
    />
  );
}

/**
 * Painel admin com os editores compartilhados: cadastro (o mesmo do parceiro, decisão D9), fila de
 * verificação dos estabelecimentos (D12), selo por estabelecimento (D11), filas financeiras (D16), sessões do evento e
 * gerenciador de ingressos.
 */
export function AdminPanelComposition() {
  return (
    <AdminDispatcher
      renderListingEditor={(props) => <AdminListingEditor {...props} />}
      renderVerificationQueue={() => <ListingVerificationQueue />}
      renderListingSeal={(item) => <AdminListingSealControl itemId={item.id} name={item.name} />}
      renderFinanceQueues={() => <AdminFinanceQueues />}
      renderSessionsField={(props) => <EventSessionsField {...props} />}
      renderTicketingManager={(eventListingId) => (
        <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />
      )}
    />
  );
}
