import { Loader2, Paperclip } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { declareForceMajeureUseCase } from '../../application/usecases/declareForceMajeureUseCase';
import type { AccountDebtView } from '../../types/receivables';
import { receivablesErrorKey } from '../../utils/receivablesFormat';

const MIN_REASON = 10;
const MAX_REASON = 500;

export function ForceMajeureDialog({
  debt,
  onClose,
  onDeclared,
}: {
  debt: AccountDebtView | null;
  onClose: () => void;
  onDeclared: () => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!debt) return;
    if (reason.trim().length < MIN_REASON) {
      return setError(t('receivables.forceMajeure.reasonTooShort'));
    }
    if (!proof) return setError(t('receivables.forceMajeure.proofRequired'));
    setSending(true);
    setError(null);
    try {
      await declareForceMajeureUseCase(debt.id, { reason, proof });
      onDeclared();
    } catch (err) {
      setError(t(receivablesErrorKey(err)));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={debt !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('receivables.forceMajeure.title')}
      description={t('receivables.forceMajeure.description')}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
            {t('receivables.forceMajeure.reasonLabel')}
          </label>
          <textarea
            id={`${id}-reason`}
            value={reason}
            maxLength={MAX_REASON}
            rows={4}
            onChange={(event) => setReason(event.target.value)}
            aria-describedby={`${id}-reason-hint`}
            className="w-full p-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
          <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
            {t('receivables.forceMajeure.reasonHint')}
          </p>
        </div>
        <div className="space-y-1.5">
          <span className="block text-xs font-bold text-ink">
            {t('receivables.forceMajeure.proofLabel')}
          </span>
          <label
            htmlFor={`${id}-proof`}
            className="press min-h-11 px-4 rounded-xl border border-dashed border-line text-xs text-ink flex items-center gap-2 cursor-pointer hover:bg-accent-soft focus-within:ring-2 focus-within:ring-teal-400/50"
          >
            <Paperclip size={15} aria-hidden="true" />
            <span className="truncate">
              {proof?.name ?? t('receivables.forceMajeure.proofPick')}
            </span>
            <input
              id={`${id}-proof`}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-describedby={`${id}-proof-hint`}
              onChange={(event) => setProof(event.target.files?.[0] ?? null)}
            />
          </label>
          <p id={`${id}-proof-hint`} className="text-[11px] text-ink/70">
            {t('receivables.forceMajeure.proofHint')}
          </p>
        </div>
        {error && (
          <p
            role="alert"
            className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="press w-full min-h-12 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {t(sending ? 'receivables.forceMajeure.sending' : 'receivables.forceMajeure.submit')}
        </button>
      </form>
    </Dialog>
  );
}
