import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { ItemStats } from '../../types/interaction';
import { audienceShare } from '../../utils/audienceShare';

interface ReportsStatsGridProps {
  stats: ItemStats;
}

export function ReportsStatsGrid({ stats }: ReportsStatsGridProps) {
  const { t, i18n } = useTranslation();
  const numberFormat = new Intl.NumberFormat(i18n.language);
  const percentFormat = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 0,
  });
  const share = audienceShare(stats);

  const cards = [
    {
      key: 'whatsapp',
      label: t('insights.stats.whatsapp'),
      value: stats.whatsapp_click,
      icon: MessageCircle,
      tone: 'text-emerald-400 bg-emerald-400/10',
    },
    {
      key: 'favorites',
      label: t('insights.stats.favorites'),
      value: stats.favorite,
      icon: Heart,
      tone: 'text-rose-400 bg-rose-400/10',
    },
    {
      key: 'shares',
      label: t('insights.stats.shares'),
      value: stats.share,
      icon: Share2,
      tone: 'text-cyan-400 bg-cyan-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-2 lg:col-span-1 glassmorphism rounded-3xl p-6 border border-white/5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 text-blue-400 bg-blue-400/10">
          <Eye size={20} aria-hidden="true" />
        </div>
        <div className="text-2xl font-display font-black text-white leading-none">
          {numberFormat.format(stats.views)}
        </div>
        <div className="text-[10px] font-semibold tracking-wide text-white/60 mt-2">
          {t('insights.stats.views')}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-semibold tracking-wide text-white/60 mb-2">
            {t('insights.audience.title')}
          </p>
          {share ? (
            <>
              <div className="flex h-2 rounded-full overflow-hidden bg-white/5" aria-hidden="true">
                <div className="bg-teal-400" style={{ width: `${share.signedIn * 100}%` }} />
                <div className="bg-cyan-400/60" style={{ width: `${share.anonymous * 100}%` }} />
              </div>
              <dl className="mt-3 space-y-1 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">{t('insights.audience.signedIn')}</dt>
                  <dd className="font-bold text-teal-300">
                    {percentFormat.format(share.signedIn)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">{t('insights.audience.anonymous')}</dt>
                  <dd className="font-bold text-cyan-300">
                    {percentFormat.format(share.anonymous)}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-[11px] text-white/60">{t('insights.audience.noViews')}</p>
          )}
        </div>
      </div>

      {cards.map((card) => (
        <div key={card.key} className="glassmorphism rounded-3xl p-6 border border-white/5">
          <div
            className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-4', card.tone)}
          >
            <card.icon size={20} aria-hidden="true" />
          </div>
          <div className="text-2xl font-display font-black text-white leading-none">
            {numberFormat.format(card.value)}
          </div>
          <div className="text-[10px] font-semibold tracking-wide text-white/60 mt-2">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
