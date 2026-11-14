import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { respondPromoterInviteUseCase } from '../../application/usecases/respondPromoterInviteUseCase';
import { useMyPromotions } from '../../hooks/useMyPromotions';
import type { MyPromotion } from '../../types/promoter';
import { promoterErrorKey } from '../../utils/promoterErrorKey';
import { PromoterInviteSheet } from './PromoterInviteSheet';
import { PromotionCard } from './PromotionCard';

/**
 * Menu › Divulgação (p26): quanto tem a receber, os eventos, os links e os convites (D27). O `<` e o
 * título ficam na barra fixa da folha do perfil (D33).
 */
export function MyPromotionsView() {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = useMyPromotions();
  const [inviting, setInviting] = useState<MyPromotion | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const counted = data.filter((row) => row.status !== 'invited');
  const owed = counted.reduce((sum, row) => sum + row.owedMinor, 0);
  const tickets = counted.reduce((sum, row) => sum + row.tickets, 0);

  const decline = async (promotion: MyPromotion) => {
    try {
      await respondPromoterInviteUseCase(promotion.id, false);
      setNotice({ tone: 'success', text: t('promoters.invite.declined') });
      await reload();
    } catch (err: unknown) {
      setNotice({ tone: 'danger', text: t(promoterErrorKey(err)) });
    }
  };

  return (
    <section className="w-full space-y-6">
      <div className="p-4 rounded-card bg-surface border border-line">
        <p className="text-body text-ink-muted">{t('promoters.user.owedTitle')}</p>
        <p className="text-display font-bold text-ink tabular-nums">
          {formatMoneyMinorCompact(owed, i18n.language)}
        </p>
        <p className="text-body text-ink-muted">
          {t('promoters.user.owedHint', { count: tickets })}
        </p>
      </div>
      {notice && (
        <p role="status" className="px-1">
          <StatusText tone={notice.tone}>{notice.text}</StatusText>
        </p>
      )}
      <section className="space-y-3">
        <h3 className="px-1 text-title font-display font-bold text-ink">
          {t('promoters.user.events')}
        </h3>
        {loading && data.length === 0 ? (
          <ListLoading label={t('promoters.user.events')} />
        ) : error ? (
          <ListError message={t('promoters.user.loadError')} onRetry={() => void reload()} />
        ) : data.length === 0 ? (
          <ListEmpty message={t('promoters.user.empty')} />
        ) : (
          <ul className="space-y-3">
            {data.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onOpenInvite={() => {
                  setNotice(null);
                  setInviting(promotion);
                }}
                onDecline={() => void decline(promotion)}
              />
            ))}
          </ul>
        )}
      </section>
      <PromoterInviteSheet
        promotion={inviting}
        onClose={() => setInviting(null)}
        onAnswered={(accepted) => {
          setInviting(null);
          setNotice({
            tone: 'success',
            text: t(accepted ? 'promoters.invite.accepted' : 'promoters.invite.declined'),
          });
          void reload();
        }}
      />
    </section>
  );
}
