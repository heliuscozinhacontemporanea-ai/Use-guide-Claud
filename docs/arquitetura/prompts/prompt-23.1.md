# Prompt 23.1 — Telas de Notificações, central e Suporte

> Lote 19, gerado dos commits de referência `00f530e..8834efd` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.1 — Telas de Notificações, central e Suporte

Telas aprovadas em 2026-11-03, depois da revisão (referências Airbnb, Tripadvisor e Apple; base visual D17).

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D25 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Configurações › Notificações: cartão "Ative as notificações" (única ação principal), lista "Sempre avisamos você" sem interruptor, "Você decide" com Pedidos de avaliação e Novidades e ofertas, e para o parceiro "A cada venda" ou "Resumo no fim do dia".
2) Central de notificações (folha): filtros Não lidas e Tudo, menu "…" com Configurações e Marcar todas como lidas, grupos Hoje e Anteriores e "Você está em dia".
3) Suporte como central de ajuda: saudação com busca, Ajuda com uma compra, Assuntos (cada um abre a própria lista), Perguntas mais lidas com prévia e Fale com a gente.
4) Textos para quem usa o app, nos três idiomas. Ícones neutros; cor só com significado.
5) Os dados ainda não estão ligados: o sininho e as escolhas passam a funcionar no 23.2a e 23.2b.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/menu/SideMenu.tsx (alterar)
- src/domain/content/components/SupportView.test.tsx (criar)
- src/domain/content/components/SupportView.tsx (alterar)
- src/domain/content/components/about/AboutLicensesView.tsx (alterar)
- src/domain/content/components/support/FaqItem.tsx (criar)
- src/domain/content/components/support/SupportRow.tsx (criar)
- src/domain/content/data/faqItems.ts (apagar)
- src/domain/content/types/content.ts (alterar)
- src/domain/notifications/adapters/firestoreNotificationAdapter.ts (alterar)
- src/domain/notifications/application/usecases/getNotificationPreferencesUseCase.ts (criar)
- src/domain/notifications/application/usecases/getNotificationSettingsUseCase.ts (apagar)
- src/domain/notifications/application/usecases/updateNotificationPreferencesUseCase.ts (criar)
- src/domain/notifications/application/usecases/updateNotificationSettingsUseCase.ts (apagar)
- src/domain/notifications/components/NotificationBellButton.tsx (criar)
- src/domain/notifications/components/NotificationCenterSheet.test.tsx (criar)
- src/domain/notifications/components/NotificationCenterSheet.tsx (criar)
- src/domain/notifications/components/NotificationDeviceCard.tsx (criar)
- src/domain/notifications/components/NotificationPanel.tsx (alterar)
- src/domain/notifications/components/NotificationSettingsView.test.tsx (alterar)
- src/domain/notifications/components/NotificationSettingsView.tsx (alterar)
- src/domain/notifications/hooks/useNotificationPreferences.ts (criar)
- src/domain/notifications/hooks/useNotificationSettings.ts (apagar)
- src/domain/notifications/hooks/useNotifications.ts (alterar)
- src/domain/notifications/hooks/usePushDeviceState.ts (criar)
- src/domain/notifications/index.ts (alterar)
- src/domain/notifications/ports/notificationPort.ts (alterar)
- src/domain/notifications/types/notification.ts (alterar)
- src/domain/notifications/types/notificationCategories.ts (criar)
- src/domain/user/components/SettingsView.tsx (alterar)
- src/shared/i18n/appAboutResources.ts (alterar)
- src/shared/i18n/helpResources.ts (criar)
- src/shared/i18n/notifyResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/menu/SideMenu.tsx — diff ===
@@ -78,9 +78,7 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
   // Papel vem da sessão (claims + perfil), a mesma fonte que o AppRouter usa para abrir os painéis.
   const isPartner = user?.role === UserRole.PARTNER;
   const isAdmin = user?.role === UserRole.ADMIN;
-  const visibleView = visibleMenuView(requestedView ?? 'main', Boolean(user));
-  // Notificações só existem para parceiros; outra conta que abrir o link vê Configurações.
-  const view = visibleView === 'notifications' && !isPartner ? 'settings' : visibleView;
+  const view = visibleMenuView(requestedView ?? 'main', Boolean(user));
   const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
 
   const showView = (target: MenuView) => openMenu(target);
@@ -167,11 +165,11 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
             onOpenAbout={() => showView('about')}
             onOpenPurchases={user ? () => showView('purchases') : undefined}
             onOpenUsername={user ? () => showView('username') : undefined}
-            onOpenNotifications={isPartner ? () => showView('notifications') : undefined}
+            onOpenNotifications={user ? () => showView('notifications') : undefined}
           />
         );
       case 'notifications':
-        return user ? <NotificationSettingsView partnerId={user.uid} onBack={goBack} /> : null;
+        return <NotificationSettingsView isPartner={isPartner} onBack={goBack} />;
       case 'username':
         return <UsernameSettingsView onBack={goBack} />;
       case 'purchases':
@@ -211,7 +209,14 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
       case 'licenses':
         return <AboutLicensesView onBack={goBack} />;
       case 'support':
-        return <SupportView onBack={goBack} userEmail={user?.email} />;
+        return (
+          <SupportView
+            onBack={goBack}
+            onOpenPurchases={user ? () => showView('purchases') : undefined}
+            onOpenTickets={user ? () => showView('tickets') : undefined}
+            onOpenBookings={user ? () => showView('bookings') : undefined}
+          />
+        );
       case 'tickets':
         return <UserTicketsHistoryView onBack={goBack} />;
       case 'bookings':

=== src/domain/content/components/SupportView.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { SupportView } from './SupportView';

describe('SupportView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('busca sem acento e mostra só os resultados', () => {
    render(<SupportView onBack={() => undefined} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar nas perguntas' }), {
      target: { value: 'reembolso' },
    });
    expect(screen.getByText('Resultados')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Quanto tempo o reembolso demora\?/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Esqueci minha senha/ })).toBeNull();
    expect(screen.queryByText('Assuntos')).toBeNull();
  });

  it('assunto abre a própria lista e a resposta', () => {
    render(<SupportView onBack={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sua conta' }));
    const question = screen.getByRole('button', { name: 'Esqueci minha senha.' });
    fireEvent.click(question);
    expect(question.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/Esqueceu a senha\?/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Como vendo pelo Use Guide/ })).toBeNull();
  });

  it('atalhos de compras, ingressos e reservas só com login; e-mail único ajuda@', () => {
    const onOpenPurchases = vi.fn();
    const { rerender } = render(<SupportView onBack={() => undefined} />);
    expect(screen.queryByRole('button', { name: 'Minhas compras' })).toBeNull();
    rerender(<SupportView onBack={() => undefined} onOpenPurchases={onOpenPurchases} />);
    fireEvent.click(screen.getByRole('button', { name: 'Minhas compras' }));
    expect(onOpenPurchases).toHaveBeenCalled();
    expect(screen.getByText('ajuda@useguide.com.br')).toBeTruthy();
  });
});

=== src/domain/content/components/SupportView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
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
  'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';
const SECTION_TITLE = 'px-1 mb-3 text-[18px] font-display font-bold text-ink';

type HelpEntry = FaqEntry & { topic: HelpTopic };

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
 * Configurações › Suporte (D25). Central de ajuda no estilo Airbnb e Tripadvisor: saudação com
 * busca, atalho para a compra, assuntos e perguntas mais lidas; o assunto abre a própria lista.
 */
export function SupportView({
  onBack,
  onOpenPurchases,
  onOpenTickets,
  onOpenBookings,
}: SupportViewProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<HelpTopic | null>(null);
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
    </section>
  );

  if (topic) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-5">
          <BackButton label={t('help.title')} onClick={() => setTopic(null)} />
          <h2 className="text-[22px] font-display font-bold text-ink">
            {t(`help.topics.${topic}`)}
          </h2>
        </div>
        <ul className={cn(LIST, 'mb-8')}>
          {faq
            .filter((entry) => entry.topic === topic)
            .map((entry) => (
              <FaqItem key={entry.id} entry={entry} />
            ))}
        </ul>
        {contact}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[17px] font-semibold text-ink">{t('help.title')}</h2>
      </div>

      <h3 className="shrink-0 mt-2 mb-4 text-[28px] leading-tight font-display font-bold text-ink">
        {t('help.greeting')}
      </h3>
      <div className="shrink-0 relative mb-8">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/60"
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
            <p className="px-1 text-[14px] text-ink/70">{t('help.noResults')}</p>
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
                  onClick={() => setTopic(key)}
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
    </div>
  );
}

=== src/domain/content/components/about/AboutLicensesView.tsx — diff ===
@@ -6,7 +6,8 @@ import { useOpenSourceLicenses } from '../../hooks/useOpenSourceLicenses';
 import { LicenseEntry } from './LicenseEntry';
 
 const SECTION_TITLE = 'px-1 mb-2 text-[13px] font-semibold text-ink/70';
-const LIST = 'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';
+const LIST =
+  'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';
 
 /** Sobre o app › Licenças e créditos: autoria de trabalhos de terceiros e licenças das bibliotecas. */
 export function AboutLicensesView({ onBack }: { onBack: () => void }) {

=== src/domain/content/components/support/FaqItem.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../../../shared/utils/cn';

export type FaqEntry = { id: string; q: string; a: string };

/**
 * Pergunta que abre a resposta logo abaixo. Com `preview`, mostra o começo da resposta fechada
 * (padrão "artigos principais" das centrais de ajuda).
 */
export function FaqItem({ entry, preview = false }: { entry: FaqEntry; preview?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="w-full min-h-14 px-4 py-3.5 flex items-start gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold text-ink">{entry.q}</span>
          {preview && !open && (
            <span className="mt-0.5 text-[13px] text-ink/70 line-clamp-2">{entry.a}</span>
          )}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            'mt-0.5 shrink-0 text-ink/40 transition-transform motion-reduce:transition-none',
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

=== src/domain/content/components/support/SupportRow.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const ROW =
  'press w-full min-h-16 px-4 py-3.5 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none';

interface SupportRowProps {
  /** Ícone neutro opcional, à esquerda (lista de assuntos). */
  icon?: LucideIcon;
  label: string;
  hint?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
}

/** Linha do Suporte: título, contexto e seta; ícone neutro só nos assuntos. Com `href`, vira link. */
export function SupportRow({
  icon: Icon,
  label,
  hint,
  href,
  external,
  onClick,
  trailing,
}: SupportRowProps) {
  const content = (
    <>
      {Icon && <Icon size={20} className="shrink-0 text-ink/70" aria-hidden="true" />}
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        {hint && <span className="block text-[13px] text-ink/70 break-words">{hint}</span>}
      </span>
      {!trailing && <ChevronRight size={18} className="shrink-0 text-ink/40" aria-hidden="true" />}
    </>
  );
  return (
    <li className="flex items-center">
      {href ? (
        <a
          href={href}
          className={ROW}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={ROW}>
          {content}
        </button>
      )}
      {trailing}
    </li>
  );
}

=== src/domain/content/data/faqItems.ts — APAGUE este arquivo ===

=== src/domain/content/types/content.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
/** Biblioteca de produção com o texto da licença (gerado por `npm run licenses`). */
export interface OpenSourceLicense {
  name: string;
  version: string;
  license: string;
  author: string;
  url: string;
  text: string;
}

/** Trabalho de terceiros usado no app (ilustração, animação), com a autoria exigida pela licença. */
export interface ThirdPartyCredit {
  id: string;
  /** Chave de tradução do que é o trabalho. */
  workKey: string;
  author: string;
  source: string;
  url: string;
  license: string;
  text: string;
}

=== src/domain/notifications/adapters/firestoreNotificationAdapter.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { subscribeToCollectionUseCase } from '../../database';
import { NotificationPort } from '../ports/notificationPort';
import { Notification, SendAdminNotificationPayload } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export class FirestoreNotificationAdapter implements NotificationPort {
  subscribeToNotifications(
    partnerId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void {
    return subscribeToCollectionUseCase<Notification>(
      'notifications',
      onUpdate,
      onError,
      [{ field: 'recipientPartnerId', op: '==', value: partnerId }],
      [{ field: 'createdAt', direction: 'desc' }],
      limitCount
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    const res = await firebaseApiFetch(
      `/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
      },
      { requireAuth: true }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao marcar notificação como lida');
    }
  }

  async markAllAsRead(): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/read-all',
      {
        method: 'PATCH',
      },
      { requireAuth: true }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao marcar todas as notificações como lidas');
    }
  }

  async sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/send-admin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      { requireAuth: true }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao enviar notificação de administrador');
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const res = await firebaseApiFetch(
      '/api/notifications/preferences',
      { method: 'GET' },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('PREFERENCES_UNAVAILABLE');
    const body = (await res.json()) as { data: NotificationPreferences };
    return body.data;
  }

  async updatePreferences(patch: Partial<NotificationPreferences>): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/preferences',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('PREFERENCES_SAVE_FAILED');
  }
}

=== src/domain/notifications/application/usecases/getNotificationPreferencesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationAdapter } from '../../factory';
import type { NotificationPreferences } from '../../types/notificationCategories';

export function getNotificationPreferencesUseCase(): Promise<NotificationPreferences> {
  return notificationAdapter.getPreferences();
}

=== src/domain/notifications/application/usecases/getNotificationSettingsUseCase.ts — APAGUE este arquivo ===

=== src/domain/notifications/application/usecases/updateNotificationPreferencesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationAdapter } from '../../factory';
import type { NotificationPreferences } from '../../types/notificationCategories';

export function updateNotificationPreferencesUseCase(
  patch: Partial<NotificationPreferences>
): Promise<void> {
  return notificationAdapter.updatePreferences(patch);
}

=== src/domain/notifications/application/usecases/updateNotificationSettingsUseCase.ts — APAGUE este arquivo ===

=== src/domain/notifications/components/NotificationBellButton.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Sininho do topo do app com o número de avisos não lidos (D25). */
export function NotificationBellButton({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        unreadCount > 0
          ? t('notify.center.openUnread', { count: unreadCount })
          : t('notify.center.open')
      }
      className="press relative w-11 h-11 rounded-xl flex items-center justify-center text-ink hover:bg-ink/[0.05] focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <Bell size={20} aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-[#ffffff] text-[11px] font-bold leading-[18px] text-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

=== src/domain/notifications/components/NotificationCenterSheet.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { NotificationCenterSheet } from './NotificationCenterSheet';

const NOW = new Date('2026-11-03T15:00:00-03:00');
const items = [
  {
    id: 'a',
    category: 'tickets' as const,
    title: 'Você recebeu um ingresso',
    body: '@ana enviou 1 ingresso.',
    createdAt: new Date('2026-11-03T14:40:00-03:00'),
    read: false,
  },
  {
    id: 'b',
    category: 'bookings' as const,
    title: 'Reserva confirmada',
    body: 'Passeio de buggy, sábado às 9h.',
    createdAt: new Date('2026-11-01T10:00:00-03:00'),
    read: true,
  },
];

describe('NotificationCenterSheet', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('agrupa em Hoje e Anteriores, marca não lidas e abre o aviso tocado', () => {
    const onOpenItem = vi.fn();
    render(
      <NotificationCenterSheet
        open
        onOpenChange={() => undefined}
        items={items}
        loading={false}
        error={false}
        onRetry={() => undefined}
        onOpenItem={onOpenItem}
        onMarkAllRead={() => undefined}
        onOpenSettings={() => undefined}
        now={NOW}
      />
    );
    expect(screen.getByText('Hoje')).toBeTruthy();
    expect(screen.getByText('Anteriores')).toBeTruthy();
    expect(screen.getAllByText('Não lida')).toHaveLength(1);
    fireEvent.click(screen.getByText('Reserva confirmada'));
    expect(onOpenItem).toHaveBeenCalledWith(items[1]);
  });

  it('sem avisos mostra o estado vazio; em Não lidas, você está em dia', () => {
    render(
      <NotificationCenterSheet
        open
        onOpenChange={() => undefined}
        items={[]}
        loading={false}
        error={false}
        onRetry={() => undefined}
        onOpenItem={() => undefined}
        onMarkAllRead={() => undefined}
        onOpenSettings={() => undefined}
        now={NOW}
      />
    );
    expect(screen.getByText('Nenhuma notificação')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Não lidas' }));
    expect(screen.getByText('Você está em dia')).toBeTruthy();
  });
});

=== src/domain/notifications/components/NotificationCenterSheet.tsx — ARQUIVO NOVO, conteúdo completo ===
import { BellCheck, CheckCheck, Ellipsis, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { Dialog } from '../../../ui/components/Dialog';
import { DropdownMenu } from '../../../ui/components/DropdownMenu';
import { TextButton } from '../../../ui/components/TextButton';
import type { NotificationCenterItem } from '../types/notificationCategories';

const TIME_ZONE = 'America/Fortaleza';

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);
}

function relativeTime(date: Date, locale: string, now: Date): string {
  const minutes = Math.round((date.getTime() - now.getTime()) / 60_000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  if (Math.abs(minutes) < 60) return format.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return format.format(hours, 'hour');
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: TIME_ZONE,
  }).format(date);
}

interface NotificationCenterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NotificationCenterItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onOpenItem: (item: NotificationCenterItem) => void;
  onMarkAllRead: () => void;
  onOpenSettings: () => void;
  now?: Date;
}

/** Central de notificações de todas as contas (D25): filtro Não lidas/Tudo, Hoje e Anteriores; tocar abre o lugar certo. */
export function NotificationCenterSheet({
  open,
  onOpenChange,
  items,
  loading,
  error,
  onRetry,
  onOpenItem,
  onMarkAllRead,
  onOpenSettings,
  now = new Date(),
}: NotificationCenterSheetProps) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<'unread' | 'all'>('all');
  const today = dayKey(now);
  const shown = filter === 'unread' ? items.filter((item) => !item.read) : items;
  const groups = [
    { key: 'today', items: shown.filter((item) => dayKey(item.createdAt) === today) },
    { key: 'earlier', items: shown.filter((item) => dayKey(item.createdAt) !== today) },
  ].filter((group) => group.items.length > 0);
  const hasUnread = items.some((item) => !item.read);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('notify.center.title')}>
      <div className="flex items-center justify-between gap-2 -mt-1 mb-4">
        <div className="flex gap-2">
          {(['unread', 'all'] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                'press min-h-11 px-4 rounded-full text-[14px] font-semibold border focus-visible:ring-2 focus-visible:ring-teal-400/50',
                filter === key ? 'bg-ink text-app border-ink' : 'text-ink/80 border-line'
              )}
            >
              {t(key === 'unread' ? 'notify.center.filterUnread' : 'notify.center.filterAll')}
            </button>
          ))}
        </div>
        <DropdownMenu
          trigger={
            <button
              type="button"
              aria-label={t('notify.center.more')}
              className="press w-11 h-11 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <Ellipsis size={20} aria-hidden="true" />
            </button>
          }
          items={[
            {
              label: t('notify.center.settings'),
              icon: <SlidersHorizontal size={18} aria-hidden="true" />,
              onClick: onOpenSettings,
            },
            {
              label: t('notify.center.markAll'),
              icon: <CheckCheck size={18} aria-hidden="true" />,
              onClick: onMarkAllRead,
              disabled: !hasUnread,
            },
          ]}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="h-[72px] rounded-2xl bg-ink/[0.04] animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-2 py-6 text-[13px] text-ink/70">
          <span role="alert">{t('notify.center.loadError')}</span>
          <TextButton tone="accent" onClick={onRetry}>
            {t('notify.retry')}
          </TextButton>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center gap-1">
          <BellCheck size={28} className="mb-2 text-ink/70" aria-hidden="true" />
          <p className="text-[16px] font-semibold text-ink">
            {t(filter === 'unread' ? 'notify.center.upToDate' : 'notify.center.empty')}
          </p>
          <p className="text-[14px] text-ink/70">
            {t(filter === 'unread' ? 'notify.center.upToDateHint' : 'notify.center.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="mb-2 text-xs font-bold text-ink">{t(`notify.center.${group.key}`)}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className="press w-full p-4 rounded-2xl bg-ink/[0.04] flex items-start gap-3 text-left hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
                    >
                      <span className="flex-1 min-w-0 space-y-0.5">
                        <span
                          className={cn(
                            'block text-[15px] text-ink break-words',
                            item.read ? 'font-medium' : 'font-semibold'
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="block text-[13px] text-ink/70 break-words">
                          {item.body}
                        </span>
                      </span>
                      <span className="shrink-0 flex items-center gap-2 pt-0.5">
                        <span className="text-[12px] text-ink/70 tabular-nums">
                          {relativeTime(item.createdAt, i18n.language, now)}
                        </span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-accent">
                            <span className="sr-only">{t('notify.center.unread')}</span>
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Dialog>
  );
}

=== src/domain/notifications/components/NotificationDeviceCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { usePushDeviceState } from '../hooks/usePushDeviceState';

/** Ativar notificações neste aparelho. É a única ação principal da tela. */
export function NotificationDeviceCard() {
  const { t } = useTranslation();
  const { state, enable } = usePushDeviceState();

  if (state === 'default') {
    return (
      <section className="shrink-0 mb-6 p-4 rounded-[20px] bg-surface border border-line space-y-3">
        <div className="space-y-1">
          <h3 className="text-[16px] font-semibold text-ink">{t('notify.device.defaultTitle')}</h3>
          <p className="text-[14px] text-ink/70 leading-relaxed">{t('notify.device.default')}</p>
        </div>
        <button type="button" onClick={() => void enable()} className={`${BUTTON_PRIMARY} w-full`}>
          {t('notify.device.enable')}
        </button>
      </section>
    );
  }

  const granted = state === 'granted';
  return (
    <section className="shrink-0 mb-6 p-4 rounded-[20px] bg-surface border border-line">
      <div className="space-y-0.5">
        {granted && (
          <h3 className="text-[15px] font-semibold text-ink">{t('notify.device.granted')}</h3>
        )}
        <p className="text-[14px] text-ink/70 leading-relaxed">
          {granted ? t('notify.device.grantedHint') : t(`notify.device.${state}`)}
        </p>
      </div>
    </section>
  );
}

=== src/domain/notifications/components/NotificationPanel.tsx — diff ===
@@ -1,8 +1,8 @@
+import { CheckCheck, Clock, Loader2, MessageSquare, Star } from 'lucide-react';
 import { AnimatePresence, motion } from 'motion/react';
-import { Star, MessageSquare, Clock, CheckCheck, Loader2 } from 'lucide-react';
-import { Notification } from '../types/notification';
 import { Z_INDEX } from '../../../shared/constants/zIndex';
 import { cn } from '../../../shared/utils/cn';
+import { Notification } from '../types/notification';
 
 interface NotificationPanelProps {
   isOpen: boolean;

=== src/domain/notifications/components/NotificationSettingsView.test.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { DEFAULT_PREFERENCES } from '../types/notificationCategories';

vi.mock('../application/usecases/getNotificationPreferencesUseCase', () => ({
  getNotificationPreferencesUseCase: vi.fn(),
}));
vi.mock('../application/usecases/updateNotificationPreferencesUseCase', () => ({
  updateNotificationPreferencesUseCase: vi.fn(),
}));

import { getNotificationPreferencesUseCase } from '../application/usecases/getNotificationPreferencesUseCase';
import { updateNotificationPreferencesUseCase } from '../application/usecases/updateNotificationPreferencesUseCase';
import { NotificationSettingsView } from './NotificationSettingsView';

describe('NotificationSettingsView', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    vi.mocked(getNotificationPreferencesUseCase).mockResolvedValue(DEFAULT_PREFERENCES);
  });

  it('avisos importantes não têm interruptor; só os opcionais têm', async () => {
    render(<NotificationSettingsView isPartner={false} onBack={() => undefined} />);
    expect(screen.getByText('Compras e pagamentos')).toBeTruthy();
    await screen.findByRole('switch', { name: 'Pedidos de avaliação' });
    expect(screen.getAllByRole('switch')).toHaveLength(2);
    expect(
      screen.getByRole('switch', { name: 'Novidades e ofertas' }).getAttribute('aria-checked')
    ).toBe('false');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('parceiro escolhe entre aviso a cada venda e resumo do dia', async () => {
    render(<NotificationSettingsView isPartner onBack={() => undefined} />);
    const daily = await screen.findByRole('radio', { name: /Resumo no fim do dia/ });
    expect(screen.getByRole('radio', { name: /A cada venda/ })).toHaveProperty('checked', true);
    fireEvent.click(daily);
    expect(updateNotificationPreferencesUseCase).toHaveBeenCalledWith({ salesAlerts: 'daily' });
  });

  it('salva só o que mudou e desfaz se o servidor recusar', async () => {
    vi.mocked(updateNotificationPreferencesUseCase).mockRejectedValueOnce(new Error('fail'));
    render(<NotificationSettingsView isPartner={false} onBack={() => undefined} />);
    const reviews = await screen.findByRole('switch', { name: 'Pedidos de avaliação' });
    fireEvent.click(reviews);
    expect(updateNotificationPreferencesUseCase).toHaveBeenCalledWith({ reviewRequests: false });
    expect(await screen.findByText('Não conseguimos salvar. Tente de novo.')).toBeTruthy();
    await waitFor(() => expect(reviews.getAttribute('aria-checked')).toBe('true'));
  });
});

=== src/domain/notifications/components/NotificationSettingsView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  CalendarCheck,
  type LucideIcon,
  MessageSquareWarning,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { StatusText } from '../../../ui/components/StatusText';
import { Switch } from '../../../ui/components/Switch';
import { TextButton } from '../../../ui/components/TextButton';
import { cn } from '../../../shared/utils/cn';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import type { NotificationPreferences } from '../types/notificationCategories';
import { NotificationDeviceCard } from './NotificationDeviceCard';

const LIST =
  'shrink-0 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden';
const SECTION_TITLE = 'px-1 mb-2 text-xs font-bold text-ink';
// Mesmo cartão de opção da folha de decisão (docs/design/base-d17/light-6-admin-decidir.png).
const OPTION =
  'press min-h-14 px-4 py-3 rounded-2xl bg-surface border border-line flex items-center gap-3 cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:border-accent-line focus-within:ring-2 focus-within:ring-teal-400/50';
const NOTE = 'px-1 mt-2 text-[13px] text-ink/70';

type AlwaysKey = 'purchases' | 'trips' | 'account' | 'partnerClaims' | 'partnerMoney';

const ALWAYS_ICONS: Record<AlwaysKey, LucideIcon> = {
  purchases: ShoppingBag,
  trips: CalendarCheck,
  account: ShieldCheck,
  partnerClaims: MessageSquareWarning,
  partnerMoney: Wallet,
};

/** Título com ícone neutro ao lado, sem caixa nem cor (só identifica o assunto). */
function RowTitle({
  icon: Icon,
  id,
  children,
}: {
  icon: LucideIcon;
  id?: string;
  children: string;
}) {
  return (
    <p id={id} className="flex items-center gap-2 text-[15px] font-semibold text-ink">
      <Icon size={18} className="shrink-0 text-ink/70" aria-hidden="true" />
      {children}
    </p>
  );
}

function AlwaysRow({ item }: { item: AlwaysKey }) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 min-h-16">
      <div className="flex-1 min-w-0">
        <RowTitle icon={ALWAYS_ICONS[item]}>{t(`notify.always.${item}.label`)}</RowTitle>
        <p className="pl-[26px] text-[13px] text-ink/70">{t(`notify.always.${item}.hint`)}</p>
      </div>
      <span className="shrink-0 text-[13px] text-ink/60">{t('notify.always.on')}</span>
    </li>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <li className="flex items-center gap-3 pl-4 pr-2 py-3">
      <div className="flex-1 min-w-0">
        <RowTitle icon={icon} id={id}>
          {label}
        </RowTitle>
        <p id={`${id}-hint`} className="pl-[26px] text-[13px] text-ink/70">
          {hint}
        </p>
      </div>
      <Switch checked={checked} onChange={onChange} labelledBy={id} describedBy={`${id}-hint`} />
    </li>
  );
}

function SalesChoice({
  value,
  onChange,
}: {
  value: NotificationPreferences['salesAlerts'];
  onChange: (value: NotificationPreferences['salesAlerts']) => void;
}) {
  const { t } = useTranslation();
  const name = useId();
  return (
    <fieldset className="shrink-0 mt-6">
      <legend className={SECTION_TITLE}>{t('notify.sales.title')}</legend>
      <div className="space-y-2">
        {(['each', 'daily'] as const).map((option) => (
          <label key={option} className={OPTION}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="w-4 h-4 shrink-0 accent-teal-500"
            />
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-ink">
                {t(`notify.sales.${option}`)}
              </span>
              <span className="block text-[13px] text-ink/70">
                {t(`notify.sales.${option}Hint`)}
              </span>
            </span>
          </label>
        ))}
      </div>
      <p className={NOTE}>{t('notify.sales.note')}</p>
    </fieldset>
  );
}

/**
 * Configurações › Notificações (D25, revisão). Avisos que evitam perder um serviço, um prazo ou
 * dinheiro chegam sempre; a pessoa só escolhe o que é opcional (padrão Airbnb e Apple HIG).
 */
export function NotificationSettingsView({
  isPartner,
  onBack,
}: {
  isPartner: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { preferences, loading, error, saveError, reload, update } = useNotificationPreferences();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('notify.settingsTitle')}</h2>
      </div>

      <NotificationDeviceCard />

      <h3 className={SECTION_TITLE}>{t('notify.always.title')}</h3>
      <ul className={LIST}>
        <AlwaysRow item="purchases" />
        <AlwaysRow item="trips" />
        <AlwaysRow item="account" />
        {isPartner && (
          <>
            <AlwaysRow item="partnerClaims" />
            <AlwaysRow item="partnerMoney" />
          </>
        )}
      </ul>
      <p className={NOTE}>{t('notify.always.note')}</p>

      {loading ? (
        <div className="mt-6 h-40 shrink-0 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error || !preferences ? (
        <div className="mt-6 flex items-center justify-between gap-2 px-1 text-[13px] text-ink/70">
          <span role="alert">{t('notify.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('notify.retry')}
          </TextButton>
        </div>
      ) : (
        <>
          <h3 className={cn(SECTION_TITLE, 'mt-6')}>{t('notify.choices.title')}</h3>
          <ul className={LIST}>
            <ToggleRow
              icon={Star}
              label={t('notify.choices.reviewRequests')}
              hint={t('notify.choices.reviewRequestsHint')}
              checked={preferences.reviewRequests}
              onChange={(value) => void update({ reviewRequests: value })}
            />
            <ToggleRow
              icon={Sparkles}
              label={t('notify.choices.news')}
              hint={t('notify.choices.newsHint')}
              checked={preferences.news}
              onChange={(value) => void update({ news: value })}
            />
          </ul>
          <p className={NOTE}>{t('notify.choices.nightNote')}</p>

          {isPartner && (
            <SalesChoice
              value={preferences.salesAlerts}
              onChange={(value) => void update({ salesAlerts: value })}
            />
          )}

          {saveError && (
            <p role="alert" className="mt-3 px-1">
              <StatusText tone="danger">{t('notify.saveError')}</StatusText>
            </p>
          )}
        </>
      )}
    </div>
  );
}

=== src/domain/notifications/hooks/useNotificationPreferences.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { getNotificationPreferencesUseCase } from '../application/usecases/getNotificationPreferencesUseCase';
import { updateNotificationPreferencesUseCase } from '../application/usecases/updateNotificationPreferencesUseCase';
import type { NotificationPreferences } from '../types/notificationCategories';

/** Preferências da conta: carrega, salva na hora e desfaz se o servidor recusar. */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setPreferences(await getNotificationPreferencesUseCase());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      if (!preferences) return;
      const previous = preferences;
      setSaveError(false);
      setPreferences({ ...preferences, ...patch });
      try {
        await updateNotificationPreferencesUseCase(patch);
      } catch {
        setPreferences(previous);
        setSaveError(true);
      }
    },
    [preferences]
  );

  return { preferences, loading, error, saveError, reload: load, update };
}

=== src/domain/notifications/hooks/useNotificationSettings.ts — APAGUE este arquivo ===

=== src/domain/notifications/hooks/useNotifications.ts — diff ===
@@ -1,7 +1,7 @@
-import { useState, useEffect, useCallback, useRef } from 'react';
-import { subscribeToNotificationsUseCase } from '../application/usecases/subscribeToNotificationsUseCase';
-import { markNotificationAsReadUseCase } from '../application/usecases/markNotificationAsReadUseCase';
+import { useCallback, useEffect, useRef, useState } from 'react';
 import { markAllNotificationsAsReadUseCase } from '../application/usecases/markAllNotificationsAsReadUseCase';
+import { markNotificationAsReadUseCase } from '../application/usecases/markNotificationAsReadUseCase';
+import { subscribeToNotificationsUseCase } from '../application/usecases/subscribeToNotificationsUseCase';
 import { Notification } from '../types/notification';
 
 const PAGE_SIZE = 10;

=== src/domain/notifications/hooks/usePushDeviceState.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useState } from 'react';
import type { PushDeviceState } from '../types/notificationCategories';

function isAppleMobile(): boolean {
  const ua = navigator.userAgent;
  // iPadOS se apresenta como Mac; o toque denuncia o iPad.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function isInstalled(): boolean {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true;
}

function readState(): PushDeviceState {
  if (typeof window === 'undefined') return 'unsupported';
  // No iPhone e no iPad, o push só existe no app instalado na Tela de Início (iOS 16.4+).
  if (isAppleMobile() && !isInstalled()) return 'install';
  if (
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return 'unsupported';
  }
  return Notification.permission === 'granted'
    ? 'granted'
    : Notification.permission === 'denied'
      ? 'denied'
      : 'default';
}

/**
 * Estado do push neste aparelho (D25). `enable` só pode ser chamado a partir de um toque: os
 * navegadores recusam pedidos de permissão sem gesto da pessoa.
 */
export function usePushDeviceState() {
  const [state, setState] = useState<PushDeviceState>(readState);

  const enable = useCallback(async () => {
    if (state !== 'default') return;
    await Notification.requestPermission();
    setState(readState());
  }, [state]);

  return { state, enable };
}

=== src/domain/notifications/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
// Contratos e tipos públicos do domínio de Notificações

export { markAllNotificationsAsReadUseCase } from './application/usecases/markAllNotificationsAsReadUseCase';
export { markNotificationAsReadUseCase } from './application/usecases/markNotificationAsReadUseCase';
export { sendAdminNotificationUseCase } from './application/usecases/sendAdminNotificationUseCase';
// Use Cases públicos do domínio de Notificações
export { subscribeToNotificationsUseCase } from './application/usecases/subscribeToNotificationsUseCase';
// Componentes públicos do domínio de Notificações
export { NotificationBell } from './components/NotificationBell';
export { NotificationPanel } from './components/NotificationPanel';
// Público só para src/app (menu lateral › Configurações).
export { NotificationSettingsView } from './components/NotificationSettingsView';
// Hooks públicos do domínio de Notificações
export { useNotifications } from './hooks/useNotifications';
export type { Notification } from './types/notification';

=== src/domain/notifications/ports/notificationPort.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Notification, SendAdminNotificationPayload } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export interface NotificationPort {
  subscribeToNotifications(
    partnerId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void;

  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;

  sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void>;

  /** Preferências da conta logada (D25): push por categoria, silêncio noturno e resumo diário. */
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(patch: Partial<NotificationPreferences>): Promise<void>;
}

=== src/domain/notifications/types/notification.ts — diff ===
@@ -24,9 +24,3 @@ export interface SendAdminNotificationPayload {
   title: string;
   message: string;
 }
-
-export interface NotificationSettings {
-  partnerId: string;
-  reviewNotifications: boolean;
-  planExpiringNotifications: boolean;
-}

=== src/domain/notifications/types/notificationCategories.ts — ARQUIVO NOVO, conteúdo completo ===
/** Assunto de cada aviso (D25). Define o ícone na central e para onde o toque leva. */
export type NotificationCategory =
  | 'purchases'
  | 'tickets'
  | 'bookings'
  | 'reviews'
  | 'account'
  | 'news'
  | 'sales'
  | 'operations'
  | 'finance'
  | 'partnerReviews'
  | 'registration'
  | 'messages';

/**
 * O que a pessoa escolhe (D25, revisão). Compras, ingressos, reservas, conta e, para o parceiro,
 * vendas, cancelamentos, reclamações e repasses chegam sempre: sem eles a pessoa perde um serviço
 * ou um prazo. Avisos opcionais nunca chegam das 21h às 9h (Fortaleza).
 */
export interface NotificationPreferences {
  /** Pedido de avaliação depois de um passeio, evento ou estadia. */
  reviewRequests: boolean;
  /** Novidades e ofertas. Nascem desligadas (LGPD e Apple HIG: marketing só com aceite). */
  news: boolean;
  /** Parceiro: um aviso a cada venda ou um resumo no fim do dia. */
  salesAlerts: 'each' | 'daily';
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  reviewRequests: true,
  news: false,
  salesAlerts: 'each',
};

/** Estado das notificações neste aparelho. `install`: iPhone/iPad fora da Tela de Início. */
export type PushDeviceState = 'unsupported' | 'install' | 'default' | 'granted' | 'denied';

/** Linha da central de notificações, já no idioma de quem lê. */
export interface NotificationCenterItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
}

=== src/domain/user/components/SettingsView.tsx — diff ===
@@ -26,7 +26,7 @@ interface SettingsViewProps {
   onOpenPurchases?: () => void;
   /** Só com login: o @ que outras pessoas usam para transferir ingressos (D21). */
   onOpenUsername?: () => void;
-  /** Só para parceiros: avisos do painel (avaliações, vencimento do plano). */
+  /** Só com login: avisos da conta e do parceiro (D25). */
   onOpenNotifications?: () => void;
 }
 
@@ -94,7 +94,7 @@ export function SettingsView({
         {onOpenNotifications && (
           <SettingsRow
             icon={Bell}
-            label={t('appAbout.notifications.title')}
+            label={t('notify.settingsTitle')}
             onClick={onOpenNotifications}
           />
         )}

=== src/shared/i18n/appAboutResources.ts — diff ===
@@ -15,16 +15,6 @@ export interface AppAboutTranslation {
   project: string;
   loadError: string;
   retry: string;
-  notifications: {
-    title: string;
-    intro: string;
-    reviews: string;
-    reviewsHint: string;
-    plan: string;
-    planHint: string;
-    loadError: string;
-    saveError: string;
-  };
 }
 
 export const appAboutPtBR: AppAboutTranslation = {
@@ -45,16 +35,6 @@ export const appAboutPtBR: AppAboutTranslation = {
   project: 'Página do projeto',
   loadError: 'Não foi possível carregar as licenças.',
   retry: 'Tentar de novo',
-  notifications: {
-    title: 'Notificações',
-    intro: 'Escolha os avisos que aparecem no seu painel de parceiro.',
-    reviews: 'Avaliações recebidas',
-    reviewsHint: 'Quando alguém avaliar um item ou evento seu.',
-    plan: 'Vencimento do plano',
-    planHint: 'Quando o plano de um estabelecimento estiver perto de vencer.',
-    loadError: 'Não foi possível carregar suas notificações.',
-    saveError: 'Não foi possível salvar. Tente de novo.',
-  },
 };
 
 export const appAboutEn: AppAboutTranslation = {
@@ -75,16 +55,6 @@ export const appAboutEn: AppAboutTranslation = {
   project: 'Project page',
   loadError: 'We couldn’t load the licenses.',
   retry: 'Try again',
-  notifications: {
-    title: 'Notifications',
-    intro: 'Choose the alerts that show up in your partner panel.',
-    reviews: 'Reviews received',
-    reviewsHint: 'When someone reviews one of your items or events.',
-    plan: 'Plan expiring',
-    planHint: 'When a business plan is about to expire.',
-    loadError: 'We couldn’t load your notifications.',
-    saveError: 'We couldn’t save. Try again.',
-  },
 };
 
 export const appAboutFr: AppAboutTranslation = {
@@ -105,14 +75,4 @@ export const appAboutFr: AppAboutTranslation = {
   project: 'Page du projet',
   loadError: 'Impossible de charger les licences.',
   retry: 'Réessayer',
-  notifications: {
-    title: 'Notifications',
-    intro: 'Choisissez les alertes affichées dans votre espace partenaire.',
-    reviews: 'Avis reçus',
-    reviewsHint: 'Quand quelqu’un évalue l’un de vos éléments ou événements.',
-    plan: 'Expiration de l’abonnement',
-    planHint: 'Quand l’abonnement d’un établissement arrive bientôt à échéance.',
-    loadError: 'Impossible de charger vos notifications.',
-    saveError: 'Impossible d’enregistrer. Réessayez.',
-  },
 };

=== src/shared/i18n/helpResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da central de ajuda (Suporte, D25). pt-BR é a fonte; respostas tiradas das regras reais. */
export type HelpTopic =
  | 'purchases'
  | 'tickets'
  | 'bookings'
  | 'refunds'
  | 'account'
  | 'partners'
  | 'app';

export interface HelpTranslation {
  title: string;
  search: string;
  searchLabel: string;
  shortcutsTitle: string;
  shortcuts: { purchases: string; tickets: string; bookings: string };
  greeting: string;
  topicsTitle: string;
  topTitle: string;
  resultsTitle: string;
  topics: Record<HelpTopic, string>;
  noResults: string;
  faq: Array<{ id: string; topic: HelpTopic; q: string; a: string }>;
  contactTitle: string;
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  copy: string;
  copied: string;
  reportProblem: string;
  reportHint: string;
  reportSubject: string;
}

export const helpPtBR: HelpTranslation = {
  title: 'Suporte',
  search: 'Buscar ajuda',
  searchLabel: 'Buscar nas perguntas',
  shortcutsTitle: 'Ajuda com uma compra',
  shortcuts: {
    purchases: 'Minhas compras',
    tickets: 'Meus ingressos',
    bookings: 'Minhas reservas',
  },
  greeting: 'Oi! Como podemos ajudar?',
  topicsTitle: 'Assuntos',
  topTitle: 'Perguntas mais lidas',
  resultsTitle: 'Resultados',
  topics: {
    purchases: 'Compras e pagamentos',
    tickets: 'Ingressos e QR Code',
    bookings: 'Passeios, aluguéis e translados',
    refunds: 'Cancelamentos e reembolsos',
    account: 'Sua conta',
    partners: 'Para parceiros',
    app: 'Uso do app',
  },
  noResults: 'Não achamos nada com essas palavras. Fale com a gente aqui embaixo.',
  faq: [
    {
      id: 'payment-methods',
      topic: 'purchases',
      q: 'Quais formas de pagamento posso usar?',
      a: 'Cartão de crédito e Pix. O Pix aparece quando o serviço acontece em até 80 dias depois da compra; para datas mais distantes, só cartão.',
    },
    {
      id: 'pix-pending',
      topic: 'purchases',
      q: 'Paguei com Pix e a compra ainda não aparece. E agora?',
      a: 'A confirmação do Pix chega em poucos minutos e você recebe um aviso. Se o código do Pix vencer antes do pagamento, a reserva é liberada e é preciso fazer uma nova compra.',
    },
    {
      id: 'service-fee',
      topic: 'purchases',
      q: 'O que é a taxa de serviço?',
      a: 'Alguns ingressos têm uma taxa de serviço por ingresso. Quando há, ela aparece destacada antes do pagamento, junto do preço total.',
    },
    {
      id: 'find-tickets',
      topic: 'tickets',
      q: 'Onde vejo meus ingressos?',
      a: 'No menu, em Ingressos. O código do ingresso aparece a partir das 0h do dia do evento, junto do QR Code.',
    },
    {
      id: 'transfer',
      topic: 'tickets',
      q: 'Posso passar o ingresso para outra pessoa?',
      a: 'Sim. Use o @ de outra conta ou, se a pessoa ainda não tem conta, gere um link que vale 30 minutos e uma vez só. Quem recebe um ingresso só pode devolvê-lo para quem comprou.',
    },
    {
      id: 'qr-problem',
      topic: 'tickets',
      q: 'Meu QR Code não funciona ou foi compartilhado. O que faço?',
      a: 'No ingresso, toque em "Problema com o QR Code?". Você troca o QR e o código uma vez, até a entrada, e os antigos deixam de valer.',
    },
    {
      id: 'checkin-code',
      topic: 'bookings',
      q: 'Como funciona a chegada no passeio ou no aluguel?',
      a: 'Mostre ao prestador o código da sua reserva. Ele aparece a partir das 0h do dia do serviço. Se a reserva é por pessoa, cada uma tem o seu código; se é por grupo, o código é um só.',
    },
    {
      id: 'provider-absent',
      topic: 'bookings',
      q: 'O prestador não apareceu. O que faço?',
      a: 'Na reserva, toque em "O prestador não veio". Ele tem 2 horas para responder. Se admitir ou não responder, você recebe o reembolso integral.',
    },
    {
      id: 'cancel-window',
      topic: 'refunds',
      q: 'Posso cancelar uma compra?',
      a: 'Até 7 dias depois da compra e até 48 horas antes do início, o reembolso é integral, inclusive a taxa de serviço. Depois disso, vale a política de cancelamento mostrada antes do pagamento. Quem não comparece não tem reembolso.',
    },
    {
      id: 'organizer-cancels',
      topic: 'refunds',
      q: 'E se o organizador ou o prestador cancelar?',
      a: 'Você recebe o reembolso integral, inclusive a taxa de serviço. Em caso de força maior, primeiro é oferecida uma nova data; se ela não servir, o reembolso é integral.',
    },
    {
      id: 'refund-time',
      topic: 'refunds',
      q: 'Quanto tempo o reembolso demora?',
      a: 'Devolvemos o valor na hora. O tempo para aparecer na sua conta ou na fatura depende do seu banco ou do cartão.',
    },
    {
      id: 'forgot-password',
      topic: 'account',
      q: 'Esqueci minha senha.',
      a: 'Na tela de entrar, toque em "Esqueceu a senha?". Enviamos um link para o seu e-mail.',
    },
    {
      id: 'verify-email',
      topic: 'account',
      q: 'Por que preciso confirmar meu e-mail?',
      a: 'Para comprar, reservar, receber ingressos e cadastrar seu negócio. Contas que entram com o Google já vêm confirmadas.',
    },
    {
      id: 'delete-account',
      topic: 'account',
      q: 'Como excluo minha conta?',
      a: 'No menu, abra a sua conta e toque em "Excluir conta". Por lei, os registros das compras ficam guardados, mas sem os seus dados pessoais.',
    },
    {
      id: 'sell',
      topic: 'partners',
      q: 'Como vendo pelo Use Guide?',
      a: 'Toque em "Seja parceiro", cadastre seu negócio e informe a conta que vai receber os pagamentos, no CNPJ do negócio.',
    },
    {
      id: 'payout',
      topic: 'partners',
      q: 'Quando recebo o valor das vendas?',
      a: 'O valor cai na sua conta 48 horas depois que o serviço termina, se o cliente não tiver aberto uma reclamação. Acompanhe em Recebimentos, no painel do parceiro.',
    },
    {
      id: 'notifications',
      topic: 'app',
      q: 'Como ativo as notificações?',
      a: 'Em Configurações › Notificações, toque em "Ativar". No iPhone, primeiro coloque o Use Guide na tela inicial (Compartilhar › Adicionar à Tela de Início) e abra o app por lá.',
    },
    {
      id: 'wind',
      topic: 'app',
      q: 'De onde vem a previsão de vento e clima?',
      a: 'De institutos públicos de meteorologia. É uma previsão: confira as condições no local antes de sair.',
    },
  ],
  contactTitle: 'Fale com a gente',
  whatsapp: 'Conversar no WhatsApp',
  whatsappMessage: 'Olá! Preciso de ajuda com o Use Guide.',
  email: 'Enviar e-mail',
  copy: 'Copiar e-mail',
  copied: 'E-mail copiado',
  reportProblem: 'Algo não funciona no app?',
  reportHint: 'Conte pra gente o que aconteceu',
  reportSubject: 'Problema no app (versão {{version}})',
};

export const helpEn: HelpTranslation = {
  title: 'Support',
  search: 'Search help',
  searchLabel: 'Search the questions',
  shortcutsTitle: 'Help with a purchase',
  shortcuts: {
    purchases: 'My purchases',
    tickets: 'My tickets',
    bookings: 'My bookings',
  },
  greeting: 'Hi! How can we help?',
  topicsTitle: 'Topics',
  topTitle: 'Most read questions',
  resultsTitle: 'Results',
  topics: {
    purchases: 'Purchases and payments',
    tickets: 'Tickets and QR code',
    bookings: 'Tours, rentals and transfers',
    refunds: 'Cancellations and refunds',
    account: 'Your account',
    partners: 'For partners',
    app: 'Using the app',
  },
  noResults: 'Nothing matches those words. Get in touch with us below.',
  faq: [
    {
      id: 'payment-methods',
      topic: 'purchases',
      q: 'Which payment methods can I use?',
      a: 'Credit card and Pix. Pix shows up when the service takes place within 80 days of the purchase; for later dates, card only.',
    },
    {
      id: 'pix-pending',
      topic: 'purchases',
      q: 'I paid with Pix and the purchase isn’t showing yet. What now?',
      a: 'Pix confirmation arrives within a few minutes and you get an alert. If the Pix code expires before payment, the reservation is released and you need to buy again.',
    },
    {
      id: 'service-fee',
      topic: 'purchases',
      q: 'What is the service fee?',
      a: 'Some tickets have a service fee per ticket. When there is one, it is shown before payment, together with the total price.',
    },
    {
      id: 'find-tickets',
      topic: 'tickets',
      q: 'Where can I see my tickets?',
      a: 'In the menu, under Tickets. The ticket code shows up from midnight on the day of the event, next to the QR code.',
    },
    {
      id: 'transfer',
      topic: 'tickets',
      q: 'Can I give my ticket to someone else?',
      a: 'Yes. Use another account’s @ or, if the person doesn’t have an account yet, create a link that is valid for 30 minutes and can be used once. Whoever receives a ticket can only return it to the buyer.',
    },
    {
      id: 'qr-problem',
      topic: 'tickets',
      q: 'My QR code doesn’t work or was shared. What should I do?',
      a: 'On the ticket, tap "Problem with the QR code?". You can replace the QR and the code once, until entry, and the old ones stop working.',
    },
    {
      id: 'checkin-code',
      topic: 'bookings',
      q: 'How do I check in for a tour or rental?',
      a: 'Show the provider your booking code. It appears from midnight on the day of the service. If the booking is per person, each person has a code; if it’s for a group, there’s one code.',
    },
    {
      id: 'provider-absent',
      topic: 'bookings',
      q: 'The provider didn’t show up. What should I do?',
      a: 'On the booking, tap "The provider didn’t come". They have 2 hours to reply. If they admit it or don’t reply, you get a full refund.',
    },
    {
      id: 'cancel-window',
      topic: 'refunds',
      q: 'Can I cancel a purchase?',
      a: 'Up to 7 days after the purchase and up to 48 hours before the start, you get a full refund, including the service fee. After that, the cancellation policy shown before payment applies. No-shows are not refunded.',
    },
    {
      id: 'organizer-cancels',
      topic: 'refunds',
      q: 'What if the organizer or provider cancels?',
      a: 'You get a full refund, including the service fee. In case of force majeure, a new date is offered first; if it doesn’t work for you, the refund is full.',
    },
    {
      id: 'refund-time',
      topic: 'refunds',
      q: 'How long does a refund take?',
      a: 'We send the money back right away. How long it takes to show up in your account or card statement depends on your bank or card.',
    },
    {
      id: 'forgot-password',
      topic: 'account',
      q: 'I forgot my password.',
      a: 'On the sign-in screen, tap "Forgot password". We send a link to your email.',
    },
    {
      id: 'verify-email',
      topic: 'account',
      q: 'Why do I need to confirm my email?',
      a: 'To buy, book, receive tickets and register your business. Accounts that sign in with Google are already confirmed.',
    },
    {
      id: 'delete-account',
      topic: 'account',
      q: 'How do I delete my account?',
      a: 'In the menu, open your account and tap "Delete account". By law, purchase records are kept, but without your personal details.',
    },
    {
      id: 'sell',
      topic: 'partners',
      q: 'How do I sell on Use Guide?',
      a: 'Tap "Become a partner", register your business and add the account that will receive payments, under the business’s CNPJ.',
    },
    {
      id: 'payout',
      topic: 'partners',
      q: 'When do I get paid for sales?',
      a: 'The money reaches your account 48 hours after the service ends, as long as the customer hasn’t opened a complaint. Follow it in Payouts, in the partner panel.',
    },
    {
      id: 'notifications',
      topic: 'app',
      q: 'How do I turn on notifications?',
      a: 'In Settings › Notifications, tap "Turn on". On iPhone, first add Use Guide to your Home Screen (Share › Add to Home Screen) and open the app from there.',
    },
    {
      id: 'wind',
      topic: 'app',
      q: 'Where does the wind and weather forecast come from?',
      a: 'From public weather institutes. It’s a forecast: check the conditions on site before heading out.',
    },
  ],
  contactTitle: 'Talk to us',
  whatsapp: 'Chat on WhatsApp',
  whatsappMessage: 'Hi! I need help with Use Guide.',
  email: 'Send an email',
  copy: 'Copy email',
  copied: 'Email copied',
  reportProblem: 'Something not working?',
  reportHint: 'Tell us what happened',
  reportSubject: 'Problem with the app (version {{version}})',
};

export const helpFr: HelpTranslation = {
  title: 'Assistance',
  search: 'Rechercher de l’aide',
  searchLabel: 'Rechercher dans les questions',
  shortcutsTitle: 'Aide pour un achat',
  shortcuts: {
    purchases: 'Mes achats',
    tickets: 'Mes billets',
    bookings: 'Mes réservations',
  },
  greeting: 'Bonjour ! Comment pouvons-nous vous aider ?',
  topicsTitle: 'Sujets',
  topTitle: 'Questions les plus lues',
  resultsTitle: 'Résultats',
  topics: {
    purchases: 'Achats et paiements',
    tickets: 'Billets et QR code',
    bookings: 'Excursions, locations et transferts',
    refunds: 'Annulations et remboursements',
    account: 'Votre compte',
    partners: 'Pour les partenaires',
    app: 'Utiliser l’app',
  },
  noResults: 'Rien ne correspond à ces mots. Contactez-nous ci-dessous.',
  faq: [
    {
      id: 'payment-methods',
      topic: 'purchases',
      q: 'Quels moyens de paiement puis-je utiliser ?',
      a: 'Carte de crédit et Pix. Le Pix apparaît quand la prestation a lieu dans les 80 jours suivant l’achat ; pour des dates plus lointaines, carte uniquement.',
    },
    {
      id: 'pix-pending',
      topic: 'purchases',
      q: 'J’ai payé par Pix et l’achat n’apparaît pas encore. Que faire ?',
      a: 'La confirmation du Pix arrive en quelques minutes et vous recevez une alerte. Si le code Pix expire avant le paiement, la réservation est libérée et il faut refaire l’achat.',
    },
    {
      id: 'service-fee',
      topic: 'purchases',
      q: 'Qu’est-ce que les frais de service ?',
      a: 'Certains billets ont des frais de service par billet. Le cas échéant, ils sont indiqués avant le paiement, avec le prix total.',
    },
    {
      id: 'find-tickets',
      topic: 'tickets',
      q: 'Où voir mes billets ?',
      a: 'Dans le menu, rubrique Billets. Le code du billet apparaît à partir de minuit le jour de l’événement, à côté du QR code.',
    },
    {
      id: 'transfer',
      topic: 'tickets',
      q: 'Puis-je donner mon billet à quelqu’un d’autre ?',
      a: 'Oui. Utilisez le @ d’un autre compte ou, si la personne n’a pas encore de compte, créez un lien valable 30 minutes et une seule fois. La personne qui reçoit un billet ne peut le rendre qu’à l’acheteur.',
    },
    {
      id: 'qr-problem',
      topic: 'tickets',
      q: 'Mon QR code ne fonctionne pas ou a été partagé. Que faire ?',
      a: 'Sur le billet, touchez « Problème avec le QR code ? ». Vous remplacez le QR et le code une fois, jusqu’à l’entrée, et les anciens ne sont plus valables.',
    },
    {
      id: 'checkin-code',
      topic: 'bookings',
      q: 'Comment se passe l’arrivée pour une excursion ou une location ?',
      a: 'Montrez au prestataire le code de votre réservation. Il apparaît à partir de minuit le jour de la prestation. Si la réservation est par personne, chacune a son code ; si elle est de groupe, il n’y a qu’un code.',
    },
    {
      id: 'provider-absent',
      topic: 'bookings',
      q: 'Le prestataire ne s’est pas présenté. Que faire ?',
      a: 'Sur la réservation, touchez « Le prestataire n’est pas venu ». Il a 2 heures pour répondre. S’il le reconnaît ou ne répond pas, vous êtes remboursé intégralement.',
    },
    {
      id: 'cancel-window',
      topic: 'refunds',
      q: 'Puis-je annuler un achat ?',
      a: 'Jusqu’à 7 jours après l’achat et jusqu’à 48 heures avant le début, le remboursement est intégral, frais de service compris. Ensuite, c’est la politique d’annulation affichée avant le paiement qui s’applique. Les absences ne sont pas remboursées.',
    },
    {
      id: 'organizer-cancels',
      topic: 'refunds',
      q: 'Et si l’organisateur ou le prestataire annule ?',
      a: 'Vous êtes remboursé intégralement, frais de service compris. En cas de force majeure, une nouvelle date est d’abord proposée ; si elle ne vous convient pas, le remboursement est intégral.',
    },
    {
      id: 'refund-time',
      topic: 'refunds',
      q: 'Combien de temps prend un remboursement ?',
      a: 'Nous renvoyons l’argent tout de suite. Le délai pour le voir sur votre compte ou votre relevé dépend de votre banque ou de votre carte.',
    },
    {
      id: 'forgot-password',
      topic: 'account',
      q: 'J’ai oublié mon mot de passe.',
      a: 'Sur l’écran de connexion, touchez « Mot de passe oublié ». Nous envoyons un lien à votre e-mail.',
    },
    {
      id: 'verify-email',
      topic: 'account',
      q: 'Pourquoi dois-je confirmer mon e-mail ?',
      a: 'Pour acheter, réserver, recevoir des billets et inscrire votre établissement. Les comptes connectés avec Google sont déjà confirmés.',
    },
    {
      id: 'delete-account',
      topic: 'account',
      q: 'Comment supprimer mon compte ?',
      a: 'Dans le menu, ouvrez votre compte et touchez « Supprimer le compte ». La loi impose de garder les achats, mais sans vos données personnelles.',
    },
    {
      id: 'sell',
      topic: 'partners',
      q: 'Comment vendre sur Use Guide ?',
      a: 'Touchez « Devenir partenaire », inscrivez votre établissement et indiquez le compte qui recevra les paiements, au CNPJ de l’établissement.',
    },
    {
      id: 'payout',
      topic: 'partners',
      q: 'Quand suis-je payé pour mes ventes ?',
      a: 'L’argent arrive sur votre compte 48 heures après la fin de la prestation, si le client n’a pas ouvert de réclamation. Suivez-le dans Versements, dans l’espace partenaire.',
    },
    {
      id: 'notifications',
      topic: 'app',
      q: 'Comment activer les notifications ?',
      a: 'Dans Réglages › Notifications, touchez « Activer ». Sur iPhone, ajoutez d’abord Use Guide à l’écran d’accueil (Partager › Sur l’écran d’accueil) et ouvrez l’app depuis là.',
    },
    {
      id: 'wind',
      topic: 'app',
      q: 'D’où viennent les prévisions de vent et de météo ?',
      a: 'D’instituts publics de météorologie. C’est une prévision : vérifiez les conditions sur place avant de partir.',
    },
  ],
  contactTitle: 'Nous contacter',
  whatsapp: 'Discuter sur WhatsApp',
  whatsappMessage: 'Bonjour ! J’ai besoin d’aide avec Use Guide.',
  email: 'Envoyer un e-mail',
  copy: 'Copier l’e-mail',
  copied: 'E-mail copié',
  reportProblem: 'Quelque chose ne marche pas ?',
  reportHint: 'Racontez-nous ce qui s’est passé',
  reportSubject: 'Problème dans l’app (version {{version}})',
};

=== src/shared/i18n/notifyResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos das notificações (central e Configurações › Notificações, D25). pt-BR é a fonte. */
export interface NotifyTranslation {
  settingsTitle: string;
  device: {
    defaultTitle: string;
    default: string;
    enable: string;
    granted: string;
    grantedHint: string;
    denied: string;
    install: string;
    unsupported: string;
  };
  always: {
    title: string;
    on: string;
    purchases: { label: string; hint: string };
    trips: { label: string; hint: string };
    account: { label: string; hint: string };
    partnerClaims: { label: string; hint: string };
    partnerMoney: { label: string; hint: string };
    note: string;
  };
  choices: {
    title: string;
    reviewRequests: string;
    reviewRequestsHint: string;
    news: string;
    newsHint: string;
    nightNote: string;
  };
  sales: {
    title: string;
    each: string;
    eachHint: string;
    daily: string;
    dailyHint: string;
    note: string;
  };
  loadError: string;
  saveError: string;
  retry: string;
  center: {
    title: string;
    open: string;
    openUnread_one: string;
    openUnread_other: string;
    markAll: string;
    more: string;
    filterUnread: string;
    filterAll: string;
    upToDate: string;
    upToDateHint: string;
    settings: string;
    today: string;
    earlier: string;
    empty: string;
    emptyHint: string;
    unread: string;
    loadError: string;
  };
}

export const notifyPtBR: NotifyTranslation = {
  settingsTitle: 'Notificações',
  device: {
    defaultTitle: 'Ative as notificações',
    default:
      'Saiba na hora quando a compra for confirmada, o passeio mudar de horário ou o guia chegar.',
    enable: 'Ativar',
    granted: 'Notificações ativadas',
    grantedHint: 'Para desligar, use os ajustes do celular ou do navegador.',
    denied:
      'As notificações do Use Guide estão desligadas aqui. Para receber, permita nos ajustes do navegador.',
    install:
      'No iPhone, as notificações só chegam com o Use Guide na tela inicial. Toque em Compartilhar, depois em “Adicionar à Tela de Início”, e abra o app por lá.',
    unsupported:
      'Este navegador não mostra notificações. Você continua vendo tudo no sininho, no alto da tela.',
  },
  always: {
    title: 'Sempre avisamos você',
    on: 'Sempre',
    purchases: {
      label: 'Compras e pagamentos',
      hint: 'Pagamento confirmado, Pix pendente e reembolsos',
    },
    trips: { label: 'Ingressos e reservas', hint: 'Confirmação, lembretes e mudanças de horário' },
    account: { label: 'Sua conta', hint: 'Acesso novo e troca de e-mail ou senha' },
    partnerClaims: {
      label: 'Cancelamentos e reclamações',
      hint: 'Também as avaliações dos seus clientes',
    },
    partnerMoney: {
      label: 'Repasses e cadastro',
      hint: 'Pagamento das vendas e verificação do seu negócio',
    },
    note: 'São avisos importantes, por isso não dá para desligar.',
  },
  choices: {
    title: 'Você decide',
    reviewRequests: 'Pedidos de avaliação',
    reviewRequestsHint: 'Depois de um passeio, evento ou estadia, pedimos sua opinião.',
    news: 'Novidades e ofertas',
    newsHint: 'Eventos novos e dicas para aproveitar a viagem.',
    nightNote: 'Esses avisos nunca chegam entre 21h e 9h.',
  },
  sales: {
    title: 'Avisos de venda',
    each: 'A cada venda',
    eachHint: 'Um aviso para cada venda ou reserva.',
    daily: 'Resumo no fim do dia',
    dailyHint: 'Um único aviso com as vendas do dia.',
    note: 'Cancelamentos e reclamações chegam na hora, sempre.',
  },
  loadError: 'Não conseguimos carregar suas escolhas.',
  saveError: 'Não conseguimos salvar. Tente de novo.',
  retry: 'Tentar de novo',
  center: {
    title: 'Notificações',
    open: 'Abrir notificações',
    openUnread_one: 'Abrir notificações, {{count}} não lida',
    openUnread_other: 'Abrir notificações, {{count}} não lidas',
    markAll: 'Marcar todas como lidas',
    more: 'Mais opções',
    filterUnread: 'Não lidas',
    filterAll: 'Tudo',
    upToDate: 'Você está em dia',
    upToDateHint: 'Quando chegar algo novo, aparece aqui.',
    settings: 'Configurações',
    today: 'Hoje',
    earlier: 'Anteriores',
    empty: 'Nenhuma notificação',
    emptyHint: 'Quando sua compra for confirmada ou algo mudar, você fica sabendo aqui.',
    unread: 'Não lida',
    loadError: 'Não conseguimos carregar as notificações.',
  },
};

export const notifyEn: NotifyTranslation = {
  settingsTitle: 'Notifications',
  device: {
    defaultTitle: 'Turn on notifications',
    default:
      'Know right away when your purchase is confirmed, a tour changes time or your guide arrives.',
    enable: 'Turn on',
    granted: 'Notifications are on',
    grantedHint: 'To turn them off, use your phone or browser settings.',
    denied:
      'Use Guide notifications are off here. To get them, allow them in your browser settings.',
    install:
      'On iPhone, notifications only work with Use Guide on your Home Screen. Tap Share, then “Add to Home Screen”, and open the app from there.',
    unsupported:
      'This browser doesn’t show notifications. You can still see everything under the bell at the top of the screen.',
  },
  always: {
    title: 'We always let you know about',
    on: 'Always',
    purchases: {
      label: 'Purchases and payments',
      hint: 'Payment confirmed, pending Pix and refunds',
    },
    trips: { label: 'Tickets and bookings', hint: 'Confirmation, reminders and time changes' },
    account: { label: 'Your account', hint: 'New sign-ins and email or password changes' },
    partnerClaims: { label: 'Cancellations and complaints', hint: 'Plus your customers’ reviews' },
    partnerMoney: {
      label: 'Payouts and registration',
      hint: 'Payment for your sales and your business’s verification',
    },
    note: 'These are important, so they can’t be turned off.',
  },
  choices: {
    title: 'Your choice',
    reviewRequests: 'Review requests',
    reviewRequestsHint: 'After a tour, event or stay, we ask what you thought.',
    news: 'News and offers',
    newsHint: 'New events and tips to make the most of your trip.',
    nightNote: 'These never arrive between 9 pm and 9 am.',
  },
  sales: {
    title: 'Sale alerts',
    each: 'For every sale',
    eachHint: 'One alert for each sale or booking.',
    daily: 'End-of-day summary',
    dailyHint: 'A single alert with the day’s sales.',
    note: 'Cancellations and complaints always arrive right away.',
  },
  loadError: 'We couldn’t load your choices.',
  saveError: 'We couldn’t save. Please try again.',
  retry: 'Try again',
  center: {
    title: 'Notifications',
    open: 'Open notifications',
    openUnread_one: 'Open notifications, {{count}} unread',
    openUnread_other: 'Open notifications, {{count}} unread',
    markAll: 'Mark all as read',
    more: 'More options',
    filterUnread: 'Unread',
    filterAll: 'All',
    upToDate: 'You’re all caught up',
    upToDateHint: 'New updates will show up here.',
    settings: 'Settings',
    today: 'Today',
    earlier: 'Earlier',
    empty: 'No notifications',
    emptyHint: 'When your purchase is confirmed or something changes, you’ll see it here.',
    unread: 'Unread',
    loadError: 'We couldn’t load your notifications.',
  },
};

export const notifyFr: NotifyTranslation = {
  settingsTitle: 'Notifications',
  device: {
    defaultTitle: 'Activez les notifications',
    default:
      'Sachez tout de suite quand votre achat est confirmé, qu’une excursion change d’horaire ou que votre guide arrive.',
    enable: 'Activer',
    granted: 'Notifications activées',
    grantedHint: 'Pour les désactiver, passez par les réglages du téléphone ou du navigateur.',
    denied:
      'Les notifications de Use Guide sont désactivées ici. Pour les recevoir, autorisez-les dans les réglages du navigateur.',
    install:
      'Sur iPhone, les notifications ne fonctionnent qu’avec Use Guide sur l’écran d’accueil. Touchez Partager, puis « Sur l’écran d’accueil », et ouvrez l’app depuis là.',
    unsupported:
      'Ce navigateur n’affiche pas les notifications. Vous voyez toujours tout sous la cloche, en haut de l’écran.',
  },
  always: {
    title: 'Nous vous prévenons toujours pour',
    on: 'Toujours',
    purchases: {
      label: 'Achats et paiements',
      hint: 'Paiement confirmé, Pix en attente et remboursements',
    },
    trips: {
      label: 'Billets et réservations',
      hint: 'Confirmation, rappels et changements d’horaire',
    },
    account: {
      label: 'Votre compte',
      hint: 'Nouvelles connexions et changement d’e-mail ou de mot de passe',
    },
    partnerClaims: {
      label: 'Annulations et réclamations',
      hint: 'Ainsi que les avis de vos clients',
    },
    partnerMoney: {
      label: 'Versements et inscription',
      hint: 'Paiement de vos ventes et vérification de votre établissement',
    },
    note: 'Ce sont des messages importants, ils ne peuvent donc pas être désactivés.',
  },
  choices: {
    title: 'À vous de choisir',
    reviewRequests: 'Demandes d’avis',
    reviewRequestsHint:
      'Après une excursion, un événement ou un séjour, nous demandons votre avis.',
    news: 'Nouveautés et offres',
    newsHint: 'Nouveaux événements et conseils pour profiter du voyage.',
    nightNote: 'Ces messages n’arrivent jamais entre 21 h et 9 h.',
  },
  sales: {
    title: 'Alertes de vente',
    each: 'À chaque vente',
    eachHint: 'Une alerte pour chaque vente ou réservation.',
    daily: 'Résumé en fin de journée',
    dailyHint: 'Une seule alerte avec les ventes du jour.',
    note: 'Les annulations et réclamations arrivent toujours tout de suite.',
  },
  loadError: 'Impossible de charger vos choix.',
  saveError: 'Impossible d’enregistrer. Réessayez.',
  retry: 'Réessayer',
  center: {
    title: 'Notifications',
    open: 'Ouvrir les notifications',
    openUnread_one: 'Ouvrir les notifications, {{count}} non lue',
    openUnread_other: 'Ouvrir les notifications, {{count}} non lues',
    markAll: 'Tout marquer comme lu',
    more: 'Plus d’options',
    filterUnread: 'Non lues',
    filterAll: 'Tout',
    upToDate: 'Vous êtes à jour',
    upToDateHint: 'Les nouveautés apparaîtront ici.',
    settings: 'Réglages',
    today: 'Aujourd’hui',
    earlier: 'Plus tôt',
    empty: 'Aucune notification',
    emptyHint: 'Quand votre achat est confirmé ou que quelque chose change, vous le verrez ici.',
    unread: 'Non lue',
    loadError: 'Impossible de charger les notifications.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -16,6 +16,8 @@ import {
   appAboutFr,
   appAboutPtBR,
 } from './appAboutResources';
+import { type NotifyTranslation, notifyEn, notifyFr, notifyPtBR } from './notifyResources';
+import { type HelpTranslation, helpEn, helpFr, helpPtBR } from './helpResources';
 import {
   type BookingsTranslation,
   bookingsEn,
@@ -170,6 +172,8 @@ export interface TranslationResource {
   ticketGate: TicketGateTranslation;
   username: UsernameTranslation;
   appAbout: AppAboutTranslation;
+  notify: NotifyTranslation;
+  help: HelpTranslation;
   eventSessions: EventSessionsTranslation;
   gateMode: GateModeTranslation;
   legal: LegalTranslation;
@@ -408,6 +412,8 @@ const ptBR: TranslationResource = {
   ticketGate: ticketGatePtBR,
   username: usernamePtBR,
   appAbout: appAboutPtBR,
+  notify: notifyPtBR,
+  help: helpPtBR,
   eventSessions: eventSessionsPtBR,
   gateMode: gateModePtBR,
   legal: legalPtBR,
@@ -706,6 +712,8 @@ const en: TranslationResource = {
   ticketGate: ticketGateEn,
   username: usernameEn,
   appAbout: appAboutEn,
+  notify: notifyEn,
+  help: helpEn,
   eventSessions: eventSessionsEn,
   gateMode: gateModeEn,
   legal: legalEn,
@@ -998,6 +1006,8 @@ const fr: TranslationResource = {
   ticketGate: ticketGateFr,
   username: usernameFr,
   appAbout: appAboutFr,
+  notify: notifyFr,
+  help: helpFr,
   eventSessions: eventSessionsFr,
   gateMode: gateModeFr,
   legal: legalFr,

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/menu/SideMenu.tsx src/domain/content/components/SupportView.test.tsx src/domain/content/components/SupportView.tsx src/domain/content/components/about/AboutLicensesView.tsx src/domain/content/components/support/FaqItem.tsx src/domain/content/components/support/SupportRow.tsx src/domain/content/types/content.ts src/domain/notifications/adapters/firestoreNotificationAdapter.ts src/domain/notifications/application/usecases/getNotificationPreferencesUseCase.ts src/domain/notifications/application/usecases/updateNotificationPreferencesUseCase.ts src/domain/notifications/components/NotificationBellButton.tsx src/domain/notifications/components/NotificationCenterSheet.test.tsx src/domain/notifications/components/NotificationCenterSheet.tsx src/domain/notifications/components/NotificationDeviceCard.tsx src/domain/notifications/components/NotificationPanel.tsx src/domain/notifications/components/NotificationSettingsView.test.tsx src/domain/notifications/components/NotificationSettingsView.tsx src/domain/notifications/hooks/useNotificationPreferences.ts src/domain/notifications/hooks/useNotifications.ts src/domain/notifications/hooks/usePushDeviceState.ts src/domain/notifications/index.ts src/domain/notifications/ports/notificationPort.ts src/domain/notifications/types/notification.ts src/domain/notifications/types/notificationCategories.ts src/domain/user/components/SettingsView.tsx src/shared/i18n/appAboutResources.ts src/shared/i18n/helpResources.ts src/shared/i18n/notifyResources.ts src/shared/i18n/resources.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique o Hosting.
