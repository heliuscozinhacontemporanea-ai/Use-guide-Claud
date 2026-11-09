import {
  BadgeCheck,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BENEFITS: Array<{ key: 'visibility' | 'payment' | 'panel' | 'trust'; icon: LucideIcon }> = [
  { key: 'visibility', icon: MapPin },
  { key: 'payment', icon: ShieldCheck },
  { key: 'panel', icon: LayoutDashboard },
  { key: 'trust', icon: BadgeCheck },
];

/** Apresentação para quem quer ser parceiro (V1): confiança e qualidades, no roxo do parceiro. */
export function PartnerPresentation({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div id="partner-presentation-wrapper">
      <div className="pt-2 pb-5 text-center">
        <span className="mx-auto mb-4 w-14 h-14 rounded-[18px] bg-partner-soft border border-partner-line text-partner flex items-center justify-center">
          <Store size={26} aria-hidden="true" />
        </span>
        <h2 className="text-[26px] leading-tight font-display font-bold text-ink">
          {t('partnerSignup.presentation.title')}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
          {t('partnerSignup.presentation.subtitle')}
        </p>
      </div>
      <ul className="divide-y divide-line">
        {BENEFITS.map(({ key, icon: Icon }) => (
          <li key={key} className="flex gap-3 py-3">
            <Icon size={20} className="mt-0.5 shrink-0 text-partner" aria-hidden="true" />
            <span>
              <span className="block text-[15px] font-semibold text-ink">
                {t(`partnerSignup.presentation.${key}Title`)}
              </span>
              <span className="block mt-0.5 text-[13px] leading-snug text-ink/70">
                {t(`partnerSignup.presentation.${key}Text`)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="press mt-5 w-full min-h-[52px] rounded-2xl bg-partner-fill text-on-fill text-[16px] font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
        id="start-onboard-top-btn"
      >
        {t('partnerSignup.presentation.start')}
      </button>
      <p className="mt-3 text-center text-[13px] leading-snug text-ink/70">
        {t('partnerSignup.presentation.footnote')}
      </p>
    </div>
  );
}
