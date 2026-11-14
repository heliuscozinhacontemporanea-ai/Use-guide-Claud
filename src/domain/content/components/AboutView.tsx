import { ChevronRight, Code, type LucideIcon, ScrollText, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../../shared/constants/appVersion';

interface AboutViewProps {
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
        <Icon size={20} className="text-ink-muted shrink-0" aria-hidden="true" />
        <span className="flex-1 text-body font-semibold text-ink">{label}</span>
        <ChevronRight size={20} className="text-ink-subtle shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

/**
 * Configurações › Sobre o app: versão, o que o app faz, termos e licenças (uma tela, sem abas). O `<`
 * e o título ficam na barra fixa da folha do perfil (D33).
 */
export function AboutView({ onOpenTerms, onOpenPartnerTerms, onOpenLicenses }: AboutViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="shrink-0 flex flex-col items-center text-center gap-2 mb-6">
        <img
          src="/pwa-192x192.png"
          alt="Use Guide"
          width={72}
          height={72}
          className="w-[72px] h-[72px] rounded-card shadow-sm"
        />
        <p className="text-meta text-ink-muted tabular-nums">
          {t('appAbout.version', { version: APP_VERSION })}
        </p>
      </div>

      <p className="shrink-0 mb-4 px-4 py-3 rounded-card bg-surface border border-line text-body text-ink">
        {t('appAbout.description')}
      </p>

      <ul className="shrink-0 rounded-card bg-surface border border-line divide-y divide-line overflow-hidden">
        <AboutRow icon={ScrollText} label={t('appAbout.terms')} onClick={onOpenTerms} />
        <AboutRow icon={Store} label={t('legal.partner.title')} onClick={onOpenPartnerTerms} />
        <AboutRow icon={Code} label={t('appAbout.licenses')} onClick={onOpenLicenses} />
      </ul>

      <p className="mt-auto pt-8 text-center text-caption text-ink-muted">
        {t('appAbout.rights', { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
