import { Fragment, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { usePanelItemTime } from '../../hooks/panelTimeZone';
import { usePartnerAgora } from '../../hooks/usePartnerAgora';
import type { PartnerTodayItem } from '../../types/partnerHome';
import { AgoraCardItem } from './AgoraCardItem';

/** A lista sem internet (evento) ou a portaria (atração) neste aparelho (C5), em termos neutros. */
export interface AgoraOfflineState {
  kind: 'list' | 'keys';
  status: 'missing' | 'ready' | 'no_connection';
  /** Só na lista: ingressos guardados e quando foi a última atualização. */
  count: number | null;
  updatedAt: string | null;
  online: boolean;
  busy: boolean;
  failed: boolean;
  download: () => void;
}

/** O que a composição monta para "Agora" (domínios bookings e ticketing). */
export interface PartnerAgoraRenders {
  /** "Cheguei" do horário; devolve se a localização foi junto. */
  arrive: (item: PartnerTodayItem) => Promise<{ located: boolean }>;
  /** "Iniciar serviço" (C4): grava no servidor e devolve a hora do início. */
  start: (item: PartnerTodayItem) => Promise<string | null>;
  renderCodeSheet: (props: {
    item: PartnerTodayItem;
    noShowAllowed: boolean;
    onClose: () => void;
    onChanged: (message?: string) => void;
  }) => ReactNode;
  renderContacts: (item: PartnerTodayItem, version: number) => ReactNode;
  /** Lê no aparelho a situação da lista sem internet e entrega ao cartão (C5). */
  renderOffline?: (
    item: PartnerTodayItem,
    render: (state: AgoraOfflineState) => ReactNode
  ) => ReactNode;
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
  const { t, i18n } = useTranslation();
  const { showToast } = useUI();
  const { cards, now } = usePartnerAgora(items);
  const itemTime = usePanelItemTime(i18n.language);
  const [arriving, setArriving] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
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

  const start = async (item: PartnerTodayItem) => {
    setStarting(item.id);
    try {
      const startedAt = await renders.start(item);
      showToast(
        t('partnerAgora.start.done', {
          time: itemTime(item, startedAt ?? new Date().toISOString()),
        }),
        'success'
      );
      onChanged();
    } catch {
      showToast(t('partnerAgora.start.error'), 'error');
    } finally {
      setStarting(null);
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="partner-agora-title" data-tour="agora">
      <h2 id="partner-agora-title" className="px-1 text-[22px] font-display font-bold text-ink">
        {t('partnerAgora.title')}
      </h2>
      <ul className="space-y-3">
        {cards.map((card) => {
          const cardOf = (offline: AgoraOfflineState | null) => (
            <AgoraCardItem
              offline={offline}
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
              starting={starting === card.item.id}
              onStart={() => void start(card.item)}
              onOpenGate={() => onOpenGate(card.item)}
            />
          );
          // A situação no aparelho só importa quando a lista já pode ser baixada (D21).
          const readsDevice = (card.type === 'offline' || card.type === 'gate') && !card.listAt;
          return readsDevice && renders.renderOffline ? (
            <Fragment key={`${card.type}-${card.item.id}`}>
              {renders.renderOffline(card.item, cardOf)}
            </Fragment>
          ) : (
            cardOf(null)
          );
        })}
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
