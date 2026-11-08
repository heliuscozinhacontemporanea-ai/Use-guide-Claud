import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { usePartnerAgora } from '../../hooks/usePartnerAgora';
import type { PartnerTodayItem } from '../../types/partnerHome';
import { AgoraCardItem } from './AgoraCardItem';

/** O que a composição monta para "Agora" (domínio bookings). */
export interface PartnerAgoraRenders {
  /** "Cheguei" do horário; devolve se a localização foi junto. */
  arrive: (item: PartnerTodayItem) => Promise<{ located: boolean }>;
  renderCodeSheet: (props: {
    item: PartnerTodayItem;
    noShowAllowed: boolean;
    onClose: () => void;
    onChanged: (message?: string) => void;
  }) => ReactNode;
  renderContacts: (item: PartnerTodayItem, version: number) => ReactNode;
}

/**
 * "Agora" no topo do Início (p40 a p43, D27): cartões que aparecem e somem sozinhos pelo horário.
 * Portaria e lista sem internet abrem as folhas da Agenda já na portaria.
 */
export function PartnerAgoraSection({
  items,
  nameOf,
  renders,
  version,
  onOpenGate,
  onChanged,
}: {
  items: PartnerTodayItem[];
  /** Nome do estabelecimento, para "Portaria · Dunas Park". */
  nameOf: (item: PartnerTodayItem) => string;
  renders: PartnerAgoraRenders;
  version: number;
  onOpenGate: (item: PartnerTodayItem) => void;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const { cards, now, start } = usePartnerAgora(items);
  const [arriving, setArriving] = useState<string | null>(null);
  const [codeFor, setCodeFor] = useState<{ item: PartnerTodayItem; noShow: boolean } | null>(null);
  // A folha do código fica aberta mesmo que o último cartão saia depois de um check-in.
  if (cards.length === 0 && !codeFor) return null;

  const arrive = async (item: PartnerTodayItem) => {
    setArriving(item.id);
    try {
      const { located } = await renders.arrive(item);
      if (!located) showToast(t('partnerAgora.arrive.noLocation'), 'info');
      onChanged();
    } catch {
      showToast(t('partnerAgora.arrive.error'), 'error');
    } finally {
      setArriving(null);
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="partner-agora-title" data-tour="agora">
      <h2 id="partner-agora-title" className="px-1 text-[22px] font-display font-bold text-ink">
        {t('partnerAgora.title')}
      </h2>
      <ul className="space-y-3">
        {cards.map((card) => (
          <AgoraCardItem
            key={`${card.type}-${card.item.id}`}
            card={card}
            now={now}
            arriving={arriving === card.item.id}
            nameOf={nameOf}
            contacts={
              card.type === 'code' && card.arrived
                ? renders.renderContacts(card.item, version)
                : null
            }
            onArrive={() => void arrive(card.item)}
            onOpenCode={(noShow) => setCodeFor({ item: card.item, noShow })}
            onStart={() => {
              start(card.item.id);
              showToast(t('partnerAgora.start.done'), 'success');
            }}
            onOpenGate={() => onOpenGate(card.item)}
          />
        ))}
      </ul>
      {codeFor &&
        renders.renderCodeSheet({
          item: codeFor.item,
          noShowAllowed: codeFor.noShow,
          onClose: () => setCodeFor(null),
          onChanged: (message) => {
            if (message) showToast(message, 'success');
            onChanged();
          },
        })}
    </section>
  );
}
