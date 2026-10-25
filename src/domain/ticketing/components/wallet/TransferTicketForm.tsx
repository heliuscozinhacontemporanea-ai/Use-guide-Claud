import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type { Ticket } from '../../types/ticketing';

const INPUT =
  'w-full min-h-11 px-3.5 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60 focus-visible:ring-2 focus-visible:ring-teal-400/50';

interface TransferTicketFormProps {
  ticket: Ticket;
  busy: boolean;
  onSubmit: (recipient: { email: string; name?: string }) => void;
  onCancel: () => void;
}

export function TransferTicketForm({ ticket, busy, onSubmit, onCancel }: TransferTicketFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    onSubmit({ email: email.trim(), name: name.trim() || undefined });
  };
  return (
    <GlassCard className="p-4 space-y-3 border-accent-line">
      <h4 className="text-sm font-bold text-ink">
        {t('ticketWallet.transfer.title', { id: ticket.id.slice(0, 8) })}
      </h4>
      <form onSubmit={submit} className="space-y-2.5">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('ticketWallet.transfer.name')}
          aria-label={t('ticketWallet.transfer.name')}
          className={INPUT}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('ticketWallet.transfer.email')}
          aria-label={t('ticketWallet.transfer.email')}
          className={INPUT}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 px-4 rounded-xl bg-surface text-xs font-bold text-ink/80 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 px-4 rounded-xl bg-teal-400 text-slate-950 text-xs font-black cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('ticketWallet.transfer.confirm')}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
