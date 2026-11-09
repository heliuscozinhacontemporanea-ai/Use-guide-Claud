import { MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { whatsAppUrl } from '../../../../shared/utils/phone';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { listSlotContactsUseCase } from '../../application/usecases/listSlotContactsUseCase';
import type { SlotContact } from '../../types/bookings';
import { bookingReference } from '../../utils/bookingReference';
import { formatSlotTime } from '../../utils/dates';

const ICON_BUTTON =
  'press shrink-0 size-12 rounded-2xl bg-ink/[0.07] text-ink flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50';

/**
 * Contatos de quem ainda não chegou, depois do "Cheguei" (p42, D27). Cada leitura fica na auditoria
 * da reserva, então a lista só é lida ao abrir e quando o cartão muda (`version`).
 */
export function SlotContactsList({
  offerId,
  slotId,
  version,
}: {
  offerId: string;
  slotId: string;
  version: number;
}) {
  const { t, i18n } = useTranslation();
  const [contacts, setContacts] = useState<SlotContact[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `version` e `attempt` pedem uma nova leitura.
  useEffect(() => {
    let active = true;
    setError(false);
    listSlotContactsUseCase(offerId, slotId)
      .then((data) => active && setContacts(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [offerId, slotId, version, attempt]);

  if (error) {
    return (
      <ListError
        message={t('partnerAgora.contacts.error')}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }
  if (!contacts) return <ListLoading label={t('partnerAgora.contacts.loading')} />;
  if (contacts.length === 0) return null;

  return (
    <ul className="rounded-2xl bg-ink/[0.04] border border-line divide-y divide-line overflow-hidden">
      {contacts.map((contact) => {
        const name = contact.buyerName ?? t('partnerAgora.contacts.noName');
        // Mensagem pronta com o número da reserva (C2/B37); o telefone não aparece escrito.
        const whatsapp = whatsAppUrl(
          contact.phone,
          t('bookings.contact.arrived', { name, code: bookingReference(contact.bookingId) })
        );
        const response = contact.response;
        return (
          <li key={contact.bookingId} className="px-4 py-3.5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-ink break-words">
                  {name} · {t('partnerAgora.contacts.people', { count: contact.units })}
                </p>
                <p className="text-[14px] text-ink/70">{t('partnerAgora.contacts.noCode')}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                aria-label={t('partnerAgora.contacts.call', { name })}
                className={ICON_BUTTON}
              >
                <Phone size={20} aria-hidden="true" />
              </a>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('partnerAgora.contacts.whatsapp', { name })}
                  className={ICON_BUTTON}
                >
                  <MessageCircle size={20} aria-hidden="true" />
                </a>
              )}
            </div>
            {response && (
              <StatusText tone={response.response === 'coming' ? 'info' : 'warn'}>
                {t(
                  response.response === 'coming'
                    ? 'partnerAgora.contacts.coming'
                    : 'partnerAgora.contacts.notGoing',
                  { time: formatSlotTime(response.at, i18n.language) }
                )}
              </StatusText>
            )}
          </li>
        );
      })}
    </ul>
  );
}
