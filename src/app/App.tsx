import { AppProviders } from './AppProviders';
import { AppRouter } from './AppRouter';
import { CourtesyLinkReceiver } from './CourtesyLinkReceiver';
import { EmailVerificationGate } from './EmailVerificationGate';
import { ErrorBoundary } from './ErrorBoundary';
import { LocalePreference } from './locale/LocalePreference';
import { PromoterLinkCapture } from './PromoterLinkCapture';
import { TransferLinkReceiver } from './TransferLinkReceiver';
import { UsernameGate } from './UsernameGate';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <UsernameGate />
        <TransferLinkReceiver />
        <CourtesyLinkReceiver />
        <PromoterLinkCapture />
        <EmailVerificationGate />
        <LocalePreference />
      </AppProviders>
    </ErrorBoundary>
  );
}
