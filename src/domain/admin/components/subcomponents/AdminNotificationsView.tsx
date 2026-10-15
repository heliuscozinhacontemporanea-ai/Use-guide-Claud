import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUI } from '../../../../shared/stores/useUIStore';
import { ErrorState } from '../../../../ui/components/ErrorState';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { sendAdminNotificationUseCase } from '../../../notifications';
import { getAllPartnersUseCase } from '../../../partners';
import {
  adminNotificationFormSchema,
  type AdminNotificationFormValues,
} from '../../schemas/adminNotificationFormSchema';

interface PartnerOption {
  id: string;
  businessName: string;
}

type RecipientMode = AdminNotificationFormValues['recipientMode'];

export function AdminNotificationsView() {
  const { showToast, confirmAction } = useUI();
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [partnersError, setPartnersError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<AdminNotificationFormValues>({
    resolver: zodResolver(adminNotificationFormSchema),
    defaultValues: {
      recipientMode: 'single',
      selectedPartnerIds: [],
      title: '',
      message: '',
    },
  });

  const recipientMode = watch('recipientMode');
  const selectedPartnerIds = watch('selectedPartnerIds');

  useEffect(() => {
    let active = true;
    setIsLoadingPartners(true);
    setPartnersError(null);

    getAllPartnersUseCase()
      .then((docs) => {
        if (!active) return;
        setPartners(
          docs.map((d: { id: string; businessName?: string }) => ({
            id: d.id,
            businessName: d.businessName || 'Sem nome',
          }))
        );
      })
      .catch((err) => {
        if (!active) return;
        console.error('[AdminNotificationsView] Erro ao buscar parceiros:', err);
        setPartnersError('Não foi possível carregar a lista de parceiros agora.');
      })
      .finally(() => {
        if (active) {
          setIsLoadingPartners(false);
        }
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  const togglePartner = (id: string) => {
    const next = selectedPartnerIds.includes(id)
      ? selectedPartnerIds.filter((p) => p !== id)
      : [...selectedPartnerIds, id];
    setValue('selectedPartnerIds', next, { shouldValidate: true });
  };

  const onSubmit = async (values: AdminNotificationFormValues) => {
    if (
      values.recipientMode === 'all' &&
      !(await confirmAction(`Enviar este aviso para todos os ${partners.length} parceiros?`))
    ) {
      return;
    }
    try {
      await sendAdminNotificationUseCase({
        recipientIds: values.recipientMode === 'all' ? 'all' : values.selectedPartnerIds,
        title: values.title,
        message: values.message,
      });

      showToast('Notificação enviada com sucesso!', 'success');
      reset({
        recipientMode: values.recipientMode,
        selectedPartnerIds: [],
        title: '',
        message: '',
      });
    } catch (err) {
      console.error('[AdminNotificationsView] Erro ao enviar:', err);
      showToast('Erro ao enviar notificação.', 'error');
    }
  };

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const firstError =
      errors.title?.message ||
      errors.message?.message ||
      errors.selectedPartnerIds?.message ||
      'Preencha os campos obrigatórios.';
    showToast(firstError, 'error');
  };

  if (isLoadingPartners) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-400" size={28} />
      </div>
    );
  }

  if (partnersError) {
    return (
      <div className="py-6">
        <ErrorState
          message={partnersError}
          onRetry={() => setRetryKey((val) => val + 1)}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
      <GlassCard className="p-5 space-y-4">
        <div>
          <label className="text-[10px] uppercase text-white/50 mb-2 block">Destinatário</label>
          <div className="flex gap-2">
            {(['single', 'multiple', 'all'] as RecipientMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  // A seleção anterior não vale para o novo modo (ex: três marcados em "Vários" e
                  // depois "Um parceiro" enviaria para os três).
                  setValue('recipientMode', mode, { shouldValidate: true });
                  setValue('selectedPartnerIds', [], { shouldValidate: false });
                }}
                className={`flex-1 min-h-[44px] py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                  recipientMode === mode
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}
              >
                {mode === 'single' ? 'Um parceiro' : mode === 'multiple' ? 'Vários' : 'Todos'}
              </button>
            ))}
          </div>
        </div>

        {recipientMode !== 'all' && (
          <div className="max-h-40 overflow-y-auto space-y-1 no-scrollbar border border-white/5 rounded-xl p-2 bg-black/10">
            {partners.length === 0 && (
              <p className="p-2 text-xs text-white/60">Nenhum parceiro cadastrado ainda.</p>
            )}
            {partners.map((partner) => (
              <label
                key={partner.id}
                className="flex items-center gap-2 p-2 min-h-[44px] rounded-lg hover:bg-white/5 cursor-pointer text-sm text-white/80"
              >
                <input
                  type={recipientMode === 'single' ? 'radio' : 'checkbox'}
                  name="partner-select"
                  checked={selectedPartnerIds.includes(partner.id)}
                  onChange={() => {
                    if (recipientMode === 'single') {
                      setValue('selectedPartnerIds', [partner.id], { shouldValidate: true });
                    } else {
                      togglePartner(partner.id);
                    }
                  }}
                />
                {partner.businessName}
              </label>
            ))}
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase text-white/50 mb-1 block">Título</label>
          <input
            type="text"
            maxLength={100}
            {...register('title')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase text-white/50 mb-1 block">Mensagem</label>
          <textarea
            maxLength={500}
            rows={3}
            {...register('message')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || partners.length === 0}
          aria-label="Enviar notificação"
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-black hover:bg-teal-400 transition-colors rounded-xl text-xs font-bold uppercase tracking-wide disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
          Enviar
        </button>
      </GlassCard>
    </form>
  );
}
