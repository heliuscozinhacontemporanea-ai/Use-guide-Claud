import { AppProviders } from './AppProviders';
import { AppRouter } from './AppRouter';
import { UsernameGate } from './UsernameGate';
import { ErrorBoundary } from './ErrorBoundary';
import { LocalePreference } from './locale/LocalePreference';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <UsernameGate />
        <LocalePreference />
      </AppProviders>
    </ErrorBoundary>
  );
}
