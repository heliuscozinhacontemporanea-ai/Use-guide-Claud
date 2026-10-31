import { AppProviders } from './AppProviders';
import { AppRouter } from './AppRouter';
import { TransferLinkReceiver } from './TransferLinkReceiver';
import { UsernameGate } from './UsernameGate';
import { EmailVerificationGate } from './EmailVerificationGate';
import { ErrorBoundary } from './ErrorBoundary';
import { LocalePreference } from './locale/LocalePreference';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <UsernameGate />
        <TransferLinkReceiver />
        <EmailVerificationGate />
        <LocalePreference />
      </AppProviders>
    </ErrorBoundary>
  );
}
