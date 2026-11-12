import { Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessWeekday } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { MyPromotion } from '../../types/promoter';
import { promoterEarningText } from '../../utils/promoterEarningText';
import { buildPromoterLinkUrl } from '../../utils/promoterLinkUrl';

/** Um evento em Divulgação (p26): combinado e vendas, e o link para compartilhar ou o convite. */
export function PromotionCard({
  promotion,
  onOpenInvite,
  onDecline,
}: {
  promotion: MyPromotion;
  onOpenInvite: () => void;
  onDecline: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [copied, setCopied] = useState(false);
  const earning = promoterEarningText(t, promotion.earning, locale);
  const amount = formatMoneyMinorCompact(promotion.owedMinor, locale);
  const url = buildPromoterLinkUrl(window.location.origin, promotion.username, promotion.code);

  const copy = async () => {
    await navigator.clipboard
      ?.writeText(url)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  const share = async () => {
    const text = t('promoters.user.shareText', { event: promotion.eventTitle });
    if (navigator.share) {
      await navigator.share({ text, url }).catch(() => undefined);
      return;
    }
    await copy();
  };

  const sub = [
    promotion.startsAt && formatBusinessWeekday(promotion.startsAt, locale),
    promotion.businessName,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="p-4 rounded-[20px] bg-surface border border-line space-y-3">
      <div>
        <p className="text-[17px] font-semibold text-ink break-words">{promotion.eventTitle}</p>
        {sub && <p className="text-[15px] text-ink/70 first-letter:uppercase">{sub}</p>}
      </div>
      {promotion.status === 'invited' ? (
        <>
          <StatusText tone="info">{t('promoters.user.invited', { earning })}</StatusText>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onOpenInvite} className={BUTTON_PRIMARY}>
              {t('promoters.user.accept')}
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="press min-h-11 rounded-xl text-[15px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('promoters.user.decline')}
            </button>
          </div>
        </>
      ) : (
        <>
          <StatusText tone="muted">
            {t(promotion.status === 'ended' ? 'promoters.user.ended' : 'promoters.user.active', {
              earning,
              count: promotion.tickets,
              amount,
            })}
          </StatusText>
          {promotion.status === 'active' && (
            <>
              <div className="flex items-center gap-2 min-h-12 pl-4 pr-1 rounded-2xl bg-ink/[0.04]">
                <p className="flex-1 min-w-0 text-[15px] text-ink break-all select-all">
                  {url.replace(/^https?:\/\//, '')}
                </p>
                <button
                  type="button"
                  onClick={() => void copy()}
                  aria-label={t('promoters.user.copy')}
                  className="press w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Copy size={20} aria-hidden="true" />
                </button>
              </div>
              {copied && (
                <p role="status">
                  <StatusText tone="success">{t('promoters.user.copied')}</StatusText>
                </p>
              )}
              <button
                type="button"
                onClick={() => void share()}
                className={`${BUTTON_PRIMARY} w-full inline-flex items-center justify-center gap-2`}
              >
                <Share2 size={20} aria-hidden="true" />
                {t('promoters.user.share')}
              </button>
            </>
          )}
        </>
      )}
    </li>
  );
}
