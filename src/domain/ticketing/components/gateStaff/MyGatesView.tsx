import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMinuteClock } from '../../../../shared/hooks/useMinuteClock';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { zonedDayKey } from '../../../../shared/utils/timeZones';
import { BackButton } from '../../../../ui/components/BackButton';
import type { ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { ConfirmDialog } from '../../../../ui/components/ConfirmDialog';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { leaveGateUseCase } from '../../application/usecases/leaveGateUseCase';
import { useMyGates } from '../../hooks/useMyGates';
import type { MyGate } from '../../types/gateStaff';
import { gateStaffErrorKey } from '../../utils/gateStaffErrorKey';
import { GateInviteSheet } from './GateInviteSheet';
import { StaffGateSheet } from './StaffGateSheet';

const HOUR = 3_600_000;
// A portaria do evento abre 2 h antes do início e vale até 6 h depois do fim (D20, D27).
const OPENS_BEFORE = 2 * HOUR;
const GRACE = 6 * HOUR;

type Session = MyGate['sessions'][number];

/** Menu › Portaria (C1): convites e os eventos em que a pessoa está na equipe. */
export function MyGatesView({ onBack }: { onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const now = useMinuteClock();
  const { data, loading, error, reload } = useMyGates();
  const [inviting, setInviting] = useState<MyGate | null>(null);
  const [opened, setOpened] = useState<{ gate: MyGate; session: Session } | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const whenOf = (gate: MyGate, session: Session) =>
    formatBusinessDate(
      session.startsAt,
      locale,
      { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
      gate.timeZone
    );
  const timeOf = (gate: MyGate, iso: string) =>
    formatBusinessDate(iso, locale, { hour: '2-digit', minute: '2-digit' }, gate.timeZone);
  const isOpen = (session: Session) => {
    const start = new Date(session.startsAt).getTime();
    const end = new Date(session.endsAt ?? session.startsAt).getTime();
    return now >= start - OPENS_BEFORE && now <= end + GRACE;
  };
  const opensText = (gate: MyGate, session: Session) => {
    const opensAt = new Date(new Date(session.startsAt).getTime() - OPENS_BEFORE).toISOString();
    const sameDay =
      zonedDayKey(opensAt, gate.timeZone) ===
      zonedDayKey(new Date(now).toISOString(), gate.timeZone);
    return sameDay
      ? t('gateStaff.mine.opensAt', { time: timeOf(gate, opensAt) })
      : t('gateStaff.mine.opensOn', {
          date: formatBusinessDate(
            opensAt,
            locale,
            { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
            gate.timeZone
          ),
        });
  };
  const inviteWhen = (gate: MyGate) => {
    const first = gate.sessions[0];
    if (!first) return '';
    const rest = gate.sessions.length - 1;
    return rest > 0
      ? t('gateStaff.mine.sessions', { first: whenOf(gate, first), count: rest })
      : whenOf(gate, first);
  };

  const leave = (gate: MyGate) =>
    setConfirm({
      message: t('gateStaff.mine.leaveConfirm', { event: gate.title }),
      confirmLabel: t('gateStaff.mine.leave'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void leaveGateUseCase(gate.memberId)
          .then(() => {
            setNotice({ tone: 'success', text: t('gateStaff.mine.left') });
            return reload();
          })
          .catch((err: unknown) => setNotice({ tone: 'danger', text: t(gateStaffErrorKey(err)) }));
      },
    });

  return (
    <section className="w-full space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BackButton label={t('gateStaff.owner.back')} onClick={onBack} />
          <h2 className="text-[22px] font-display font-bold text-ink">
            {t('gateStaff.mine.title')}
          </h2>
        </div>
        <p className="px-1 text-[14px] text-ink/70">{t('gateStaff.mine.intro')}</p>
      </div>
      {notice && (
        <p role="status" className="px-1">
          <StatusText tone={notice.tone}>{notice.text}</StatusText>
        </p>
      )}
      {loading && data.length === 0 ? (
        <ListLoading label={t('gateStaff.mine.title')} />
      ) : error ? (
        <ListError message={t('gateStaff.mine.loadError')} onRetry={() => void reload()} />
      ) : data.length === 0 ? (
        <ListEmpty message={t('gateStaff.mine.empty')} />
      ) : (
        <ul className="space-y-3">
          {data.map((gate) => (
            <li
              key={gate.memberId}
              className="p-4 rounded-[20px] bg-surface border border-line space-y-3"
            >
              <div>
                <h3 className="text-[17px] font-semibold text-ink break-words">{gate.title}</h3>
                {gate.business && <p className="text-[14px] text-ink/70">{gate.business}</p>}
              </div>
              {gate.status === 'invited' ? (
                <>
                  <p className="text-[14px] text-ink/70 first-letter:uppercase">
                    {inviteWhen(gate)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setInviting(gate);
                    }}
                    className={`${BUTTON_PRIMARY} w-full`}
                  >
                    {t('gateStaff.mine.seeInvite')}
                  </button>
                </>
              ) : (
                <>
                  <ul className="space-y-3">
                    {gate.sessions.map((session) => (
                      <li key={session.id} className="space-y-2">
                        <p className="text-[14px] text-ink first-letter:uppercase">
                          {whenOf(gate, session)}
                        </p>
                        {isOpen(session) ? (
                          <button
                            type="button"
                            onClick={() => setOpened({ gate, session })}
                            className={`${BUTTON_SECONDARY} w-full`}
                          >
                            {t('gateStaff.mine.open')}
                          </button>
                        ) : (
                          <p className="text-[13px] text-ink/70">{opensText(gate, session)}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center">
                    <TextButton tone="ink" onClick={() => leave(gate)}>
                      {t('gateStaff.mine.leave')}
                    </TextButton>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <GateInviteSheet
        gate={inviting}
        when={inviting ? inviteWhen(inviting) : ''}
        onClose={() => setInviting(null)}
        onAnswered={(accepted) => {
          setInviting(null);
          setNotice({
            tone: 'success',
            text: t(accepted ? 'gateStaff.mine.accepted' : 'gateStaff.mine.declined'),
          });
          void reload();
        }}
      />
      {opened && (
        <StaffGateSheet
          occurrenceId={opened.session.id}
          title={opened.gate.title}
          description={whenOf(opened.gate, opened.session)}
          onClose={() => setOpened(null)}
        />
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}
