import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { findUserByUsernameUseCase, type UsernameProfile } from '../../../user';
import type { Ticket } from '../../types/ticketing';
import { TransferLinkPanel } from './TransferLinkPanel';

const KNOWN_ERRORS = [
  'USERNAME_NOT_FOUND',
  'TRANSFER_TO_SELF',
  'RECIPIENT_NOT_VERIFIED',
  'RATE_LIMITED',
  'TRANSFER_ONLY_TO_BUYER',
];

interface TransferTicketFormProps {
  ticket: Ticket;
  onSubmit: (username: string) => Promise<void>;
  /** Ingresso recebido: só volta para quem comprou (D21). */
  onReturn: () => Promise<void>;
  onCancel: () => void;
  /** Recarrega a carteira depois de criar ou cancelar o link. */
  onLinkChanged: () => Promise<void> | void;
}

/** Transferência pelo @ (D21): procura a conta, mostra foto, nome e @ e só então transfere. */
export function TransferTicketForm({
  ticket,
  onSubmit,
  onReturn,
  onCancel,
  onLinkChanged,
}: TransferTicketFormProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const [value, setValue] = useState('');
  const [recipient, setRecipient] = useState<UsernameProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // @ não encontrado ou link já pendente: oferece o link para quem ainda não tem conta (D21).
  const [showLink, setShowLink] = useState(
    Boolean(ticket.transferLinkExpiresAt && new Date(ticket.transferLinkExpiresAt) > new Date())
  );

  const fail = (err: unknown) => {
    const code =
      err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
    if (code === 'USERNAME_NOT_FOUND') setShowLink(true);
    setError(t(`username.transfer.errors.${code}`));
  };

  const search = async () => {
    setBusy(true);
    setError(null);
    try {
      setRecipient(await findUserByUsernameUseCase(value));
    } catch (err: unknown) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!recipient) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(recipient.username);
    } catch (err: unknown) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const giveBack = async () => {
    setBusy(true);
    setError(null);
    try {
      await onReturn();
    } catch (err: unknown) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const sender = ticket.receivedFrom;
  if (sender) {
    const senderLabel = sender.username ? `@${sender.username}` : (sender.displayName ?? '');
    return (
      <section className="p-4 rounded-[20px] bg-surface border border-accent-line space-y-4">
        <h4 className="text-sm font-semibold text-ink">{t('username.transfer.returnTitle')}</h4>
        <p className="text-[13px] text-ink/70">
          {t('username.transfer.returnHint', { name: senderLabel })}
        </p>
        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void giveBack()}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('username.transfer.returnConfirm', { name: senderLabel })}
        </button>
        <div className="flex justify-center">
          <TextButton tone="ink" onClick={onCancel}>
            {t('common.cancel')}
          </TextButton>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 rounded-[20px] bg-surface border border-accent-line space-y-4">
      <h4 className="text-sm font-semibold text-ink">
        {t('username.transfer.title')}
        <span className="text-ink/70">
          {' '}
          · {ticket.eventSnapshot?.title ?? ticket.id.slice(0, 8)}
        </span>
      </h4>

      {recipient ? (
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-ink/80">
            {t('username.transfer.confirmTitle')}
          </p>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-ink/[0.04]">
            {recipient.photoURL ? (
              <img
                src={recipient.photoURL}
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span
                className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center text-lg font-bold"
                aria-hidden="true"
              >
                {(recipient.displayName ?? recipient.username).charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink truncate">
                {recipient.displayName ?? recipient.username}
              </p>
              <p className="text-[13px] text-ink/70 truncate">@{recipient.username}</p>
            </div>
          </div>
          <p className="text-[13px] text-ink/70">{t('username.transfer.hint')}</p>
          {error && (
            <p role="alert">
              <StatusText tone="danger">{error}</StatusText>
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirm()}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t('username.transfer.confirm', { username: recipient.username })}
          </button>
          <div className="flex flex-wrap justify-center gap-x-4">
            <TextButton tone="ink" onClick={() => setRecipient(null)}>
              {t('username.transfer.other')}
            </TextButton>
            <TextButton tone="ink" onClick={onCancel}>
              {t('common.cancel')}
            </TextButton>
          </div>
        </div>
      ) : (
        <form
          className="space-y-3"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <label htmlFor={inputId} className="block text-[13px] font-semibold text-ink/80">
            {t('username.transfer.label')}
          </label>
          <div className="flex items-center min-h-11 rounded-xl bg-surface border border-line focus-within:ring-2 focus-within:ring-teal-400/50">
            <span className="pl-3 text-sm text-ink/70" aria-hidden="true">
              @
            </span>
            <input
              id={inputId}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={31}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 min-w-0 min-h-11 px-1 bg-transparent text-sm text-ink focus:outline-none"
            />
          </div>
          {error && (
            <p role="alert">
              <StatusText tone="danger">{error}</StatusText>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={busy || value.replace(/^@/, '').trim().length < 3}
              className={BUTTON_PRIMARY}
            >
              {t('username.transfer.search')}
            </button>
          </div>
        </form>
      )}
      {showLink && <TransferLinkPanel ticket={ticket} onChanged={onLinkChanged} />}
    </section>
  );
}
