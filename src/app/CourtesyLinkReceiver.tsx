import { useEffect, useState } from 'react';
import { useAuthContext } from '../domain/auth';
import { CourtesyLinkReceiverPage, parseCourtesyLinkHash } from '../domain/ticketing';
import { useUI } from '../shared/stores/useUIStore';
import { useSideMenu } from './menu/useSideMenu';

const STORAGE_KEY = 'useguide.courtesyLink';

type Link = { courtesyId: string; token: string };

function readStored(): Link | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Link) : null;
  } catch {
    return null;
  }
}

function store(link: Link | null) {
  try {
    if (link) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(link));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem armazenamento, o link só vale enquanto a página estiver aberta.
  }
}

/**
 * Link de convite aberto (D27): guarda o código na sessão e tira da barra de endereço, para
 * sobreviver ao login e à criação da conta (inclusive a escolha do @) sem ficar à vista.
 */
export function CourtesyLinkReceiver() {
  const { user, profile, loading } = useAuthContext();
  const { openLoginModal } = useUI();
  const { openMenu } = useSideMenu();
  const [link, setLink] = useState(readStored);
  const [loggingIn, setLoggingIn] = useState(false);
  const loggedIn = Boolean(user && !user.isAnonymous);

  useEffect(() => {
    const fromHash = parseCourtesyLinkHash(window.location.hash);
    if (!fromHash) return;
    store(fromHash);
    setLink(fromHash);
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search
    );
  }, []);

  useEffect(() => {
    if (loggedIn) setLoggingIn(false);
  }, [loggedIn]);

  const close = () => {
    store(null);
    setLink(null);
  };

  // Conta nova escolhe o @ antes (UsernameGate); durante o login a página sai da frente.
  if (!link || loading || loggingIn || (loggedIn && !profile?.username)) return null;

  return (
    <CourtesyLinkReceiverPage
      link={link}
      loggedIn={loggedIn}
      onLogin={() => {
        setLoggingIn(true);
        openLoginModal();
      }}
      onAccepted={() => {
        close();
        openMenu('tickets');
      }}
      onClose={close}
    />
  );
}
