import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { type ChangeEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { BackButton } from '../../../ui/components/BackButton';
import { ConfirmDialog } from '../../../ui/components/ConfirmDialog';
import { ListCard, ListRowButton } from '../../../ui/components/ListRows';
import { TextButton } from '../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import {
  DEFAULT_EVENT_SALES_POLICY,
  type EventSessionsFieldProps,
  type EventSessionsLoadState,
} from '../../events';
import type { PartnerBusiness } from '../types/partner';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { EventBasicsSection } from './event/EventBasicsSection';
import { EventContactSection } from './event/EventContactSection';
import { EventEntrySection } from './event/EventEntrySection';
import { EventPhotosSection } from './event/EventPhotosSection';
import { EventSalesPolicySection } from './event/EventSalesPolicySection';

type Section = 'info' | 'sessions' | 'location' | 'tickets' | 'policy' | 'photos' | 'contact';

interface PartnerEventEditorProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
  isUploading: boolean;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  businesses?: PartnerBusiness[];
  sessionsLoadState: EventSessionsLoadState;
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

/**
 * Editar evento (p18): só o que o evento é. Vendas, pedidos e portaria ficam na página do evento,
 * e adiar ou cancelar uma sessão fica na folha da sessão (D27).
 */
export function PartnerEventEditor({
  item,
  onChange,
  onClose,
  onSave,
  isLoading,
  isUploading,
  onImageUpload,
  businesses,
  sessionsLoadState,
  renderSessionsField,
  renderEventTicketingManager,
  renderAccountCard,
  hasSales = false,
  showDeleteConfirm,
  onRequestDelete,
  onConfirmDelete,
}: PartnerEventEditorProps) {
  const { t } = useTranslation();
  const [section, setSection] = useState<Section | null>(null);
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

  const title = section
    ? (rows.find((row) => row.id === section)?.title ?? '')
    : t(item.id ? 'partnerCatalog.editor.titleEdit' : 'partnerCatalog.editor.titleNew');

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-event-editor-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 overflow-y-auto bg-app"
    >
      <div className="max-w-xl mx-auto px-4 pt-12 pb-40 space-y-6">
        <div className="flex items-center gap-2">
          <BackButton
            label={t('partnerPanel.tabs.catalog')}
            onClick={() => (section ? setSection(null) : onClose())}
          />
          <h2
            id="partner-event-editor-title"
            className="text-[24px] font-display font-bold text-ink break-words"
          >
            {title}
          </h2>
        </div>

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
                  onClick={() => setSection(row.id)}
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
                <TextButton tone="danger" onClick={() => onRequestDelete(true)}>
                  {t('partnerCatalog.editor.delete')}
                </TextButton>
              ))}
          </>
        )}
      </div>

      <div
        className="fixed inset-x-0 bottom-0 border-t border-line bg-app/90 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-xl mx-auto px-4 py-3">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={isLoading}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {isLoading && <RefreshCw className="animate-spin" size={16} aria-hidden="true" />}
            {t('partnerCatalog.editor.save')}
          </button>
        </div>
      </div>

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
    </motion.div>
  );
}
