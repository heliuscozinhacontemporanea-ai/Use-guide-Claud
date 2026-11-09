import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerContentEditorState } from '../../types/partnerContent';
import type { PartnerEventOrder, PartnerEventSales } from '../../types/partnerHome';

const m = vi.hoisted(() => ({ sales: vi.fn(), orders: vi.fn() }));
vi.mock('../../application/usecases/getPartnerEventSalesUseCase', () => ({
  getPartnerEventSalesUseCase: m.sales,
}));
vi.mock('../../application/usecases/listPartnerEventOrdersUseCase', () => ({
  listPartnerEventOrdersUseCase: m.orders,
}));

import { PartnerEventEditor } from '../PartnerEventEditor';
import { PartnerEventPage } from './PartnerEventPage';

const SALES: PartnerEventSales = {
  event: { id: 'ev1', title: 'Luau na Duna', status: 'published', sessions: 2 },
  soldMinor: 1280000,
  ticketsSold: 128,
  receiveMinor: 1152000,
  sessions: [
    { id: 's1', startsAt: '2026-12-20T23:00:00.000Z', sold: 128, capacity: 300, courtesies: 12 },
    { id: 's2', startsAt: '2026-12-21T23:00:00.000Z', sold: 40, capacity: 300, courtesies: 0 },
  ],
  ordersTotal: 1,
};

const ORDER: PartnerEventOrder = {
  id: 'o2Kq81xyz',
  code: 'o2Kq81',
  buyerName: 'Carlos Melo',
  promoterUsername: null,
  occurrenceId: 's1',
  tickets: 1,
  createdAt: '2026-11-03T21:42:00.000Z',
  status: 'refund_requested',
  lines: [{ name: 'Pista', unitPriceMinor: 10000, quantity: 1 }],
  serviceFeeMinor: 300,
  paymentMethod: 'pix',
  refund: {
    state: 'in_progress',
    amountMinor: 10300,
    full: true,
    at: '2026-11-04T12:00:00.000Z',
  },
};

describe('Página do evento (p10–p12) e Editar evento (p18)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.sales.mockResolvedValue(SALES);
    m.orders.mockResolvedValue({ data: [ORDER], nextCursor: null, total: 1 });
  });

  it('mostra vendido, a receber, sessões e pedidos; a sessão abre a folha', async () => {
    const onOpenSession = vi.fn();
    render(
      <PartnerEventPage
        eventId="ev1"
        reloadKey={0}
        timeZone="America/Fortaleza"
        onBack={vi.fn()}
        onEdit={vi.fn()}
        onOpenSession={onOpenSession}
      />
    );
    expect(await screen.findByText(/^R\$\s12\.800$/)).toBeTruthy();
    expect(screen.getByText('128 ingressos')).toBeTruthy();
    expect(screen.getByText(/^R\$\s11\.520$/)).toBeTruthy();
    expect(screen.getByText('Publicado · 2 sessões')).toBeTruthy();
    expect(await screen.findByText('Pediu reembolso')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Dom\., 20 de dez\./ }));
    expect(onOpenSession).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'session', id: 's1', parentId: 'ev1', sold: 128 })
    );
  });

  it('atalho Cupons leva à área Cupons do evento', async () => {
    const onOpenCoupons = vi.fn();
    render(
      <PartnerEventPage
        eventId="ev1"
        reloadKey={0}
        timeZone="America/Fortaleza"
        onBack={vi.fn()}
        onEdit={vi.fn()}
        onOpenSession={vi.fn()}
        onOpenCoupons={onOpenCoupons}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: /Cupons/ }));
    expect(onOpenCoupons).toHaveBeenCalled();
  });

  it('o pedido abre a folha com ingresso, taxa, sessão e o reembolso integral em andamento', async () => {
    render(
      <PartnerEventPage
        eventId="ev1"
        reloadKey={0}
        timeZone="America/Fortaleza"
        onBack={vi.fn()}
        onEdit={vi.fn()}
        onOpenSession={vi.fn()}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: /Carlos Melo · 1 ingresso/ }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText(/^Pista · R\$\s100,00$/)).toBeTruthy();
    expect(within(sheet).getByText(/^R\$\s3,00$/)).toBeTruthy();
    expect(within(sheet).getByText('Pix')).toBeTruthy();
    expect(
      within(sheet).getByText(/Reembolso integral de R\$\s103,00, com a taxa de serviço/)
    ).toBeTruthy();
  });

  it('busca, filtro "Com reembolso" e "Ver mais" pedem a página certa ao servidor', async () => {
    const other = { ...ORDER, id: 'Zz99aaa', code: 'Zz99aa', buyerName: 'Ana Souza' };
    m.orders.mockResolvedValueOnce({ data: [ORDER], nextCursor: 'c1', total: 2 });
    render(
      <PartnerEventPage
        eventId="ev1"
        reloadKey={0}
        timeZone="America/Fortaleza"
        onBack={vi.fn()}
        onEdit={vi.fn()}
        onOpenSession={vi.fn()}
      />
    );
    m.orders.mockResolvedValueOnce({ data: [other], nextCursor: null, total: 2 });
    fireEvent.click(await screen.findByRole('button', { name: 'Ver mais 1 pedido' }));
    expect(await screen.findByRole('button', { name: /Ana Souza/ })).toBeTruthy();
    expect(m.orders).toHaveBeenLastCalledWith('ev1', { q: '', filter: 'all', cursor: 'c1' });
    expect(screen.queryByRole('button', { name: /Ver mais/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Com reembolso' }));
    expect(await screen.findByText('1 pedido')).toBeTruthy();
    expect(m.orders).toHaveBeenLastCalledWith('ev1', { q: '', filter: 'refunds' });

    vi.useFakeTimers();
    m.orders.mockResolvedValueOnce({ data: [], nextCursor: null, total: 0 });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar por nome ou nº do pedido' }), {
      target: { value: ' joao ' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    vi.useRealTimers();
    expect(m.orders).toHaveBeenLastCalledWith('ev1', { q: 'joao', filter: 'refunds' });
    expect(await screen.findByText('Nenhum pedido encontrado.')).toBeTruthy();
  });

  it('Editar evento lista só o cadastro e abre cada parte; sem vendas nem portaria', () => {
    const item = {
      id: 'ev1',
      name: 'Luau na Duna',
      category: 'event',
      entryType: 'pago',
      sessions: [{}, {}],
      images: ['a', 'b'],
      phone: '+5588999999999',
      instagramLink: '@luau',
    } as unknown as PartnerContentEditorState;
    render(
      <PartnerEventEditor
        item={item}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
        isLoading={false}
        isUploading={false}
        onImageUpload={vi.fn()}
        sessionsLoadState={{ status: 'loaded' } as never}
        showDeleteConfirm={false}
        onRequestDelete={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );
    for (const row of [
      'Informações',
      'Datas e sessões',
      'Local',
      'Ingressos e lotes',
      'Regras de venda',
      'Fotos',
      'Contato',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(row) })).toBeTruthy();
    }
    expect(screen.getByText('2 sessões')).toBeTruthy();
    expect(screen.getByText('2 fotos')).toBeTruthy();
    expect(screen.getByText('WhatsApp, Instagram')).toBeTruthy();
    expect(screen.queryByText(/Vendas|Portaria|Check-in/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Contato/ }));
    expect(screen.getByRole('heading', { name: 'Contato' })).toBeTruthy();
    expect(screen.queryByText('Região do evento')).toBeNull();
  });

  it('evento com vendas não oferece excluir e explica como cancelar', () => {
    render(
      <PartnerEventEditor
        item={
          { id: 'ev1', name: 'Luau', category: 'event' } as unknown as PartnerContentEditorState
        }
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
        isLoading={false}
        isUploading={false}
        onImageUpload={vi.fn()}
        sessionsLoadState={{ status: 'loaded' } as never}
        hasSales
        showDeleteConfirm={false}
        onRequestDelete={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: 'Excluir evento' })).toBeNull();
    expect(screen.getByText(/Este evento tem vendas e não pode ser excluído/)).toBeTruthy();
  });
});
