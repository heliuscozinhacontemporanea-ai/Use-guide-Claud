import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type UserSession, useAuthContext } from '../../auth';
import { getCurrentUserUseCase } from '../application/usecases/getCurrentUserUseCase';
import type { UserProfile } from '../types/user';
import { accountPhoto, accountUser } from '../utils/accountSession';

interface AccountContextValue {
  /** A sessão com o papel de parceiro e a foto do perfil. */
  user: UserSession | null;
  profile: UserProfile | null;
  /** Sessão ou perfil da conta ainda carregando. */
  loading: boolean;
  photoURL: string | null;
  setPhotoURL: (url: string | null) => void;
  refreshProfile: () => Promise<void>;
}

interface LoadedProfile {
  uid: string;
  profile: UserProfile | null;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

/**
 * Conta de quem está no app: a sessão do `auth` com o perfil do Firestore (B77). O `auth` não conhece
 * o perfil; é o `user` que lê a sessão e busca o resto.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const { user: session, loading: sessionLoading } = useAuthContext();
  const uid = session?.uid ?? null;
  const [loaded, setLoaded] = useState<LoadedProfile | null>(null);
  const [uploaded, setUploaded] = useState<{ uid: string; url: string | null } | null>(null);
  const currentUid = useRef<string | null>(null);
  // Só a leitura mais recente vale: a do cadastro, que começa antes de o nome ser gravado, não
  // apaga a que vem depois, nem a de outra conta entra depois de sair ou trocar.
  const lastRequest = useRef(0);

  const load = useCallback(async (forUid: string) => {
    const request = ++lastRequest.current;
    let profile: UserProfile | null = null;
    try {
      profile = await getCurrentUserUseCase();
    } catch (err) {
      console.error('[AccountProvider] profile sync failed:', err);
    }
    if (request === lastRequest.current && currentUid.current === forUid) {
      setLoaded({ uid: forUid, profile });
    }
  }, []);

  useEffect(() => {
    currentUid.current = uid;
    lastRequest.current += 1;
    if (uid) void load(uid);
  }, [uid, load]);

  const refreshProfile = useCallback(async () => {
    if (currentUid.current) await load(currentUid.current);
  }, [load]);

  const setPhotoURL = useCallback((url: string | null) => {
    if (currentUid.current) setUploaded({ uid: currentUid.current, url });
  }, []);

  const value = useMemo<AccountContextValue>(() => {
    const profile = uid && loaded?.uid === uid ? loaded.profile : null;
    const photoURL = accountPhoto(session, profile, uploaded?.uid === uid ? uploaded.url : null);
    return {
      user: accountUser(session, profile, photoURL),
      profile,
      loading: sessionLoading || (uid !== null && loaded?.uid !== uid),
      photoURL,
      setPhotoURL,
      refreshProfile,
    };
  }, [session, sessionLoading, uid, loaded, uploaded, setPhotoURL, refreshProfile]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount deve ser usado dentro de um AccountProvider');
  }
  return context;
}
