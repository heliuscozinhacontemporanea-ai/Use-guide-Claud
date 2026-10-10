import { useState, useEffect } from 'react';

/**
 * Hook customizado para monitorar o status da conexão à internet do usuário.
 *
 * Por que foi feito: Permite que a aplicação exiba alertas visuais de offline
 * e evite requisições desnecessárias a serviços externos quando o cliente está sem internet.
 */
export function useConnection() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    status: isOnline ? 'online' : 'offline',
    isActuallyOnline: isOnline,
  };
}
