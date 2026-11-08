import { useEffect, useState } from 'react';
import { useAuthContext } from '../domain/auth';
import { parseTransferLinkHash, TransferLinkReceiverDialog } from '../domain/ticketing';
import { useUI } from '../shared/stores/useUIStore';
import { useSideMenu } from './menu/useSideMenu';

const STORAGE_KEY = 'useguide.transferLink';

function readStored(): { linkId: string; token: string } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { linkId: string; token: string }) : null;
  } catch {
    return null;
  }
}

function store(link: { linkId: string; token: string } | null) {
  try {
    if (link) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(link));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem armazenamento, o link só vale enquanto a página estiver aberta.
  }
}

/**
 * Link de transferência aberto (D21): guarda o código na sessão e tira da barra de endereço, para
 * sobreviver ao login e à criação da conta (inclusive a escolha do @) sem ficar à vista.
 */
export function TransferLinkReceiver() {
  const { user, profile, loading } = useAuthContext();
  const { openLoginModal } = useUI();
  const { openMenu } = useSideMenu();
  const [link, setLink] = useState(readStored);

  useEffect(() => {
    const fromHash = parseTransferLinkHash(window.location.hash);
    if (!fromHash) return;
    store(fromHash);
    setLink(fromHash);
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search
    );
  }, []);

  const close = () => {
    store(null);
    setLink(null);
  };

  const loggedIn = Boolean(user && !user.isAnonymous);
  // Conta nova escolhe o @ antes (UsernameGate); o link espera.
  if (!link || loading || (loggedIn && !profile?.username)) return null;

  return (
    <TransferLinkReceiverDialog
      link={link}
      loggedIn={loggedIn}
      onLogin={openLoginModal}
      onAccepted={() => {
        close();
        openMenu('tickets');
      }}
      onClose={close}
    />
  );
}
