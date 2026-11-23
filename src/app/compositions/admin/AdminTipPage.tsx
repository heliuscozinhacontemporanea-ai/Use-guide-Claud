import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createPartnerContentItemUseCase,
  deletePartnerContentItemUseCase,
  ListingPhotosField,
  updatePartnerContentItemUseCase,
} from '../../../domain/partners';
import { REGIONS } from '../../../shared/constants/regions';
import { useUI } from '../../../shared/stores/useUIStore';
import { ConfirmDialog } from '../../../ui/components/ConfirmDialog';
import { InfoNote } from '../../../ui/components/InfoNote';
import { ListCard, ListRowAction } from '../../../ui/components/ListRows';
import { StatusText } from '../../../ui/components/StatusText';
import { INPUT } from '../../../ui/styles/controls';
import { useAdminGuideItems } from './adminGuideStore';
import { adminPages } from './adminStack';

const LABEL = 'block text-[13px] font-semibold text-ink/80 mb-1.5';

/**
 * Dica do Use Guide (escolhas da F4): título, fotos, texto e região, no visual atual. Vai para o guia
 * ao salvar; não tem dono nem "Sou o dono". "Publicar"/"Salvar" fica na barra.
 */
export function AdminTipPage({
  itemId,
  registerSave,
}: {
  itemId?: string;
  registerSave: (save: (() => void) | null) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const ids = { title: useId(), text: useId(), region: useId() };
  const tip = useAdminGuideItems().find((entry) => entry.id === itemId);
  const [name, setName] = useState(tip?.name ?? '');
  const [text, setText] = useState(tip?.description ?? '');
  const [region, setRegion] = useState(tip?.location || REGIONS[0] || '');
  const [images, setImages] = useState<string[]>(tip?.images ?? (tip?.image ? [tip.image] : []));
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const saving = useRef(false);

  const save = async () => {
    if (saving.current) return;
    if (name.trim().length < 2 || !text.trim() || images.length === 0) {
      setMessage(t('adminPanel.tip.invalid'));
      return;
    }
    saving.current = true;
    setMessage(null);
    const data = {
      name: name.trim(),
      description: text.trim(),
      image: images[0] ?? '',
      images,
      location: region,
    };
    try {
      if (itemId) await updatePartnerContentItemUseCase(itemId, data);
      else await createPartnerContentItemUseCase({ ...data, category: 'tips' });
      showToast(t(itemId ? 'adminPanel.tip.saved' : 'adminPanel.tip.published'), 'success');
      adminPages.back();
    } catch {
      setMessage(t('adminPanel.tip.failed'));
    } finally {
      saving.current = false;
    }
  };

  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    registerSave(() => void saveRef.current());
    return () => registerSave(null);
  }, [registerSave]);

  const remove = async () => {
    if (!itemId) return;
    setConfirm(false);
    try {
      await deletePartnerContentItemUseCase(itemId);
      showToast(t('adminPanel.tip.deleted'), 'success');
      adminPages.back();
    } catch {
      setMessage(t('adminPanel.tip.deleteFailed'));
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <label htmlFor={ids.title} className={LABEL}>
          {t('adminPanel.tip.title')}
        </label>
        <input
          id={ids.title}
          value={name}
          maxLength={200}
          placeholder={t('adminPanel.tip.titlePlaceholder')}
          onChange={(event) => setName(event.target.value)}
          className={INPUT}
        />
      </div>
      <div>
        <span className={LABEL}>{t('adminPanel.tip.photos')}</span>
        <ListingPhotosField images={images} onChange={setImages} />
      </div>
      <div>
        <label htmlFor={ids.text} className={LABEL}>
          {t('adminPanel.tip.text')}
        </label>
        <textarea
          id={ids.text}
          value={text}
          rows={5}
          maxLength={2000}
          placeholder={t('adminPanel.tip.textPlaceholder')}
          onChange={(event) => setText(event.target.value)}
          className={`${INPUT} py-2.5 resize-none`}
        />
      </div>
      <div>
        <label htmlFor={ids.region} className={LABEL}>
          {t('adminPanel.tip.region')}
        </label>
        <select
          id={ids.region}
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className={INPUT}
        >
          {REGIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <InfoNote>{t('adminPanel.tip.note')}</InfoNote>
      {message ? (
        <p role="alert">
          <StatusText tone="danger">{message}</StatusText>
        </p>
      ) : null}
      {itemId ? (
        <ListCard>
          <ListRowAction
            label={t('adminPanel.tip.delete')}
            tone="danger"
            onClick={() => setConfirm(true)}
          />
        </ListCard>
      ) : null}
      <ConfirmDialog
        data={
          confirm
            ? {
                title: t('adminPanel.tip.deleteTitle', { name }),
                message: t('adminPanel.tip.deleteMessage'),
                confirmLabel: t('adminPanel.tip.delete'),
                onConfirm: () => void remove(),
                onCancel: () => setConfirm(false),
              }
            : null
        }
      />
    </div>
  );
}
