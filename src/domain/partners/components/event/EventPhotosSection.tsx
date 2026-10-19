import { Camera, CheckCircle2, RefreshCw, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { cn } from '../../../../shared/utils/cn';
import { type EventSectionProps, updateEventField } from './eventSectionProps';

const MAX_PHOTOS = 5;

interface EventPhotosSectionProps extends EventSectionProps {
  isUploading: boolean;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function EventPhotosSection({
  item,
  onChange,
  isUploading,
  onImageUpload,
}: EventPhotosSectionProps) {
  const images = item.images ?? [];

  return (
    <div className="space-y-6 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Camera size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Fotos do Evento</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div
            key={img}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg"
          >
            <img
              src={img}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt={`Foto ${index + 1} do evento`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => updateEventField({ item, onChange }, 'image', img)}
                aria-label={`Definir a foto ${index + 1} como principal`}
                className={cn(
                  'w-11 h-11 flex items-center justify-center rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50',
                  item.image === img
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/40'
                )}
              >
                <CheckCircle2 size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Remover a foto ${index + 1}`}
                onClick={() => {
                  const remaining = images.filter((_, current) => current !== index);
                  onChange({
                    ...item,
                    images: remaining,
                    image: item.image === img ? remaining[0] || '' : item.image,
                  });
                }}
                className="w-11 h-11 flex items-center justify-center bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
            {item.image === img && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-xl">
                Principal
              </div>
            )}
          </div>
        ))}
        {images.length < MAX_PHOTOS && (
          <label
            className={cn(
              'aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-2 focus-within:ring-2 focus-within:ring-teal-400/50',
              isUploading
                ? 'border-indigo-500/20 bg-indigo-500/5 animate-pulse'
                : 'border-white/5 hover:border-indigo-500/30 hover:bg-white/5'
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onImageUpload}
              multiple
            />
            <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
              {isUploading ? (
                <RefreshCw className="animate-spin" size={16} aria-hidden="true" />
              ) : (
                <Upload size={16} aria-hidden="true" />
              )}
            </span>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/50">
              Add Fotos
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
