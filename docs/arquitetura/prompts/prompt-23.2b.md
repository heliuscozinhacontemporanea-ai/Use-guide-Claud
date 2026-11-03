# Prompt 23.2b — Sininho para todas as contas, central em tempo real e textos dos avisos

> Lote 19, gerado dos commits de referência `8834efd..6739469` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.2b — Sininho para todas as contas, central em tempo real e textos dos avisos

Parte do app da D25; depende do 23.2a.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D25 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Sininho no topo do app para todas as contas logadas (slot do Header montado em src/app); o sininho antigo do painel do parceiro sai.
2) Central em tempo real (limite de 50), traduzida pelo tipo nos três idiomas (notifyTypesResources), com plural, data no fuso de Fortaleza e versão sem nome.
3) Tocar num aviso leva a Ingressos, Reservas, Compras ou ao painel do parceiro; marcar como lida e marcar todas.
4) Mensagem do admin usa POST /api/admin/notifications.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/AppRouter.tsx (alterar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/app/useNotificationNavigation.ts (criar)
- src/domain/notifications/adapters/firestoreNotificationAdapter.ts (alterar)
- src/domain/notifications/application/usecases/subscribeToNotificationsUseCase.ts (alterar)
- src/domain/notifications/components/NotificationBell.tsx (alterar)
- src/domain/notifications/components/NotificationBellButton.tsx (alterar)
- src/domain/notifications/components/NotificationPanel.tsx (apagar)
- src/domain/notifications/hooks/useNotifications.ts (alterar)
- src/domain/notifications/index.ts (alterar)
- src/domain/notifications/ports/notificationPort.ts (alterar)
- src/domain/notifications/types/notification.ts (alterar)
- src/domain/notifications/types/notificationCategories.ts (alterar)
- src/domain/notifications/utils/describeNotification.test.ts (criar)
- src/domain/notifications/utils/describeNotification.ts (criar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerHeader.tsx (alterar)
- src/shared/i18n/notifyResources.ts (alterar)
- src/shared/i18n/notifyTypesResources.ts (criar)
- src/ui/layouts/Header.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/AppRouter.tsx — diff ===
@@ -5,6 +5,7 @@ import { LoginModal } from '../domain/auth/components/LoginModal';
 import { useAuthContext } from '../domain/auth/context/AuthContext';
 import { UserRole } from '../domain/auth/types/auth';
 import { GuideItem, useGuideCatalog } from '../domain/guide';
+import { NotificationBell } from '../domain/notifications';
 import { AttractionDetailModal } from '../domain/guide/components/AttractionDetailModal';
 import { EventDetailModal } from '../domain/guide/components/EventDetailModal';
 import { ItemDetailModal } from '../domain/guide/components/ItemDetailModal';
@@ -29,6 +30,7 @@ import { SideMenu } from './menu/SideMenu';
 import { useSideMenu } from './menu/useSideMenu';
 import { AppRoutes } from './routes/AppRoutes';
 import { useMissingItemNotice } from './useMissingItemNotice';
+import { useNotificationNavigation } from './useNotificationNavigation';
 import { useScrollContainer } from './useScrollContainer';
 
 export function AppRouter() {
@@ -109,6 +111,7 @@ export function AppRouter() {
 
   const isSearchOpen = searchParams.get('search') === '1';
   const { isOpen: isMenuOpen, openMenu, closeMenu } = useSideMenu();
+  const openNotificationLink = useNotificationNavigation(openMenu);
   const isPartnersOpen = searchParams.get('partners') === '1';
 
   const itemIdParam = searchParams.get('item');
@@ -263,6 +266,15 @@ export function AppRouter() {
             isAdmin={isAdmin}
             isPartner={isPartner}
             user={user}
+            notificationSlot={
+              user ? (
+                <NotificationBell
+                  uid={user.uid}
+                  onNavigate={openNotificationLink}
+                  onOpenSettings={() => openMenu('notifications')}
+                />
+              ) : null
+            }
           />
         )}

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -6,7 +6,6 @@ import { useAuthContext } from '../../domain/auth/context/AuthContext';
 import { UserRole } from '../../domain/auth/types/auth';
 import { EventSessionsField } from '../../domain/events';
 import { ReportsView } from '../../domain/insights';
-import { NotificationBell } from '../../domain/notifications';
 import type { PartnerProfile, SubscriptionPlan } from '../../domain/partners';
 import { getPartnerProfileUseCase, PartnerPanel } from '../../domain/partners';
 import {
@@ -163,7 +162,6 @@ export function PartnerPortalComposition() {
       renderReports={({ partnerId, items, events }) => (
         <ReportsView partnerId={partnerId} items={items} events={events} />
       )}
-      renderNotificationBell={(partnerId) => <NotificationBell partnerId={partnerId} />}
       renderCheckoutModal={({
         isOpen,
         onClose,

=== src/app/useNotificationNavigation.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { NotificationLink } from '../domain/notifications';
import type { MenuView } from './menu/menuViews';

const MENU_TARGET: Partial<Record<NotificationLink['screen'], MenuView>> = {
  tickets: 'tickets',
  bookings: 'bookings',
  purchases: 'purchases',
};

/**
 * Leva cada aviso para a tela certa (D25): ingressos, reservas e compras abrem no menu; avisos do
 * parceiro (venda, reclamação, plano, avaliação de um item dele) abrem o painel do parceiro.
 */
export function useNotificationNavigation(openMenu: (view: MenuView) => void) {
  const [, setSearchParams] = useSearchParams();

  return useCallback(
    (link: NotificationLink) => {
      const menuView = MENU_TARGET[link.screen];
      if (menuView) {
        openMenu(menuView);
        return;
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('admin');
          next.set('partner', '1');
          return next;
        },
        { replace: false }
      );
    },
    [openMenu, setSearchParams]
  );
}

=== src/domain/notifications/adapters/firestoreNotificationAdapter.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { subscribeToCollectionUseCase } from '../../database';
import { NotificationPort } from '../ports/notificationPort';
import type { SendAdminNotificationPayload, StoredNotification } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export class FirestoreNotificationAdapter implements NotificationPort {
  subscribeToNotifications(
    uid: string,
    onUpdate: (notifications: StoredNotification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void {
    return subscribeToCollectionUseCase<StoredNotification>(
      'notifications',
      onUpdate,
      onError,
      [{ field: 'recipientUid', op: '==', value: uid }],
      [{ field: 'createdAt', direction: 'desc' }],
      limitCount
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    const res = await firebaseApiFetch(
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
      { method: 'PATCH' },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('NOTIFICATION_UPDATE_FAILED');
  }

  async markAllAsRead(): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/notifications/read-all',
      { method: 'PATCH' },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('NOTIFICATION_UPDATE_FAILED');
  }

  async sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void> {
    const res = await firebaseApiFetch(
      '/api/admin/notifications',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      { requireAuth: true }
    );
    if (!res.ok) throw new Error('ADMIN_MESSAGE_FAILED');
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

=== src/domain/notifications/application/usecases/subscribeToNotificationsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { notificationAdapter } from '../../factory';
import type { StoredNotification } from '../../types/notification';

export function subscribeToNotificationsUseCase(
  uid: string,
  onUpdate: (notifications: StoredNotification[]) => void,
  onError?: (error: Error) => void,
  limitCount?: number
): () => void {
  return notificationAdapter.subscribeToNotifications(uid, onUpdate, onError, limitCount);
}

=== src/domain/notifications/components/NotificationBell.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationLink } from '../types/notification';
import { NotificationBellButton } from './NotificationBellButton';
import { NotificationCenterSheet } from './NotificationCenterSheet';

interface NotificationBellProps {
  uid: string;
  /** O app decide para onde cada aviso leva (ingressos, reservas, compras, painel). */
  onNavigate: (link: NotificationLink) => void;
  onOpenSettings: () => void;
}

/** Sininho do topo com a central de notificações, para todas as contas (D25). */
export function NotificationBell({ uid, onNavigate, onOpenSettings }: NotificationBellProps) {
  const { items, unreadCount, loading, error, retry, markAsRead, markAllAsRead } =
    useNotifications(uid);
  const [open, setOpen] = useState(false);

  return (
    <>
      <NotificationBellButton unreadCount={unreadCount} onClick={() => setOpen(true)} />
      <NotificationCenterSheet
        open={open}
        onOpenChange={setOpen}
        items={items}
        loading={loading}
        error={error}
        onRetry={retry}
        onOpenItem={(item) => {
          if (!item.read) void markAsRead(item.id).catch(() => undefined);
          if (item.link) {
            setOpen(false);
            onNavigate(item.link);
          }
        }}
        onMarkAllRead={() => void markAllAsRead().catch(() => undefined)}
        onOpenSettings={() => {
          setOpen(false);
          onOpenSettings();
        }}
      />
    </>
  );
}

=== src/domain/notifications/components/NotificationBellButton.tsx — diff ===
@@ -19,13 +19,13 @@ export function NotificationBellButton({
           ? t('notify.center.openUnread', { count: unreadCount })
           : t('notify.center.open')
       }
-      className="press relative w-11 h-11 rounded-xl flex items-center justify-center text-ink hover:bg-ink/[0.05] focus-visible:ring-2 focus-visible:ring-teal-400/50"
+      className="press relative w-[34px] h-[34px] rounded-xl bg-surface border border-line flex items-center justify-center text-ink shadow-md before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50"
     >
-      <Bell size={20} aria-hidden="true" />
+      <Bell size={18} aria-hidden="true" />
       {unreadCount > 0 && (
         <span
           aria-hidden="true"
-          className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-[#ffffff] text-[11px] font-bold leading-[18px] text-center"
+          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-[#ffffff] text-[11px] font-bold leading-[18px] text-center"
         >
           {unreadCount > 9 ? '9+' : unreadCount}
         </span>

=== src/domain/notifications/components/NotificationPanel.tsx — APAGUE este arquivo ===

=== src/domain/notifications/hooks/useNotifications.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { markAllNotificationsAsReadUseCase } from '../application/usecases/markAllNotificationsAsReadUseCase';
import { markNotificationAsReadUseCase } from '../application/usecases/markNotificationAsReadUseCase';
import { subscribeToNotificationsUseCase } from '../application/usecases/subscribeToNotificationsUseCase';
import type { StoredNotification } from '../types/notification';
import { describeNotification } from '../utils/describeNotification';

// A central mostra os 50 mais recentes; avisos somem sozinhos depois de 90 dias (D25).
const LIMIT = 50;

/** Avisos da conta em tempo real, já no idioma ativo. Sem `uid` (sem login), fica vazio. */
export function useNotifications(uid: string | undefined) {
  const { t, i18n } = useTranslation();
  const [raw, setRaw] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` refaz a assinatura no "Tentar de novo".
  useEffect(() => {
    setRaw([]);
    setError(false);
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToNotificationsUseCase(
      uid,
      (data) => {
        setRaw(data);
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      },
      LIMIT
    );
    return unsubscribe;
  }, [uid, attempt]);

  const items = useMemo(
    () => raw.map((notification) => describeNotification(notification, t, i18n.language)),
    [raw, t, i18n.language]
  );
  const unreadCount = items.filter((item) => !item.read).length;

  const markAsRead = useCallback((id: string) => markNotificationAsReadUseCase(id), []);
  const markAllAsRead = useCallback(() => markAllNotificationsAsReadUseCase(), []);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { items, unreadCount, loading, error, retry, markAsRead, markAllAsRead };
}

=== src/domain/notifications/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export { markAllNotificationsAsReadUseCase } from './application/usecases/markAllNotificationsAsReadUseCase';
export { markNotificationAsReadUseCase } from './application/usecases/markNotificationAsReadUseCase';
export { sendAdminNotificationUseCase } from './application/usecases/sendAdminNotificationUseCase';
export { subscribeToNotificationsUseCase } from './application/usecases/subscribeToNotificationsUseCase';
// Componentes públicos só para src/app: sininho no topo e Configurações › Notificações (D25).
export { NotificationBell } from './components/NotificationBell';
export { NotificationSettingsView } from './components/NotificationSettingsView';
export { useNotifications } from './hooks/useNotifications';
export type { NotificationLink } from './types/notification';

=== src/domain/notifications/ports/notificationPort.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { SendAdminNotificationPayload, StoredNotification } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationCategories';

export interface NotificationPort {
  /** Avisos da própria conta, mais novos primeiro (leitura direta permitida pelas rules, §6.2). */
  subscribeToNotifications(
    uid: string,
    onUpdate: (notifications: StoredNotification[]) => void,
    onError?: (error: Error) => void,
    limitCount?: number
  ): () => void;

  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;

  sendAdminNotification(payload: SendAdminNotificationPayload): Promise<void>;

  /** Escolhas da conta logada (D25): pedidos de avaliação, novidades e avisos de venda. */
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(patch: Partial<NotificationPreferences>): Promise<void>;
}

=== src/domain/notifications/types/notification.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export interface TimestampLike {
  seconds?: number;
  nanoseconds?: number;
  toDate?: () => Date;
}

export type NotificationDate = string | number | Date | TimestampLike | null;

/** Para onde o toque leva (definido pelo servidor). */
export interface NotificationLink {
  screen: 'tickets' | 'bookings' | 'purchases' | 'partner' | 'item' | 'event';
  id?: string;
}

/** Aviso como está no Firestore (D25): tipo + dados, sem texto pronto. */
export interface StoredNotification {
  id: string;
  recipientUid: string;
  type: string;
  params?: Record<string, string | number>;
  link?: NotificationLink | null;
  read: boolean;
  createdAt: NotificationDate;
}

export interface SendAdminNotificationPayload {
  recipientIds: string[] | 'all';
  title: string;
  message: string;
}

=== src/domain/notifications/types/notificationCategories.ts — diff ===
@@ -1,17 +1,4 @@
-/** Assunto de cada aviso (D25). Define o ícone na central e para onde o toque leva. */
-export type NotificationCategory =
-  | 'purchases'
-  | 'tickets'
-  | 'bookings'
-  | 'reviews'
-  | 'account'
-  | 'news'
-  | 'sales'
-  | 'operations'
-  | 'finance'
-  | 'partnerReviews'
-  | 'registration'
-  | 'messages';
+import type { NotificationLink } from './notification';
 
 /**
  * O que a pessoa escolhe (D25, revisão). Compras, ingressos, reservas, conta e, para o parceiro,
@@ -39,9 +26,9 @@ export type PushDeviceState = 'unsupported' | 'install' | 'default' | 'granted'
 /** Linha da central de notificações, já no idioma de quem lê. */
 export interface NotificationCenterItem {
   id: string;
-  category: NotificationCategory;
   title: string;
   body: string;
   createdAt: Date;
   read: boolean;
+  link?: NotificationLink | null;
 }

=== src/domain/notifications/utils/describeNotification.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { describeNotification } from './describeNotification';

const base = { id: 'n1', recipientUid: 'u1', read: false, createdAt: '2026-11-03T12:00:00Z' };

describe('describeNotification', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('traduz pelo tipo com os dados e o plural do idioma', () => {
    const t = i18n.t.bind(i18n);
    expect(
      describeNotification({ ...base, type: 'sale_ticket', params: { count: 2 } }, t, 'pt-BR').body
    ).toBe('2 ingressos vendidos.');
    expect(
      describeNotification(
        { ...base, type: 'ticket_received', params: { event: 'Luau na Duna' } },
        t,
        'pt-BR'
      ).body
    ).toBe('Um ingresso para Luau na Duna está na sua carteira.');
  });

  it('sem o nome, usa o texto que não depende dele', () => {
    const t = i18n.t.bind(i18n);
    const item = describeNotification(
      { ...base, type: 'booking_provider_arrived', params: { business: '' } },
      t,
      'pt-BR'
    );
    expect(item.title).toBe('Seu guia chegou');
  });

  it('data da nova sessão sai no idioma e no fuso de Fortaleza', async () => {
    await i18n.changeLanguage('en');
    const item = describeNotification(
      {
        ...base,
        type: 'event_postponed',
        params: { event: 'Luau', startsAt: '2026-12-20T23:00:00.000Z' },
      },
      i18n.t.bind(i18n),
      'en'
    );
    expect(item.body).toContain('December 20, 2026');
    expect(item.body).toContain('8:00');
  });

  it('tipo desconhecido não quebra a lista', () => {
    const item = describeNotification({ ...base, type: 'novo_tipo' }, i18n.t.bind(i18n), 'pt-BR');
    expect(item).toMatchObject({ title: 'Notificações', body: '' });
  });
});

=== src/domain/notifications/utils/describeNotification.ts — ARQUIVO NOVO, conteúdo completo ===
import type { TFunction } from 'i18next';
import type { NotificationDate, StoredNotification } from '../types/notification';
import type { NotificationCenterItem } from '../types/notificationCategories';

const TIME_ZONE = 'America/Fortaleza';

/** Dados que, se vierem vazios, trocam o texto pela versão sem nome (`titleGeneric`/`bodyGeneric`). */
const NAMED_PARAMS = ['event', 'business', 'username', 'listing'] as const;

export function toDate(value: NotificationDate): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date((value.seconds ?? 0) * 1000);
}

function hasText(t: TFunction, key: string): boolean {
  return t(key, { defaultValue: '' }) !== '';
}

/**
 * Monta título e texto no idioma ativo a partir do tipo e dos dados (D25, §12.5). Tipo desconhecido
 * (app antigo, tipo novo no servidor) vira um aviso genérico em vez de sumir.
 */
export function describeNotification(
  notification: StoredNotification,
  t: TFunction,
  locale: string
): NotificationCenterItem {
  const params = notification.params ?? {};
  const base = `notify.types.${notification.type}`;
  const known = hasText(t, `${base}.title`);
  const missingName = NAMED_PARAMS.some((name) => name in params && !params[name]);
  const values: Record<string, string | number> = { ...params };
  if (typeof params.username === 'string' && params.username) {
    values.username = `@${params.username}`;
  }
  if (typeof params.startsAt === 'string') {
    values.date = new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: TIME_ZONE,
    }).format(new Date(params.startsAt));
  }
  for (const countKey of ['count', 'participants', 'rating', 'days']) {
    if (typeof params[countKey] === 'number') values.count = params[countKey];
  }
  const pick = (part: 'title' | 'body') =>
    missingName && hasText(t, `${base}.${part}Generic`) ? `${base}.${part}Generic` : `${base}.${part}`;

  return {
    id: notification.id,
    title: known ? t(pick('title'), values) : t('notify.center.title'),
    body: known ? t(pick('body'), values) : '',
    createdAt: toDate(notification.createdAt),
    read: notification.read,
    link: notification.link ?? null,
  };
}

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -29,7 +29,6 @@ export interface PartnerPanelProps {
     items: PartnerContentRecord[];
     events: PartnerContentRecord[];
   }) => React.ReactNode;
-  renderNotificationBell?: (partnerId: string) => React.ReactNode;
   renderCheckoutModal?: (props: {
     isOpen: boolean;
     onClose: () => void;
@@ -59,7 +58,6 @@ export function PartnerPanel({
   profile,
   subscriptionPlans,
   renderReports,
-  renderNotificationBell,
   renderCheckoutModal,
   renderEventTicketingManager,
   renderEventSessionsField,
@@ -162,11 +160,7 @@ export function PartnerPanel({
       <div
         className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
       >
-        <PartnerHeader
-          partnerProfile={partnerProfile}
-          onNavigateBack={() => goTo('explore')}
-          notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}
-        />
+        <PartnerHeader partnerProfile={partnerProfile} onNavigateBack={() => goTo('explore')} />
 
         <PartnerTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

=== src/domain/partners/components/subcomponents/PartnerHeader.tsx — diff ===
@@ -1,21 +1,15 @@
 import { ChevronLeft } from 'lucide-react';
 import { motion } from 'motion/react';
-import React from 'react';
 import { PartnerProfile } from '../../types/partner';
 import { cn } from '../../../../shared/utils/cn';
 
 interface PartnerHeaderProps {
   partnerProfile: PartnerProfile | null;
   onNavigateBack: () => void;
-  notificationBell?: React.ReactNode;
 }
 
 /** O selo e o plano são de cada estabelecimento (D11): ficam nos cartões de cadastro, não aqui. */
-export function PartnerHeader({
-  partnerProfile,
-  onNavigateBack,
-  notificationBell,
-}: PartnerHeaderProps) {
+export function PartnerHeader({ partnerProfile, onNavigateBack }: PartnerHeaderProps) {
   return (
     <div className="space-y-6">
       <motion.div
@@ -63,7 +57,6 @@ export function PartnerHeader({
               </span>
             </div>
           </div>
-          {notificationBell}
         </div>
       </motion.div>
     </div>

=== src/shared/i18n/notifyResources.ts — diff ===
@@ -1,3 +1,10 @@
+import {
+  type NotificationTypeTexts,
+  notifyTypesEn,
+  notifyTypesFr,
+  notifyTypesPtBR,
+} from './notifyTypesResources';
+
 /** Textos das notificações (central e Configurações › Notificações, D25). pt-BR é a fonte. */
 export interface NotifyTranslation {
   settingsTitle: string;
@@ -40,6 +47,7 @@ export interface NotifyTranslation {
   loadError: string;
   saveError: string;
   retry: string;
+  types: NotificationTypeTexts;
   center: {
     title: string;
     open: string;
@@ -62,6 +70,7 @@ export interface NotifyTranslation {
 }
 
 export const notifyPtBR: NotifyTranslation = {
+  types: notifyTypesPtBR,
   settingsTitle: 'Notificações',
   device: {
     defaultTitle: 'Ative as notificações',
@@ -137,6 +146,7 @@ export const notifyPtBR: NotifyTranslation = {
 };
 
 export const notifyEn: NotifyTranslation = {
+  types: notifyTypesEn,
   settingsTitle: 'Notifications',
   device: {
     defaultTitle: 'Turn on notifications',
@@ -209,6 +219,7 @@ export const notifyEn: NotifyTranslation = {
 };
 
 export const notifyFr: NotifyTranslation = {
+  types: notifyTypesFr,
   settingsTitle: 'Notifications',
   device: {
     defaultTitle: 'Activez les notifications',

=== src/shared/i18n/notifyTypesResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos de cada tipo de aviso (D25). Variantes `Generic` quando o nome não veio; plural pelo i18next. */
export type NotificationTypeTexts = Record<string, Record<string, string>>;

export const notifyTypesPtBR: NotificationTypeTexts = {
  ticket_received: {
    title: 'Você recebeu um ingresso',
    body: 'Um ingresso para {{event}} está na sua carteira.',
    bodyGeneric: 'Um ingresso novo está na sua carteira.',
  },
  ticket_returned: {
    title: 'Ingresso devolvido',
    body: 'O ingresso para {{event}} voltou para a sua carteira.',
    bodyGeneric: 'Um ingresso voltou para a sua carteira.',
  },
  ticket_link_accepted: {
    title: 'Ingresso entregue',
    body: '{{username}} recebeu o ingresso que você enviou.',
    bodyGeneric: 'O ingresso que você enviou foi recebido.',
  },
  ticket_qr_replaced: {
    title: 'QR Code trocado',
    body: 'O QR Code e o código anteriores não valem mais. Se não foi você, fale com a gente.',
  },
  event_canceled: {
    title: 'Evento cancelado',
    body: '{{event}} foi cancelado. Já pedimos o seu reembolso.',
    bodyGeneric: 'Um evento seu foi cancelado. Já pedimos o seu reembolso.',
  },
  event_postponed: {
    title: 'Evento com nova data',
    body: '{{event}} passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
    bodyGeneric:
      'Um evento seu passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
  },
  booking_provider_arrived: {
    title: '{{business}} chegou',
    titleGeneric: 'Seu guia chegou',
    body: 'Estão esperando você no local combinado. Mostre o seu código.',
  },
  booking_no_show_marked: {
    title: 'Ausência registrada',
    body: '{{business}} registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
    bodyGeneric:
      'O prestador registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
  },
  booking_absence_in_review: {
    title: 'Estamos analisando',
    body: '{{business}} diz que esteve no local. Respondemos em até 5 dias.',
    bodyGeneric: 'O prestador diz que esteve no local. Respondemos em até 5 dias.',
  },
  booking_absence_refunded_buyer: {
    title: 'Reembolso a caminho',
    body: 'Você recebe de volta o valor pago, com a taxa de serviço.',
  },
  booking_confirmation_asked: {
    title: 'Deu tudo certo?',
    body: 'Conte pra gente em Compras se o serviço aconteceu, em até 72 horas.',
  },
  sale_ticket: {
    title: 'Nova venda',
    body_one: '{{count}} ingresso vendido.',
    body_other: '{{count}} ingressos vendidos.',
  },
  sale_booking: {
    title: 'Nova reserva',
    body_one: '{{offer}} para {{count}} pessoa.',
    body_other: '{{offer}} para {{count}} pessoas.',
  },
  sale_claim_opened: {
    title: 'Cliente abriu uma reclamação',
    body: 'O valor desta venda fica guardado até a decisão, em até 5 dias.',
  },
  booking_absence_reported: {
    title: 'Cliente diz que você não foi',
    body: 'Responda em até 2 horas nas reservas do painel. Sem resposta, o cliente é reembolsado e vale a multa de 20%.',
  },
  booking_absence_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'Não houve resposta no prazo. O cliente foi reembolsado e vale a multa de 20%.',
  },
  booking_confirmation_denied: {
    title: 'Cliente abriu uma reclamação',
    body: 'O cliente disse que o serviço não aconteceu. O valor fica guardado até a decisão, em até 5 dias.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente disse que o serviço não aconteceu.',
  },
  booking_confirmation_expired_partner: {
    title: 'Cliente reembolsado',
    body: 'A chegada não foi confirmada com o código e o cliente não respondeu em 72 horas.',
  },
  review_received: {
    title: 'Nova avaliação',
    body_one: '{{user}} deu {{count}} estrela para {{item}}.',
    body_other: '{{user}} deu {{count}} estrelas para {{item}}.',
  },
  review_updated: {
    title: 'Avaliação atualizada',
    body_one: '{{user}} mudou a nota de {{item}} para {{count}} estrela.',
    body_other: '{{user}} mudou a nota de {{item}} para {{count}} estrelas.',
  },
  plan_expiring: {
    title: 'Seu plano está acabando',
    body_one: 'O plano de {{listing}} termina em {{count}} dia. Renove para manter o selo.',
    body_other: 'O plano de {{listing}} termina em {{count}} dias. Renove para manter o selo.',
  },
  plan_renewal_failed: {
    title: 'Não conseguimos renovar seu plano',
    body: 'O cartão não passou. Atualize a forma de pagamento para manter o selo.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

export const notifyTypesEn: NotificationTypeTexts = {
  ticket_received: {
    title: 'You got a ticket',
    body: 'A ticket for {{event}} is in your wallet.',
    bodyGeneric: 'A new ticket is in your wallet.',
  },
  ticket_returned: {
    title: 'Ticket returned',
    body: 'The ticket for {{event}} is back in your wallet.',
    bodyGeneric: 'A ticket is back in your wallet.',
  },
  ticket_link_accepted: {
    title: 'Ticket delivered',
    body: '{{username}} got the ticket you sent.',
    bodyGeneric: 'The ticket you sent was received.',
  },
  ticket_qr_replaced: {
    title: 'QR code replaced',
    body: 'The previous QR code and code no longer work. If this wasn’t you, contact us.',
  },
  event_canceled: {
    title: 'Event canceled',
    body: '{{event}} was canceled. Your refund is on its way.',
    bodyGeneric: 'One of your events was canceled. Your refund is on its way.',
  },
  event_postponed: {
    title: 'Event has a new date',
    body: '{{event}} moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
    bodyGeneric:
      'One of your events moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
  },
  booking_provider_arrived: {
    title: '{{business}} has arrived',
    titleGeneric: 'Your guide has arrived',
    body: 'They’re waiting for you at the meeting point. Show your code.',
  },
  booking_no_show_marked: {
    title: 'Marked as no-show',
    body: '{{business}} marked that you didn’t show up. If you were there, tell us in Purchases.',
    bodyGeneric:
      'The provider marked that you didn’t show up. If you were there, tell us in Purchases.',
  },
  booking_absence_in_review: {
    title: 'We’re looking into it',
    body: '{{business}} says they were there. We’ll get back to you within 5 days.',
    bodyGeneric: 'The provider says they were there. We’ll get back to you within 5 days.',
  },
  booking_absence_refunded_buyer: {
    title: 'Refund on its way',
    body: 'You’ll get back what you paid, including the service fee.',
  },
  booking_confirmation_asked: {
    title: 'Did everything go well?',
    body: 'Let us know in Purchases whether the service happened, within 72 hours.',
  },
  sale_ticket: {
    title: 'New sale',
    body_one: '{{count}} ticket sold.',
    body_other: '{{count}} tickets sold.',
  },
  sale_booking: {
    title: 'New booking',
    body_one: '{{offer}} for {{count}} person.',
    body_other: '{{offer}} for {{count}} people.',
  },
  sale_claim_opened: {
    title: 'A customer opened a complaint',
    body: 'The money from this sale is held until a decision, within 5 days.',
  },
  booking_absence_reported: {
    title: 'Customer says you didn’t show up',
    body: 'Reply within 2 hours in your panel’s bookings. Without a reply, the customer is refunded and the 20% fine applies.',
  },
  booking_absence_refunded_partner: {
    title: 'Customer refunded',
    body: 'There was no reply in time. The customer was refunded and the 20% fine applies.',
  },
  booking_confirmation_denied: {
    title: 'A customer opened a complaint',
    body: 'The customer said the service didn’t happen. The money is held until a decision, within 5 days.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer said the service didn’t happen.',
  },
  booking_confirmation_expired_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer didn’t reply within 72 hours.',
  },
  review_received: {
    title: 'New review',
    body_one: '{{user}} gave {{item}} {{count}} star.',
    body_other: '{{user}} gave {{item}} {{count}} stars.',
  },
  review_updated: {
    title: 'Review updated',
    body_one: '{{user}} changed their rating of {{item}} to {{count}} star.',
    body_other: '{{user}} changed their rating of {{item}} to {{count}} stars.',
  },
  plan_expiring: {
    title: 'Your plan is ending soon',
    body_one: 'The plan for {{listing}} ends in {{count}} day. Renew to keep the badge.',
    body_other: 'The plan for {{listing}} ends in {{count}} days. Renew to keep the badge.',
  },
  plan_renewal_failed: {
    title: 'We couldn’t renew your plan',
    body: 'The card was declined. Update your payment method to keep the badge.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

export const notifyTypesFr: NotificationTypeTexts = {
  ticket_received: {
    title: 'Vous avez reçu un billet',
    body: 'Un billet pour {{event}} est dans votre portefeuille.',
    bodyGeneric: 'Un nouveau billet est dans votre portefeuille.',
  },
  ticket_returned: {
    title: 'Billet rendu',
    body: 'Le billet pour {{event}} est revenu dans votre portefeuille.',
    bodyGeneric: 'Un billet est revenu dans votre portefeuille.',
  },
  ticket_link_accepted: {
    title: 'Billet remis',
    body: '{{username}} a reçu le billet que vous avez envoyé.',
    bodyGeneric: 'Le billet que vous avez envoyé a été reçu.',
  },
  ticket_qr_replaced: {
    title: 'QR code remplacé',
    body: 'L’ancien QR code et l’ancien code ne sont plus valables. Si ce n’était pas vous, contactez-nous.',
  },
  event_canceled: {
    title: 'Événement annulé',
    body: '{{event}} a été annulé. Votre remboursement est en cours.',
    bodyGeneric: 'Un de vos événements a été annulé. Votre remboursement est en cours.',
  },
  event_postponed: {
    title: 'Nouvelle date pour l’événement',
    body: '{{event}} est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
    bodyGeneric:
      'Un de vos événements est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
  },
  booking_provider_arrived: {
    title: '{{business}} est arrivé',
    titleGeneric: 'Votre guide est arrivé',
    body: 'On vous attend au point de rendez-vous. Montrez votre code.',
  },
  booking_no_show_marked: {
    title: 'Absence enregistrée',
    body: '{{business}} a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
    bodyGeneric:
      'Le prestataire a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
  },
  booking_absence_in_review: {
    title: 'Nous examinons la situation',
    body: '{{business}} affirme avoir été sur place. Nous répondons sous 5 jours.',
    bodyGeneric: 'Le prestataire affirme avoir été sur place. Nous répondons sous 5 jours.',
  },
  booking_absence_refunded_buyer: {
    title: 'Remboursement en cours',
    body: 'Vous récupérez le montant payé, frais de service compris.',
  },
  booking_confirmation_asked: {
    title: 'Tout s’est bien passé ?',
    body: 'Dites-nous dans Achats si la prestation a eu lieu, sous 72 heures.',
  },
  sale_ticket: {
    title: 'Nouvelle vente',
    body_one: '{{count}} billet vendu.',
    body_other: '{{count}} billets vendus.',
  },
  sale_booking: {
    title: 'Nouvelle réservation',
    body_one: '{{offer}} pour {{count}} personne.',
    body_other: '{{offer}} pour {{count}} personnes.',
  },
  sale_claim_opened: {
    title: 'Un client a ouvert une réclamation',
    body: 'Le montant de cette vente est retenu jusqu’à la décision, sous 5 jours.',
  },
  booking_absence_reported: {
    title: 'Le client dit que vous n’êtes pas venu',
    body: 'Répondez sous 2 heures dans les réservations de votre espace. Sans réponse, le client est remboursé et la pénalité de 20 % s’applique.',
  },
  booking_absence_refunded_partner: {
    title: 'Client remboursé',
    body: 'Aucune réponse dans le délai. Le client a été remboursé et la pénalité de 20 % s’applique.',
  },
  booking_confirmation_denied: {
    title: 'Un client a ouvert une réclamation',
    body: 'Le client dit que la prestation n’a pas eu lieu. Le montant est retenu jusqu’à la décision, sous 5 jours.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Client remboursé',
    body: 'L’arrivée n’a pas été confirmée avec le code et le client dit que la prestation n’a pas eu lieu.',
  },
  booking_confirmation_expired_partner: {
    title: 'Client remboursé',
    body: 'L’arrivée n’a pas été confirmée avec le code et le client n’a pas répondu sous 72 heures.',
  },
  review_received: {
    title: 'Nouvel avis',
    body_one: '{{user}} a donné {{count}} étoile à {{item}}.',
    body_other: '{{user}} a donné {{count}} étoiles à {{item}}.',
  },
  review_updated: {
    title: 'Avis modifié',
    body_one: '{{user}} a changé sa note pour {{item}} : {{count}} étoile.',
    body_other: '{{user}} a changé sa note pour {{item}} : {{count}} étoiles.',
  },
  plan_expiring: {
    title: 'Votre formule se termine bientôt',
    body_one:
      'La formule de {{listing}} se termine dans {{count}} jour. Renouvelez-la pour garder le badge.',
    body_other:
      'La formule de {{listing}} se termine dans {{count}} jours. Renouvelez-la pour garder le badge.',
  },
  plan_renewal_failed: {
    title: 'Impossible de renouveler votre formule',
    body: 'La carte a été refusée. Mettez à jour votre moyen de paiement pour garder le badge.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};

=== src/ui/layouts/Header.tsx — diff ===
@@ -1,3 +1,4 @@
+import type { ReactNode } from 'react';
 import { useLocation } from 'react-router-dom';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
 import { Search, Handshake, User as UserIcon } from 'lucide-react';
@@ -18,6 +19,8 @@ interface HeaderProps {
   isAdmin?: boolean;
   isPartner?: boolean;
   user?: UserSession | null;
+  /** Sininho de notificações, montado em src/app (o design system não conhece domínios). */
+  notificationSlot?: ReactNode;
 }
 
 export function Header({
@@ -29,6 +32,7 @@ export function Header({
   isAdmin = false,
   isPartner = false,
   user = null,
+  notificationSlot,
 }: HeaderProps) {
   const { pathname } = useLocation();
   const { t } = useTranslation();
@@ -109,9 +113,7 @@ export function Header({
             <button
               onClick={onAdminOpen}
               title={isAdmin ? t('header.managementPanel') : t('header.myPanel')}
-              aria-label={
-                isAdmin ? t('header.openManagementPanel') : t('header.openMyPanel')
-              }
+              aria-label={isAdmin ? t('header.openManagementPanel') : t('header.openMyPanel')}
               className="relative w-[34px] h-[34px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-2xl flex items-center justify-center active:scale-90 transition-all hover:bg-white/20 text-indigo-400 shadow-md animate-fade-in before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
             >
               <Handshake size={16} />
@@ -126,6 +128,7 @@ export function Header({
           )}
         </div>
         <div className="flex items-center gap-3">
+          {notificationSlot}
           {!isMainPage && !isAdminPage && (
             <button
               onClick={onSearchClick}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/AppRouter.tsx src/app/compositions/PartnerPortalComposition.tsx src/app/useNotificationNavigation.ts src/domain/notifications/adapters/firestoreNotificationAdapter.ts src/domain/notifications/application/usecases/subscribeToNotificationsUseCase.ts src/domain/notifications/components/NotificationBell.tsx src/domain/notifications/components/NotificationBellButton.tsx src/domain/notifications/hooks/useNotifications.ts src/domain/notifications/index.ts src/domain/notifications/ports/notificationPort.ts src/domain/notifications/types/notification.ts src/domain/notifications/types/notificationCategories.ts src/domain/notifications/utils/describeNotification.test.ts src/domain/notifications/utils/describeNotification.ts src/domain/partners/components/PartnerPanel.tsx src/domain/partners/components/subcomponents/PartnerHeader.tsx src/shared/i18n/notifyResources.ts src/shared/i18n/notifyTypesResources.ts src/ui/layouts/Header.tsx` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique o Hosting.
