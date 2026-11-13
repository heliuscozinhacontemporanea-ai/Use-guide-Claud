import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { checkInTicketUseCase } from '../../application/usecases/checkInTicketUseCase';
import { getGateCountsUseCase } from '../../application/usecases/getGateCountsUseCase';
import type { GateCounts } from '../../types/gateStaff';
import { OfflineSessionCard } from '../manager/OfflineSessionCard';
import { SessionGateScreen, useSessionGate } from '../manager/SessionGate';

/**
 * Portaria de quem está na equipe (C1): a contagem, a lista sem internet e o modo portaria. É a
 * mesma portaria do dono, sem vendas, pedidos nem ações da sessão.
 */
export function StaffGateSheet({
  occurrenceId,
  title,
  description,
  onClose,
}: {
  occurrenceId: string;
  title: string;
  description: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<GateCounts | null>(null);
  const [gateMode, setGateMode] = useState(false);

  const reload = useCallback(async () => {
    // Sem internet a contagem fica como estava; a portaria segue pela lista guardada.
    await getGateCountsUseCase(occurrenceId)
      .then(setCounts)
      .catch(() => undefined);
  }, [occurrenceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const performCheckIn = useCallback(
    async (targetOccurrenceId: string, input: { qrToken: string } | { code: string }) => {
      const result = await checkInTicketUseCase({ occurrenceId: targetOccurrenceId, ...input });
      await reload();
      return result;
    },
    [reload]
  );
  const { session, gate } = useSessionGate(occurrenceId, performCheckIn, reload);

  return (
    <>
      <Dialog
        open={!gateMode}
        onOpenChange={(open) => !open && onClose()}
        title={t('gateStaff.mine.gateTitle')}
        description={`${title} · ${description}`}
      >
        <div className="space-y-4">
          {counts && (
            <p className="rounded-2xl bg-sheet-card border border-sheet-card-line px-4 py-3 text-[15px] font-semibold text-ink">
              {t('gateStaff.mine.entered', { entered: counts.entered, total: counts.total })}
            </p>
          )}
          <OfflineSessionCard session={session} />
          <p className="px-1 text-[13px] text-ink/70">{t('ticketSessions.sheet.offlineHint')}</p>
          <button
            type="button"
            onClick={() => setGateMode(true)}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t('ticketSessions.sheet.openGateMode')}
          </button>
        </div>
      </Dialog>
      {gateMode && (
        <SessionGateScreen
          sessionLabel={`${title} · ${description}`}
          entries={counts?.entered ?? 0}
          session={session}
          gate={gate}
          onClose={() => setGateMode(false)}
        />
      )}
    </>
  );
}
