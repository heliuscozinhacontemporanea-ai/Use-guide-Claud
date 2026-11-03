import {
  Bug,
  CalendarCheck,
  Check,
  ChevronDown,
  Copy,
  type LucideIcon,
  Mail,
  MessageCircle,
  Search,
  ShoppingBag,
  Ticket,
  UserRound,
} from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../../shared/constants/appVersion';
import type { HelpTopic } from '../../../shared/i18n/helpResources';
import { cn } from '../../../shared/utils/cn';
import { whatsAppUrl } from '../../../shared/utils/phone';
import { BackButton } from '../../../ui/components/BackButton';
import { INPUT } from '../../../ui/styles/controls';

const SUPPORT_EMAIL = 'ajuda@useguide.com.br';
const TOPICS: HelpTopic[] = [
  'purchases',
  'tickets',
  'bookings',
  'refunds',
  'account',
  'partners',
  'app',
];

type FaqEntry = { id: string; topic: HelpTopic; q: string; a: string };

interface SupportViewProps {
  onBack: () => void;
  /** Só com login: atalhos para as compras, os ingressos e as reservas da conta. */
  onOpenPurchases?: () => void;
  onOpenTickets?: () => void;
  onOpenBookings?: () => void;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function Shortcut({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press min-h-[72px] p-3 rounded-2xl bg-surface border border-line flex flex-col items-start justify-between gap-2 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <Icon size={20} className="text-accent" aria-hidden="true" />
      <span className="text-[14px] font-semibold text-ink leading-tight">{label}</span>
    </button>
  );
}

function FaqItem({ entry }: { entry: FaqEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="w-full min-h-14 px-4 py-3 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span className="flex-1 text-[15px] font-semibold text-ink">{entry.q}</span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-ink/40 transition-transform motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <p id={panelId} className="px-4 pb-4 text-[14px] text-ink/80 leading-relaxed">
          {entry.a}
        </p>
      )}
    </li>
  );
}

/** Configurações › Suporte: busca, atalhos, temas, perguntas e contato (D25). */
export function SupportView({
  onBack,
  onOpenPurchases,
  onOpenTickets,
  onOpenBookings,
}: SupportViewProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<HelpTopic | 'all'>('all');
  const [copied, setCopied] = useState(false);
  const faq = t('help.faq', { returnObjects: true }) as FaqEntry[];

  const visible = useMemo(() => {
    const term = normalize(query.trim());
    return faq.filter(
      (entry) =>
        (topic === 'all' || entry.topic === topic) &&
        (!term || normalize(`${entry.q} ${entry.a}`).includes(term))
    );
  }, [faq, query, topic]);

  // Número real vem da configuração (AGENTS.md §11.10: nada de número fictício no código).
  const whatsappUrl = whatsAppUrl(
    import.meta.env.VITE_SUPPORT_WHATSAPP?.trim(),
    t('help.contactHint')
  );
  const reportUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('help.reportSubject', { version: APP_VERSION }))}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o e-mail continua visível e o link abre o app de e-mail.
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('help.title')}</h2>
      </div>

      <div className="shrink-0 relative mb-4">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('help.search')}
          aria-label={t('help.searchLabel')}
          className={cn(INPUT, 'pl-10')}
        />
      </div>

      <div className="shrink-0 grid grid-cols-2 gap-2 mb-5">
        {onOpenPurchases && (
          <Shortcut
            icon={ShoppingBag}
            label={t('help.shortcuts.purchases')}
            onClick={onOpenPurchases}
          />
        )}
        {onOpenTickets && (
          <Shortcut icon={Ticket} label={t('help.shortcuts.tickets')} onClick={onOpenTickets} />
        )}
        {onOpenBookings && (
          <Shortcut
            icon={CalendarCheck}
            label={t('help.shortcuts.bookings')}
            onClick={onOpenBookings}
          />
        )}
        <Shortcut
          icon={UserRound}
          label={t('help.shortcuts.account')}
          onClick={() => setTopic('account')}
        />
      </div>

      <div className="shrink-0 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 mb-3">
        {(['all', ...TOPICS] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={topic === key}
            onClick={() => setTopic(key)}
            className={cn(
              'press shrink-0 min-h-11 px-4 rounded-full text-[13px] font-semibold whitespace-nowrap border focus-visible:ring-2 focus-visible:ring-teal-400/50',
              topic === key
                ? 'bg-accent-soft text-accent border-accent-line'
                : 'bg-surface text-ink/80 border-line'
            )}
          >
            {key === 'all' ? t('help.allTopics') : t(`help.topics.${key}`)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="shrink-0 mb-5 px-1 text-[13px] text-ink/70">{t('help.noResults')}</p>
      ) : (
        <ul className="shrink-0 mb-5 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
          {visible.map((entry) => (
            <FaqItem key={entry.id} entry={entry} />
          ))}
        </ul>
      )}

      <section className="shrink-0 p-4 rounded-[20px] bg-surface border border-line space-y-3">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{t('help.contactTitle')}</h3>
          <p className="text-[13px] text-ink/70">{t('help.contactHint')}</p>
        </div>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press min-h-12 px-4 rounded-xl bg-success-soft border border-success-line text-success flex items-center gap-3 font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <MessageCircle size={20} aria-hidden="true" />
            {t('help.whatsapp')}
          </a>
        )}
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="press flex-1 min-w-0 min-h-12 px-4 rounded-xl bg-app/40 border border-line text-ink flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <Mail size={20} className="shrink-0 text-accent" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[12px] text-ink/70">{t('help.email')}</span>
              <span className="block text-[14px] font-semibold truncate">{SUPPORT_EMAIL}</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => void copyEmail()}
            aria-label={copied ? t('help.copied') : t('help.copy')}
            className="press w-12 h-12 shrink-0 rounded-xl border border-line text-ink/80 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {copied ? (
              <Check size={18} className="text-success" aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
          </button>
        </div>
        <a
          href={reportUrl}
          className="press min-h-11 inline-flex items-center gap-2 text-[14px] font-semibold text-accent rounded-lg focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Bug size={18} aria-hidden="true" />
          {t('help.reportProblem')}
        </a>
      </section>
    </div>
  );
}
