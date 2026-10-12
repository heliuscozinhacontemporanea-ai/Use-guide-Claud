import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUI } from '../../../../shared/stores/useUIStore';
import { maskCurrency, unmaskCurrency } from '../../../../shared/utils/currencyMask';
import { ErrorState } from '../../../../ui/components/ErrorState';
import { GlassCard } from '../../../../ui/components/GlassCard';
import {
  getAllSubscriptionPlansUseCase,
  updateSubscriptionPlanUseCase,
} from '../../index';
import {
  type AdminPlanFormValues,
  adminPlanFormSchema,
} from '../../schemas/adminPlanFormSchema';
import type { SubscriptionPlan } from '../../types/admin';

const PLAN_ORDER: SubscriptionPlan['id'][] = ['trial', 'monthly', 'semi-annual', 'annual'];

function AdminPlanCard({ plan }: { plan: SubscriptionPlan }) {
  const { showToast } = useUI();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<AdminPlanFormValues>({
    resolver: zodResolver(adminPlanFormSchema),
    defaultValues: {
      name: plan.name,
      price: maskCurrency(String(plan.priceMinor)),
      period: plan.period,
      description: plan.description ?? '',
      isActive: plan.isActive,
    },
  });

  const watchedPrice = watch('price');
  const watchedName = watch('name');

  const onSubmit = async (values: AdminPlanFormValues) => {
    try {
      const parsed = adminPlanFormSchema.parse(values);
      await updateSubscriptionPlanUseCase(plan.id, {
        name: parsed.name,
        priceMinor: Math.round(unmaskCurrency(parsed.price) * 100),
        period: parsed.period,
        description: parsed.description,
        isActive: parsed.isActive,
      });
      showToast('Plano atualizado com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('[AdminPlansView] Falha ao salvar plano:', err);
      showToast(
        err instanceof Error ? err.message : 'Erro ao salvar o plano. Tente novamente.',
        'error'
      );
    }
  };

  return (
    <GlassCard className="p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <input
              type="text"
              {...register('name')}
              maxLength={200}
              aria-label="Nome do plano"
              className="w-full bg-transparent border-b border-transparent focus:border-white/20 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded px-1 py-0.5"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs text-white/60 min-h-[44px]">
            <input
              type="checkbox"
              {...register('isActive')}
              className="focus-visible:ring-2 focus-visible:ring-teal-400/50"
            />
            Ativo
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase text-white/50">Preço</label>
            <input
              type="text"
              value={watchedPrice}
              onChange={(e) =>
                setValue('price', maskCurrency(e.target.value), { shouldValidate: true })
              }
              maxLength={12}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-teal-400/50"
            />
            {errors.price && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="text-[10px] uppercase text-white/50">Período</label>
            <input
              type="text"
              {...register('period')}
              maxLength={50}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus-visible:ring-2 focus-visible:ring-teal-400/50"
            />
            {errors.period && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.period.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase text-white/50">Descrição</label>
          <textarea
            {...register('description')}
            maxLength={300}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
          {errors.description && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.description.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={`Salvar alterações do ${watchedName || plan.name}`}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-black rounded-xl text-xs font-bold uppercase tracking-wide disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          Salvar
        </button>
      </form>
    </GlassCard>
  );
}

export function AdminPlansView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    async function loadPlans() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const allPlans = await getAllSubscriptionPlansUseCase();
        const loadedPlans = PLAN_ORDER.map((id) =>
          allPlans.find((p) => p.id === id)
        ).filter((p): p is SubscriptionPlan => p !== undefined);

        if (loadedPlans.length < PLAN_ORDER.length) {
          const missingIds = PLAN_ORDER.filter(
            (id) => !loadedPlans.some((p) => p.id === id)
          );
          console.warn(
            '[AdminPlansView] Planos ausentes na coleção subscriptionPlans:',
            missingIds
          );
          setLoadError(
            `Não foi possível carregar todos os planos (faltando: ${missingIds.join(', ')}). ` +
              `Verifique a coleção "subscriptionPlans" no Firestore ou tente novamente.`
          );
          setPlans([]);
          return;
        }

        setPlans(loadedPlans);
      } catch (err) {
        console.error('[AdminPlansView] Erro ao carregar planos:', err);
        setLoadError('Não foi possível carregar os planos agora.');
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlans();
  }, [retryKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-400" size={28} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-6">
        <ErrorState message={loadError} onRetry={() => setRetryKey((k) => k + 1)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <AdminPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
