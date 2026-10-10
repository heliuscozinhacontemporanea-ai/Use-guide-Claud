import { ChevronLeft, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../auth/context/AuthContext';
import { UserRole } from '../../auth/types/auth';
import { AdminPanel } from './AdminPanel';

function RestrictedAdminAccess() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020508] p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
        <ShieldAlert size={32} />
      </div>
      <h2 className="text-2xl font-display font-extrabold mb-2 text-white">
        Acesso Restrito
      </h2>
      <p className="text-white/50 mb-8 max-w-xs">
        Este portal é exclusivo para administradores.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ChevronLeft size={16} />
          Voltar para Home
        </div>
      </button>
    </div>
  );
}

export function AdminDispatcher() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020508]">
        <RefreshCw
          className="animate-spin text-teal-500 mb-4"
          size={32}
        />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
          Verificando Credenciais...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== UserRole.ADMIN) {
    return <RestrictedAdminAccess />;
  }

  return <AdminPanel />;
}
