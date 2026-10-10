import { loadConnectAndInitialize } from '@stripe/connect-js';

export function createStripeConnectInstance(
  publishableKey: string,
  fetchClientSecret: () => Promise<string>
) {
  return loadConnectAndInitialize({
    publishableKey,
    fetchClientSecret,
    appearance: {
      overlays: 'dialog',
      variables: {
        colorPrimary: '#2dd4bf',
        colorBackground: '#0b1120',
        colorText: '#f8fafc',
        colorSecondaryText: '#94a3b8',
        borderRadius: '12px',
      },
    },
  });
}
