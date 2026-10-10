import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';

export function AdminEditorLocation() {
  const { register } = useFormContext<AdminGuideEditorSchemaValues>();

  return (
    <div className="pt-4 pb-2" id="links-integrations-section">
      <div className="h-px w-full bg-white/5 mb-6" />
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6 px-2">
        Links Externos & Integrações
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-teal-500/50 px-2">
            Google Maps
          </label>
          <input
            type="text"
            placeholder="Link do local..."
            {...register('googleMapsLink')}
            className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-base focus:outline-none focus:border-teal-500/30 transition-all placeholder:text-white/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-teal-500/50 px-2">
            Instagram
          </label>
          <input
            type="text"
            placeholder="@usuario ou link..."
            {...register('instagramLink')}
            className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-base focus:outline-none focus:border-teal-500/30 transition-all placeholder:text-white/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-[#25D366] px-2">
            WhatsApp
          </label>
          <input
            type="text"
            placeholder="Link do WhatsApp..."
            {...register('whatsappLink')}
            className="w-full bg-[#25D366]/[0.05] border border-[#25D366]/20 rounded-xl p-4 text-base focus:outline-none focus:border-[#25D366]/50 transition-all placeholder:text-white/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-teal-500/50 px-2">
            Website
          </label>
          <input
            type="text"
            placeholder="https://..."
            {...register('websiteLink')}
            className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-base focus:outline-none focus:border-teal-500/30 transition-all placeholder:text-white/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-teal-400 px-2">
            Reserva / Menu
          </label>
          <input
            type="text"
            placeholder="Link direto..."
            {...register('bookingLink')}
            className="w-full bg-white/[0.05] border border-teal-500/20 rounded-xl p-4 text-base focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-white/50"
          />
        </div>
      </div>
    </div>
  );
}
