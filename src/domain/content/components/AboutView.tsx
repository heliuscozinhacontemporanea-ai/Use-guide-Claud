import {
  Building2,
  ChevronRight,
  Code,
  FileText,
  Handshake,
  type LucideIcon,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  Store,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import type { LegalSectionKey } from '../../../ui/legal/LegalTermsDocument';
import { useAppVersion } from '../hooks/useAppVersion';

interface AboutViewProps {
  onBack: () => void;
  onOpenCompany: () => void;
  onOpenPartners: () => void;
  onOpenSupport: () => void;
  onOpenLegal: (section: LegalSectionKey) => void;
  onOpenLicenses: () => void;
}

const LEGAL_ROWS: Array<{ section: LegalSectionKey; icon: LucideIcon }> = [
  { section: 'use', icon: FileText },
  { section: 'purchases', icon: ReceiptText },
  { section: 'partner', icon: Store },
  { section: 'privacy', icon: ShieldCheck },
];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="shrink-0 mb-5">
      <h3 className="px-1 mb-2 text-[13px] font-semibold text-ink/70">{title}</h3>
      <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        {children}
      </ul>
    </section>
  );
}

function Row({
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

/**
 * Configurações › Sobre o app, no modelo de Airbnb e Tripadvisor: quem somos, cada documento legal
 * num item próprio e a versão no fim.
 */
export function AboutView({
  onBack,
  onOpenCompany,
  onOpenPartners,
  onOpenSupport,
  onOpenLegal,
  onOpenLicenses,
}: AboutViewProps) {
  const { t } = useTranslation();
  const { appVersion } = useAppVersion();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('appAbout.title')}</h2>
      </div>

      <div className="shrink-0 flex flex-col items-center text-center gap-1 mb-6">
        <img
          src="/pwa-192x192.png"
          alt=""
          width={72}
          height={72}
          className="w-[72px] h-[72px] rounded-[20px] mb-2 shadow-sm"
        />
        <p className="text-[22px] font-display font-bold text-ink">Use Guide</p>
        <p className="text-[13px] text-ink/70">{t('appAbout.tagline')}</p>
      </div>

      <Group title={t('appAbout.groupUseGuide')}>
        <Row icon={Building2} label={t('appAbout.company')} onClick={onOpenCompany} />
        <Row icon={Handshake} label={t('appAbout.partners')} onClick={onOpenPartners} />
        <Row icon={MessageCircle} label={t('appAbout.contact')} onClick={onOpenSupport} />
      </Group>

      <Group title={t('appAbout.groupLegal')}>
        {LEGAL_ROWS.map(({ section, icon }) => (
          <Row
            key={section}
            icon={icon}
            label={t(`legal.${section}.title`)}
            onClick={() => onOpenLegal(section)}
          />
        ))}
        <Row icon={Code} label={t('appAbout.licenses')} onClick={onOpenLicenses} />
      </Group>

      {appVersion && (
        <section className="shrink-0 mb-5">
          <h3 className="px-1 mb-2 text-[13px] font-semibold text-ink/70">
            {t('appAbout.groupApp')}
          </h3>
          <dl className="rounded-[20px] bg-surface border border-line px-4 min-h-14 flex items-center justify-between gap-3">
            <dt className="text-[15px] font-semibold text-ink">{t('appAbout.versionRow')}</dt>
            <dd className="text-[13px] text-ink/70 tabular-nums text-right">
              {appVersion.version}
              {appVersion.revision && (
                <span className="block text-[12px]">
                  {t('appAbout.build', { revision: appVersion.revision })}
                </span>
              )}
            </dd>
          </dl>
        </section>
      )}

      <p className="mt-auto pt-4 text-center text-[12px] text-ink/70">
        {t('appAbout.rights', { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
