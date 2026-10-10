import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus, RefreshCw, Star, X } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';
import type { AdminGuideEditorSchemaValues } from '../../schemas/adminGuideEditorFormSchema';

interface AdminEditorGalleryProps {
  isUploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AdminEditorGallery({
  isUploading,
  onImageUpload,
}: AdminEditorGalleryProps) {
  const { watch, setValue } = useFormContext<AdminGuideEditorSchemaValues>();
  const image = watch('image') || '';
  const images = watch('images') || [];

  const handleSelectCover = (img: string) => {
    setValue('image', img, { shouldDirty: true, shouldValidate: true });
  };

  const handleRemoveImage = (idx: number, img: string) => {
    const isMain = image === img;
    const newImages = images.filter((_: string, i: number) => i !== idx);
    const newMain: string = isMain ? (newImages[0] ?? '') : image;
    setValue('images', newImages, { shouldDirty: true, shouldValidate: true });
    setValue('image', newMain, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 px-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/50">
            Galeria de Fotos (Até 5)
          </label>
          <span className="text-[10px] font-bold text-white/50">{images.length}/5 fotos</span>
        </div>
        <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest">
          ⚠️ É obrigatório escolher uma imagem como capa
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="photo-album-grid">
        {images.map((img: string, idx: number) => {
          const isMain = image === img;
          return (
            <div
              key={idx}
              className={cn(
                'relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group/photo',
                isMain
                  ? 'border-teal-500 shadow-lg shadow-teal-500/20'
                  : 'border-white/5 hover:border-white/20'
              )}
            >
              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />

              <div className="absolute inset-0 pointer-events-none">
                <button
                  type="button"
                  aria-label="Definir como Capa"
                  onClick={() => handleSelectCover(img)}
                  className={cn(
                    'absolute top-2 left-2 w-11 h-11 flex items-center justify-center rounded-xl transition-all pointer-events-auto shadow-lg backdrop-blur-md focus-visible:ring-2 focus-visible:ring-teal-400/50',
                    isMain
                      ? 'bg-teal-500 text-black scale-110 border border-teal-400'
                      : 'bg-black/60 text-white/70 border border-white/10 hover:bg-teal-500/80 hover:text-white'
                  )}
                  title="Definir como Capa"
                >
                  <Star size={16} fill={isMain ? 'currentColor' : 'none'} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  aria-label="Excluir Foto"
                  onClick={() => handleRemoveImage(idx, img)}
                  className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/90 text-white border border-rose-400 pointer-events-auto shadow-lg backdrop-blur-md hover:bg-rose-600 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                  title="Excluir Foto"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>

              {isMain && (
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-teal-500 text-black text-[8px] font-black uppercase rounded text-center shadow-lg pointer-events-none">
                  Capa Selecionada
                </div>
              )}
            </div>
          );
        })}

        {images.length < 5 && (
          <label
            className={cn(
              'aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 hover:border-teal-500/30 transition-all group/upload',
              isUploading && 'opacity-50 pointer-events-none'
            )}
            id="btn-upload-more-photos"
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
            {isUploading ? (
              <RefreshCw className="animate-spin text-teal-500" size={24} />
            ) : (
              <>
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500 group-hover/upload:scale-110 transition-transform">
                  <Plus size={20} strokeWidth={3} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
                  Adicionar
                </span>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
}
