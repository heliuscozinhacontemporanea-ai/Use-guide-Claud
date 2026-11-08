import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { TextButton } from '../../../../ui/components/TextButton';
import { useBookingCheckInPass } from '../../hooks/useBookingCheckInPass';
import type { BookingSummary } from '../../types/bookings';
import { checkInPrefix } from '../../utils/checkInPrefix';
import { canEditUnitName, unitLabel } from '../../utils/unitLabel';
import { EntryQrImage } from './EntryQrImage';
import { ParticipantNameDialog } from './ParticipantNameDialog';
import { UnitPicker } from './UnitPicker';

/**
 * Código de check-in ou entrada de cada pessoa ou grupo da reserva (D20). O código só existe no
 * dia do serviço e é dito pessoalmente; o aviso contra golpe fica sempre junto.
 */
export function BookingCheckInPass({ booking }: { booking: BookingSummary }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload, saveName } = useBookingCheckInPass(booking, true);
  const [selected, setSelected] = useState(0);
  const [editing, setEditing] = useState(false);
  const entry = booking.kind === 'private_entry';
  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);

  if (loading && !data) {
    return (
      <div className="h-16 rounded-2xl bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 text-[13px] text-ink/70">
        <span>{t('serviceProof.pass.loadError')}</span>
        <TextButton tone="accent" onClick={() => void reload()}>
          {t('serviceProof.pass.retry')}
        </TextButton>
      </div>
    );
  }
  const pass = data?.passes.find((item) => item.unit === selected) ?? data?.passes[0];
  if (!data || !pass) return null;
  const total = data.passes.length;
  const label = unitLabel(t, booking, pass.unit, pass.name);
  const editable = canEditUnitName(booking, pass, new Date());

  return (
    <div className="space-y-3">
      {total > 1 && (
        <UnitPicker
          units={data.passes.map((item) => ({
            unit: item.unit,
            label: unitLabel(t, booking, item.unit, item.name),
            used: Boolean(item.checkedInAt),
          }))}
          selected={pass.unit}
          onSelect={setSelected}
        />
      )}
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink/80">
          {t(entry ? 'serviceProof.pass.entryTitle' : 'serviceProof.pass.codeTitle')}
          {total > 1 && ` · ${t('serviceProof.pass.unitOf', { n: pass.unit + 1, total })}`}
        </p>
        {booking.sellingUnit === 'group' && booking.groupMaxPeople && (
          <p className="text-[12px] text-ink/70">
            {t('serviceProof.units.group', { max: booking.groupMaxPeople })}
          </p>
        )}
      </div>

      {booking.requiresParticipantNames && (
        <div className="flex items-center justify-between gap-2 min-h-11">
          <p className="text-[15px] font-semibold text-ink truncate">{label}</p>
          {editable ? (
            <TextButton tone="accent" onClick={() => setEditing(true)}>
              {t(pass.name ? 'serviceProof.pass.changeName' : 'serviceProof.pass.addName')}
            </TextButton>
          ) : (
            pass.nameChanged && (
              <span className="text-[12px] text-ink/70">{t('serviceProof.pass.nameLocked')}</span>
            )
          )}
        </div>
      )}

      {pass.checkedInAt ? (
        <p className="text-[13px] text-success">
          {t('serviceProof.pass.checkedIn', { date: date(pass.checkedInAt) })}
        </p>
      ) : !pass.code ? (
        <p className="text-[13px] text-ink/70">
          {t('serviceProof.pass.notYet', { date: date(data.visibleFrom) })}
        </p>
      ) : (
        <>
          {entry && pass.qrToken && (
            <EntryQrImage value={pass.qrToken} alt={t('serviceProof.pass.qrAlt')} />
          )}
          <p
            className="text-center font-display text-[28px] font-bold tracking-[0.14em] tabular-nums text-ink select-all break-all"
            aria-label={t('serviceProof.pass.copyLabel', { code: pass.code.split('').join(' ') })}
          >
            {checkInPrefix(booking.kind)}:{pass.code}
          </p>
          <p className="text-[13px] text-ink/70 text-center">
            {t(entry ? 'serviceProof.pass.entryHint' : 'serviceProof.pass.codeHint')}
          </p>
          <p className="flex items-start gap-2 text-[13px] text-warn">
            <ShieldAlert size={16} className="shrink-0 mt-px" aria-hidden="true" />
            {t('serviceProof.pass.warning')}
          </p>
        </>
      )}

      {editing && (
        <ParticipantNameDialog
          initialName={pass.name ?? ''}
          onClose={() => setEditing(false)}
          onSave={(name) => saveName(pass.unit, name)}
        />
      )}
    </div>
  );
}
