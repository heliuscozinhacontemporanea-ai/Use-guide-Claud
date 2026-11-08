import { CloudOff, Download, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { useOfflineTicketSession } from '../../hooks/useOfflineTicketSession';

/** Estado da internet e sessão sem internet da portaria: preparar o manifesto e enviar o que ficou guardado. */
export function OfflineSessionCard({
  session,
}: {
  session: ReturnType<typeof useOfflineTicketSession>;
}) {
  const { t } = useTranslation();
  const { isOnline, bundle, pending, preparing, syncing, notice } = session;

  return (
    <section className="p-4 rounded-[20px] bg-surface border border-line space-y-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 shrink-0 rounded-xl flex items-center justify-center',
            isOnline ? 'bg-success-soft text-success' : 'bg-warn-soft text-warn'
          )}
        >
          {isOnline ? (
            <Wifi size={18} aria-hidden="true" />
          ) : (
            <CloudOff size={18} aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-ink">
            {t(isOnline ? 'ticketGate.online' : 'ticketGate.offlineMode')}
          </p>
          <p className="text-[13px] text-ink/70">
            {bundle
              ? t('ticketGate.prepared', { count: bundle.tickets.length })
              : t('ticketGate.notPrepared')}
          </p>
        </div>
      </div>
      <p className="text-[13px] text-ink/70">{t('ticketGate.offlineHint')}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          disabled={!isOnline || preparing}
          onClick={() => void session.prepare()}
          className={`${BUTTON_SECONDARY} inline-flex items-center gap-1.5`}
        >
          <Download size={16} aria-hidden="true" />
          {t(bundle ? 'ticketGate.prepareAgain' : 'ticketGate.prepare')}
        </button>
        {pending > 0 && (
          <TextButton
            tone="accent"
            disabled={!isOnline || syncing}
            onClick={() => void session.sync()}
          >
            {t('ticketGate.sync', { count: pending })}
          </TextButton>
        )}
      </div>
      {notice && (
        <p role="status">
          <StatusText
            tone={
              notice.kind === 'error' || (notice.kind === 'synced' && notice.conflicts > 0)
                ? 'warn'
                : 'success'
            }
          >
            {notice.kind === 'prepared'
              ? t('ticketGate.preparedNotice', { count: notice.count })
              : notice.kind === 'synced'
                ? notice.conflicts > 0
                  ? t('ticketGate.syncedConflicts', { count: notice.conflicts })
                  : t('ticketGate.synced', { count: notice.count })
                : notice.message || t('ticketGate.failed')}
          </StatusText>
        </p>
      )}
    </section>
  );
}
