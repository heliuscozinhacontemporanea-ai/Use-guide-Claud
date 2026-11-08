import { ChevronRight, Code, type LucideIcon, ScrollText, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../../shared/constants/appVersion';
import { BackButton } from '../../../ui/components/BackButton';

interface AboutViewProps {
  onBack: () => void;
  onOpenTerms: () => void;
  onOpenPartnerTerms: () => void;
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

/** Configurações › Sobre o app: versão, o que o app faz, termos e licenças (uma tela, sem abas). */
export function AboutView({
  onBack,
  onOpenTerms,
  onOpenPartnerTerms,
  onOpenLicenses,
}: AboutViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('appAbout.title')}</h2>
      </div>

      <div className="shrink-0 flex flex-col items-center text-center gap-2 mb-6">
        <img
          src="/pwa-192x192.png"
          alt="Use Guide"
          width={72}
          height={72}
          className="w-[72px] h-[72px] rounded-[20px] shadow-sm"
        />
        <p className="text-[13px] text-ink/70 tabular-nums">
          {t('appAbout.version', { version: APP_VERSION })}
        </p>
      </div>

      <p className="shrink-0 mb-4 px-4 py-3 rounded-[20px] bg-surface border border-line text-[15px] text-ink/80 leading-relaxed">
        {t('appAbout.description')}
      </p>

      <ul className="shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        <AboutRow icon={ScrollText} label={t('appAbout.terms')} onClick={onOpenTerms} />
        <AboutRow icon={Store} label={t('legal.partner.title')} onClick={onOpenPartnerTerms} />
        <AboutRow icon={Code} label={t('appAbout.licenses')} onClick={onOpenLicenses} />
      </ul>

      <p className="mt-auto pt-8 text-center text-[12px] text-ink/70">
        {t('appAbout.rights', { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
