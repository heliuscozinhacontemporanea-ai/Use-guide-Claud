import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { ListCard, ListRowButton } from '../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../ui/components/ListState';
import { TextButton } from '../../../ui/components/TextButton';
import { usePromoCodes } from '../hooks/usePromoCodes';
import { type PartnerPromoCode, type PromoTargetKind, promoTargetKey } from '../types/promoCode';
import { PROMO_TONE, promoDiscountText, promoTargetsText, promoUsesText } from '../utils/promoText';
import { PromoCodeFormSheet } from './PromoCodeFormSheet';
import { PromoCodeSheet } from './PromoCodeSheet';

/**
 * Área Cupons (B1): os cupons do parceiro, para um ou mais anúncios. Aberta por um evento, mostra só
 * os cupons dele e cria um novo já com ele marcado.
 */
export function PromoCodesPage({
  scope: initialScope = null,
  backLabel,
  onBack,
}: {
  /** Aberta por um evento ou uma oferta: só os cupons dele. */
  scope?: { kind: PromoTargetKind; id: string } | null;
  backLabel: string;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = usePromoCodes();
  const [scope, setScope] = useState<string | null>(
    initialScope ? promoTargetKey(initialScope) : null
  );
  const [open, setOpen] = useState<PartnerPromoCode | null>(null);
  const [editing, setEditing] = useState<PartnerPromoCode | 'new' | null>(null);
  const listing = data?.targets.find((item) => promoTargetKey(item) === scope) ?? null;
  const rows =
    data?.promoCodes.filter(
      (promo) => !scope || promo.targets.some((target) => promoTargetKey(target) === scope)
    ) ?? [];

  return (
    <section aria-labelledby="promo-codes-title" className="space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BackButton label={backLabel} onClick={onBack} />
          <h2
            id="promo-codes-title"
            className="flex-1 min-w-0 text-[24px] font-display font-bold text-ink"
          >
            {t('promoCodes.title')}
          </h2>
          {data && data.targets.length > 0 && (
            <TextButton tone="accent" onClick={() => setEditing('new')}>
              <Plus size={18} aria-hidden="true" />
              {t('promoCodes.create')}
            </TextButton>
          )}
        </div>
        <p className="px-1 text-[14px] text-ink/70">
          {listing ? t('promoCodes.forEvent', { title: listing.title }) : t('promoCodes.subtitle')}
        </p>
        {listing && (
          <TextButton tone="accent" className="mx-1" onClick={() => setScope(null)}>
            {t('promoCodes.showAll')}
          </TextButton>
        )}
      </div>

      {loading && !data ? (
        <ListLoading label={t('promoCodes.title')} />
      ) : error || !data ? (
        <ListError message={t('promoCodes.loadError')} onRetry={() => void reload()} />
      ) : data.targets.length === 0 ? (
        <ListEmpty message={t('promoCodes.noEvents')} />
      ) : rows.length === 0 ? (
        <ListEmpty message={t(scope ? 'promoCodes.emptyEvent' : 'promoCodes.empty')} />
      ) : (
        <ListCard>
          {rows.map((promo) => (
            <ListRowButton
              key={promo.id}
              title={`${promo.code} · ${promoDiscountText(promo, t, i18n.language)}`}
              sub={[promoTargetsText(promo, t), promoUsesText(promo, t)].join(' · ')}
              status={{
                tone: PROMO_TONE[promo.status],
                text: t(`promoCodes.status.${promo.status}`),
              }}
              onClick={() => setOpen(promo)}
            />
          ))}
        </ListCard>
      )}

      <PromoCodeSheet
        promo={open}
        onClose={() => setOpen(null)}
        onEdit={(promo) => {
          setOpen(null);
          setEditing(promo);
        }}
        onChanged={() => {
          setOpen(null);
          void reload();
        }}
      />
      {data && (
        <PromoCodeFormSheet
          open={editing !== null}
          promo={editing === 'new' ? null : editing}
          targets={data.targets}
          defaultTargetKey={scope}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void reload();
          }}
        />
      )}
    </section>
  );
}
