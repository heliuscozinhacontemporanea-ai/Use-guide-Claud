import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';

/** Nome de uma entrada nominal (D20); o servidor confere a regra de troca única. */
export function ParticipantNameDialog({
  initialName,
  onClose,
  onSave,
}: {
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [name, setName] = useState(initialName);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = name.trim();

  const save = async () => {
    setSending(true);
    setError(null);
    try {
      await onSave(trimmed);
      onClose();
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('serviceProof.pass.nameTitle')}
      description={t('serviceProof.pass.nameHint')}
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor={id} className="text-[13px] font-semibold text-ink/80">
            {t('serviceProof.pass.nameLabel')}
          </label>
          <input
            id={id}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoComplete="name"
            className={INPUT}
          />
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending || trimmed.length < 2 || trimmed === initialName}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('serviceProof.pass.nameSave')}
        </button>
      </form>
    </Dialog>
  );
}
