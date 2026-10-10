import React from 'react';
import { ConnectComponentsProvider } from '@stripe/react-connect-js';

export function StripeConnectProvider(props: {
  connectInstance: ReturnType<typeof import('@stripe/connect-js').loadConnectAndInitialize>;
  children: React.ReactNode;
}) {
  return (
    <ConnectComponentsProvider connectInstance={props.connectInstance}>
      {props.children}
    </ConnectComponentsProvider>
  );
}
