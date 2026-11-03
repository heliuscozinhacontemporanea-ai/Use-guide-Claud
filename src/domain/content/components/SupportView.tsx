import { Check, Copy, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../../shared/constants/appVersion';
import type { HelpTopic } from '../../../shared/i18n/helpResources';
import { cn } from '../../../shared/utils/cn';
import { whatsAppUrl } from '../../../shared/utils/phone';
import { BackButton } from '../../../ui/components/BackButton';
import { TextButton } from '../../../ui/components/TextButton';
import { INPUT } from '../../../ui/styles/controls';
import { type FaqEntry, FaqItem } from './support/FaqItem';
import { SupportRow } from './support/SupportRow';

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
const LIST =
  'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';
/** Sem busca e sem assunto escolhido, mostra só as mais procuradas (padrão Airbnb). */
const TOP_COUNT = 5;
const SECTION_TITLE = 'px-1 mb-2 text-xs font-bold text-ink';

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

/**
 * Configurações › Suporte (D25, revisão). Padrão Airbnb e Uber: busca, atalho para a compra,
 * perguntas por assunto e contato no fim. Cores neutras; só a seleção usa destaque.
 */
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
  const [showAll, setShowAll] = useState(false);
  const faq = t('help.faq', { returnObjects: true }) as Array<FaqEntry & { topic: HelpTopic }>;

  const visible = useMemo(() => {
    const term = normalize(query.trim());
    return faq.filter(
      (entry) =>
        (topic === 'all' || entry.topic === topic) &&
        (!term || normalize(`${entry.q} ${entry.a}`).includes(term))
    );
  }, [faq, query, topic]);
  const collapsed = !showAll && topic === 'all' && !query.trim() && visible.length > TOP_COUNT;
  const shown = collapsed ? visible.slice(0, TOP_COUNT) : visible;

  // Número real vem da configuração (AGENTS.md §11.10: nada de número fictício no código).
  const whatsappUrl = whatsAppUrl(
    import.meta.env.VITE_SUPPORT_WHATSAPP?.trim(),
    t('help.whatsappMessage')
  );
  const reportUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('help.reportSubject', { version: APP_VERSION }))}`;
  const hasShortcuts = Boolean(onOpenPurchases || onOpenTickets || onOpenBookings);

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

      <div className="shrink-0 relative mb-6">
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

      {hasShortcuts && (
        <>
          <h3 className={SECTION_TITLE}>{t('help.shortcutsTitle')}</h3>
          <ul className={cn(LIST, 'mb-6')}>
            {onOpenPurchases && (
              <SupportRow label={t('help.shortcuts.purchases')} onClick={onOpenPurchases} />
            )}
            {onOpenTickets && (
              <SupportRow label={t('help.shortcuts.tickets')} onClick={onOpenTickets} />
            )}
            {onOpenBookings && (
              <SupportRow label={t('help.shortcuts.bookings')} onClick={onOpenBookings} />
            )}
          </ul>
        </>
      )}

      <h3 className={SECTION_TITLE}>{t('help.faqTitle')}</h3>
      <div className="shrink-0 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 mb-3">
        {(['all', ...TOPICS] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={topic === key}
            onClick={() => setTopic(key)}
            className={cn(
              'press shrink-0 min-h-11 px-4 rounded-full text-[14px] font-semibold whitespace-nowrap border focus-visible:ring-2 focus-visible:ring-teal-400/50',
              topic === key ? 'bg-ink text-app border-ink' : 'bg-surface text-ink/80 border-line'
            )}
          >
            {key === 'all' ? t('help.allTopics') : t(`help.topics.${key}`)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="shrink-0 mb-6 px-1 text-[14px] text-ink/70">{t('help.noResults')}</p>
      ) : (
        <div className="shrink-0 mb-6">
          <ul className={LIST}>
            {shown.map((entry) => (
              <FaqItem key={entry.id} entry={entry} />
            ))}
          </ul>
          {collapsed && (
            <TextButton tone="accent" onClick={() => setShowAll(true)} className="mt-2">
              {t('help.showAll', { count: visible.length })}
            </TextButton>
          )}
        </div>
      )}

      <h3 className={SECTION_TITLE}>{t('help.contactTitle')}</h3>
      <ul className={LIST}>
        {whatsappUrl && <SupportRow label={t('help.whatsapp')} href={whatsappUrl} external />}
        <SupportRow
          label={t('help.email')}
          hint={SUPPORT_EMAIL}
          href={`mailto:${SUPPORT_EMAIL}`}
          trailing={
            <button
              type="button"
              onClick={() => void copyEmail()}
              aria-label={copied ? t('help.copied') : t('help.copy')}
              className="press w-11 h-11 mr-2 shrink-0 rounded-xl text-ink/70 hover:bg-ink/[0.05] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {copied ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Copy size={18} aria-hidden="true" />
              )}
            </button>
          }
        />
        <SupportRow label={t('help.reportProblem')} hint={t('help.reportHint')} href={reportUrl} />
      </ul>
    </div>
  );
}
