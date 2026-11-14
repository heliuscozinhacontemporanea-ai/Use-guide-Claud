import {
  CalendarCheck,
  Check,
  Copy,
  CreditCard,
  type LucideIcon,
  RotateCcw,
  Search,
  Smartphone,
  Store,
  Ticket,
  UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../../shared/constants/appVersion';
import type { HelpTopic } from '../../../shared/i18n/helpResources';
import { cn } from '../../../shared/utils/cn';
import { whatsAppUrl } from '../../../shared/utils/phone';
import { BackButton } from '../../../ui/components/BackButton';
import { StackSubPage, useStackSubPage } from '../../../ui/layouts/stack/StackSubPage';
import { INPUT } from '../../../ui/styles/controls';
import { type FaqEntry, FaqItem } from './support/FaqItem';
import { SupportRow } from './support/SupportRow';

const SUPPORT_EMAIL = 'ajuda@useguide.com.br';
const TOPICS: Array<{ key: HelpTopic; icon: LucideIcon }> = [
  { key: 'purchases', icon: CreditCard },
  { key: 'tickets', icon: Ticket },
  { key: 'bookings', icon: CalendarCheck },
  { key: 'refunds', icon: RotateCcw },
  { key: 'account', icon: UserRound },
  { key: 'partners', icon: Store },
  { key: 'app', icon: Smartphone },
];
/** As dúvidas que mais chegam: Pix, cancelamento, onde está o ingresso, reembolso e senha. */
const TOP_QUESTIONS = [
  'pix-pending',
  'cancel-window',
  'find-tickets',
  'refund-time',
  'forgot-password',
];
const LIST =
  'shrink-0 rounded-card bg-surface border border-line divide-y divide-line overflow-hidden';
const SECTION_TITLE = 'px-1 mb-3 text-title font-display font-bold text-ink';

type HelpEntry = FaqEntry & { topic: HelpTopic };

const isHelpTopic = (value: string | null): value is HelpTopic =>
  TOPICS.some((topic) => topic.key === value);

interface SupportViewProps {
  /** Desenha o próprio topo (painel do parceiro); na folha do perfil o `<` fica na barra fixa (D33). */
  onBack?: () => void;
  /** Só com login: atalhos para as compras, os ingressos e as reservas da conta. */
  onOpenPurchases?: () => void;
  onOpenTickets?: () => void;
  onOpenBookings?: () => void;
  /** Abre direto num assunto (ex.: "Ajuda para parceiros" abre em Para parceiros). */
  initialTopic?: HelpTopic;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Configurações › Suporte (D25). Central de ajuda no estilo Airbnb e Tripadvisor: saudação com
 * busca, atalho para a compra, assuntos e perguntas mais lidas; o assunto abre a própria página
 * (na folha do perfil, uma página interna da pilha).
 */
export function SupportView({
  onBack,
  onOpenPurchases,
  onOpenTickets,
  onOpenBookings,
  initialTopic,
}: SupportViewProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const subPage = useStackSubPage(initialTopic ?? null);
  const topic = isHelpTopic(subPage.id) ? subPage.id : null;
  const [copied, setCopied] = useState(false);
  const faq = t('help.faq', { returnObjects: true }) as HelpEntry[];
  const term = normalize(query.trim());

  const results = useMemo(
    () => (term ? faq.filter((entry) => normalize(`${entry.q} ${entry.a}`).includes(term)) : []),
    [faq, term]
  );
  const top = TOP_QUESTIONS.map((id) => faq.find((entry) => entry.id === id)).filter(
    (entry): entry is HelpEntry => Boolean(entry)
  );

  // Número real vem da configuração (AGENTS.md §11: nada de número fictício no código).
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

  const contact = (
    <section className="shrink-0">
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
              className="press w-11 h-11 mr-2 shrink-0 rounded-control text-ink-muted hover:bg-ink/[0.05] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {copied ? (
                <Check size={20} aria-hidden="true" />
              ) : (
                <Copy size={20} aria-hidden="true" />
              )}
            </button>
          }
        />
        <SupportRow label={t('help.reportProblem')} hint={t('help.reportHint')} href={reportUrl} />
      </ul>
    </section>
  );

  const topicPage = topic && (
    <>
      <ul className={cn(LIST, 'mb-8')}>
        {faq
          .filter((entry) => entry.topic === topic)
          .map((entry) => (
            <FaqItem key={entry.id} entry={entry} />
          ))}
      </ul>
      {contact}
    </>
  );

  // Fora da folha do perfil (painel do parceiro), o assunto troca a tela no lugar.
  if (topicPage && !subPage.inStack) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          <BackButton label={t('help.title')} onClick={subPage.close} />
          <h2 className="text-heading font-display font-bold text-ink">
            {t(`help.topics.${topic}`)}
          </h2>
        </div>
        {topicPage}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {onBack && (
        <div className="flex items-center gap-2 mb-2">
          <BackButton label={t('settings.back')} onClick={onBack} />
          <h2 className="text-title font-semibold text-ink">{t('help.title')}</h2>
        </div>
      )}

      <h3 className="shrink-0 mt-2 mb-4 text-display font-display font-bold text-ink">
        {t('help.greeting')}
      </h3>
      <div className="shrink-0 relative mb-8">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('help.search')}
          aria-label={t('help.searchLabel')}
          className={cn(INPUT, 'min-h-12 pl-11 rounded-full')}
        />
      </div>

      {term ? (
        <section className="shrink-0 mb-8">
          <h3 className={SECTION_TITLE}>{t('help.resultsTitle')}</h3>
          {results.length === 0 ? (
            <p className="px-1 text-control text-ink-muted">{t('help.noResults')}</p>
          ) : (
            <ul className={LIST}>
              {results.map((entry) => (
                <FaqItem key={entry.id} entry={entry} preview />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {hasShortcuts && (
            <section className="shrink-0 mb-8">
              <h3 className={SECTION_TITLE}>{t('help.shortcutsTitle')}</h3>
              <ul className={LIST}>
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
            </section>
          )}

          <section className="shrink-0 mb-8">
            <h3 className={SECTION_TITLE}>{t('help.topicsTitle')}</h3>
            <ul className={LIST}>
              {TOPICS.map(({ key, icon }) => (
                <SupportRow
                  key={key}
                  icon={icon}
                  label={t(`help.topics.${key}`)}
                  onClick={() => subPage.open(key)}
                />
              ))}
            </ul>
          </section>

          <section className="shrink-0 mb-8">
            <h3 className={SECTION_TITLE}>{t('help.topTitle')}</h3>
            <ul className={LIST}>
              {top.map((entry) => (
                <FaqItem key={entry.id} entry={entry} preview />
              ))}
            </ul>
          </section>
        </>
      )}

      {contact}
      {subPage.inStack && topicPage && (
        <StackSubPage title={t(`help.topics.${topic}`)}>{topicPage}</StackSubPage>
      )}
    </div>
  );
}
