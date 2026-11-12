import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatBusinessDateTime,
  formatBusinessDay,
} from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_DANGER } from '../../../../ui/styles/controls';
import { removeGateStaffUseCase } from '../../application/usecases/removeGateStaffUseCase';
import type { GateStaffMemberView } from '../../types/gateStaff';
import { gateStaffErrorKey } from '../../utils/gateStaffErrorKey';

/** Folha da pessoa da equipe (C1): situação, quantas entradas liberou e "Remover da equipe". */
export function GateStaffMemberSheet({
  member,
  eventTitle,
  onClose,
  onRemoved,
}: {
  member: GateStaffMemberView | null;
  eventTitle: string;
  onClose: () => void;
  onRemoved: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!member) return null;
  const active = member.status === 'active';
  const rows: Array<[string, string, string?]> = [
    [
      t('gateStaff.member.status'),
      t(active ? 'gateStaff.owner.active' : 'gateStaff.owner.invited'),
      active ? 'text-success' : 'text-warn',
    ],
    ...(member.acceptedAt
      ? [
          [t('gateStaff.member.joined'), formatBusinessDay(member.acceptedAt, i18n.language)] as [
            string,
            string,
          ],
        ]
      : []),
    ...(active && member.entries !== null
      ? [[t('gateStaff.member.entries'), String(member.entries)] as [string, string]]
      : []),
    ...(member.lastEntryAt
      ? [
          [
            t('gateStaff.member.lastEntry'),
            formatBusinessDateTime(member.lastEntryAt, i18n.language),
          ] as [string, string],
        ]
      : []),
  ];

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await removeGateStaffUseCase(member.id);
      onRemoved();
    } catch (err: unknown) {
      setError(t(gateStaffErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={member.displayName ?? t('gateStaff.owner.noName')}
      description={[member.username ? `@${member.username}` : null, eventTitle]
        .filter(Boolean)
        .join(' · ')}
    >
      <div className="space-y-3">
        <dl className="rounded-2xl bg-sheet-card border border-sheet-card-line px-4 py-3 space-y-2 text-[15px]">
          {rows.map(([label, value, tone]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-ink/70">{label}</dt>
              <dd className={`text-right font-semibold ${tone ?? 'text-ink'}`}>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="px-1 text-[13px] text-ink/70">
          {t(active ? 'gateStaff.member.removeHint' : 'gateStaff.member.cancelHint')}
        </p>
        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void remove()}
          className={`${BUTTON_DANGER} w-full`}
        >
          {t(
            busy
              ? 'gateStaff.member.removing'
              : active
                ? 'gateStaff.member.remove'
                : 'gateStaff.member.cancelInvite'
          )}
        </button>
      </div>
    </Dialog>
  );
}
