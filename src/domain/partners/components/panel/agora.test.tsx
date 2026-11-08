import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerTodayItem } from '../../types/partnerHome';
import { PartnerAgoraSection } from './PartnerAgoraSection';

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

  it('"Iniciar serviço" some depois do toque e a portaria abre a folha', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar serviço' }));
    expect(screen.queryByRole('button', { name: 'Iniciar serviço' })).toBeNull();
    expect(screen.getByText('Portaria · Dunas Park')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir portaria' }));
    expect(onOpenGate).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });
});
