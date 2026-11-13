import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { UsernameProfile } from '../../../user';
import { inviteGateStaffUseCase } from '../../application/usecases/inviteGateStaffUseCase';
import type { GateTarget } from '../../types/gateStaff';
import { gateStaffErrorKey } from '../../utils/gateStaffErrorKey';
import { UsernamePicker } from '../shared/UsernamePicker';

const CAN = ['canScan', 'canDownload', 'canCount'] as const;
const CANNOT = ['cannotSee', 'cannotEdit'] as const;

/** Folha "Convidar para a portaria" (C1): em qual evento, quem (pelo @) e o que a pessoa pode fazer. */
export function InviteGateStaffSheet({
  open,
  targets,
  onClose,
  onInvited,
}: {
  open: boolean;
  targets: GateTarget[];
  onClose: () => void;
  onInvited: () => void;
}) {
  const { t } = useTranslation();
  const [key, setKey] = useState('');
  const [found, setFound] = useState<UsernameProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const select = useCallback((profile: UsernameProfile | null) => {
    setFound(profile);
    setError(null);
  }, []);
  const searchFailed = useCallback((err: unknown) => setError(t(gateStaffErrorKey(err))), [t]);
  const keyOf = (target: GateTarget) => `${target.type}:${target.id}`;
  const firstKey = targets[0] ? keyOf(targets[0]) : '';
  const chosen = targets.find((target) => keyOf(target) === key);

  useEffect(() => {
    if (!open) return;
    setKey(firstKey);
    setFound(null);
    setError(null);
  }, [open, firstKey]);

  const send = async () => {
    if (!found || !chosen) return;
    setBusy(true);
    setError(null);
    try {
      await inviteGateStaffUseCase({ type: chosen.type, id: chosen.id }, found.username);
      onInvited();
    } catch (err: unknown) {
      setError(t(gateStaffErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('gateStaff.sheet.title')}
    >
      <div className="space-y-4">
        {targets.length > 1 && (
          <RadioCardGroup
            name="gate-staff-event"
            legend={t('gateStaff.sheet.where')}
            value={key}
            onChange={setKey}
            options={targets.map((target) => ({
              value: keyOf(target),
              title: target.title,
              description: t(
                target.type === 'event' ? 'gateStaff.sheet.eventHint' : 'gateStaff.sheet.placeHint'
              ),
            }))}
          />
        )}
        <UsernamePicker
          resetKey={open}
          label={t('gateStaff.sheet.who')}
          placeholder={t('gateStaff.sheet.searchPlaceholder')}
          notFound={t('gateStaff.errors.USERNAME_NOT_FOUND')}
          resultsLabel={t('courtesy.sheet.results')}
          selected={found}
          onSelect={select}
          onError={searchFailed}
        />
        <ul className="rounded-2xl bg-sheet-card border border-sheet-card-line px-4 py-3 space-y-1.5 text-[14px]">
          {CAN.map((key) => (
            <li key={key} className="flex items-start gap-2 text-ink">
              <Check size={16} className="shrink-0 mt-0.5 text-success" aria-hidden="true" />
              {t(`gateStaff.sheet.${key}`)}
            </li>
          ))}
          {CANNOT.map((key) => (
            <li key={key} className="flex items-start gap-2 text-ink/70">
              <X size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
              {t(`gateStaff.sheet.${key}`)}
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={!found || !chosen || busy}
          onClick={() => void send()}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t(busy ? 'gateStaff.sheet.sending' : 'gateStaff.sheet.send')}
        </button>
      </div>
    </Dialog>
  );
}
