import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { CourtesyRow } from '../../types/courtesy';

const m = vi.hoisted(() => ({
  list: vi.fn(),
  invite: vi.fn(),
  createLink: vi.fn(),
  cancel: vi.fn(),
  preview: vi.fn(),
  accept: vi.fn(),
  find: vi.fn(),
}));
vi.mock('../../application/usecases/listEventCourtesiesUseCase', () => ({
  listEventCourtesiesUseCase: m.list,
}));
vi.mock('../../application/usecases/inviteCourtesyUseCase', () => ({
  inviteCourtesyUseCase: m.invite,
}));
vi.mock('../../application/usecases/createCourtesyLinkUseCase', () => ({
  createCourtesyLinkUseCase: m.createLink,
}));
vi.mock('../../application/usecases/cancelCourtesyUseCase', () => ({
  cancelCourtesyUseCase: m.cancel,
}));
vi.mock('../../application/usecases/previewCourtesyLinkUseCase', () => ({
  previewCourtesyLinkUseCase: m.preview,
}));
vi.mock('../../application/usecases/acceptCourtesyLinkUseCase', () => ({
  acceptCourtesyLinkUseCase: m.accept,
}));
vi.mock('../../../user', () => ({ findUserByUsernameUseCase: m.find }));
vi.mock('../../../auth', () => ({ openEmailVerificationPromptUseCase: vi.fn() }));

import { CourtesyLinkReceiverPage } from './CourtesyLinkReceiverPage';
import { EventGuestsPanel } from './EventGuestsPanel';

const SESSION = { id: 'oc1', startsAt: '2026-12-20T23:00:00.000Z' };
const ROWS: CourtesyRow[] = [
  {
    id: 'c1',
    occurrenceId: 'oc1',
    channel: 'username',
    status: 'checked_in',
    guest: { username: 'ana.souza', displayName: 'Ana Souza' },
    checkedInAt: '2026-12-20T23:14:00.000Z',
    linkExpiresAt: null,
    createdAt: '2026-12-01T12:00:00.000Z',
  },
  {
    id: 'c2',
    occurrenceId: 'oc1',
    channel: 'username',
    status: 'in_wallet',
    guest: { username: 'dj.marcos', displayName: 'Marcos Lima' },
    checkedInAt: null,
    linkExpiresAt: null,
    createdAt: '2026-12-01T12:00:00.000Z',
  },
  {
    id: 'c3',
    occurrenceId: 'oc1',
    channel: 'link',
    status: 'link_pending',
    guest: null,
    checkedInAt: null,
    linkExpiresAt: SESSION.startsAt,
    createdAt: '2026-12-01T12:00:00.000Z',
  },
  {
    id: 'c4',
    occurrenceId: 'oc1',
    channel: 'username',
    status: 'canceled',
    guest: { username: 'pedro.alves', displayName: 'Pedro Alves' },
    checkedInAt: null,
    linkExpiresAt: null,
    createdAt: '2026-12-01T12:00:00.000Z',
  },
];

function renderPanel() {
  return render(
    <EventGuestsPanel
      eventListingId="ev1"
      eventTitle="Luau na Duna"
      sessions={[SESSION]}
      allSessions={[SESSION]}
      onChanged={vi.fn()}
    />
  );
}

describe('convidados (p13, p14, p15, p28)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.list.mockResolvedValue(ROWS);
  });

  it('conta só as cortesias ativas e mostra a situação de cada uma', async () => {
    renderPanel();
    expect(await screen.findByText('3 cortesias enviadas')).toBeTruthy();
    expect(screen.getByText('Entrou às 20:14')).toBeTruthy();
    expect(screen.getByText('Na carteira')).toBeTruthy();
    expect(screen.getByText(/Aguardando a pessoa abrir · vale até/)).toBeTruthy();
    expect(screen.getByText('Cancelado por você')).toBeTruthy();
  });

  it('Convidar: acha o @ exato e envia a cortesia para a sessão', async () => {
    m.find.mockResolvedValue({ username: 'bia.reis', displayName: 'Bia Reis', photoURL: null });
    m.invite.mockResolvedValue(ROWS[1]);
    renderPanel();
    await screen.findByText('3 cortesias enviadas');
    fireEvent.click(screen.getByRole('button', { name: 'Convidar' }));
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText('@ da pessoa'), { target: { value: '@bia.reis' } });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    vi.useRealTimers();
    await screen.findByText('@bia.reis');
    expect(m.find).toHaveBeenCalledWith('bia.reis');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cortesia' }));
    await waitFor(() => expect(m.invite).toHaveBeenCalledWith('oc1', 'bia.reis'));
    expect(await screen.findByText('Cortesia enviada para @bia.reis.')).toBeTruthy();
  });

  it('link: o código vai depois do # e o WhatsApp leva o link', async () => {
    m.createLink.mockResolvedValue({
      courtesyId: 'abcdefgh12',
      token: 'T'.repeat(43),
      expiresAt: SESSION.startsAt,
    });
    renderPanel();
    await screen.findByText('3 cortesias enviadas');
    fireEvent.click(screen.getByRole('button', { name: 'Convidar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar link de convite' }));
    expect(await screen.findByText('Link de convite criado')).toBeTruthy();
    expect(screen.getByText(`localhost:3000/#convite=abcdefgh12.${'T'.repeat(43)}`)).toBeTruthy();
    const whatsapp = screen.getByRole('link', { name: 'Enviar pelo WhatsApp' });
    expect(whatsapp.getAttribute('href')).toContain('wa.me');
    expect(whatsapp.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('cancelar só depois de confirmar; quem entrou não tem o botão', async () => {
    m.cancel.mockResolvedValue(undefined);
    renderPanel();
    fireEvent.click(await screen.findByText('@dj.marcos'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar cortesia' }));
    expect(m.cancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: 'Cancelar cortesia' }).at(-1)!);
    await waitFor(() => expect(m.cancel).toHaveBeenCalledWith('c2'));
  });

  it('página do link: mostra o evento antes do login e recebe depois', async () => {
    m.preview.mockResolvedValue({
      businessName: 'Buggy do Preá',
      eventTitle: 'Luau na Duna',
      startsAt: SESSION.startsAt,
      locationName: 'Jericoacoara',
      expiresAt: SESSION.startsAt,
    });
    m.accept.mockResolvedValue({ ticketId: 't1' });
    const onLogin = vi.fn();
    const link = { courtesyId: 'c3', token: 'T'.repeat(43) };
    const { rerender } = render(
      <CourtesyLinkReceiverPage
        link={link}
        loggedIn={false}
        onLogin={onLogin}
        onAccepted={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(await screen.findByText('Luau na Duna')).toBeTruthy();
    expect(screen.getByText(/Buggy do Preá convidou você para/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar ou criar conta para receber' }));
    expect(onLogin).toHaveBeenCalled();
    rerender(
      <CourtesyLinkReceiverPage
        link={link}
        loggedIn
        onLogin={onLogin}
        onAccepted={vi.fn()}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Receber cortesia' }));
    expect(await screen.findByText('Pronto! O ingresso está na sua carteira.')).toBeTruthy();
    expect(m.accept).toHaveBeenCalledWith('c3', 'T'.repeat(43));
  });
});
