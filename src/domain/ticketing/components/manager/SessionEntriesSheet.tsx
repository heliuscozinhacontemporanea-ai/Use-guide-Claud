import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { ListCard, ListRowStatic } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { useSessionEntries } from '../../hooks/useSessionEntries';

/** Entradas da sessão (A2): quem entrou, com que ingresso e a que horas. */
export function SessionEntriesSheet({
  open,
  eventListingId,
  occurrenceId,
  description,
  onClose,
}: {
  open: boolean;
  eventListingId: string;
  occurrenceId: string;
  description: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { data, loading, error, reload } = useSessionEntries(eventListingId, occurrenceId, open);
  const day = (iso: string) => formatBusinessDate(iso, locale, { day: 'numeric', month: 'short' });
  // Sessão que passa da meia-noite: com mais de um dia, cada linha mostra o dia.
  const oneDay = new Set(data?.map((entry) => day(entry.at))).size <= 1;
  const when = (iso: string) =>
    formatBusinessDate(iso, locale, {
      ...(oneDay ? {} : { day: 'numeric', month: 'short' }),
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('ticketSessions.entries.title')}
      description={description}
    >
      {loading && !data ? (
        <ListLoading label={t('ticketSessions.entries.title')} />
      ) : error || !data ? (
        <ListError message={t('ticketSessions.entries.error')} onRetry={() => void reload()} />
      ) : data.length === 0 ? (
        <ListEmpty message={t('ticketSessions.entries.empty')} />
      ) : (
        <div className="space-y-3">
          <p className="px-1 text-[14px] text-ink/70">
            {t('ticketSessions.entries.count', { count: data.length })}
          </p>
          <ListCard>
            {data.map((entry) => (
              <ListRowStatic
                key={entry.id}
                title={
                  entry.name ??
                  t(
                    entry.courtesy ? 'ticketSessions.entries.guest' : 'ticketSessions.entries.buyer'
                  )
                }
                sub={[
                  entry.ticketType,
                  entry.courtesy && entry.name ? t('ticketSessions.entries.guest') : null,
                  entry.source === 'offline' ? t('ticketSessions.entries.offline') : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                aside={
                  <span className="shrink-0 text-[15px] font-semibold text-ink tabular-nums">
                    {when(entry.at)}
                  </span>
                }
              />
            ))}
          </ListCard>
        </div>
      )}
    </Dialog>
  );
}
