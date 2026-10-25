import {
  ConnectAccountManagement,
  ConnectAccountOnboarding,
  ConnectBalances,
  ConnectComponentsProvider,
  ConnectPayments,
  ConnectPayouts,
} from '@stripe/react-connect-js';
import { useMemo } from 'react';
import { type ConnectTheme, createStripeConnectInstance } from '../stripeConnectAdapter';

export type ConnectSection = 'onboarding' | 'balances' | 'payouts' | 'payments' | 'account';

/** UI adapter (AGENTS.md §3.3): componentes embutidos do Stripe Connect de uma conta, com props neutras. */
export function StripeConnectAccountEmbed(props: {
  publishableKey: string;
  /** Muda quando a conta muda: a instância do Connect é de uma conta só. */
  accountKey: string;
  fetchClientSecret: () => Promise<string>;
  section: ConnectSection;
  theme: ConnectTheme;
  locale: string;
  onOnboardingExit: () => void;
}) {
  const { publishableKey, accountKey, fetchClientSecret, theme, locale } = props;
  // biome-ignore lint/correctness/useExhaustiveDependencies: accountKey troca a conta da sessão; fetchClientSecret muda a cada render.
  const instance = useMemo(
    () => createStripeConnectInstance({ publishableKey, fetchClientSecret, theme, locale }),
    [publishableKey, accountKey, theme, locale]
  );
  return (
    <ConnectComponentsProvider connectInstance={instance}>
      {props.section === 'onboarding' && (
        <ConnectAccountOnboarding onExit={props.onOnboardingExit} />
      )}
      {props.section === 'balances' && <ConnectBalances />}
      {props.section === 'payouts' && <ConnectPayouts />}
      {props.section === 'payments' && <ConnectPayments />}
      {props.section === 'account' && <ConnectAccountManagement />}
    </ConnectComponentsProvider>
  );
}
