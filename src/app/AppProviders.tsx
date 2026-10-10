import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { AuthProvider } from '../domain/auth/context/AuthContext';
import { Z_INDEX } from '../shared/constants/zIndex';
import { useUIStore } from '../shared/stores/useUIStore';
import { ConfirmDialog } from '../ui/components/ConfirmDialog';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const confirmDialog = useUIStore((state) => state.confirmDialog);

  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ConfirmDialog data={confirmDialog} />
        <Toaster
          position="bottom-center"
          theme="dark"
          closeButton
          richColors
          style={{ zIndex: Z_INDEX.toast }}
          toastOptions={{
            className:
              '!bg-neutral-900/95 !border !border-white/10 !backdrop-blur-xl !text-white !rounded-2xl',
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
