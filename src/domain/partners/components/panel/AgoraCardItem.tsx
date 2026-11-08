import { Download, KeyRound, type LucideIcon, MapPin, Play, ScanLine } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { PartnerTodayItem } from '../../types/partnerHome';
import type { AgoraCard } from '../../utils/agoraCards';

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
  title,
  sub,
  children,
}: {
  type: AgoraCard['type'];
  /** Troca o ícone do tipo (ex.: o pino depois do "Cheguei", p42). */
  icon?: LucideIcon;
  title: string;
  sub: string;
  children: ReactNode;
}) {
  const Icon = icon ?? ICON[type];
  return (
    <li className="rounded-[20px] bg-surface border border-teal-400/30 p-4 space-y-4">
      <div className="flex items-start gap-3.5">
        <span className="shrink-0 size-12 rounded-2xl bg-teal-400/10 text-accent flex items-center justify-center">
          <Icon size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-[17px] leading-snug font-semibold text-ink break-words">{title}</h3>
          <p className="text-[14px] text-ink/70 break-words">{sub}</p>
        </div>
      </div>
      {children}
    </li>
  );
}

/** Um cartão de "Agora" (p40, p42, p43): título, linha de apoio e a ação da hora. */
export function AgoraCardItem({
  card,
  now,
  arriving,
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
  const time = (iso: string) =>
    formatBusinessDate(iso, lang, { hour: '2-digit', minute: '2-digit' });
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
          <button type="button" onClick={onStart} className={`${BUTTON_PRIMARY} w-full`}>
            {t('partnerAgora.start.button')}
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
        formatBusinessDate(item.startsAt, 'en-CA', { dateStyle: 'short' }) ===
        formatBusinessDate(new Date(now).toISOString(), 'en-CA', { dateStyle: 'short' });
      return (
        <CardShell
          type="offline"
          title={t('partnerAgora.offline.title', {
            name: item.kind === 'slot' ? nameOf(item) : item.title,
          })}
          sub={t(sameDay ? 'partnerAgora.offline.today' : 'partnerAgora.offline.tomorrow', {
            time: time(item.startsAt),
          })}
        >
          <button type="button" onClick={onOpenGate} className={`${BUTTON_SECONDARY} w-full`}>
            {t('partnerAgora.offline.button')}
          </button>
        </CardShell>
      );
    }
  }
}
