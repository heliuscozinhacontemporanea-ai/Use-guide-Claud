import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { ListingStep } from '../../types/partnerHome';
import { NewListingPage } from '../join/NewListingPage';
import { ListingEditorPage } from './ListingEditorPage';
import { ListingStepPage } from './ListingStepPage';

const m = vi.hoisted(() => ({
  contact: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}));
vi.mock('../../application/usecases/getPartnerItemContactUseCase', () => ({
  getPartnerItemContactUseCase: m.contact,
}));
vi.mock('../../application/usecases/deletePartnerContentItemUseCase', () => ({
  deletePartnerContentItemUseCase: m.remove,
}));
vi.mock('../../application/usecases/updatePartnerContentItemUseCase', () => ({
  updatePartnerContentItemUseCase: m.update,
}));
vi.mock('../../application/usecases/createPartnerContentItemUseCase', () => ({
  createPartnerContentItemUseCase: m.create,
}));

const tour = {
  id: 'item-1',
  name: 'Buggy do Preá',
  category: 'tour',
  city: 'Cruz',
  state: 'CE',
  description: 'Passeio pelas dunas',
  image: 'a',
  images: ['a', 'b', 'c'],
  location: 'Praia do Preá',
  address: 'Rua da Praia, 10',
  operationalInfo: { languages: ['Português', 'Inglês'] },
} as unknown as PartnerContentRecord;

const steps: ListingStep[] = [
  { id: 'name', done: true, missing: [] },
  { id: 'photos', done: true, missing: [] },
  { id: 'about', done: true, missing: [] },
  { id: 'where', done: true, missing: [] },
  { id: 'details', done: false, missing: ['luggage'] },
];

describe('ListingEditorPage (F2)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    m.contact.mockResolvedValue({ phone: '+5588999990000' });
  });
  afterEach(() => vi.clearAllMocks());

  it('lista os blocos com o resumo e o ✓ ou o que falta, pela regra do guia', async () => {
    const onOpenBlock = vi.fn();
    render(
      <ListingEditorPage
        item={tour}
        steps={steps}
        publication="published"
        onOpenBlock={onOpenBlock}
        onDeleted={vi.fn()}
      />
    );
    expect(screen.getByText('Publicado no guia')).toBeInTheDocument();
    const name = screen.getByRole('button', { name: /Nome e cidade/ });
    expect(name).toHaveTextContent('Buggy do Preá · Cruz');
    expect(name).toHaveTextContent('Completo');
    expect(screen.getByRole('button', { name: /Fotos/ })).toHaveTextContent('3 fotos');
    expect(screen.getByRole('button', { name: /Sobre/ })).toHaveTextContent('Português, Inglês');
    expect(screen.getByRole('button', { name: /Detalhes do passeio/ })).toHaveTextContent(
      'Falta: o que levar ou a bagagem'
    );
    // Passeio vende pelo app: sem Instagram e site (C2).
    expect(screen.queryByRole('button', { name: /Contatos e links/ })).toBeNull();
    expect(screen.getByText(/não mostra Instagram nem site/)).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /WhatsApp do negócio.*\(88\) 99999-0000/ })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Fotos/ }));
    expect(onOpenBlock).toHaveBeenCalledWith('photos', 'Fotos');
  });

  it('rascunho e perfil de produtor: sem Onde fica e Detalhes, com o aviso de rascunho', () => {
    render(
      <ListingEditorPage
        item={{ ...tour, category: 'producer' } as PartnerContentRecord}
        steps={steps.slice(0, 3)}
        publication="draft"
        onOpenBlock={vi.fn()}
        onDeleted={vi.fn()}
      />
    );
    expect(screen.getByText('Rascunho: ainda fora do guia')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Onde fica/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Detalhes/ })).toBeNull();
  });

  it('com muitos campos em aberto, a linha mostra quantos faltam', () => {
    render(
      <ListingEditorPage
        item={tour}
        steps={[{ id: 'details', done: false, missing: ['itinerary', 'luggage', 'activities'] }]}
        publication="draft"
        onOpenBlock={vi.fn()}
        onDeleted={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /Detalhes do passeio/ })).toHaveTextContent(
      'Faltam 3 itens'
    );
  });

  it('excluir pede confirmação, apaga e avisa quem abriu', async () => {
    const onDeleted = vi.fn();
    m.remove.mockResolvedValue(undefined);
    render(
      <ListingEditorPage
        item={tour}
        steps={steps}
        publication="published"
        onOpenBlock={vi.fn()}
        onDeleted={onDeleted}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Excluir anúncio' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Excluir "Buggy do Preá"?');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir anúncio' }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    expect(m.remove).toHaveBeenCalledWith('item-1');
  });

  it.each([
    ['LISTING_HAS_BOOKINGS', /tem reservas ativas.*Pausar no guia/],
    ['LISTING_HAS_EVENTS', /tem eventos ligados.*Pausar no guia/],
  ])('anúncio preso (%s): não sai e a página diz o que fazer', async (code, text) => {
    const onDeleted = vi.fn();
    m.remove.mockRejectedValue(new Error(code));
    render(
      <ListingEditorPage
        item={tour}
        steps={steps}
        publication="published"
        onOpenBlock={vi.fn()}
        onDeleted={onDeleted}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Excluir anúncio' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir anúncio' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(text);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('falha ao excluir fica na página, com o aviso', async () => {
    const onDeleted = vi.fn();
    m.remove.mockRejectedValue(new Error('INTERNAL_ERROR'));
    render(
      <ListingEditorPage
        item={tour}
        steps={steps}
        publication="published"
        onOpenBlock={vi.fn()}
        onDeleted={onDeleted}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Excluir anúncio' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir anúncio' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir agora. Tente de novo.'
    );
    expect(onDeleted).not.toHaveBeenCalled();
  });
});

describe('blocos pelo editor (F2)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    m.update.mockResolvedValue(undefined);
  });
  afterEach(() => vi.clearAllMocks());

  const open = (step: 'name' | 'phone') => {
    let save: (() => void) | null = null;
    const onSaved = vi.fn();
    render(
      <ListingStepPage
        item={tour}
        step={step}
        steps={steps}
        mode="editor"
        registerSave={(fn) => {
          save = fn;
        }}
        onSaved={onSaved}
      />
    );
    return { save: () => (save as unknown as () => void)(), onSaved };
  };

  it('Nome: a categoria aparece travada, sem "Passo X de N", e salva nome e cidade', async () => {
    const { save, onSaved } = open('name');
    expect(screen.getByText('Passeios')).toBeInTheDocument();
    expect(screen.queryByText(/Passo \d de \d/)).toBeNull();
    fireEvent.change(screen.getByLabelText('Nome do negócio'), {
      target: { value: 'Buggy Vento Leste' },
    });
    save();
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(m.update).toHaveBeenCalledWith('item-1', {
      name: 'Buggy Vento Leste',
      state: 'CE',
      city: 'Cruz',
    });
  });

  it('Nome vazio não salva e diz o que falta', async () => {
    const { save, onSaved } = open('name');
    fireEvent.change(screen.getByLabelText('Nome do negócio'), { target: { value: ' ' } });
    save();
    expect(await screen.findByRole('alert')).toHaveTextContent('Escreva o nome.');
    expect(m.update).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('WhatsApp: lê o telefone guardado no servidor e grava em E.164', async () => {
    m.contact.mockResolvedValue({ phone: '+5588999990000' });
    const { save, onSaved } = open('phone');
    await waitFor(() => expect(m.contact).toHaveBeenCalledWith('item-1'));
    expect(await screen.findByDisplayValue('(88) 99999-0000')).toBeInTheDocument();
    save();
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(m.update).toHaveBeenCalledWith('item-1', { phone: '+5588999990000' });
  });

  it('WhatsApp vazio não salva', async () => {
    m.contact.mockResolvedValue({ phone: null });
    const { save } = open('phone');
    await waitFor(() => expect(m.contact).toHaveBeenCalled());
    save();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Escreva um telefone válido, com DDD.'
    );
    expect(m.update).not.toHaveBeenCalled();
  });
});

describe('NewListingPage (F2)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    m.create.mockResolvedValue('new-1');
  });
  afterEach(() => vi.clearAllMocks());

  it('sem os Termos e sem o perfil de produtor; cria o rascunho e avisa quem abriu', async () => {
    const onCreated = vi.fn();
    render(<NewListingPage onCreated={onCreated} />);
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByRole('button', { name: /Eventos/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Hospedagem/ }));
    fireEvent.change(screen.getByLabelText('Nome do negócio'), {
      target: { value: 'Pousada Brisa' },
    });
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'CE' } });
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Jijoca' } });
    fireEvent.change(screen.getByPlaceholderText('(85) 99999-9999'), {
      target: { value: '88999990001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith('new-1'));
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pousada Brisa',
        category: 'hotel',
        state: 'CE',
        city: 'Jijoca',
        phone: '+5588999990001',
      })
    );
  });

  it('pelo "Também trabalha com…?", oferece só a categoria escolhida, inclusive produtor', () => {
    render(<NewListingPage categories={['producer']} onCreated={vi.fn()} />);
    const choices = screen
      .getAllByRole('button', { pressed: true })
      .map((button) => button.textContent);
    expect(choices).toEqual([expect.stringMatching(/Eventos/)]);
    expect(screen.queryByRole('button', { name: /Hospedagem/ })).toBeNull();
  });
});
