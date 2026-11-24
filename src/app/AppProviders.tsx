import { MotionConfig } from 'motion/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '../shared/context/ThemeContext';
import { AuthProvider } from '../domain/auth';
import { AccountProvider } from '../domain/user';
import { Z_INDEX } from '../shared/constants/zIndex';
import { useUIStore } from '../shared/stores/useUIStore';
import { ConfirmDialog } from '../ui/components/ConfirmDialog';

interface AppProvidersProps {
  children: ReactNode;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <Toaster
      containerAriaLabel={t('common.notificationsArea')}
      position="bottom-center"
      theme={resolvedTheme}
      closeButton
      richColors
      style={{ zIndex: Z_INDEX.toast }}
      toastOptions={{
        className: '!bg-surface !border !border-line !backdrop-blur-xl !text-ink !rounded-2xl',
      }}
    />
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  const confirmDialog = useUIStore((state) => state.confirmDialog);

  return (
    <ThemeProvider>
      {/* Respeita "reduzir movimento" do aparelho em todas as animações do motion (DESIGN.md §9.1). */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <AccountProvider>
            {children}
            <ConfirmDialog data={confirmDialog} />
            <ThemedToaster />
          </AccountProvider>
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
