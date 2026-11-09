import { usePanelTimeZone } from '../../hooks/panelTimeZone';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { BackButton } from '../../../../ui/components/BackButton';
import type { PartnerEstablishment } from '../../types/partnerHome';
import { EstablishmentTitle } from './EstablishmentTitle';

/** "<" para sair do painel, o nome (ou "Todos") que abre o filtro e a data embaixo (D27). */
export function PartnerHomeHeader({
  establishments,
  filterName,
  otherPending,
  onOpenFilter,
  onBack,
}: {
  establishments: PartnerEstablishment[];
  filterName: string | null;
  otherPending: boolean;
  onOpenFilter: () => void;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { timeZone } = usePanelTimeZone();
  const name =
    filterName ??
    (establishments.length === 1 ? (establishments[0]?.name ?? '') : t('partnerPanel.filter.all'));
  return (
    <div>
      <div className="flex items-center gap-1">
        <BackButton label={t('partnerPanel.backToGuide')} onClick={onBack} />
        <EstablishmentTitle
          name={name}
          canChoose={establishments.length > 1}
          compact={!filterName && establishments.length > 1}
          otherPending={otherPending}
          onOpen={onOpenFilter}
        />
      </div>
      <p className="pl-10 text-[13px] text-ink/70 first-letter:uppercase">
        {formatBusinessDate(
          new Date().toISOString(),
          i18n.language,
          {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          },
          timeZone
        )}
      </p>
    </div>
  );
}
