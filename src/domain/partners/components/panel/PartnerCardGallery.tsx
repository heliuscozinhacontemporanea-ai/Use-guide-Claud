import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { ListEmpty } from '../../../../ui/components/ListState';
import { PARTNER_HOME_CARD_SIZE, type PartnerHomeCardId } from '../../types/partnerHomeCards';

/** Galeria "Adicionar cartão": só cartões que ainda não estão no Início e têm dado. */
export function PartnerCardGallery({
  open,
  onOpenChange,
  available,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: PartnerHomeCardId[];
  onAdd: (id: PartnerHomeCardId) => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('partnerPanel.cards.addTitle')}
      description={t('partnerPanel.cards.addDescription')}
    >
      {available.length === 0 ? (
        <ListEmpty message={t('partnerPanel.cards.galleryEmpty')} />
      ) : (
        <ul className="space-y-2">
          {available.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  onAdd(id);
                  onOpenChange(false);
                }}
                className="press w-full px-4 py-3 min-h-16 rounded-2xl bg-sheet-card border border-sheet-card-line flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">
                    {t(`partnerPanel.cards.${id}.title`)}
                  </span>
                  <span className="block text-[13px] text-ink/70">
                    {t(`partnerPanel.cards.${id}.description`)}
                  </span>
                </span>
                <span className="text-[12px] text-ink/70 shrink-0">
                  {t(`partnerPanel.cards.size.${PARTNER_HOME_CARD_SIZE[id]}`)}
                </span>
                <span
                  aria-hidden="true"
                  className="w-9 h-9 shrink-0 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center"
                >
                  <Plus size={18} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
