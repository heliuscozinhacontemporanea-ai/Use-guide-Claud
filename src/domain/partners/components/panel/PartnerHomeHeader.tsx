import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import type { PartnerEstablishment } from '../../types/partnerHome';
import { EstablishmentTitle } from './EstablishmentTitle';

/** Data de hoje e o nome do estabelecimento (ou "Todos") que abre o filtro (D27). */
export function PartnerHomeHeader({
  establishments,
  filterName,
  otherPending,
  onOpenFilter,
}: {
  establishments: PartnerEstablishment[];
  filterName: string | null;
  otherPending: boolean;
  onOpenFilter: () => void;
}) {
  const { t, i18n } = useTranslation();
  const name =
    filterName ??
    (establishments.length === 1 ? (establishments[0]?.name ?? '') : t('partnerPanel.filter.all'));
  return (
    <div>
      <p className="text-[13px] text-ink/70 first-letter:uppercase">
        {formatBusinessDate(new Date().toISOString(), i18n.language, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
      <EstablishmentTitle
        name={name}
        canChoose={establishments.length > 1}
        otherPending={otherPending}
        onOpen={onOpenFilter}
      />
    </div>
  );
}
