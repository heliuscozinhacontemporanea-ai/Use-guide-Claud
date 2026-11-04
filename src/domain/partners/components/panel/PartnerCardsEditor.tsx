import { GripVertical, Minus, Plus } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListError } from '../../../../ui/components/ListState';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { PARTNER_HOME_CARD_SIZE, type PartnerHomeCardId } from '../../types/partnerHomeCards';
import { PartnerCardGallery } from './PartnerCardGallery';

function EditorRow({
  id,
  onRemove,
  onMove,
}: {
  id: PartnerHomeCardId;
  onRemove: () => void;
  /** Teclado: seta para cima ou para baixo muda a posição. */
  onMove: (step: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  const controls = useDragControls();
  const title = t(`partnerPanel.cards.${id}.title`);
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className="list-none px-2 py-2 min-h-16 rounded-[20px] bg-surface border border-line flex items-center gap-2"
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('partnerPanel.cards.remove', { name: title })}
        className="press w-11 h-11 shrink-0 rounded-full flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <span className="w-6 h-6 rounded-full bg-danger text-[#0d0e10] flex items-center justify-center">
          <Minus size={16} aria-hidden="true" />
        </span>
      </button>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-ink truncate">{title}</span>
        <span className="block text-[12px] text-ink/70">
          {t(`partnerPanel.cards.size.${PARTNER_HOME_CARD_SIZE[id]}`)}
        </span>
      </span>
      {/* A alça arrasta; a lista não rola junto no toque (touch-action none). */}
      <button
        type="button"
        onPointerDown={(event) => controls.start(event)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            onMove(event.key === 'ArrowUp' ? -1 : 1);
          }
        }}
        aria-label={t('partnerPanel.cards.move', { name: title })}
        className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-ink/60 cursor-grab touch-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <GripVertical size={20} aria-hidden="true" />
      </button>
    </Reorder.Item>
  );
}

/**
 * Modo Personalizar: arrastar pela alça para mudar a ordem, "−" para tirar, "Adicionar cartão"
 * para a galeria; "Concluir" grava na conta. "Resolva agora" fica fora (seção 6.1).
 */
export function PartnerCardsEditor({
  draft,
  onDraftChange,
  available,
  onCancel,
  onFinish,
  saving,
  error,
}: {
  draft: PartnerHomeCardId[];
  onDraftChange: (cards: PartnerHomeCardId[]) => void;
  available: PartnerHomeCardId[];
  onCancel: () => void;
  onFinish: () => void;
  saving: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  const [galleryOpen, setGalleryOpen] = useState(false);
  return (
    <section aria-labelledby="partner-cards-editor" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="partner-cards-editor" className="px-1 text-[22px] font-display font-bold text-ink">
          {t('partnerPanel.cards.customize')}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="press min-h-11 px-3 rounded-xl text-[15px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('partnerPanel.cards.cancel')}
        </button>
      </div>
      <p className="px-1 text-[13px] text-ink/70">{t('partnerPanel.cards.editHint')}</p>
      <Reorder.Group axis="y" values={draft} onReorder={onDraftChange} className="space-y-2">
        {draft.map((id) => (
          <EditorRow
            key={id}
            id={id}
            onRemove={() => onDraftChange(draft.filter((card) => card !== id))}
            onMove={(step) => {
              const from = draft.indexOf(id);
              const to = from + step;
              if (to < 0 || to >= draft.length) return;
              const next = [...draft];
              next.splice(from, 1);
              next.splice(to, 0, id);
              onDraftChange(next);
            }}
          />
        ))}
      </Reorder.Group>
      <button
        type="button"
        onClick={() => setGalleryOpen(true)}
        className={`${BUTTON_SECONDARY} w-full inline-flex items-center justify-center gap-2`}
      >
        <Plus size={18} aria-hidden="true" />
        {t('partnerPanel.cards.add')}
      </button>
      {error && <ListError message={t('partnerPanel.cards.saveError')} onRetry={onFinish} />}
      <button
        type="button"
        onClick={onFinish}
        disabled={saving}
        className={`${BUTTON_PRIMARY} w-full`}
      >
        {t('partnerPanel.cards.done')}
      </button>
      <PartnerCardGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        available={available.filter((id) => !draft.includes(id))}
        onAdd={(id) => onDraftChange([...draft, id])}
      />
    </section>
  );
}
