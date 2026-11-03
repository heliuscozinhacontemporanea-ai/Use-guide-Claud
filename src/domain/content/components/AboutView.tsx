import { ChevronRight, Code, type LucideIcon, ScrollText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { useAppVersion } from '../hooks/useAppVersion';

interface AboutViewProps {
  onBack: () => void;
  onOpenTerms: () => void;
  onOpenLicenses: () => void;
}

function AboutRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-14 px-4 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <Icon size={20} className="text-ink/80 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-[15px] font-semibold text-ink">{label}</span>
        <ChevronRight size={18} className="text-ink/40 shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Configurações › Sobre o app: quem somos, versão, termos e licenças (uma tela, sem abas). */
export function AboutView({ onBack, onOpenTerms, onOpenLicenses }: AboutViewProps) {
  const { t } = useTranslation();
  const { appVersion } = useAppVersion();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('appAbout.title')}</h2>
      </div>

      <div className="flex flex-col items-center text-center gap-1 mb-6">
        <img
          src="/pwa-192x192.png"
          alt=""
          width={72}
          height={72}
          className="w-[72px] h-[72px] rounded-[20px] mb-2 shadow-sm"
        />
        <p className="text-[22px] font-display font-bold text-ink">Use Guide</p>
        <p className="text-[13px] text-ink/70">{t('appAbout.tagline')}</p>
        {appVersion && (
          <p className="text-[12px] text-ink/70 tabular-nums">
            {t('appAbout.version', { version: appVersion.version })}
            {appVersion.revision && ` · ${t('appAbout.build', { revision: appVersion.revision })}`}
          </p>
        )}
      </div>

      <p className="shrink-0 mb-4 px-4 py-3 rounded-[20px] bg-surface border border-line text-[15px] text-ink/80 leading-relaxed">
        {t('appAbout.description')}
      </p>

      <ul className="shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        <AboutRow icon={ScrollText} label={t('appAbout.terms')} onClick={onOpenTerms} />
        <AboutRow icon={Code} label={t('appAbout.licenses')} onClick={onOpenLicenses} />
      </ul>

      <p className="mt-auto pt-8 text-center text-[12px] text-ink/70">
        {t('appAbout.rights', { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
