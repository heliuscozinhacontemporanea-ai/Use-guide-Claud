import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyPasswordResetCodeUseCase, confirmPasswordResetUseCase } from '../factory';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/authSchema';
import { checkPasswordRequirements } from '../utils/passwordRequirements';
import { cn } from '../../../shared/utils/cn';
import { useUIStore } from '../../../shared/stores/useUIStore';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  const [email, setEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'verify' | 'success' | 'error'>('verify');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const watchPassword = watch('password') || '';
  const requirements = checkPasswordRequirements(watchPassword);

  useEffect(() => {
    async function verifyCode() {
      if (!oobCode) {
        setError('Link de recuperação inválido ou expirado.');
        setStep('error');
        setIsLoading(false);
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCodeUseCase(oobCode);
        setEmail(userEmail);
      } catch (err: any) {
        console.error('Verify Code Error:', err);
        setError('Este link expirou ou já foi utilizado.');
        setStep('error');
      } finally {
        setIsLoading(false);
      }
    }

    verifyCode();
  }, [oobCode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'success') {
      setCountdown(5);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            handleGoToLogin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    if (!oobCode) {
      setError('Código de redefinição não encontrado.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await confirmPasswordResetUseCase(oobCode, data.password);
      setStep('success');
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      setError('Erro ao salvar nova senha. Tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoToLogin = () => {
    useUIStore.getState().openLoginModal();
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-full py-8 flex items-center justify-center p-6">
        <RefreshCw className="text-teal-500 animate-spin" size={32} />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-full py-8 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm glassmorphism-vibrant p-8 rounded-[2.5rem] border border-white/10 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-white">Ops!</h2>
            <p className="text-sm text-white/60 leading-relaxed">{error}</p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                useUIStore.getState().openLoginModal();
                navigate('/');
              }}
              className="w-full h-12 min-h-[44px] bg-teal-500 text-black font-black uppercase text-xs rounded-2xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50 flex items-center justify-center tracking-widest"
            >
              Solicitar Novo Link
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full h-12 min-h-[44px] glassmorphism rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              Voltar ao Início
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-full py-8 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm glassmorphism-vibrant p-8 rounded-[2.5rem] border border-white/10 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-white">Sucesso!</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Sua senha foi redefinida com sucesso.
            </p>
            <p className="text-xs text-white/60">
              Redirecionando para o login em {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full h-12 min-h-[44px] bg-teal-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            Fazer Login agora
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full py-8 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glassmorphism-vibrant p-8 rounded-[3rem] border border-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto mb-4">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight text-white mb-2">
            Nova Senha
          </h1>
          {email && (
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">
              {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onResetSubmit)} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="reset-new-password" className="sr-only">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-white/50" />
                </div>
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nova senha *"
                  {...register('password')}
                  maxLength={100}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'reset-password-error' : undefined}
                  className={cn(
                    'w-full h-14 pl-12 pr-12 bg-white/5 border rounded-2xl text-base font-medium focus:outline-none transition-colors text-white',
                    errors.password
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-white/10 focus:border-teal-500/50'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  className="absolute inset-y-0 right-4 flex items-center text-white/50 hover:text-white min-w-[44px] min-h-[44px] justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="reset-password-error"
                  role="alert"
                  className="text-[11px] text-rose-400 font-medium ml-1"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="reset-confirm-password" className="sr-only">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-white/50" />
                </div>
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar nova senha *"
                  {...register('confirmPassword')}
                  maxLength={100}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? 'reset-confirm-password-error' : undefined
                  }
                  className={cn(
                    'w-full h-14 pl-12 pr-12 bg-white/5 border rounded-2xl text-base font-medium focus:outline-none transition-colors text-white',
                    errors.confirmPassword
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-white/10 focus:border-teal-500/50'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Exibir confirmação'}
                  className="absolute inset-y-0 right-4 flex items-center text-white/50 hover:text-white min-w-[44px] min-h-[44px] justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="reset-confirm-password-error"
                  role="alert"
                  className="text-[11px] text-rose-400 font-medium ml-1"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">
                Requisitos:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                    requirements.hasUppercase ? 'text-teal-400' : 'text-white/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-1 h-1 rounded-full',
                      requirements.hasUppercase ? 'bg-teal-400' : 'bg-white/20'
                    )}
                  />
                  Maiúscula
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                    requirements.hasLowercase ? 'text-teal-400' : 'text-white/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-1 h-1 rounded-full',
                      requirements.hasLowercase ? 'bg-teal-400' : 'bg-white/20'
                    )}
                  />
                  Minúscula
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                    requirements.hasNumber ? 'text-teal-400' : 'text-white/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-1 h-1 rounded-full',
                      requirements.hasNumber ? 'bg-teal-400' : 'bg-white/20'
                    )}
                  />
                  Número
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                    requirements.hasSpecial ? 'text-teal-400' : 'text-white/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-1 h-1 rounded-full',
                      requirements.hasSpecial ? 'bg-teal-400' : 'bg-white/20'
                    )}
                  />
                  Especial
                </div>
                <div
                  className={cn(
                    'col-span-2 flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                    requirements.hasMinLength ? 'text-teal-400' : 'text-white/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-1 h-1 rounded-full',
                      requirements.hasMinLength ? 'bg-teal-400' : 'bg-white/20'
                    )}
                  />
                  Mínimo 8 caracteres
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider text-center leading-relaxed">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full h-14 min-h-[44px] glassmorphism-vibrant bg-teal-500/20 border-teal-500/30 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 group active:scale-95 transition-all text-white shadow-lg shadow-teal-500/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {isVerifying ? (
              <RefreshCw className="animate-spin text-teal-400" size={18} />
            ) : (
              <>
                Salvar Senha
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform text-teal-400"
                />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
