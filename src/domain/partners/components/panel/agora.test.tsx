import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerTodayItem } from '../../types/partnerHome';
import { type AgoraOfflineState, PartnerAgoraSection } from './PartnerAgoraSection';

const MIN = 60_000;
const rel = (minutes: number) => new Date(Date.now() + minutes * MIN).toISOString();

function slot(overrides: Partial<PartnerTodayItem>): PartnerTodayItem {
  return {
    kind: 'slot',
    id: 'h1',
    parentId: 'o1',
    establishmentIds: ['buggy'],
    title: 'Passeio de buggy ao Preá',
    offerKind: 'tour',
    startsAt: rel(20),
    endsAt: null,
    sold: 6,
    capacity: 8,
    checkedIn: 0,
    arrivedAt: null,
    bookings: 3,
    waitingBookings: 3,
    meetingPoint: 'Praça Principal',
    serviceEndsAt: rel(200),
    ...overrides,
  };
}

function renders() {
  return {
    arrive: vi.fn(async () => ({ located: true })),
    start: vi.fn(async () => new Date().toISOString()),
    renderCodeSheet: vi.fn(() => <p>folha do código</p>),
    renderContacts: vi.fn(() => <p>contatos</p>),
  };
}

describe('Agora (p40 a p43)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    localStorage.clear();
  });

  it('"Cheguei" nos 30 min antes registra a chegada do horário', async () => {
    const r = renders();
    const onChanged = vi.fn();
    render(
      <PartnerAgoraSection
        items={[slot({})]}
        nameOf={() => 'Buggy do Preá'}
        renders={r}
        version={0}
        onOpenGate={vi.fn()}
        onChanged={onChanged}
      />
    );
    expect(screen.getByText(/Praça Principal · 3 reservas, 6 pessoas/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cheguei' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(r.arrive).toHaveBeenCalledWith(expect.objectContaining({ id: 'h1' }));
  });

  it('depois do "Cheguei" mostra os contatos e abre a folha do código', () => {
    const r = renders();
    render(
      <PartnerAgoraSection
        items={[slot({ startsAt: rel(5), arrivedAt: rel(-5), checkedIn: 2, waitingBookings: 2 })]}
        nameOf={() => 'Buggy do Preá'}
        renders={r}
        version={0}
        onOpenGate={vi.fn()}
        onChanged={vi.fn()}
      />
    );
    expect(screen.getByText('contatos')).toBeTruthy();
    expect(screen.getByText(/1 de 3 com código/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Inserir código' }));
    expect(screen.getByText('folha do código')).toBeTruthy();
  });

  it('"Iniciar serviço" grava no servidor, recarrega e some quando o horário volta iniciado', async () => {
    const r = renders();
    const onChanged = vi.fn();
    const ready = slot({ startsAt: rel(2), checkedIn: 6, waitingBookings: 0 });
    const view = (items: PartnerTodayItem[]) => (
      <PartnerAgoraSection
        items={items}
        nameOf={() => 'Buggy do Preá'}
        renders={r}
        version={0}
        onOpenGate={vi.fn()}
        onChanged={onChanged}
      />
    );
    const { rerender } = render(view([ready]));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar serviço' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(r.start).toHaveBeenCalledWith(expect.objectContaining({ id: 'h1' }));
    rerender(view([{ ...ready, startedAt: rel(0) }]));
    expect(screen.queryByRole('button', { name: 'Iniciar serviço' })).toBeNull();
  });

  it('a portaria abre a folha', () => {
    const onOpenGate = vi.fn();
    render(
      <PartnerAgoraSection
        items={[
          slot({ startsAt: rel(2), checkedIn: 6, waitingBookings: 0 }),
          slot({ id: 'e1', offerKind: 'private_entry', startsAt: rel(30), sold: 86 }),
        ]}
        nameOf={() => 'Dunas Park'}
        renders={renders()}
        version={0}
        onOpenGate={onOpenGate}
        onChanged={vi.fn()}
      />
    );
    expect(screen.getByText('Portaria · Dunas Park')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir portaria' }));
    expect(onOpenGate).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });

  it('antes do fim das vendas o cartão avisa a hora; depois, a portaria baixa a lista (C5)', () => {
    const download = vi.fn();
    const offline: AgoraOfflineState = {
      kind: 'list',
      status: 'missing',
      count: null,
      updatedAt: null,
      online: true,
      busy: false,
      failed: false,
      download,
    };
    const view = (item: PartnerTodayItem) => (
      <PartnerAgoraSection
        items={[item]}
        nameOf={() => 'Dunas Park'}
        renders={{ ...renders(), renderOffline: (_item, render) => render(offline) }}
        version={0}
        onOpenGate={vi.fn()}
        onChanged={vi.fn()}
      />
    );
    const event = slot({ kind: 'session', id: 'o1', title: 'Luau na Duna', offerKind: undefined });
    const { rerender } = render(view({ ...event, startsAt: rel(600), salesEndsAt: rel(480) }));
    expect(screen.getByText(/Prepare-se: seu evento começa/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Baixar lista' })).toBeNull();
    rerender(view({ ...event, startsAt: rel(60), salesEndsAt: rel(-60) }));
    expect(screen.getByText(/Lista sem internet: ainda não baixada neste aparelho/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Baixar lista' }));
    expect(download).toHaveBeenCalledTimes(1);
  });

  it('lista sem internet: diz se está no aparelho e baixa com um toque (C5)', () => {
    const download = vi.fn();
    const state = (overrides: Partial<AgoraOfflineState>): AgoraOfflineState => ({
      kind: 'list',
      status: 'missing',
      count: null,
      updatedAt: null,
      online: true,
      busy: false,
      failed: false,
      download,
      ...overrides,
    });
    const view = (offline: AgoraOfflineState) => (
      <PartnerAgoraSection
        items={[
          slot({
            kind: 'session',
            id: 'o1',
            title: 'Luau na Duna',
            startsAt: rel(600),
            salesEndsAt: rel(-60),
          }),
        ]}
        nameOf={() => 'Dunas Park'}
        renders={{ ...renders(), renderOffline: (_item, render) => render(offline) }}
        version={0}
        onOpenGate={vi.fn()}
        onChanged={vi.fn()}
      />
    );
    const { rerender } = render(view(state({})));
    expect(screen.getByText(/ainda não baixada neste aparelho/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Baixar lista' }));
    expect(download).toHaveBeenCalledTimes(1);
    rerender(view(state({ status: 'ready', count: 128, updatedAt: rel(-5) })));
    expect(screen.getByText(/128 ingressos · atualizada em/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Atualizar lista' })).toBeTruthy();
    rerender(view(state({ status: 'no_connection', online: false })));
    expect(screen.getByText(/conecte-se à internet para baixar/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Baixar lista' })).toHaveProperty('disabled', true);
    rerender(view(state({ kind: 'keys', status: 'ready' })));
    expect(screen.getByText(/pronta para funcionar sem internet/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Baixar|Preparar|Atualizar/ })).toBeNull();
  });
});
