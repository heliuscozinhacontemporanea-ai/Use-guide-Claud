import { usePanelTimeZone } from '../../hooks/panelTimeZone';
import { Check, Download, KeyRound, type LucideIcon, MapPin, Play, ScanLine } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { PartnerTodayItem } from '../../types/partnerHome';
import { StatusText } from '../../../../ui/components/StatusText';
import type { AgoraCard } from '../../utils/agoraCards';
import type { AgoraOfflineState } from './PartnerAgoraSection';

const ICON: Record<AgoraCard['type'], LucideIcon> = {
  arrive: MapPin,
  code: KeyRound,
  start: Play,
  gate: ScanLine,
  offline: Download,
};

const LINK =
  'press min-h-11 px-2 rounded-xl text-[14px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50';

function CardShell({
  type,
  icon,
  tone,
  title,
  sub,
  children,
}: {
  type: AgoraCard['type'];
  /** Aviso (ex.: sem internet e sem lista, C5): borda, ícone e linha de apoio em amarelo. */
  tone?: 'warn';
  /** Troca o ícone do tipo (ex.: o pino depois do "Cheguei", p42). */
  icon?: LucideIcon;
  title: string;
  sub: string;
  children: ReactNode;
}) {
  const Icon = icon ?? ICON[type];
  return (
    <li
      className={cn(
        'rounded-[20px] bg-surface border p-4 space-y-4',
        tone === 'warn' ? 'border-warn-line' : 'border-teal-400/30'
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            'shrink-0 size-12 rounded-2xl flex items-center justify-center',
            tone === 'warn' ? 'bg-warn-soft text-warn' : 'bg-teal-400/10 text-accent'
          )}
        >
          <Icon size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-[17px] leading-snug font-semibold text-ink break-words">{title}</h3>
          <p
            className={cn('text-[14px] break-words', tone === 'warn' ? 'text-warn' : 'text-ink/70')}
          >
            {sub}
          </p>
        </div>
      </div>
      {children}
    </li>
  );
}

/**
 * Cartão da lista sem internet (C5): diz se a lista já está neste aparelho e baixa com um toque. Na
 * atração não há lista, só as chaves que conferem o QR, guardadas sozinhas quando há internet.
 */
function OfflineCard({
  state,
  name,
  when,
  timeZone,
}: {
  state: AgoraOfflineState;
  name: string;
  when: string;
  timeZone: string;
}) {
  const { t, i18n } = useTranslation();
  const list = state.kind === 'list';
  const key = list ? 'partnerAgora.offline' : 'partnerAgora.offlineKeys';
  const ready = state.status === 'ready';
  const blocked = state.status === 'no_connection';
  const detail = ready
    ? list
      ? t('partnerAgora.offline.ready', {
          count: state.count ?? 0,
          date: state.updatedAt
            ? formatBusinessDate(
                state.updatedAt,
                i18n.language,
                { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
                timeZone
              )
            : '',
        })
      : t('partnerAgora.offlineKeys.ready')
    : t(blocked ? `${key}.noConnection` : `${key}.missing`);
  return (
    <CardShell
      type="offline"
      icon={ready ? Check : undefined}
      tone={blocked ? 'warn' : undefined}
      title={t(`${key}.title`, { name })}
      sub={`${when} · ${detail}`}
    >
      {ready ? (
        list &&
        (state.online ? (
          <button type="button" onClick={state.download} disabled={state.busy} className={LINK}>
            {t(state.busy ? 'partnerAgora.offline.downloading' : 'partnerAgora.offline.refresh')}
          </button>
        ) : (
          <p className="text-[13px] text-ink/70">{t('partnerAgora.offline.readyNoConnection')}</p>
        ))
      ) : (
        <button
          type="button"
          onClick={state.download}
          disabled={blocked || state.busy}
          className={`${BUTTON_SECONDARY} w-full`}
        >
          {t(state.busy ? `${key}.downloading` : `${key}.button`)}
        </button>
      )}
      {state.failed && <StatusText tone="warn">{t(`${key}.failed`)}</StatusText>}
    </CardShell>
  );
}

/** Um cartão de "Agora" (p40, p42, p43): título, linha de apoio e a ação da hora. */
export function AgoraCardItem({
  card,
  now,
  arriving,
  starting,
  offline,
  nameOf,
  contacts,
  onArrive,
  onOpenCode,
  onStart,
  onOpenGate,
}: {
  card: AgoraCard;
  now: number;
  arriving: boolean;
  starting: boolean;
  /** Situação da lista sem internet neste aparelho (C5); `null` quando a composição não informa. */
  offline: AgoraOfflineState | null;
  nameOf: (item: PartnerTodayItem) => string;
  /** Lista de contatos depois do "Cheguei" (bookings), montada pela composição. */
  contacts: ReactNode;
  onArrive: () => void;
  onOpenCode: (noShow: boolean) => void;
  onStart: () => void;
  onOpenGate: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { zoneOf } = usePanelTimeZone();
  // Tudo neste cartão é do mesmo item: as horas saem no fuso do lugar dele (D28).
  const timeZone = zoneOf(card.item);
  const time = (iso: string) =>
    formatBusinessDate(iso, lang, { hour: '2-digit', minute: '2-digit' }, timeZone);
  const titleAt = (item: PartnerTodayItem) =>
    t('partnerAgora.titleAt', { title: item.title, time: time(item.startsAt) });
  const withCode = (item: PartnerTodayItem) => {
    const total = item.bookings ?? 0;
    return t('partnerAgora.code.withCode', {
      done: total - (item.waitingBookings ?? 0),
      total,
    });
  };

  const { item } = card;
  switch (card.type) {
    case 'arrive':
      return (
        <CardShell
          type="arrive"
          title={titleAt(item)}
          sub={[
            item.meetingPoint,
            `${t('partnerAgora.arrive.bookings', { count: item.bookings ?? 0 })}, ${t(
              'partnerAgora.arrive.people',
              { count: item.sold }
            )}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        >
          <button
            type="button"
            onClick={onArrive}
            disabled={arriving}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t(arriving ? 'partnerAgora.arrive.sending' : 'partnerAgora.arrive.button')}
          </button>
        </CardShell>
      );
    case 'code': {
      const noShow = card.noShowAt !== null && now >= new Date(card.noShowAt).getTime();
      return (
        <CardShell
          type="code"
          icon={card.arrived ? MapPin : undefined}
          title={titleAt(item)}
          sub={
            item.arrivedAt
              ? `${t('partnerAgora.code.arrivedAt', { time: time(item.arrivedAt) })} · ${withCode(item)}`
              : withCode(item)
          }
        >
          <button
            type="button"
            onClick={() => onOpenCode(noShow)}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t('partnerAgora.code.button')}
          </button>
          {card.arrived && contacts}
          {noShow && (
            <div className="flex justify-center">
              <button type="button" onClick={() => onOpenCode(true)} className={LINK}>
                {t('partnerAgora.code.noShow')}
              </button>
            </div>
          )}
          {card.arrived && (
            <p className="px-1 text-[14px] text-ink/70">
              {t('partnerAgora.code.contactsHint')}
              {card.noShowAt && !noShow
                ? ` ${t('partnerAgora.code.noShowAt', { time: time(card.noShowAt) })}`
                : ''}
            </p>
          )}
        </CardShell>
      );
    }
    case 'start':
      return (
        <CardShell
          type="start"
          title={titleAt(item)}
          sub={t('partnerAgora.start.sub', { done: item.bookings ?? 0, total: item.bookings ?? 0 })}
        >
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t(starting ? 'partnerAgora.start.sending' : 'partnerAgora.start.button')}
          </button>
        </CardShell>
      );
    case 'gate': {
      const startMs = new Date(item.startsAt).getTime();
      const entry = item.kind === 'slot';
      const end = item.serviceEndsAt ?? item.endsAt;
      const when =
        now < startMs
          ? t(entry ? 'partnerAgora.gate.opensAt' : 'partnerAgora.gate.startsAt', {
              time: time(item.startsAt),
            })
          : end
            ? t('partnerAgora.gate.openUntil', { time: time(end) })
            : null;
      const count = entry
        ? t('partnerAgora.gate.entered', { done: item.checkedIn ?? 0, total: item.sold })
        : t('partnerAgora.gate.sold', { count: item.sold });
      return (
        <CardShell
          type="gate"
          title={t('partnerAgora.gate.title', { name: entry ? nameOf(item) : item.title })}
          sub={[when, count].filter(Boolean).join(' · ')}
        >
          <button type="button" onClick={onOpenGate} className={`${BUTTON_SECONDARY} w-full`}>
            {t('partnerAgora.gate.button')}
          </button>
        </CardShell>
      );
    }
    case 'offline': {
      const sameDay =
        formatBusinessDate(item.startsAt, 'en-CA', { dateStyle: 'short' }, timeZone) ===
        formatBusinessDate(new Date(now).toISOString(), 'en-CA', { dateStyle: 'short' }, timeZone);
      const when = t(sameDay ? 'partnerAgora.offline.today' : 'partnerAgora.offline.tomorrow', {
        time: time(item.startsAt),
      });
      const name = item.kind === 'slot' ? nameOf(item) : item.title;
      if (!offline) {
        return (
          <CardShell type="offline" title={t('partnerAgora.offline.title', { name })} sub={when}>
            <button type="button" onClick={onOpenGate} className={`${BUTTON_SECONDARY} w-full`}>
              {t('partnerAgora.offline.button')}
            </button>
          </CardShell>
        );
      }
      return <OfflineCard state={offline} name={name} when={when} timeZone={timeZone} />;
    }
  }
}
