import { Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../../ui/components/ConfirmDialog';
import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
import { Dialog } from '../../../../ui/components/Dialog';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { checkInWithoutCodeUseCase } from '../../application/usecases/checkInWithoutCodeUseCase';
import { getPartnerSlotDetailUseCase } from '../../application/usecases/getPartnerSlotDetailUseCase';
import { markNoShowUseCase } from '../../application/usecases/markNoShowUseCase';
import { useEstablishmentCheckIn } from '../../hooks/useEstablishmentCheckIn';
import type { NoCodeReason, PartnerSlotDetail } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { CHECK_IN_ALPHABET, checkInPrefix, codeLengthFor } from '../../utils/checkInPrefix';
import { formatSlotTime } from '../../utils/dates';
import { NoCodeCheckInDialog } from './NoCodeCheckInDialog';

const BLOCK = 'rounded-2xl bg-sheet-card border border-sheet-card-line';
const LINK =
  'press min-h-11 px-2 rounded-xl text-[14px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50';

type Mode = 'code' | 'noCode' | 'noShow';
type Booking = PartnerSlotDetail['bookings'][number];

/**
 * Folha "Inserir código" do cartão de "Agora" (p41, D27): o código vale em qualquer horário aberto do
 * estabelecimento; a lista é a do horário do cartão. "Cliente sem código" e "Cliente não apareceu"
 * escolhem a reserva aqui mesmo.
 */
export function EstablishmentCodeSheet({
  guideItemId,
  offerId,
  slotId,
  noShowAllowed,
  onClose,
  onChanged,
}: {
  guideItemId: string;
  offerId: string;
  slotId: string;
  /** Passou a espera de 30 min desde o "Cheguei" (D20). */
  noShowAllowed: boolean;
  onClose: () => void;
  onChanged: (message?: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [detail, setDetail] = useState<PartnerSlotDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'warn' | 'danger';
    text: string;
    extra?: string;
  } | null>(null);
  const [mode, setMode] = useState<Mode>('code');
  const [noCodeFor, setNoCodeFor] = useState<Booking | null>(null);
  const [noShowFor, setNoShowFor] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      setDetail(await getPartnerSlotDetailUseCase(offerId, slotId));
    } catch {
      setLoadError(true);
    }
  }, [offerId, slotId]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    void load();
    onChanged();
  }, [load, onChanged]);
  const { submit, sending, pending } = useEstablishmentCheckIn(
    guideItemId,
    offerId,
    slotId,
    refresh
  );

  const kind = detail?.offer.kind ?? 'tour';
  const length = codeLengthFor(kind);
  const bookings = detail?.bookings ?? [];
  const done = bookings.filter((booking) => booking.checkedInUnits > 0).length;
  const waiting = bookings.filter((booking) => booking.checkedInUnits === 0);
  const nameOf = (name: string | null) => name ?? t('partnerAgora.contacts.noName');

  const confirm = async () => {
    const outcome = await submit(code);
    if (outcome.status === 'failed') {
      setFeedback({ tone: 'danger', text: outcome.message });
      return;
    }
    setCode('');
    if (outcome.status === 'saved') {
      setFeedback({ tone: 'warn', text: t('serviceProof.partner.savedOffline') });
      return;
    }
    const { result } = outcome;
    setFeedback({
      tone: result.alreadyCheckedIn ? 'warn' : 'success',
      text: result.alreadyCheckedIn
        ? t('serviceProof.partner.alreadyUsed', { time: formatSlotTime(result.checkedInAt, lang) })
        : t('partnerAgora.sheet.confirmedAt', {
            name: nameOf(result.name ?? result.buyerName),
            time: formatSlotTime(result.checkedInAt, lang),
          }),
      // O código pode ser de outro horário aberto do estabelecimento: a tela diz de qual.
      extra:
        result.slot.id === slotId
          ? undefined
          : t('partnerAgora.sheet.otherSlot', {
              title: result.offer.title,
              time: formatSlotTime(result.slot.startsAt, lang),
            }),
    });
  };

  const description = detail
    ? `${detail.offer.title} · ${formatSlotTime(detail.slot.startsAt, lang)} · ${t(
        'partnerAgora.sheet.withCode',
        { done, total: bookings.length }
      )}`
    : undefined;

  const markNoShow = async (booking: Booking) => {
    setNoShowFor(null);
    try {
      await markNoShowUseCase(booking.id);
      setMode('code');
      refresh();
      onChanged(t('partnerAgora.sheet.saved'));
    } catch (error: unknown) {
      setFeedback({ tone: 'danger', text: getBookingErrorMessage(error) });
      setMode('code');
    }
  };

  const confirmNoCode = async (reason: NoCodeReason) => {
    if (!noCodeFor) return;
    try {
      await checkInWithoutCodeUseCase(offerId, noCodeFor.id, { reason });
      setNoCodeFor(null);
      setMode('code');
      refresh();
    } catch (error: unknown) {
      setNoCodeFor(null);
      setMode('code');
      setFeedback({ tone: 'danger', text: getBookingErrorMessage(error) });
    }
  };

  return (
    <>
      <Dialog
        open={!noCodeFor}
        onOpenChange={(open) => !open && onClose()}
        title={
          mode === 'code'
            ? t('partnerAgora.sheet.title')
            : t(
                mode === 'noCode'
                  ? 'partnerAgora.sheet.pickNoCode'
                  : 'partnerAgora.sheet.pickNoShow'
              )
        }
        description={description}
      >
        {loadError ? (
          <ListError message={t('bookings.slotSheet.error')} onRetry={() => void load()} />
        ) : !detail ? (
          <ListLoading label={t('partnerAgora.sheet.title')} />
        ) : mode !== 'code' ? (
          <div className="space-y-4">
            <ul className={`${BLOCK} divide-y divide-line overflow-hidden`}>
              {waiting.map((booking) => (
                <li key={booking.id}>
                  <button
                    type="button"
                    onClick={() =>
                      mode === 'noCode' ? setNoCodeFor(booking) : setNoShowFor(booking)
                    }
                    className="press w-full min-h-14 px-4 py-3 flex items-center justify-between gap-3 text-left text-[15px] font-semibold text-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50"
                  >
                    <span className="min-w-0 break-words">
                      {nameOf(booking.buyerName)} ·{' '}
                      {t('partnerAgora.contacts.people', { count: booking.units })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-center">
              <button type="button" onClick={() => setMode('code')} className={LINK}>
                {t('partnerAgora.sheet.back')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CodeBoxesInput
              prefix={checkInPrefix(kind)}
              length={length}
              alphabet={CHECK_IN_ALPHABET}
              value={code}
              onChange={setCode}
              label={t('serviceProof.partner.codeLabel')}
              boxLabel={(index) =>
                t('serviceProof.partner.character', { n: index + 1, total: length })
              }
              disabled={sending}
            />
            {feedback && (
              <div role="status" className={`${BLOCK} px-4 py-3 space-y-1`}>
                {feedback.tone === 'success' ? (
                  <p className="flex items-center gap-2 text-[15px] text-ink">
                    <Check size={18} className="text-success shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words">{feedback.text}</span>
                  </p>
                ) : (
                  <StatusText tone={feedback.tone}>{feedback.text}</StatusText>
                )}
                {feedback.extra && <p className="text-[13px] text-ink/70">{feedback.extra}</p>}
              </div>
            )}
            {bookings.length > 0 && (
              <ul className={`${BLOCK} divide-y divide-line overflow-hidden`}>
                {bookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="px-4 py-3 min-h-12 flex items-center justify-between gap-3 text-[15px]"
                  >
                    <span className="min-w-0 text-ink font-semibold break-words">
                      {nameOf(booking.buyerName)}
                    </span>
                    {booking.checkedInUnits > 0 ? (
                      <StatusText tone="success">
                        {t('partnerAgora.sheet.statusWithCode')}
                      </StatusText>
                    ) : (
                      <StatusText tone="muted">{t('partnerAgora.sheet.statusMissing')}</StatusText>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {pending > 0 && (
              <p className="text-[13px] text-warn">
                {t('partnerAgora.sheet.pending', { count: pending })}
              </p>
            )}
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={sending || code.length !== length}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('partnerAgora.sheet.confirm')}
            </button>
            {waiting.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-6">
                <button type="button" onClick={() => setMode('noCode')} className={LINK}>
                  {t('partnerAgora.sheet.noCode')}
                </button>
                {noShowAllowed && (
                  <button type="button" onClick={() => setMode('noShow')} className={LINK}>
                    {t('partnerAgora.sheet.noShow')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
      {noCodeFor && (
        <NoCodeCheckInDialog onClose={() => setNoCodeFor(null)} onConfirm={confirmNoCode} />
      )}
      <ConfirmDialog
        data={
          noShowFor
            ? {
                title: t('partnerAgora.sheet.noShowConfirm', { name: nameOf(noShowFor.buyerName) }),
                message: t('partnerAgora.sheet.noShowMessage'),
                confirmLabel: t('partnerAgora.sheet.noShowButton'),
                cancelLabel: t('partnerAgora.sheet.back'),
                onConfirm: () => void markNoShow(noShowFor),
                onCancel: () => setNoShowFor(null),
              }
            : null
        }
      />
    </>
  );
}
