import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { REGIONS } from '../../../search';
import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';

interface CategoryOption {
  id: string;
  label: string;
}

interface AdminEditorBasicInfoProps {
  isAdminUser: boolean;
  availableCategories: CategoryOption[];
}

export function AdminEditorBasicInfo({
  isAdminUser,
  availableCategories,
}: AdminEditorBasicInfoProps) {
  const { register } = useFormContext<AdminGuideEditorSchemaValues>();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50 px-2">
          Nome Comercial
        </label>
        <input
          type="text"
          placeholder="Ex: Pôr do Sol Jeri"
          maxLength={100}
          {...register('name')}
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-base font-medium focus:outline-none focus:border-teal-500/30 focus:bg-white/[0.06] transition-all shadow-inner placeholder:text-white/50"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50 px-2">
          Descrição Detalhada
        </label>
        <textarea
          placeholder="Descreva o que torna este lugar especial..."
          {...register('description')}
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-base font-medium focus:outline-none focus:border-teal-500/30 focus:bg-white/[0.06] transition-all h-32 no-scrollbar resize-none shadow-inner placeholder:text-white/50 leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50 px-2">
            Categoria
          </label>
          <div className="relative group">
            <select
              {...register('category')}
              disabled={!isAdminUser}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-base font-medium focus:outline-none focus:border-teal-500/30 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer shadow-inner pr-12 disabled:opacity-50"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">
                  {cat.label}
                </option>
              ))}
            </select>
            {isAdminUser && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 group-hover:text-teal-500/50 transition-colors">
                <ChevronDown size={18} />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50 px-2">
            Localização
          </label>
          <div className="relative group">
            <select
              {...register('location')}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-base font-medium focus:outline-none focus:border-teal-500/30 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer shadow-inner pr-12"
            >
              {REGIONS.map((region) => (
                <option key={region} value={region} className="bg-slate-900">
                  {region}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 group-hover:text-teal-500/50 transition-colors">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
