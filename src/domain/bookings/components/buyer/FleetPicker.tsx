import { useTranslation } from 'react-i18next';
import { placeTimeFormNote } from '../../../../shared/utils/placeTime';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import type { PublicFleetDay, PublicOffer } from '../../types/bookings';
import type { FleetMode, FleetQuote, FleetSelection } from '../../utils/fleetSelection';
import { FleetCustomOptions } from './FleetCustomOptions';
import { FleetDayChips } from './FleetDayChips';
import { FleetFixedOptions } from './FleetFixedOptions';

/**
 * Escolha do dia e do horário numa oferta por veículo (protótipo F3b, telas 5 e 6): períodos ou
 * saídas, e o horário personalizado quando o parceiro o oferece.
 */
export function FleetPicker({
  offer,
  dates,
  date,
  onDate,
  day,
  selection,
  quote,
  onSelection,
}: {
  offer: PublicOffer & { kind: 'rental' | 'transfer' };
  dates: string[];
  date: string;
  onDate: (date: string) => void;
  day: { data: PublicFleetDay | null; loading: boolean; error: string | null; reload: () => void };
  selection: FleetSelection;
  quote: FleetQuote | null;
  onSelection: (selection: FleetSelection) => void;
}) {
  const { t } = useTranslation();
  const place = { timeZone: offer.timeZone, city: offer.city };
  const hasFixed = (offer.fleet?.fixed.length ?? 0) > 0;
  const hasCustom = Boolean(offer.fleet?.custom);
  const rental = offer.kind === 'rental';
  const note = placeTimeFormNote(t, place);

  const body = () => {
    if (day.loading) return <ListLoading label={t('bookings.buyer.loading')} />;
    if (day.error) return <ListError message={day.error} onRetry={day.reload} />;
    if (!day.data || day.data.vehicles < 1)
      return <ListEmpty message={t('fleet.booking.noTimes')} />;
    return selection.mode === 'fixed' ? (
      <FleetFixedOptions
        kind={offer.kind}
        fixed={day.data.fixed}
        timeZone={offer.timeZone}
        selectedId={selection.periodId}
        onSelect={(periodId) => onSelection({ mode: 'fixed', periodId })}
      />
    ) : (
      <FleetCustomOptions
        offer={offer}
        day={day.data}
        selection={selection}
        quote={quote}
        onChange={onSelection}
      />
    );
  };

  return (
    <div className="space-y-3">
      <FleetDayChips dates={dates} selected={date} onSelect={onDate} />
      {hasFixed && hasCustom && (
        <SegmentedControl<FleetMode>
          label={t('fleet.booking.chooseLabel')}
          value={selection.mode}
          onChange={(mode) => onSelection({ mode })}
          options={[
            {
              value: 'fixed',
              label: t(rental ? 'fleet.booking.tabFixedRental' : 'fleet.booking.tabFixedTransfer'),
            },
            {
              value: 'custom',
              label: t(
                rental ? 'fleet.booking.tabCustomRental' : 'fleet.booking.tabCustomTransfer'
              ),
            },
          ]}
        />
      )}
      {note && <p className="text-[13px] text-ink/70">{note}</p>}
      {body()}
    </div>
  );
}
