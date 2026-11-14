import { usePanelTimeZone } from '../../hooks/panelTimeZone';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { StatTile } from '../../../../ui/components/StatTile';
import type { StatusTone } from '../../../../ui/components/StatusText';
import { usePartnerEarnings } from '../../hooks/usePartnerEarnings';
import type { PartnerPayoutGroup } from '../../types/partnerHome';
import { payoutRow } from '../../utils/payoutFormat';
import { PartnerPayoutSheet } from './PartnerPayoutSheet';

type EarningsSegment = 'payouts' | 'statement' | 'debts';

const TONE: Record<PartnerPayoutGroup['status'], StatusTone> = {
  scheduled: 'info',
  held: 'warn',
  paid: 'success',
};

/** O que a composição monta em Ganhos (domínio payment). */
export interface PartnerEarningsRenders {
  renderStatement?: () => ReactNode;
  renderDebts?: () => ReactNode;
  /** Contas de recebimento (p22); o toque numa conta abre a página dela por cima. */
  renderAccounts?: (props: {
    onOpenAccount: (account: { key: string; title: string }) => void;
  }) => ReactNode;
  /** Cadastro e saldos no Stripe de uma conta (um CNPJ). */
  renderAccount?: (accountKey: string) => ReactNode;
}

/**
 * Ganhos (p20): a receber, recebido no mês, repasses, extrato e dívidas. Contas e relatórios abrem por
 * cima do painel (D33).
 */
export function PartnerEarningsTab({
  renders,
  onOpenReports,
  onOpenAccounts,
}: {
  renders: PartnerEarningsRenders;
  onOpenReports: () => void;
  onOpenAccounts: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { timeZone } = usePanelTimeZone();
  const locale = i18n.language;
  const { data, loading, error, reload } = usePartnerEarnings();
  const [segment, setSegment] = useState<EarningsSegment>('payouts');
  const [open, setOpen] = useState<PartnerPayoutGroup | null>(null);

  const toReceiveCount = data?.payouts.filter((group) => group.status !== 'paid').length ?? 0;
  const month = formatBusinessDate(new Date().toISOString(), locale, { month: 'long' }, timeZone);

  return (
    <section aria-labelledby="partner-earnings-title" className="space-y-5">
      <h2 id="partner-earnings-title" className="px-1 text-heading font-display font-bold text-ink">
        {t('partnerEarnings.title')}
      </h2>

      {loading && !data ? (
        <ListLoading label={t('partnerEarnings.title')} />
      ) : error || !data ? (
        <ListError message={t('partnerEarnings.loadError')} onRetry={() => void reload()} />
      ) : (
        <div data-tour="earnings-totals" className="grid grid-cols-2 gap-3">
          <StatTile
            label={t('partnerEarnings.toReceive')}
            value={formatMoneyMinorCompact(data.toReceiveMinor, locale)}
            hint={t('partnerEarnings.toReceiveHint', { count: toReceiveCount })}
          />
          <StatTile
            label={t('partnerEarnings.received', { month })}
            value={formatMoneyMinorCompact(data.receivedThisMonthMinor, locale)}
            hint={t('partnerEarnings.receivedHint')}
          />
        </div>
      )}

      <div data-tour="earnings-tabs">
        <SegmentedControl<EarningsSegment>
          label={t('partnerEarnings.title')}
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'payouts', label: t('partnerEarnings.tabs.payouts') },
            { value: 'statement', label: t('partnerEarnings.tabs.statement') },
            { value: 'debts', label: t('partnerEarnings.tabs.debts') },
          ]}
        />
      </div>

      {segment === 'statement' ? (
        renders.renderStatement?.()
      ) : segment === 'debts' ? (
        renders.renderDebts?.()
      ) : data && data.payouts.length === 0 ? (
        <ListEmpty message={t('partnerEarnings.empty')} />
      ) : data ? (
        <ListCard>
          {data.payouts.map((group) => {
            const row = payoutRow(group, t, locale);
            return (
              <ListRowButton
                key={group.id}
                title={row.title}
                sub={row.sub}
                status={{
                  tone: TONE[group.status],
                  text: t(`partnerEarnings.status.${group.status}`),
                }}
                onClick={() => setOpen(group)}
              />
            );
          })}
        </ListCard>
      ) : null}

      <div data-tour="earnings-links">
        <ListCard>
          <ListRowButton
            title={t('partnerEarnings.accounts')}
            sub={
              data
                ? data.accounts.ready === data.accounts.count
                  ? t('partnerEarnings.accountsReady', { count: data.accounts.count })
                  : t('partnerEarnings.accountsPartial', data.accounts)
                : undefined
            }
            onClick={onOpenAccounts}
          />
          <ListRowButton
            title={t('partnerPanel.more.reports')}
            sub={t('partnerPanel.more.reportsHint')}
            onClick={onOpenReports}
          />
        </ListCard>
      </div>

      <PartnerPayoutSheet group={open} onClose={() => setOpen(null)} />
    </section>
  );
}
