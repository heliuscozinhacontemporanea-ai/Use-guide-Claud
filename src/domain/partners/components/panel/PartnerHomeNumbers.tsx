import { useTranslation } from 'react-i18next';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { PartnerHomeView } from '../../types/partnerHome';

function NumberCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[20px] bg-surface border border-line p-4 min-w-0">
      <p className="text-[13px] text-ink/70">{label}</p>
      <p className="text-[22px] font-bold text-ink truncate">{value}</p>
      <p className="text-[13px] text-ink/70">{sub}</p>
    </div>
  );
}

/** Vendas de hoje e próximo repasse; os números somam todos os estabelecimentos da conta. */
export function PartnerHomeNumbers({
  numbers,
  manyEstablishments,
}: {
  numbers: PartnerHomeView['numbers'];
  manyEstablishments: boolean;
}) {
  const { t, i18n } = useTranslation();
  const scope = manyEstablishments ? ` ${t('partnerPanel.home.allEstablishments')}` : '';
  const payout = numbers.nextPayout;
  return (
    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
      <NumberCard
        label={t('partnerPanel.home.salesToday')}
        value={formatMoneyMinor(numbers.salesTodayMinor, i18n.language)}
        sub={`${t('partnerPanel.home.salesCount', { count: numbers.salesTodayCount })}${scope}`}
      />
      <NumberCard
        label={t('partnerPanel.home.nextPayout')}
        value={payout ? formatMoneyMinor(payout.amountMinor, i18n.language) : '—'}
        sub={
          payout
            ? t('partnerPanel.home.nextPayoutOn', {
                date: formatBusinessDay(payout.releaseAt, i18n.language),
              })
            : t('partnerPanel.home.noPayout')
        }
      />
    </div>
  );
}
