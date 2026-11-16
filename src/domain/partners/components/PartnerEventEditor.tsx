import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../ui/components/ConfirmDialog';
import { ListCard, ListRowAction, ListRowButton } from '../../../ui/components/ListRows';
import {
  DEFAULT_EVENT_SALES_POLICY,
  type EventSessionsFieldProps,
  type EventSessionsLoadState,
} from '../../events';
import type { PartnerBusiness } from '../types/partner';
import type { PartnerContentEditorState, PartnerContentRecord } from '../types/partnerContent';
import { EventBasicsSection } from './event/EventBasicsSection';
import { EventContactSection } from './event/EventContactSection';
import { EventEntrySection } from './event/EventEntrySection';
import { EventPhotosSection } from './event/EventPhotosSection';
import { EventSalesPolicySection } from './event/EventSalesPolicySection';

export type EventEditorSection =
  | 'info'
  | 'sessions'
  | 'location'
  | 'tickets'
  | 'policy'
  | 'photos'
  | 'contact';
type Section = EventEditorSection;

interface PartnerEventEditorProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
  /** Seção aberta como página por cima da lista; `null` mostra a lista (item 4 da D33). */
  section: Section | null;
  onOpenSection: (section: Section, title: string) => void;
  isUploading: boolean;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  businesses?: PartnerBusiness[];
  /** Estabelecimentos do parceiro: o fuso das sessões é o do escolhido (D28). */
  establishments?: PartnerContentRecord[];
  sessionsLoadState: EventSessionsLoadState;
  /** Sessões com vendas ou cortesias: sem lixeira, cancelar ou adiar é pela folha da sessão (D27). */
  lockedSessionIds?: readonly string[];
  renderSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
  /** Conta de recebimento do estabelecimento do evento (payment), montada pela composição. */
  renderAccountCard?: (establishmentId: string, establishmentName: string) => ReactNode;
  /** Com vendas, o evento não é excluído: as sessões são canceladas pela folha da sessão. */
  hasSales?: boolean;
  showDeleteConfirm: boolean;
  onRequestDelete: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

/** Fuso e cidade do estabelecimento escolhido; sem ele, os do próprio evento salvo. */
function eventPlace(item: PartnerContentEditorState, establishments?: PartnerContentRecord[]) {
  const place = establishments?.find((entry) => entry.id === item.establishmentId) ?? item;
  return { timeZone: place.timeZone, city: place.city };
}

/**
 * Editar evento (p18), como página empilhada do painel (item 4 da D33): só o que o evento é. Vendas, pedidos e portaria ficam na página do evento,
 * e adiar ou cancelar uma sessão fica na folha da sessão (D27).
 */
export function PartnerEventEditor({
  item,
  onChange,
  section,
  onOpenSection,
  isUploading,
  onImageUpload,
  businesses,
  establishments,
  sessionsLoadState,
  lockedSessionIds,
  renderSessionsField,
  renderEventTicketingManager,
  renderAccountCard,
  hasSales = false,
  showDeleteConfirm,
  onRequestDelete,
  onConfirmDelete,
}: PartnerEventEditorProps) {
  const { t } = useTranslation();
  const paid = item.entryType === 'pago';
  const policy = item.salesPolicy ?? DEFAULT_EVENT_SALES_POLICY;
  const photos = item.images?.length ?? 0;
  const contacts = [
    item.phone && 'WhatsApp',
    item.websiteLink && t('partnerCatalog.editor.site'),
    item.instagramLink && 'Instagram',
  ].filter(Boolean);

  const rows: Array<{ id: Section; title: string; sub: string }> = [
    {
      id: 'info',
      title: t('partnerCatalog.editor.info'),
      sub: t('partnerCatalog.editor.infoHint'),
    },
    {
      id: 'sessions',
      title: t('partnerCatalog.editor.sessions'),
      sub: item.sessions?.length
        ? t('partnerCatalog.event.sessions', { count: item.sessions.length })
        : t('partnerCatalog.editor.noSessions'),
    },
    {
      id: 'location',
      title: t('partnerCatalog.editor.location'),
      sub:
        [item.address, item.location].filter(Boolean).join(', ') ||
        t('partnerCatalog.editor.locationHint'),
    },
    {
      id: 'tickets',
      title: t('partnerCatalog.editor.tickets'),
      sub: t(paid ? 'partnerCatalog.editor.paid' : 'partnerCatalog.editor.free'),
    },
    ...(paid
      ? [
          {
            id: 'policy' as const,
            title: t('partnerCatalog.editor.policy'),
            sub: [
              t(`salesPolicy.policies.event.${policy.cancellationPolicy}.title`),
              t(
                policy.serviceFeeMode === 'absorb'
                  ? 'salesPolicy.serviceFee.absorb.title'
                  : 'salesPolicy.serviceFee.passToBuyer.title'
              ),
            ].join(' · '),
          },
        ]
      : []),
    {
      id: 'photos',
      title: t('partnerCatalog.editor.photos'),
      sub: photos
        ? t('partnerCatalog.editor.photos', { count: photos })
        : t('partnerCatalog.editor.noPhotos'),
    },
    {
      id: 'contact',
      title: t('partnerCatalog.editor.contact'),
      sub: contacts.length ? contacts.join(', ') : t('partnerCatalog.editor.noContact'),
    },
  ];

  const sectionProps = { item, onChange };
  const body = (open: Section) => {
    switch (open) {
      case 'info':
        return <EventBasicsSection {...sectionProps} businesses={businesses} />;
      case 'sessions':
        return renderSessionsField?.({
          sessions: item.sessions ?? [],
          onChange: (sessions) => onChange({ ...item, sessions }),
          loadState: sessionsLoadState,
          place: eventPlace(item, establishments),
          lockedIds: lockedSessionIds,
        });
      case 'location':
        return <EventContactSection {...sectionProps} part="location" />;
      case 'tickets':
        return (
          <div className="space-y-3">
            <EventEntrySection
              {...sectionProps}
              renderEventTicketingManager={renderEventTicketingManager}
            />
            {!item.id && paid && (
              <p className="px-1 text-[13px] text-ink/70">{t('partnerCatalog.editor.saveFirst')}</p>
            )}
          </div>
        );
      case 'policy':
        return <EventSalesPolicySection {...sectionProps} />;
      case 'photos':
        return (
          <EventPhotosSection
            {...sectionProps}
            isUploading={isUploading}
            onImageUpload={onImageUpload}
          />
        );
      case 'contact':
        return <EventContactSection {...sectionProps} part="contact" />;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {section ? (
        <div className="space-y-6">{body(section)}</div>
      ) : (
        <>
          <ListCard>
            {rows.map((row) => (
              <ListRowButton
                key={row.id}
                title={row.title}
                sub={row.sub}
                onClick={() => onOpenSection(row.id, row.title)}
              />
            ))}
          </ListCard>
          {item.establishmentId &&
            renderAccountCard?.(
              item.establishmentId,
              businesses?.find((business) => business.businessId === item.establishmentId)
                ?.businessName ?? ''
            )}
          {item.id &&
            (hasSales ? (
              <p className="px-1 text-[13px] text-ink/70">
                {t('partnerCatalog.editor.deleteHasSales')}
              </p>
            ) : (
              <ListCard>
                <ListRowAction
                  label={t('partnerCatalog.editor.delete')}
                  tone="danger"
                  onClick={() => onRequestDelete(true)}
                />
              </ListCard>
            ))}
          <ConfirmDialog
            data={
              showDeleteConfirm
                ? {
                    title: t('partnerCatalog.editor.deleteTitle', { name: item.name || '' }),
                    message: t('partnerCatalog.editor.deleteMessage'),
                    confirmLabel: t('partnerCatalog.editor.delete'),
                    onConfirm: () => void onConfirmDelete(),
                    onCancel: () => onRequestDelete(false),
                  }
                : null
            }
          />
        </>
      )}
    </div>
  );
}
