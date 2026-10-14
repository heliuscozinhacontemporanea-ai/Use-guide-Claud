import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserSession } from '../../auth/types/auth';
import { PhoneInputField, PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import { updateProfileSchema, UpdateProfileFormData } from '../schemas/userSchema';

interface AccountViewProps {
  user: UserSession | null;
  userData: { firstName: string; lastName: string; phone: string };
  setUserData: React.Dispatch<
    React.SetStateAction<{ firstName: string; lastName: string; phone: string }>
  >;
  isLoading: boolean;
  isPartner: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  onUpdateProfile: () => void;
  onChangePassword: () => void;
  onDeleteAccount: (password?: string) => void;
  /** Conta com login por senha; quem entra só com Google confirma pelo popup do Google. */
  hasPassword: boolean;
  onBack: () => void;
}

export function AccountView({
  user,
  userData,
  setUserData,
  isLoading,
  isPartner,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount,
  hasPassword,
  onBack,
}: AccountViewProps) {
  const [deletePassword, setDeletePassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const [ddi, setDdi] = React.useState('+55');
  const [phoneOnly, setPhoneOnly] = React.useState('');
  const phoneRef = React.useRef<PhoneInputFieldRef>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    },
  });

  React.useEffect(() => {
    setValue('firstName', userData.firstName);
    setValue('lastName', userData.lastName);
    setValue('phone', userData.phone);

    if (userData.phone) {
      if (userData.phone.startsWith('+')) {
        const parts = userData.phone.split(' ');
        const ddiPart = parts[0] || '+55';
        const restPhone = parts.slice(1).join(' ');
        setDdi(ddiPart);
        setPhoneOnly(restPhone);
      } else {
        setDdi('+55');
        setPhoneOnly(userData.phone);
      }
    } else {
      setDdi('+55');
      setPhoneOnly('');
    }
  }, [userData, setValue]);

  const handlePhoneChange = (newPhone: string) => {
    setPhoneOnly(newPhone);
    const fullPhone = `${ddi} ${newPhone}`;
    setValue('phone', fullPhone);
    setUserData((prev) => ({ ...prev, phone: fullPhone }));
  };

  const handleDdiChange = (newDdi: string) => {
    setDdi(newDdi);
    const fullPhone = `${newDdi} ${phoneOnly}`;
    setValue('phone', fullPhone);
    setUserData((prev) => ({ ...prev, phone: fullPhone }));
  };

  const onSubmit = (data: UpdateProfileFormData) => {
    if (phoneRef.current && !phoneRef.current.validate()) {
      return;
    }
    setUserData(data);
    onUpdateProfile();
  };

  const handleDelete = () => {
    if (!hasPassword) {
      onDeleteAccount();
      return;
    }
    if (!deletePassword) return;
    onDeleteAccount(deletePassword);
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
          <h2 className="text-2xl font-display font-black mb-1 text-teal-400 leading-tight">
            Minha Conta
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Gerencie seus dados pessoais
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
                Nome
              </label>
              <input
                type="text"
                {...register('firstName')}
                onChange={(e) => {
                  register('firstName').onChange(e);
                  setUserData((prev) => ({ ...prev, firstName: e.target.value }));
                }}
                maxLength={100}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:border-teal-500/50 transition-colors text-white"
              />
              {errors.firstName && (
                <p className="text-[9px] text-rose-400 font-bold ml-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
                Sobrenome
              </label>
              <input
                type="text"
                {...register('lastName')}
                onChange={(e) => {
                  register('lastName').onChange(e);
                  setUserData((prev) => ({ ...prev, lastName: e.target.value }));
                }}
                maxLength={100}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:border-teal-500/50 transition-colors text-white"
              />
              {errors.lastName && (
                <p className="text-[9px] text-rose-400 font-bold ml-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
              Telefone
            </label>
            <Controller
              name="phone"
              control={control}
              render={() => (
                <PhoneInputField
                  ref={phoneRef}
                  id="account-phone-field"
                  phone={phoneOnly}
                  ddi={ddi}
                  onPhoneChange={handlePhoneChange}
                  onDdiChange={handleDdiChange}
                  required
                />
              )}
            />
            {errors.phone && (
              <p className="text-[9px] text-rose-400 font-bold ml-1">{errors.phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-teal-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Save className="animate-spin" size={16} /> : 'Atualizar Perfil'}
          </button>
        </form>

        <div className="h-px bg-white/5" />

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
              E-mail
            </label>
            <div className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 flex items-center text-sm font-medium text-white/60">
              {user?.email}
            </div>
          </div>

          {hasPassword && (
            <button
              onClick={onChangePassword}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white/80 text-[9px] font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all"
            >
              <Lock size={12} />
              Alterar Senha
            </button>
          )}
        </div>

        <div className="pt-2 flex justify-center">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[9px] font-bold text-white/60 hover:text-rose-400/60 uppercase tracking-widest transition-colors flex items-center gap-2 py-2"
            >
              <Trash2 size={12} />
              Excluir conta
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-3"
            >
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Atenção</span>
              </div>
              <p className="text-[9px] text-white/60 leading-relaxed">
                Esta ação é{' '}
                <span className="text-rose-400 font-bold">definitiva e irreversível</span>.
                {isPartner &&
                  ' Suas empresas e eventos cadastrados em sua conta também serão excluídos.'}
              </p>

              {hasPassword && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
                    Para confirmar, digite sua senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Sua senha atual"
                      maxLength={20}
                      className="w-full h-11 bg-black/20 border border-white/5 rounded-xl px-4 pr-10 text-xs text-white focus:outline-none focus:border-rose-500/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/50 transition-colors"
                    >
                      {showPassword ? (
                        <Lock size={14} className="text-rose-500/50" />
                      ) : (
                        <Lock size={14} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleDelete}
                  disabled={isLoading || (hasPassword && !deletePassword)}
                  className="flex-1 py-3 bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-500/10"
                >
                  {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="px-4 py-3 bg-white/5 text-white/50 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
