import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { TextButton } from '../../../../ui/components/TextButton';
import { useBookingCheckInPass } from '../../hooks/useBookingCheckInPass';
import type { BookingSummary } from '../../types/bookings';
import { checkInPrefix } from '../../utils/checkInPrefix';
import { EntryQrImage } from './EntryQrImage';

/**
 * Código de check-in ou entrada da reserva (D20). O código só existe no dia do serviço e é dito
 * pessoalmente; o aviso contra golpe fica sempre junto.
 */
export function BookingCheckInPass({ booking }: { booking: BookingSummary }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = useBookingCheckInPass(booking, true);
  const entry = booking.kind === 'private_entry';
  const prefix = checkInPrefix(booking.kind);

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
  if (!data) return null;
  if (data.checkedInAt) {
    return (
      <p className="text-[13px] text-success">
        {t('serviceProof.pass.checkedIn', {
          date: formatBusinessDateTime(data.checkedInAt, i18n.language),
        })}
      </p>
    );
  }
  if (!data.code) {
    return (
      <p className="text-[13px] text-ink/70">
        {t('serviceProof.pass.notYet', {
          date: formatBusinessDateTime(data.visibleFrom, i18n.language),
        })}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-semibold text-ink/80">
        {t(entry ? 'serviceProof.pass.entryTitle' : 'serviceProof.pass.codeTitle')}
      </p>
      {entry && data.qrToken && (
        <EntryQrImage value={data.qrToken} alt={t('serviceProof.pass.qrAlt')} />
      )}
      <p
        className="text-center font-display text-[28px] font-bold tracking-[0.14em] tabular-nums text-ink select-all break-all"
        aria-label={t('serviceProof.pass.copyLabel', { code: data.code.split('').join(' ') })}
      >
        {prefix}:{data.code}
      </p>
      <p className="text-[13px] text-ink/70 text-center">
        {t(entry ? 'serviceProof.pass.entryHint' : 'serviceProof.pass.codeHint')}
      </p>
      <p className="flex items-start gap-2 text-[13px] text-warn">
        <ShieldAlert size={16} className="shrink-0 mt-px" aria-hidden="true" />
        {t('serviceProof.pass.warning')}
      </p>
    </div>
  );
}
