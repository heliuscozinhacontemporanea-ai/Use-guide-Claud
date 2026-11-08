import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatTile } from '../../../../ui/components/StatTile';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { useEventPromoters } from '../../hooks/useEventPromoters';
import type { PromoterRow } from '../../types/promoter';
import { promoterEarningText } from '../../utils/promoterEarningText';
import { AddPromoterSheet } from './AddPromoterSheet';
import { PromoterRowSheet } from './PromoterRowSheet';

/** Aba Divulgadores da página do evento (p16): vendido pelos links, a pagar e a lista. */
export function EventPromotersPanel({ eventListingId }: { eventListingId: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { data, loading, error, reload } = useEventPromoters(eventListingId);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<PromoterRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const statusOf = (row: PromoterRow) => {
    if (row.status === 'invited')
      return { tone: 'info' as const, text: t('promoters.status.invited') };
    const earned = `${promoterEarningText(t, row.earning, locale)} · ${formatMoneyMinorCompact(row.owedMinor, locale)}`;
    return row.status === 'ended'
      ? { tone: 'muted' as const, text: `${t('promoters.status.ended')} · ${earned}` }
      : { tone: 'muted' as const, text: earned };
  };

  const changed = async (message: string) => {
    setNotice(message);
    await reload();
  };

  return (
    <div className="space-y-6">
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label={t('promoters.soldBy')}
            value={formatMoneyMinorCompact(data.soldMinor, locale)}
            hint={t('promoters.soldTickets', { count: data.tickets })}
          />
          <StatTile
            label={t('promoters.owed')}
            value={formatMoneyMinorCompact(data.owedMinor, locale)}
            hint={t('promoters.owedHint')}
          />
        </div>
      )}
      {notice && (
        <p role="status" className="px-1">
          <StatusText tone="success">{notice}</StatusText>
        </p>
      )}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h3 className="text-[18px] font-display font-bold text-ink">
            {t('promoters.listTitle')}
          </h3>
          <TextButton
            tone="accent"
            onClick={() => {
              setNotice(null);
              setAdding(true);
            }}
          >
            {t('promoters.add')}
          </TextButton>
        </div>
        {loading && !data ? (
          <ListLoading label={t('promoters.listTitle')} />
        ) : error ? (
          <ListError message={t('promoters.loadError')} onRetry={() => void reload()} />
        ) : !data || data.rows.length === 0 ? (
          <ListEmpty message={t('promoters.empty')} />
        ) : (
          <ListCard>
            {data.rows.map((row) => (
              <ListRowButton
                key={row.id}
                title={row.promoter.username ? `@${row.promoter.username}` : t('promoters.tab')}
                sub={
                  row.tickets > 0
                    ? t('promoters.rowSales', {
                        count: row.tickets,
                        amount: formatMoneyMinorCompact(row.soldMinor, locale),
                      })
                    : t('promoters.noSales')
                }
                status={statusOf(row)}
                onClick={() => setSelected(row)}
              />
            ))}
          </ListCard>
        )}
      </section>
      <AddPromoterSheet
        open={adding}
        eventListingId={eventListingId}
        onClose={() => setAdding(false)}
        onInvited={(username) => {
          setAdding(false);
          void changed(t('promoters.sheet.sent', { username }));
        }}
      />
      <PromoterRowSheet
        row={selected}
        onClose={() => setSelected(null)}
        onEnded={() => {
          setSelected(null);
          void changed(t('promoters.row.ended'));
        }}
      />
    </div>
  );
}
