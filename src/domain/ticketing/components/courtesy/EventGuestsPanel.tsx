import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatSessionLabel } from '../../../../shared/utils/businessDateTime';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { useEventCourtesies } from '../../hooks/useEventCourtesies';
import type { CourtesyLinkCreated, CourtesyRow } from '../../types/courtesy';
import { COURTESY_TONE, isCourtesyActive } from '../../utils/courtesyRowView';
import { CourtesyLinkSheet } from './CourtesyLinkSheet';
import { CourtesyRowSheet } from './CourtesyRowSheet';
import { type CourtesySession, InviteCourtesySheet } from './InviteCourtesySheet';

/**
 * Aba Convidados da página do evento (p13): quantas cortesias foram enviadas, Convidar e a lista.
 * `sessions` são as sessões que ainda aceitam convite; `allSessions`, todas, para dar nome à linha.
 */
export function EventGuestsPanel({
  eventListingId,
  eventTitle,
  sessions,
  allSessions,
  onChanged,
}: {
  eventListingId: string;
  eventTitle: string;
  sessions: CourtesySession[];
  allSessions: CourtesySession[];
  onChanged: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { data, loading, error, reload } = useEventCourtesies(eventListingId);
  const [inviting, setInviting] = useState(false);
  const [link, setLink] = useState<CourtesyLinkCreated | null>(null);
  const [selected, setSelected] = useState<CourtesyRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const sent = data.filter((row) => isCourtesyActive(row.status)).length;
  const startsOf = (id: string) => allSessions.find((session) => session.id === id)?.startsAt;

  const statusText = (row: CourtesyRow) => {
    if (row.status === 'checked_in' && row.checkedInAt) {
      return t('courtesy.status.checked_in', {
        time: formatBusinessDate(row.checkedInAt, locale, { hour: '2-digit', minute: '2-digit' }),
      });
    }
    if (row.status === 'link_pending' && row.linkExpiresAt) {
      return t('courtesy.status.link_pending', {
        date: formatBusinessDate(row.linkExpiresAt, locale, {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
    return t(`courtesy.status.${row.status}`);
  };

  const subOf = (row: CourtesyRow) => {
    const who =
      row.guest?.displayName ?? (row.channel === 'link' ? t('courtesy.linkSentBy') : undefined);
    const starts = allSessions.length > 1 ? startsOf(row.occurrenceId) : undefined;
    return [who, starts && formatSessionLabel(starts, locale)].filter(Boolean).join(' · ');
  };

  const changed = async (message: string) => {
    setNotice(message);
    await reload();
    onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-[20px] bg-surface border border-line">
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-semibold text-ink">
            {t('courtesy.summaryTitle', { count: sent })}
          </p>
          <p className="text-[15px] text-ink/70">{t('courtesy.summaryHint')}</p>
        </div>
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setNotice(null);
              setInviting(true);
            }}
            className={`${BUTTON_PRIMARY} shrink-0`}
          >
            {t('courtesy.invite')}
          </button>
        )}
      </div>
      {notice && (
        <p role="status" className="px-1">
          <StatusText tone="success">{notice}</StatusText>
        </p>
      )}

      <section className="space-y-3">
        <h3 className="px-1 text-[18px] font-display font-bold text-ink">
          {t('courtesy.listTitle')}
        </h3>
        {loading && data.length === 0 ? (
          <ListLoading label={t('courtesy.listTitle')} />
        ) : error ? (
          <ListError message={t('courtesy.loadError')} onRetry={() => void reload()} />
        ) : data.length === 0 ? (
          <ListEmpty message={t('courtesy.empty')} />
        ) : (
          <ListCard>
            {data.map((row) => (
              <ListRowButton
                key={row.id}
                title={row.guest?.username ? `@${row.guest.username}` : t('courtesy.linkTitle')}
                sub={subOf(row) || undefined}
                status={{ tone: COURTESY_TONE[row.status], text: statusText(row) }}
                onClick={() => setSelected(row)}
              />
            ))}
          </ListCard>
        )}
      </section>

      <InviteCourtesySheet
        open={inviting}
        sessions={sessions}
        onClose={() => setInviting(false)}
        onInvited={(username) => {
          setInviting(false);
          void changed(t('courtesy.sheet.sent', { username }));
        }}
        onLinkCreated={(created) => {
          setInviting(false);
          setLink(created);
          void reload();
          onChanged();
        }}
      />
      <CourtesyLinkSheet link={link} eventTitle={eventTitle} onClose={() => setLink(null)} />
      <CourtesyRowSheet
        row={selected}
        sessionStartsAt={selected ? (startsOf(selected.occurrenceId) ?? null) : null}
        statusText={selected ? statusText(selected) : ''}
        onClose={() => setSelected(null)}
        onCanceled={() => {
          setSelected(null);
          void changed(t('courtesy.row.canceled'));
        }}
      />
    </div>
  );
}
