import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';

/** O que a fila de reclamações recebe nas reservas (D20); vem pronto do backend, por allowlist. */
export interface BookingServiceEvidence {
  startsAt: string;
  pickupAddress: string | null;
  checkIn: {
    at: string;
    method: 'code' | 'qr' | 'no_code';
    participantsPresent: number;
    participantsCount: number;
    noCodeReason: 'no_phone' | 'refused' | 'other' | null;
  } | null;
  arrival: { at: string; location: { lat: number; lng: number; accuracyM?: number } | null } | null;
  providerAbsence: {
    reportedAt: string;
    answer: 'was_there' | 'admitted' | null;
    answeredAt: string | null;
  } | null;
  serviceConfirmation: { reason: string; answer: 'yes' | 'no' | null } | null;
  noShow: boolean;
}

export function isBookingServiceEvidence(value: unknown): value is BookingServiceEvidence {
  const candidate = value as Partial<BookingServiceEvidence> | null;
  return (
    !!candidate && typeof candidate.startsAt === 'string' && typeof candidate.noShow === 'boolean'
  );
}

/** Provas do serviço para o admin decidir a reclamação: check-in, "Cheguei", relato e resposta. */
export function ServiceEvidenceList({ evidence }: { evidence: BookingServiceEvidence }) {
  const { t, i18n } = useTranslation();
  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);
  const lines: string[] = [];
  const { checkIn, arrival, providerAbsence, serviceConfirmation } = evidence;

  lines.push(
    checkIn
      ? t('serviceProof.evidence.checkIn', {
          date: date(checkIn.at),
          method: t(`serviceProof.evidence.methods.${checkIn.method}`),
          present: checkIn.participantsPresent,
          total: checkIn.participantsCount,
        })
      : t('serviceProof.evidence.noCheckIn')
  );
  if (checkIn?.noCodeReason) {
    lines.push(
      t('serviceProof.evidence.noCodeReason', {
        reason: t(`serviceProof.partner.reasons.${checkIn.noCodeReason}`),
      })
    );
  }
  lines.push(
    arrival
      ? t('serviceProof.evidence.arrival', { date: date(arrival.at) })
      : t('serviceProof.evidence.noArrival')
  );
  if (providerAbsence) {
    lines.push(
      t('serviceProof.evidence.absence', {
        date: date(providerAbsence.reportedAt),
        answer: t(`serviceProof.evidence.answers.${providerAbsence.answer ?? 'none'}`),
      })
    );
  }
  if (serviceConfirmation) {
    lines.push(
      t('serviceProof.evidence.confirmation', {
        answer: t(
          `serviceProof.evidence.confirmationAnswers.${serviceConfirmation.answer ?? 'none'}`
        ),
      })
    );
  }
  if (evidence.noShow) lines.push(t('serviceProof.evidence.noShow'));
  if (evidence.pickupAddress) {
    lines.push(t('serviceProof.evidence.pickup', { address: evidence.pickupAddress }));
  }

  const location = arrival?.location;
  return (
    <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-1.5">
      <p className="text-[13px] font-semibold text-ink">{t('serviceProof.evidence.title')}</p>
      <ul className="space-y-1">
        {lines.map((line) => (
          <li key={line} className="text-[13px] text-ink/80 break-words">
            {line}
          </li>
        ))}
      </ul>
      {location && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=17/${location.lat}/${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-[13px] font-semibold text-accent focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-xl"
        >
          {t('serviceProof.evidence.map')}
        </a>
      )}
    </div>
  );
}
