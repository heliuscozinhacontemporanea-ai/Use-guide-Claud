import React from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Upload, ChevronLeft } from 'lucide-react';

interface ImageCropperViewProps {
  imageToCrop: string | null;
  crop: Point;
  zoom: number;
  onCropChange: (crop: Point) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onZoomChange: (zoom: number) => void;
  setZoom: (zoom: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ImageCropperView({
  imageToCrop,
  crop,
  zoom,
  onCropChange,
  onCropComplete,
  onZoomChange,
  setZoom,
  onCancel,
  onConfirm,
}: ImageCropperViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
        <button
          onClick={onCancel}
          aria-label="Voltar"
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-teal-400 leading-tight">
            Ajustar Foto
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Enquadre seu rosto na moldura
          </p>
        </div>
      </div>

      <div className="relative flex-1 min-h-[300px] bg-black/40 rounded-[2rem] overflow-hidden border border-white/10">
        {imageToCrop && (
          <Cropper
            image={imageToCrop}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropComplete}
            onZoomChange={onZoomChange}
            restrictPosition={true}
          />
        )}
      </div>

      <div className="mt-8 space-y-6">
        <div className="px-2">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-teal-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-white/5 text-white/50 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border border-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 bg-teal-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            Salvar Foto
          </button>
        </div>
      </div>
    </div>
  );
}
