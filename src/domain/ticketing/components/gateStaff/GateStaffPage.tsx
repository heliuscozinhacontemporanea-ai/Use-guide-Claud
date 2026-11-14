import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { useOwnerGateStaff } from '../../hooks/useOwnerGateStaff';
import type { GateStaffMemberView } from '../../types/gateStaff';
import { GateStaffMemberSheet } from './GateStaffMemberSheet';
import { InviteGateStaffSheet } from './InviteGateStaffSheet';

/**
 * Mais › Equipe da portaria (C1): quem pode liberar entradas de cada evento do dono, com convite
 * pelo @ e remoção. A equipe não vê vendas nem valores; a permissão é conferida no servidor. O `<` e
 * o título ficam na barra fixa da página (D33).
 */
export function GateStaffPage() {
  const { t } = useTranslation();
  const { data, loading, error, reload } = useOwnerGateStaff();
  const [inviting, setInviting] = useState(false);
  const [opened, setOpened] = useState<{ member: GateStaffMemberView; title: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const groups = data?.groups.filter((group) => group.members.length > 0) ?? [];
  const targets = data?.targets ?? [];

  return (
    <section className="w-full space-y-5">
      <p className="px-1 text-control text-ink-muted">{t('gateStaff.owner.intro')}</p>
      {notice && (
        <p role="status" className="px-1">
          <StatusText tone="success">{notice}</StatusText>
        </p>
      )}
      {loading && !data ? (
        <ListLoading label={t('gateStaff.owner.title')} />
      ) : error || !data ? (
        <ListError message={t('gateStaff.owner.loadError')} onRetry={() => void reload()} />
      ) : targets.length === 0 ? (
        <ListEmpty message={t('gateStaff.owner.noEvents')} />
      ) : (
        <>
          {groups.length === 0 && <ListEmpty message={t('gateStaff.owner.empty')} />}
          {groups.map((group) => (
            <section key={`${group.type}-${group.id}`} className="space-y-2">
              <h3 className="px-1 text-meta font-semibold uppercase tracking-wide text-ink-muted">
                {t(
                  group.type === 'event'
                    ? 'gateStaff.owner.eventGroup'
                    : 'gateStaff.owner.placeGroup',
                  { title: group.title }
                )}
              </h3>
              <ul className="rounded-card bg-surface border border-line divide-y divide-line overflow-hidden">
                {group.members.map((member) => (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setOpened({ member, title: group.title });
                      }}
                      className="press w-full px-4 py-3 min-h-16 flex items-center justify-between gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
                    >
                      <span className="min-w-0">
                        <span className="block text-body font-semibold text-ink truncate">
                          {member.displayName ?? t('gateStaff.owner.noName')}
                        </span>
                        {member.username && (
                          <span className="block text-meta text-ink-muted truncate">
                            @{member.username}
                          </span>
                        )}
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-meta font-semibold ${
                          member.status === 'active' ? 'text-success' : 'text-warn'
                        }`}
                      >
                        {t(
                          member.status === 'active'
                            ? 'gateStaff.owner.active'
                            : 'gateStaff.owner.invited'
                        )}
                        <ChevronRight size={16} className="text-ink-subtle" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <button
            type="button"
            onClick={() => {
              setNotice(null);
              setInviting(true);
            }}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t('gateStaff.owner.invite')}
          </button>
        </>
      )}
      <InviteGateStaffSheet
        open={inviting}
        targets={targets}
        onClose={() => setInviting(false)}
        onInvited={() => {
          setInviting(false);
          setNotice(t('gateStaff.owner.invitedNotice'));
          void reload();
        }}
      />
      <GateStaffMemberSheet
        member={opened?.member ?? null}
        eventTitle={opened?.title ?? ''}
        onClose={() => setOpened(null)}
        onRemoved={() => {
          setOpened(null);
          setNotice(t('gateStaff.owner.removedNotice'));
          void reload();
        }}
      />
    </section>
  );
}
