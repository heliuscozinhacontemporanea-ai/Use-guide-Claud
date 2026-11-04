import { useTranslation } from 'react-i18next';
import type { PartnerTodayItem } from '../../types/partnerHome';
import { PartnerTodayList } from './PartnerTodayList';

/** Agenda provisória: só o dia. A semana e as folhas do horário e da sessão vêm na etapa 1d (p05–p08). */
export function PartnerAgendaTab({
  today,
  labelFor,
}: {
  today: PartnerTodayItem[];
  labelFor: (item: PartnerTodayItem) => string | null;
}) {
  const { t } = useTranslation();
  return (
    <section className="space-y-4">
      <h2 className="px-1 text-[22px] font-display font-bold text-ink">
        {t('partnerPanel.agenda.title')}
      </h2>
      <PartnerTodayList
        title={t('partnerPanel.agenda.today')}
        items={today}
        labelFor={labelFor}
        onOpen={() => undefined}
      />
    </section>
  );
}
