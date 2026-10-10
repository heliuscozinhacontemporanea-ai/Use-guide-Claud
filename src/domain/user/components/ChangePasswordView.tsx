import React from 'react';
import { ChevronLeft, Eye, EyeOff, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../../shared/utils/cn';
import { updatePasswordSchema, UpdatePasswordFormData } from '../schemas/userSchema';
import { PasswordData, ShowPasswordsData } from '../types/user';
import { checkPasswordRequirements } from '../../auth';

interface ChangePasswordViewProps {
  passwordData: PasswordData;
  setPasswordData: React.Dispatch<React.SetStateAction<PasswordData>>;
  showPasswords: ShowPasswordsData;
  setShowPasswords: React.Dispatch<React.SetStateAction<ShowPasswordsData>>;
  isLoading: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  onUpdatePassword: () => void;
  onBack: () => void;
}

export function ChangePasswordView({
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  isLoading,
  onUpdatePassword,
  onBack,
}: ChangePasswordViewProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      current: passwordData.current || '',
      new: passwordData.new || '',
      confirm: passwordData.confirm || '',
    },
  });

  const watchNew = watch('new', passwordData.new || '');

  React.useEffect(() => {
    setValue('current', passwordData.current || '');
    setValue('new', passwordData.new || '');
    setValue('confirm', passwordData.confirm || '');
  }, [passwordData, setValue]);

  const onSubmit = (data: UpdatePasswordFormData) => {
    setPasswordData(data);
    onUpdatePassword();
  };

  return (
    <>
      <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-indigo-400 leading-tight">
            Nova Senha
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Atualize sua segurança
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
            Senha Atual <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              {...register('current')}
              onChange={(e) => {
                register('current').onChange(e);
                setPasswordData((prev: PasswordData) => ({ ...prev, current: e.target.value }));
              }}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-10 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords((prev: ShowPasswordsData) => ({ ...prev, current: !prev.current }))
              }
              aria-label={showPasswords.current ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-3 text-white/50 hover:text-white"
            >
              {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.current && (
            <p className="text-[9px] text-rose-400 font-bold ml-1">{errors.current.message}</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
              Nova Senha <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                {...register('new')}
                onChange={(e) => {
                  register('new').onChange(e);
                  setPasswordData((prev: PasswordData) => ({ ...prev, new: e.target.value }));
                }}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-10 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev: ShowPasswordsData) => ({ ...prev, new: !prev.new }))
                }
                aria-label={showPasswords.new ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-3 text-white/50 hover:text-white"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.new && (
              <p className="text-[9px] text-rose-400 font-bold ml-1">{errors.new.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
              Confirmar Nova Senha <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                {...register('confirm')}
                onChange={(e) => {
                  register('confirm').onChange(e);
                  setPasswordData((prev: PasswordData) => ({ ...prev, confirm: e.target.value }));
                }}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-10 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev: ShowPasswordsData) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                aria-label={showPasswords.confirm ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-3 text-white/50 hover:text-white"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-[9px] text-rose-400 font-bold ml-1">{errors.confirm.message}</p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/50 mb-1">
            Requisitos:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div
              className={cn(
                'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                checkPasswordRequirements(watchNew).hasUppercase ? 'text-teal-400' : 'text-white/50'
              )}
            >
              <div
                className={cn(
                  'w-1 h-1 rounded-full',
                  checkPasswordRequirements(watchNew).hasUppercase ? 'bg-teal-400' : 'bg-white/10'
                )}
              />
              Letra Maiúscula
            </div>
            <div
              className={cn(
                'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                checkPasswordRequirements(watchNew).hasLowercase ? 'text-teal-400' : 'text-white/50'
              )}
            >
              <div
                className={cn(
                  'w-1 h-1 rounded-full',
                  checkPasswordRequirements(watchNew).hasLowercase ? 'bg-teal-400' : 'bg-white/10'
                )}
              />
              Letra Minúscula
            </div>
            <div
              className={cn(
                'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                checkPasswordRequirements(watchNew).hasNumber ? 'text-teal-400' : 'text-white/50'
              )}
            >
              <div
                className={cn(
                  'w-1 h-1 rounded-full',
                  checkPasswordRequirements(watchNew).hasNumber ? 'bg-teal-400' : 'bg-white/10'
                )}
              />
              Número
            </div>
            <div
              className={cn(
                'flex items-center gap-2 text-[8px] font-bold uppercase tracking-tight',
                checkPasswordRequirements(watchNew).hasMinLength && watchNew.length <= 20
                  ? 'text-teal-400'
                  : 'text-white/50'
              )}
            >
              <div
                className={cn(
                  'w-1 h-1 rounded-full',
                  checkPasswordRequirements(watchNew).hasMinLength && watchNew.length <= 20
                    ? 'bg-teal-400'
                    : 'bg-white/10'
                )}
              />
              8-20 Carácteres
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-teal-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {isLoading ? <Save className="animate-spin" size={16} /> : 'Atualizar senha'}
        </button>
      </form>
    </>
  );
}
