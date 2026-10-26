import { AlertTriangle, Camera, CloudOff, Download, Loader2, RefreshCw, Wifi } from 'lucide-react';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type { OfflineCheckIn } from '../../hooks/useOfflineCheckIn';
import type { EventCheckIn } from '../../types/ticketing';

export function CheckInTab({
  checkIn,
  checkIns,
  selectedOccurrenceId,
}: {
  checkIn: OfflineCheckIn;
  checkIns: EventCheckIn[];
  selectedOccurrenceId: string;
}) {
  const {
    checkInInput,
    setCheckInInput,
    checkingIn,
    isOnline,
    offlineBundle,
    pendingOfflineCount,
    preparingOffline,
    syncingOffline,
    syncConflicts,
    cameraActive,
    videoRef,
    handleSyncOfflineCheckIns,
    handlePrepareOfflineSession,
    toggleCameraScanner,
    handleCheckInSubmit,
  } = checkIn;

  return (
    <div className="space-y-4">
      <GlassCard className="p-4 space-y-3 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isOnline
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi size={18} /> : <CloudOff size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">
                  {isOnline ? 'Operando Online' : 'Modo Offline Ativo'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    offlineBundle ? 'bg-teal-500/20 text-teal-300' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {offlineBundle
                    ? `Offline preparado (${offlineBundle.tickets.length} ingressos)`
                    : 'Offline não preparado'}
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-0.5">
                Se o mesmo ingresso for validado simultaneamente em outra estação offline, o
                conflito será resolvido na sincronização.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={!isOnline || preparingOffline || !selectedOccurrenceId}
              onClick={() => void handlePrepareOfflineSession()}
              className="min-h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              {preparingOffline ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} className="text-teal-400" />
              )}
              <span>Preparar Check-in Offline</span>
            </button>

            {pendingOfflineCount > 0 && (
              <button
                type="button"
                disabled={!isOnline || syncingOffline}
                onClick={() => void handleSyncOfflineCheckIns()}
                className="min-h-11 px-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                {syncingOffline ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>Sincronizar ({pendingOfflineCount})</span>
              </button>
            )}
          </div>
        </div>

        {syncConflicts.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs text-amber-200">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Conflitos de Sincronização Detectados</span>
            </div>
            {syncConflicts.map((c, idx) => (
              <p key={idx} className="text-[11px] text-white/80">
                • {c}
              </p>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleCheckInSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={checkInInput}
            onChange={(e) => setCheckInInput(e.target.value)}
            placeholder="Cole o token QR assinado (ugt2...) ou ID do ingresso"
            className="flex-1 min-h-11 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
          <button
            type="submit"
            disabled={checkingIn || !selectedOccurrenceId}
            className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Validar Entrada
          </button>
        </form>

        <button
          type="button"
          onClick={() => void toggleCameraScanner()}
          className="min-h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera size={15} className="text-teal-400" />
          <span>{cameraActive ? 'Fechar Câmera' : 'Ler com Câmera'}</span>
        </button>
      </div>

      {cameraActive && (
        <div className="p-3 rounded-2xl bg-black/70 border border-teal-500/30 space-y-2 text-center">
          <video
            ref={videoRef}
            className="w-full max-w-sm mx-auto rounded-xl border border-white/10 aspect-square object-cover"
            muted
            playsInline
          />
          <p className="text-xs text-white/60">Aponte a câmera para o QR Code do participante</p>
        </div>
      )}

      <div className="space-y-2">
        {checkIns.map((ci) => (
          <div
            key={ci.id}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-teal-300">Ingresso #{ci.ticketId.slice(0, 8)}</span>
              <span className="text-white/50 ml-2">
                ({ci.method === 'offline_sync' ? 'Sincronizado Offline' : 'Online'})
              </span>
            </div>
            <span className="text-white/60">
              {new Date(ci.checkedInAt).toLocaleString('pt-BR', {
                timeZone: 'America/Fortaleza',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
