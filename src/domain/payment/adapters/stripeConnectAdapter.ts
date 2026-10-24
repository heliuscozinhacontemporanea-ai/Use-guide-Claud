import { loadConnectAndInitialize } from '@stripe/connect-js';

export type ConnectTheme = 'light' | 'dark';

// Cores do tema do app (src/index.css): o componente do Stripe não lê as variáveis CSS da página.
const APPEARANCE: Record<ConnectTheme, Record<string, string>> = {
  dark: {
    colorPrimary: '#2dd4bf',
    colorBackground: '#0b1120',
    colorText: '#f8fafc',
    colorSecondaryText: '#94a3b8',
  },
  light: {
    colorPrimary: '#0f766e',
    colorBackground: '#faf6ee',
    colorText: '#231d16',
    colorSecondaryText: '#6b5f50',
  },
};

// Idiomas do Connect: https://docs.stripe.com/connect/supported-embedded-components/localization
const CONNECT_LOCALES: Record<string, string> = { 'pt-BR': 'pt-BR', en: 'en-US', fr: 'fr-FR' };

export function createStripeConnectInstance(options: {
  publishableKey: string;
  fetchClientSecret: () => Promise<string>;
  theme: ConnectTheme;
  locale: string;
}) {
  return loadConnectAndInitialize({
    publishableKey: options.publishableKey,
    fetchClientSecret: options.fetchClientSecret,
    locale: CONNECT_LOCALES[options.locale] ?? 'pt-BR',
    appearance: {
      overlays: 'dialog',
      variables: { ...APPEARANCE[options.theme], borderRadius: '12px' },
    },
  });
}
