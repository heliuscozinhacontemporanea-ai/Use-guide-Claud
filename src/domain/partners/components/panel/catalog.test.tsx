import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerContentRecord } from '../../types/partnerContent';

const m = vi.hoisted(() => ({ events: vi.fn(), plan: vi.fn(), verification: vi.fn() }));
vi.mock('../../application/usecases/getPartnerCatalogEventsUseCase', () => ({
  getPartnerCatalogEventsUseCase: m.events,
}));
vi.mock('../../hooks/useListingPlan', () => ({ useListingPlan: m.plan }));
vi.mock('../../hooks/useListingVerification', () => ({ useListingVerification: m.verification }));

import { PartnerCatalogSection } from './PartnerCatalogSection';

const place = (id: string, name: string, extra: Partial<PartnerContentRecord> = {}) =>
  ({
    id,
    name,
    category: 'tour',
    location: 'prea',
    isActive: true,
    ...extra,
  }) as PartnerContentRecord;

function renderSection(props: Partial<Parameters<typeof PartnerCatalogSection>[0]> = {}) {
  const handlers = { onEventChange: vi.fn(), onPlaceChange: vi.fn(), onToggleActive: vi.fn() };
  render(
    <PartnerCatalogSection
      segment="events"
      onSegmentChange={vi.fn()}
      placeId={null}
      onPlaceChange={handlers.onPlaceChange}
      eventId={null}
      onEventChange={handlers.onEventChange}
      eventReloadKey={0}
      onOpenSession={vi.fn()}
      items={[place('buggy', 'Buggy do Preá'), place('dunas', 'Dunas Park')]}
      events={[place('ev1', 'Luau na Duna')]}
      loading={false}
      filter={null}
      establishments={[
        {
          id: 'buggy',
          name: 'Buggy do Preá',
          category: 'tour',
          location: 'Preá',
          rating: 4.8,
          reviewCount: 96,
          unansweredReviews: 0,
        },
        {
          id: 'dunas',
          name: 'Dunas Park',
          category: 'sight',
          location: 'Jeri',
          rating: 0,
          reviewCount: 0,
          unansweredReviews: 0,
        },
      ]}
      eventsVersion={0}
      onEditItem={vi.fn()}
      onCreateItem={vi.fn()}
      onOpenEvent={vi.fn()}
      onCreateEvent={vi.fn()}
      onOpenPlan={vi.fn()}
      onVerify={vi.fn()}
      onToggleActive={handlers.onToggleActive}
      verificationVersion={0}
      planVersion={0}
      onOpenReviews={vi.fn()}
      renders={{}}
      {...props}
    />
  );
  return handlers;
}

describe('Catálogo (p09) e página do estabelecimento (p19)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.events.mockResolvedValue([
      {
        id: 'ev1',
        title: 'Luau na Duna',
        establishmentIds: ['buggy'],
        status: 'published',
        missing: null,
        sessions: 2,
        nextStartsAt: '2026-12-20T23:00:00.000Z',
        lastStartsAt: '2026-12-21T23:00:00.000Z',
        sold: 128,
      },
      {
        id: 'ev2',
        title: 'Festival de Forró',
        establishmentIds: ['dunas'],
        status: 'draft',
        missing: 'cover',
        sessions: 1,
        nextStartsAt: '2026-12-28T23:00:00.000Z',
        lastStartsAt: '2026-12-28T23:00:00.000Z',
        sold: 0,
      },
    ]);
    m.plan.mockReturnValue({
      loading: false,
      data: {
        itemId: 'buggy',
        planType: 'annual',
        planUntil: '2027-03-12T15:00:00.000Z',
        planActive: true,
        sealSuspended: false,
        seal: { isVerified: true },
        trialAvailable: false,
      },
    });
    m.verification.mockReturnValue({ loading: false, data: { status: 'approved' } });
  });

  it('eventos com status, agrupados por estabelecimento em "Todos"; o toque abre a página do evento', async () => {
    const { onEventChange } = renderSection();
    expect(await screen.findByText('Publicado · 128 vendidos')).toBeTruthy();
    expect(screen.getByText('Rascunho · falta a foto de capa')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Dunas Park' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Luau na Duna/ }));
    expect(onEventChange).toHaveBeenCalledWith('ev1');
  });

  it('com filtro, só os eventos do estabelecimento escolhido e sem grupos', async () => {
    renderSection({ filter: 'dunas' });
    expect(await screen.findByText('Festival de Forró')).toBeTruthy();
    expect(screen.queryByText('Luau na Duna')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Dunas Park' })).toBeNull();
  });

  it('página do estabelecimento: status, plano e nota; pausar usa a ação que já existia', () => {
    const { onToggleActive } = renderSection({ placeId: 'buggy' });
    expect(screen.getByText('Publicado · verificado')).toBeTruthy();
    expect(screen.getByText(/Plano anual até 12 de mar\. de 2027 · selo ativo/)).toBeTruthy();
    expect(screen.getByText('96 avaliações')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar no guia' }));
    expect(onToggleActive).toHaveBeenCalledWith('buggy', true);
  });
});
