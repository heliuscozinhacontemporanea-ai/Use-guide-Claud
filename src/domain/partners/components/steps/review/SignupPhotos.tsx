import { AlertTriangle, Plus, X } from 'lucide-react';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../../shared/stores/useUIStore';
import { SIGNUP_ERROR, SIGNUP_HINT, SIGNUP_LABEL } from '../../sections/signupStyles';

export interface SignupImage {
  id: string;
  file: File;
  preview: string;
}

const MAX_PHOTOS = 5;
const MAX_BYTES = 3 * 1024 * 1024;

/** Fotos do cadastro: até 5, com o aviso de que falta foto perto do envio (V2). */
export function SignupPhotos({
  images,
  onChange,
  fileInputRef,
  error,
}: {
  images: SignupImage[];
  onChange: (images: SignupImage[]) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  error?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const add = (files: File[]) => {
    if (images.length + files.length > MAX_PHOTOS) {
      showToast(t('partnerSignup.step5.tooManyPhotos'), 'error');
      return;
    }
    const accepted = files.filter((file) => {
      if (file.size <= MAX_BYTES) return true;
      showToast(t('partnerSignup.step5.photoTooBig', { name: file.name }), 'error');
      return false;
    });
    onChange([
      ...images,
      ...accepted.map((file) => ({
        file,
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
      })),
    ]);
  };
  return (
    <section aria-labelledby="signup-photos-title">
      <h3 id="signup-photos-title" className={SIGNUP_LABEL}>
        {t('partnerSignup.step5.photos')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative w-20 h-20 rounded-2xl overflow-hidden border border-line"
          >
            <img
              src={image.preview}
              alt={t('partnerSignup.step5.photoAlt', { index: index + 1 })}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              aria-label={t('partnerSignup.step5.removePhoto')}
              onClick={() => {
                URL.revokeObjectURL(image.preview);
                onChange(images.filter((item) => item.id !== image.id));
              }}
              className="press absolute top-0 right-0 w-11 h-11 flex items-start justify-end p-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <span className="w-6 h-6 rounded-full bg-scrim text-on-fill flex items-center justify-center">
                <X size={14} aria-hidden="true" />
              </span>
            </button>
          </div>
        ))}
        {images.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t('partnerSignup.step5.addPhoto')}
            className="press w-20 h-20 rounded-2xl border-2 border-dashed border-line text-ink/70 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <Plus size={26} aria-hidden="true" />
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => {
          add(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      {images.length === 0 ? (
        <p className="mt-2 px-1 flex items-center gap-2 text-[14px] text-warn" role="status">
          <AlertTriangle size={16} aria-hidden="true" />
          {t('partnerSignup.step5.photosRequired')}
        </p>
      ) : (
        <p className={SIGNUP_HINT}>{t('partnerSignup.step5.photosHint')}</p>
      )}
      {error && <p className={SIGNUP_ERROR}>{error}</p>}
    </section>
  );
}
