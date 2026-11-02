import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BUYER_TERMS_VERSION } from '../../shared/constants/legalTerms';
import { type CancellationPolicyFamily, policiesOf } from '../../shared/utils/cancellationPolicy';
import { formatMoneyMinor } from '../../shared/utils/money';

export type LegalSectionKey = 'use' | 'purchases' | 'partner' | 'privacy';

export interface PlatformFeesView {
  bookingsBps: number;
  ticketsBps: number;
  ticketsAbsorbedBps: number;
  ticketServiceFeeMinor: number;
}

interface LegalTermsDocumentProps {
  sections?: LegalSectionKey[];
  /** Rola até esta seção ao abrir (ex.: o link do checkout abre direto no cancelamento). */
  focusSection?: LegalSectionKey;
  /** Taxas vigentes vindas do backend; sem elas, o texto aponta para o painel de recebimentos. */
  fees?: PlatformFeesView | null;
  version?: string;
}

const FAMILIES: CancellationPolicyFamily[] = ['event', 'booking', 'transfer'];
const ALL_SECTIONS: LegalSectionKey[] = ['use', 'purchases', 'partner', 'privacy'];

/** Termos e políticas da plataforma (D15), o mesmo texto em Sobre o app e nos diálogos de aceite. */
export function LegalTermsDocument({
  sections = ALL_SECTIONS,
  focusSection,
  fees,
  version = BUYER_TERMS_VERSION,
}: LegalTermsDocumentProps) {
  const { t, i18n } = useTranslation();
  const focusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    focusRef.current?.scrollIntoView?.({ block: 'start' });
  }, []);

  const percent = (bps: number) =>
    new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 }).format(
      bps / 10_000
    );
  const paragraphs = (key: LegalSectionKey) =>
    t(`legal.${key}.paragraphs`, { returnObjects: true }) as unknown as string[];
  const date = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'long',
    timeZone: 'America/Fortaleza',
  }).format(new Date(`${version}T12:00:00-03:00`));

  return (
    <article className="space-y-6 text-sm text-ink/80 leading-relaxed">
      <header className="space-y-1">
        <p className="text-xs text-ink/70">{t('legal.version', { date })}</p>
        <p className="text-xs text-ink/70">{t('legal.prevailing')}</p>
      </header>
      {sections.map((key) => (
        <section
          key={key}
          id={`legal-${key}`}
          ref={key === focusSection ? focusRef : undefined}
          aria-labelledby={`legal-${key}-title`}
          className="space-y-2 scroll-mt-4"
        >
          <h3 id={`legal-${key}-title`} className="text-base font-bold text-ink">
            {t(`legal.${key}.title`)}
          </h3>
          {key === 'partner' && (
            <p>
              {fees
                ? t('legal.partner.feesWithValues', {
                    bookings: percent(fees.bookingsBps),
                    tickets: percent(fees.ticketsBps),
                    absorbed: percent(fees.ticketsAbsorbedBps),
                    serviceFee: formatMoneyMinor(fees.ticketServiceFeeMinor, i18n.language),
                  })
                : t('legal.partner.feesGeneric')}
            </p>
          )}
          {paragraphs(key).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {key === 'purchases' && (
            <div className="space-y-3 pt-1">
              <h4 className="text-sm font-bold text-ink">{t('legal.purchases.policiesTitle')}</h4>
              {FAMILIES.map((family) => (
                <div key={family} className="space-y-1">
                  <p className="text-xs font-semibold text-ink">
                    {t(`legal.purchases.families.${family}`)}
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {policiesOf(family).map((policy) => (
                      <li key={policy}>
                        <span className="font-semibold">
                          {t(`salesPolicy.policies.${family}.${policy}.title`)}:
                        </span>{' '}
                        {t(`salesPolicy.policies.${family}.${policy}.description`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </article>
  );
}
