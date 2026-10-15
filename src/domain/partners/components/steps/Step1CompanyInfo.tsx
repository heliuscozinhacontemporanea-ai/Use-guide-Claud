import React from 'react';
import { motion } from 'motion/react';
import { Building2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../../../shared/utils/cn';
import { maskCpfCnpj } from '../../../../shared/utils/documentValidator';

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Step1CompanyInfoProps {
  formData: {
    category: string;
    businessName: string;
    description: string;
    cpfCnpj: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: Category[];
  // No editor do painel o CPF/CNPJ já pertence à conta do parceiro e não é editado por item.
  mode?: 'signup' | 'editor';
  // Trocar a categoria de um item existente mudaria o schema de operationalInfo já gravado.
  lockCategory?: boolean;
}

export function Step1CompanyInfo({
  formData: propFormData,
  setFormData,
  categories,
  mode = 'signup',
  lockCategory = false,
}: Step1CompanyInfoProps) {
  const formContext = useFormContext();

  const formData = formContext ? formContext.watch() : propFormData;
  const formErrors = formContext ? formContext.formState.errors : {};

  const handleCategoryChange = (catId: string) => {
    if (lockCategory) return;
    if (formContext) {
      formContext.setValue('category', catId, { shouldValidate: true });
    }
    setFormData((prev: any) => ({ ...prev, category: catId }));
  };

  const handleCpfCnpjChange = (value: string) => {
    const masked = maskCpfCnpj(value);
    if (formContext) {
      formContext.setValue('cpfCnpj', masked, { shouldValidate: true });
    }
    setFormData((prev: any) => ({ ...prev, cpfCnpj: masked }));
  };

  const handleBusinessNameChange = (value: string) => {
    if (formContext) {
      formContext.setValue('businessName', value, { shouldValidate: true });
    }
    setFormData((prev: any) => ({ ...prev, businessName: value }));
  };

  const handleDescriptionChange = (value: string) => {
    const sliced = value.slice(0, 400);
    if (formContext) {
      formContext.setValue('description', sliced, { shouldValidate: true });
    }
    setFormData((prev: any) => ({ ...prev, description: sliced }));
  };

  const isEventProducer = formData.category === 'producer';
  const showCpfCnpj = mode === 'signup';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Building2 size={18} />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Informações da Empresa
        </h3>
      </div>

      <div className="space-y-6">
        {/* Categoria - Apresentada primeiro */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Selecione a Categoria de Cadastro <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                disabled={lockCategory && formData.category !== cat.id}
                aria-pressed={formData.category === cat.id}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100',
                  formData.category === cat.id
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                    formData.category === cat.id ? 'bg-indigo-500/20' : 'bg-white/5'
                  )}
                >
                  {cat.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-left leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
          {lockCategory && (
            <p className="text-xs text-white/50 font-medium ml-1">
              A categoria não pode ser alterada depois do cadastro.
            </p>
          )}
          {formErrors.category && (
            <p className="text-xs text-red-400 font-medium ml-1">
              {formErrors.category.message?.toString()}
            </p>
          )}
        </div>

        {/* Informações liberadas após selecionar a categoria */}
        {formData.category ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pt-2 border-t border-white/5"
          >
            {/* Somente se for produtor de eventos: campo CPF/CNPJ obrigatório acima do nome */}
            {showCpfCnpj && isEventProducer && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  CPF ou CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cpfCnpj || ''}
                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
                  placeholder="Ex: 00.000.000/0001-00 ou 000.000.000-00"
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                    formErrors.cpfCnpj ? 'border-red-500/50' : 'border-white/10'
                  )}
                  maxLength={18}
                  required
                />
                {formErrors.cpfCnpj && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {formErrors.cpfCnpj.message?.toString()}
                  </p>
                )}
              </div>
            )}

            {/* Nome da Empresa */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                {isEventProducer ? 'Nome do Produtor' : 'Nome da Empresa'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                placeholder="Ex: Pousada Mar Azul ou Produções Ceará"
                maxLength={100}
                className={cn(
                  'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                  formErrors.businessName ? 'border-red-500/50' : 'border-white/10'
                )}
              />
              {formErrors.businessName && (
                <p className="text-xs text-red-400 font-medium ml-1">
                  {formErrors.businessName.message?.toString()}
                </p>
              )}
            </div>

            {/* CPF ou CNPJ para Atrações turísticas, Hospedagem e Restaurantes */}
            {showCpfCnpj && !isEventProducer && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  CPF ou CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cpfCnpj || ''}
                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
                  placeholder="Ex: 00.000.000/0001-00 ou 000.000.000-00"
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                    formErrors.cpfCnpj ? 'border-red-500/50' : 'border-white/10'
                  )}
                  maxLength={18}
                  required
                />
                {formErrors.cpfCnpj && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {formErrors.cpfCnpj.message?.toString()}
                  </p>
                )}
              </div>
            )}

            {/* Descrição - Removida para produtor de eventos */}
            {!isEventProducer && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Descrição da Empresa <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={cn(
                      'text-[10px] font-bold',
                      (formData.description || '').length > 380 ? 'text-red-400' : 'text-white/50'
                    )}
                  >
                    {(formData.description || '').length}/400
                  </span>
                </div>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Conte um pouco sobre os diferenciais do seu negócio..."
                  rows={4}
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50 resize-none no-scrollbar font-medium',
                    formErrors.description ? 'border-red-500/50' : 'border-white/10'
                  )}
                />
                {formErrors.description && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {formErrors.description.message?.toString()}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-6 px-4 rounded-[2rem] bg-white/[0.01] border border-dashed border-white/5">
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
              Selecione acima para liberar os campos de preenchimento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
