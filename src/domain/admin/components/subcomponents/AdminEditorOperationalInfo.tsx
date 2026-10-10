import React from 'react';
import { useFormContext } from 'react-hook-form';
import { maskCurrency } from '../../../../shared/utils/currencyMask';
import type { GuideItemOperationalInfo } from '../../../guide';
import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';

export function AdminEditorOperationalInfo() {
  const { watch, setValue } = useFormContext<AdminGuideEditorSchemaValues>();
  const category = watch('category') || '';
  const operationalInfo = (watch('operationalInfo') || {}) as GuideItemOperationalInfo;

  const handleUpdate = (nextInfo: GuideItemOperationalInfo) => {
    setValue('operationalInfo', nextInfo as Record<string, unknown>, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="pt-4 pb-2" id="operational-info-section">
      <div className="h-px w-full bg-white/5 mb-6" />
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6 px-2">
        Informações Operacionais
      </h4>

      <div className="space-y-6">
        {category === 'hotel' && (
          <div
            className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl"
            id="op-hotel-container"
          >
            <label className="text-[9px] font-bold uppercase tracking-widest text-teal-500/60 block">
              Hospedagem
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/50">
                  Check-in
                </label>
                <input
                  type="time"
                  value={operationalInfo?.checkIn?.from || ''}
                  onChange={(e) =>
                    handleUpdate({
                      ...operationalInfo,
                      checkIn: {
                        from: e.target.value,
                        to: operationalInfo?.checkIn?.to || e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/30 transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/50">
                  Check-out
                </label>
                <input
                  type="time"
                  value={operationalInfo?.checkOut?.to || ''}
                  onChange={(e) =>
                    handleUpdate({
                      ...operationalInfo,
                      checkOut: {
                        from: operationalInfo?.checkOut?.from || e.target.value,
                        to: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/30 transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-wider text-white/50">
                Pets
              </label>
              <select
                value={operationalInfo?.petsPolicy || ''}
                onChange={(e) =>
                  handleUpdate({
                    ...operationalInfo,
                    petsPolicy: e.target.value,
                  })
                }
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-sm appearance-none cursor-pointer text-white"
              >
                <option value="" className="bg-slate-900">
                  Selecione...
                </option>
                <option value="Sim" className="bg-slate-900">
                  Aceita
                </option>
                <option value="Não" className="bg-slate-900">
                  Não Aceita
                </option>
                <option value="Mediante pedido" className="bg-slate-900">
                  Sob Consulta
                </option>
              </select>
            </div>
          </div>
        )}

        {category === 'restaurant' && (
          <div
            className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl"
            id="op-restaurant-container"
          >
            <label className="text-[9px] font-bold uppercase tracking-widest text-teal-500/60 block">
              Restaurante
            </label>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/50">
                  Tipo de Cozinha
                </label>
                <input
                  type="text"
                  placeholder="Italiana, Regional, etc"
                  value={operationalInfo?.cuisineType || ''}
                  onChange={(e) =>
                    handleUpdate({
                      ...operationalInfo,
                      cuisineType: e.target.value,
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/50">
                  Subcategoria
                </label>
                <input
                  type="text"
                  placeholder="Bar, Café, Restaurante..."
                  value={operationalInfo?.subcategory || ''}
                  onChange={(e) =>
                    handleUpdate({
                      ...operationalInfo,
                      subcategory: e.target.value,
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/30 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {category === 'sight' && (
          <div
            className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl"
            id="op-sight-container"
          >
            <label className="text-[9px] font-bold uppercase tracking-widest text-teal-500/60 block">
              Atração
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-wider text-white/50">
                  Acesso
                </label>
                <select
                  value={operationalInfo?.access || ''}
                  onChange={(e) =>
                    handleUpdate({
                      ...operationalInfo,
                      access: e.target.value,
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-sm appearance-none cursor-pointer text-white"
                >
                  <option value="gratuito" className="bg-slate-900">
                    Gratuito
                  </option>
                  <option value="pago" className="bg-slate-900">
                    Pago
                  </option>
                </select>
              </div>
              {operationalInfo?.access === 'pago' && (
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-wider text-white/50">
                    Preço
                  </label>
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    value={operationalInfo?.price || ''}
                    onChange={(e) =>
                      handleUpdate({
                        ...operationalInfo,
                        price: maskCurrency(e.target.value),
                      })
                    }
                    maxLength={12}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/30 transition-all text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
