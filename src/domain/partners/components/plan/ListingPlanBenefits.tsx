import { BadgeCheck, BarChart3, MessageSquare, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BENEFITS = [
  { key: 'seal', Icon: BadgeCheck },
  { key: 'metrics', Icon: BarChart3 },
  { key: 'featured', Icon: Sparkles },
  { key: 'reviews', Icon: MessageSquare },
] as const;

export function ListingPlanBenefits() {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-white/80">{t('listingPlan.benefits.title')}</p>
      <ul className="space-y-2">
        {BENEFITS.map(({ key, Icon }) => (
          <li key={key} className="flex items-start gap-2 text-xs text-white/70">
            <Icon size={14} className="text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
            {t(`listingPlan.benefits.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
