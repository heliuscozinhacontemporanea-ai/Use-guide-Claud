import { Loader2, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusText } from '../../../../ui/components/StatusText';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../../media';
import { SIGNUP_HINT } from '../sections/signupStyles';

// O anúncio guarda até 5 fotos (schema do servidor).
const MAX_PHOTOS = 5;

/** Página "Fotos" do guia (D34): a primeira é a capa; envia na hora, pelo servidor (AGENTS.md §6.1). */
export function ListingPhotosField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (files: FileList | null) => {
    const picked = Array.from(files ?? []).slice(0, MAX_PHOTOS - images.length);
    if (picked.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of picked) urls.push(await uploadImageUseCase(file, 'guia_local'));
      onChange([...images, ...urls]);
    } catch (caught) {
      setError(getImageUploadErrorMessage(caught));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-3 gap-2">
        {images.map((url, index) => (
          <li key={url} className="relative aspect-square rounded-xl overflow-hidden bg-ink/[0.06]">
            <img src={url} alt="" className="w-full h-full object-cover" />
            {index === 0 ? (
              <span className="absolute left-1.5 bottom-1.5 px-2 py-0.5 rounded-full bg-black/70 text-on-fill text-[11px] font-semibold">
                {t('partnerGuide.photos.cover')}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onChange(images.filter((entry) => entry !== url))}
              aria-label={t('partnerGuide.photos.remove', { number: index + 1 })}
              className="press absolute right-1 top-1 w-11 h-11 rounded-full flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <span className="w-7 h-7 rounded-full bg-black/70 text-on-fill flex items-center justify-center">
                <X size={16} aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
        {images.length < MAX_PHOTOS ? (
          <li className="aspect-square">
            <button
              type="button"
              disabled={uploading}
              onClick={() => input.current?.click()}
              aria-label={
                uploading ? t('partnerGuide.photos.uploading') : t('partnerGuide.photos.add')
              }
              className="press w-full h-full rounded-xl border-[1.5px] border-dashed border-ink/25 bg-surface flex items-center justify-center text-ink/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              {uploading ? (
                <Loader2
                  size={22}
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Plus size={22} aria-hidden="true" />
              )}
            </button>
          </li>
        ) : null}
      </ul>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(event) => void add(event.target.files)}
      />
      <p className={SIGNUP_HINT}>{t('partnerGuide.photos.hint')}</p>
      {error ? (
        <p role="alert">
          <StatusText tone="danger">{error}</StatusText>
        </p>
      ) : null}
    </div>
  );
}
