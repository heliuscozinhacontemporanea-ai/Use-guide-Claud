import { Loader2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { BUTTON_SECONDARY } from '../../../ui/styles/controls';
import { openBookingContactUseCase } from '../application/usecases/openBookingContactUseCase';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

/**
 * WhatsApp com mensagem pronta para o outro lado da reserva (C2/B37). O telefone só é pedido ao
 * servidor no toque (cada abertura fica na auditoria) e nunca aparece escrito na tela.
 */
export function BookingWhatsAppButton({
  bookingId,
  message,
  label,
  ariaLabel,
  iconOnly = false,
  onError,
}: {
  bookingId: string;
  message: string;
  label: string;
  ariaLabel?: string;
  iconOnly?: boolean;
  onError: (message: string) => void;
}) {
  const { t } = useTranslation();
  const [opening, setOpening] = useState(false);

  const open = async () => {
    // A aba abre já no toque (o navegador bloqueia janela aberta depois de esperar a rede) e
    // recebe o endereço quando ele chega; sem `opener`, o WhatsApp não acessa esta página.
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    setOpening(true);
    try {
      const url = await openBookingContactUseCase(bookingId, message);
      if (!url) {
        tab?.close();
        onError(t('bookings.contact.noPhone'));
        return;
      }
      if (tab) tab.location.href = url;
      else window.location.href = url;
    } catch (error: unknown) {
      tab?.close();
      onError(getBookingErrorMessage(error));
    } finally {
      setOpening(false);
    }
  };

  const icon = opening ? (
    <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
  ) : (
    <MessageCircle size={18} className="text-[#25d366]" aria-hidden="true" />
  );

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => void open()}
        disabled={opening}
        aria-label={ariaLabel ?? label}
        className="press shrink-0 size-11 rounded-xl bg-ink/[0.07] text-ink flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        {icon}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => void open()}
      disabled={opening}
      aria-label={ariaLabel}
      className={cn(
        BUTTON_SECONDARY,
        'w-full min-h-12 inline-flex items-center justify-center gap-2'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
