import { GripVertical, Minus, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { ListError } from '../../../../ui/components/ListState';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { PARTNER_HOME_CARD_SIZE, type PartnerHomeCardId } from '../../types/partnerHomeCards';
import type { PartnerTodayItem } from '../../types/partnerHome';
import type { PartnerCardData } from '../../utils/partnerHomeCardData';
import { PartnerCardGallery } from './PartnerCardGallery';
import { cardSpan, PartnerHomeCard } from './PartnerHomeCard';

function moveTo(list: PartnerHomeCardId[], id: PartnerHomeCardId, to: number) {
  const next = list.filter((card) => card !== id);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, id);
  return next;
}

/**
 * Personalizar início (p03): a própria grade, com "−" no canto e a alça de seis pontos. Arrastar
 * pela alça troca o lugar com o cartão que está embaixo do dedo; no teclado, as setas movem.
 */
export function PartnerCardsEditor({
  draft,
  dataOf,
  onDraftChange,
  available,
  onFinish,
  saving,
  error,
  labelFor,
  manyEstablishments,
}: {
  draft: PartnerHomeCardId[];
  dataOf: (id: PartnerHomeCardId) => PartnerCardData | null;
  onDraftChange: (cards: PartnerHomeCardId[]) => void;
  available: PartnerHomeCardId[];
  onFinish: () => void;
  saving: boolean;
  error: string | null;
  labelFor: (item: PartnerTodayItem) => string | null;
  manyEstablishments: boolean;
}) {
  const { t } = useTranslation();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [dragging, setDragging] = useState<PartnerHomeCardId | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-card-id]');
    const overId = target?.dataset.cardId as PartnerHomeCardId | undefined;
    if (!overId || overId === dragging) return;
    onDraftChange(moveTo(draftRef.current, dragging, draftRef.current.indexOf(overId)));
  };

  return (
    <section aria-labelledby="partner-cards-editor" className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="partner-cards-editor" className="text-[22px] font-display font-bold text-ink">
          {t('partnerPanel.cards.customize')}
        </h2>
        <button
          type="button"
          onClick={onFinish}
          disabled={saving}
          className="press min-h-11 px-2 rounded-xl text-[15px] font-semibold text-accent disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('partnerPanel.cards.done')}
        </button>
      </div>
      <p className="px-1 text-[13px] text-ink/70">{t('partnerPanel.cards.editHint')}</p>
      {error && <ListError message={t('partnerPanel.cards.saveError')} onRetry={onFinish} />}
      <div className="grid grid-cols-2 gap-3" onPointerMove={onPointerMove}>
        {draft.map((id) => {
          const data = dataOf(id);
          if (!data) return null;
          const large = PARTNER_HOME_CARD_SIZE[id] === 'large';
          const title = t(`partnerPanel.cards.${id}.title`);
          return (
            <div
              key={id}
              data-card-id={id}
              className={cn(
                'relative flex transition-opacity',
                cardSpan(large),
                dragging === id && 'opacity-60'
              )}
            >
              <PartnerHomeCard
                data={data}
                labelFor={labelFor}
                manyEstablishments={manyEstablishments}
              />
              <button
                type="button"
                onClick={() => onDraftChange(draft.filter((card) => card !== id))}
                aria-label={t('partnerPanel.cards.remove', { name: title })}
                className="press absolute -top-3 -left-3 w-11 h-11 rounded-full flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <span className="w-6 h-6 rounded-full bg-[#ffffff] text-[#0d0e10] border border-line flex items-center justify-center shadow">
                  <Minus size={16} strokeWidth={3} aria-hidden="true" />
                </span>
              </button>
              {/* Alça: só ela arrasta, para a página continuar rolando pelo resto do cartão. */}
              <button
                type="button"
                onPointerDown={(event) => {
                  // Os movimentos seguem para a alça (e sobem até a grade) mesmo fora dela.
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                  setDragging(id);
                }}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)}
                onKeyDown={(event) => {
                  const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[
                    event.key
                  ];
                  if (step === undefined) return;
                  event.preventDefault();
                  onDraftChange(moveTo(draft, id, draft.indexOf(id) + step));
                }}
                aria-label={t('partnerPanel.cards.move', { name: title })}
                className="absolute top-1.5 right-1.5 w-11 h-11 rounded-xl flex items-center justify-center text-ink/60 cursor-grab touch-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <GripVertical size={20} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setGalleryOpen(true)}
        className={`${BUTTON_PRIMARY} w-full inline-flex items-center justify-center gap-2`}
      >
        <Plus size={18} aria-hidden="true" />
        {t('partnerPanel.cards.add')}
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
