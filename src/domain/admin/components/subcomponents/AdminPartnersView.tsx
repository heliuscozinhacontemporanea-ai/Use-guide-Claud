import React from 'react';
import { Users, CheckCircle, Clock, Trash2, RefreshCw, Ban } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';
import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
import { AdminPartnerSummary } from '../../types/admin';

const STATUS_BADGE: Record<
  AdminPartnerSummary['status'],
  { label: string; className: string; icon: typeof Clock }
> = {
  active: { label: 'Cadastro Ativo', className: 'text-emerald-400', icon: CheckCircle },
  pending: { label: 'Pendente', className: 'text-amber-500', icon: Clock },
  suspended: { label: 'Suspenso', className: 'text-rose-400', icon: Ban },
};

const PLAN_LABEL: Record<NonNullable<AdminPartnerSummary['verificationType']>, string> = {
  trial: 'Teste grátis',
  monthly: 'Plano mensal',
  'semi-annual': 'Plano semestral',
  annual: 'Plano anual',
  admin: 'Selo concedido pelo admin',
};

/** Selo visível para o público: verificado e não suspenso pelo admin. */
function hasVisibleSeal(partner: AdminPartnerSummary): boolean {
  return partner.isVerified && !partner.isVerificationSuspended;
}

const ROW_BUTTON =
  'flex-1 sm:flex-none min-h-[44px] px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50';

interface AdminPartnersViewProps {
  partners: AdminPartnerSummary[];
  isLoading: boolean;
  onToggleVerification: (partner: AdminPartnerSummary) => Promise<void>;
  onToggleStatus: (partner: AdminPartnerSummary) => Promise<void>;
  onDeletePartner: (partner: AdminPartnerSummary) => Promise<void>;
}

export function AdminPartnersView({
  partners,
  isLoading,
  onToggleVerification,
  onToggleStatus,
  onDeletePartner,
}: AdminPartnersViewProps) {
  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="animate-spin text-indigo-500 mx-auto" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="partners-view-container">
      <div className="pb-2">
        <h2 className="text-2xl font-display font-extrabold tracking-tight">Gestão de Parceiros</h2>
        <p className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em] mt-1">
          Controle de acessos e estabelecimentos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4" id="partners-list-grid">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="glassmorphism rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-all group"
            id={`partner-row-${partner.id}`}
          >
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                  {partner.businessName}
                </h4>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                  {partner.firstName} {partner.lastName} • {partner.email}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase text-white/50 border border-white/10">
                    Cat: {partner.category}
                  </span>
                  {(() => {
                    const badge = STATUS_BADGE[partner.status];
                    const StatusIcon = badge.icon;
                    return (
                      <div className={cn('flex items-center gap-1', badge.className)}>
                        <StatusIcon size={10} aria-hidden="true" />
                        <span className="text-[8px] font-black uppercase italic">
                          {badge.label}
                        </span>
                      </div>
                    );
                  })()}
                  {hasVisibleSeal(partner) && (
                    <div className="flex items-center gap-1 text-blue-400">
                      <VerifiedBadge size="sm" />
                      <span className="text-[8px] font-black uppercase italic">Verificado</span>
                    </div>
                  )}
                  {partner.isVerified && partner.verificationType && (
                    <span className="text-[8px] font-black uppercase text-white/60">
                      {PLAN_LABEL[partner.verificationType]}
                      {partner.verifiedUntil &&
                        ` até ${new Intl.DateTimeFormat('pt-BR', {
                          timeZone: 'America/Fortaleza',
                          dateStyle: 'short',
                        }).format(new Date(partner.verifiedUntil))}`}
                      {partner.isVerificationSuspended && ' · selo suspenso'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
              <button
                type="button"
                onClick={() => onToggleVerification(partner)}
                className={cn(
                  ROW_BUTTON,
                  hasVisibleSeal(partner)
                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-black'
                    : 'bg-blue-500 text-black'
                )}
                id={`btn-verify-${partner.id}`}
              >
                {hasVisibleSeal(partner) ? 'Retirar selo' : 'Conceder selo'}
              </button>

              <button
                type="button"
                onClick={() => onToggleStatus(partner)}
                className={cn(
                  ROW_BUTTON,
                  partner.status === 'suspended'
                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'
                    : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black'
                )}
                id={`btn-status-${partner.id}`}
              >
                {partner.status === 'suspended'
                  ? 'Reativar'
                  : partner.status === 'pending'
                    ? 'Aprovar'
                    : 'Suspender'}
              </button>

              <button
                type="button"
                onClick={() => onDeletePartner(partner)}
                aria-label={`Excluir parceiro ${partner.businessName}`}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                id={`btn-delete-${partner.id}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        {partners.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
              Nenhum parceiro cadastrado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
