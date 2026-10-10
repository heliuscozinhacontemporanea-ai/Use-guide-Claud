import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ConnectAccountManagement,
  ConnectAccountOnboarding,
  ConnectBalances,
  ConnectPayments,
  ConnectPayouts,
} from '@stripe/react-connect-js';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
import { createStripeConnectInstance } from '../adapters/stripeConnectAdapter';
import {
  createPartnerConnectAccountSessionUseCase,
  createPartnerConnectAccountUseCase,
  getPartnerConnectStatusUseCase,
} from '../application/usecases/paymentUseCases';
import type { PartnerConnectStatusResponse } from '../types/payment';
import { StripeConnectProvider } from './StripeConnectProvider';

type FinanceSubTab = 'onboarding' | 'balances' | 'payouts' | 'payments' | 'account';

export function PartnerStripeConnectPortal() {
  const [status, setStatus] = useState<PartnerConnectStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('onboarding');

  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPartnerConnectStatusUseCase();
      setStatus(res);
      if (res.chargesEnabled && res.payoutsEnabled && res.detailsSubmitted) {
        setActiveSubTab((prev) => (prev === 'onboarding' ? 'balances' : prev));
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o status financeiro.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleStartConnect = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createPartnerConnectAccountUseCase();
      setStatus(created);
      setActiveSubTab('onboarding');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar o cadastro financeiro.'
      );
    } finally {
      setCreating(false);
    }
  };

  const connectInstance = useMemo(() => {
    if (!publishableKey || !status?.connected) {
      return null;
    }
    return createStripeConnectInstance(publishableKey, async () => {
      const { clientSecret } = await createPartnerConnectAccountSessionUseCase();
      return clientSecret;
    });
  }, [publishableKey, status?.connected]);

  const isFullyReady = Boolean(
    status?.connected &&
      status.chargesEnabled &&
      status.payoutsEnabled &&
      status.detailsSubmitted
  );

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center gap-3 text-white/70">
        <Loader2 size={18} className="animate-spin text-teal-400" />
        <span className="text-xs font-semibold">Carregando conta financeira...</span>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 space-y-4 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                isFullyReady
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              {isFullyReady ? <CheckCircle2 size={20} /> : <Building2 size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">
                  {isFullyReady
                    ? 'Conta conectada'
                    : 'Complete a configuração da sua conta para receber pagamentos.'}
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isFullyReady
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {isFullyReady
                    ? 'Habilitada para vendas e repasses'
                    : status?.connected
                      ? 'Configuração pendente'
                      : 'Não conectada'}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                {isFullyReady
                  ? 'Seus recebimentos de ingressos pagos (Cartão e Pix) são transferidos automaticamente com comissão da plataforma já descontada.'
                  : 'Eventos pagos exigem conta verificada com recebimentos e repasses habilitados.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadStatus}
              aria-label="Atualizar status financeiro"
              className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
            {!status?.connected && (
              <button
                type="button"
                disabled={creating}
                onClick={handleStartConnect}
                className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ShieldCheck size={15} />
                )}
                <span>Configurar Recebimentos</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {status?.connected && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Pagamentos (Charges)</span>
              <span
                className={`font-bold ${
                  status.chargesEnabled ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                {status.chargesEnabled ? 'Ativo' : 'Pendente'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Repasses (Payouts)</span>
              <span
                className={`font-bold ${
                  status.payoutsEnabled ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                {status.payoutsEnabled ? 'Ativo' : 'Pendente'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="text-white/60">Dados cadastrais</span>
              <span
                className={`font-bold ${
                  status.detailsSubmitted ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                {status.detailsSubmitted ? 'Enviados' : 'Incompletos'}
              </span>
            </div>
          </div>
        )}
      </GlassCard>

      {status?.connected && connectInstance && (
        <GlassCard className="p-5 space-y-4 border border-white/10">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveSubTab('onboarding')}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'onboarding'
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Onboarding / Cadastro</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('balances')}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'balances'
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Wallet size={14} />
              <span>Saldos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('payouts')}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'payouts'
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Building2 size={14} />
              <span>Repasses (Payouts)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('payments')}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'payments'
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <CreditCard size={14} />
              <span>Recebimentos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('account')}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'account'
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Dados da Conta</span>
            </button>
          </div>

          <StripeConnectProvider connectInstance={connectInstance}>
            <div className="min-h-[320px] rounded-2xl bg-slate-950/60 p-4 border border-white/10">
              {activeSubTab === 'onboarding' && (
                <ConnectAccountOnboarding onExit={loadStatus} />
              )}
              {activeSubTab === 'balances' && <ConnectBalances />}
              {activeSubTab === 'payouts' && <ConnectPayouts />}
              {activeSubTab === 'payments' && <ConnectPayments />}
              {activeSubTab === 'account' && <ConnectAccountManagement />}
            </div>
          </StripeConnectProvider>
        </GlassCard>
      )}
    </div>
  );
}
