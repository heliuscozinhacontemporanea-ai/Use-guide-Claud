import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../shared/context/ThemeContext';
import {
  type ConnectSection,
  StripeConnectAccountEmbed,
} from '../../adapters/ui/StripeConnectAccountEmbed';
import { createPaymentAccountSessionUseCase } from '../../application/usecases/createPaymentAccountSessionUseCase';
import type { PartnerPaymentAccount } from '../../types/payment';

const SECTIONS: ConnectSection[] = ['onboarding', 'balances', 'payouts', 'payments', 'account'];

/** Cadastro e gestão no Stripe de uma conta (um CNPJ), com os componentes embutidos do Connect. */
export function PaymentAccountWorkspace({
  entry,
  onBack,
  onOnboardingExit,
}: {
  entry: PartnerPaymentAccount;
  onBack: () => void;
  onOnboardingExit: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const ready = entry.account?.readyForSales === true;
  const [section, setSection] = useState<ConnectSection>(ready ? 'balances' : 'onboarding');
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  // Antes de a conta ficar pronta, só o cadastro faz sentido: saldos e repasses ainda não existem.
  const sections = ready ? SECTIONS : (['onboarding'] as ConnectSection[]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="press min-h-11 px-3 rounded-xl border border-line text-xs font-bold text-ink flex items-center gap-2 hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {t('paymentAccounts.actions.back')}
        </button>
        <p className="text-sm font-bold text-ink font-mono break-all">{entry.maskedDocument}</p>
      </div>

      {sections.length > 1 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t('paymentAccounts.tabs.label')}
        >
          {sections.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={section === key}
              onClick={() => setSection(key)}
              className={`press min-h-11 px-3.5 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                section === key
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-surface border border-line text-ink hover:bg-accent-soft'
              }`}
            >
              {t(`paymentAccounts.tabs.${key}`)}
            </button>
          ))}
        </div>
      )}

      {publishableKey ? (
        <div className="min-h-[320px] rounded-2xl bg-surface p-4 border border-line">
          <StripeConnectAccountEmbed
            publishableKey={publishableKey}
            accountKey={entry.accountKey}
            fetchClientSecret={async () =>
              (await createPaymentAccountSessionUseCase(entry.accountKey)).clientSecret
            }
            section={section}
            theme={resolvedTheme}
            locale={i18n.language}
            onOnboardingExit={onOnboardingExit}
          />
        </div>
      ) : (
        <p
          role="alert"
          className="p-3 rounded-xl bg-warn-soft border border-warn-line text-xs text-warn"
        >
          {t('paymentAccounts.missingKey')}
        </p>
      )}
    </div>
  );
}
