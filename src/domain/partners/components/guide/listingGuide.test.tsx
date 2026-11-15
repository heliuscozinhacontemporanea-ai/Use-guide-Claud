import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { ListingIncompleteError } from '../../errors/listingIncompleteError';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerFirstSteps } from '../../types/partnerHome';
import { PartnerListingGuideCard } from '../panel/PartnerListingGuideCard';
import { ListingStepPage } from './ListingStepPage';

const update = vi.hoisted(() => vi.fn());
vi.mock('../../application/usecases/updatePartnerContentItemUseCase', () => ({
  updatePartnerContentItemUseCase: update,
}));

const draft: PartnerFirstSteps = {
  segment: 'lodging',
  title: 'complete',
  listing: {
    itemId: 'item-1',
    name: 'Pousada Brisa',
    publication: 'draft',
    steps: [
      { id: 'name', done: true, missing: [] },
      { id: 'photos', done: false, missing: ['images'] },
      { id: 'about', done: false, missing: ['description', 'languages'] },
    ],
  },
  steps: [{ id: 'verify', done: false, itemId: 'item-1' }],
};

const item = {
  id: 'item-1',
  name: 'Pousada Brisa',
  category: 'hotel',
  description: '',
  image: '',
  images: [],
  location: '',
  operationalInfo: {},
} as unknown as PartnerContentRecord;

describe('PartnerListingGuideCard', () => {
  beforeEach(() => void i18n.changeLanguage('pt-BR'));

  it('rascunho: título, etiqueta, nome do anúncio e o primeiro passo aberto como "Continuar"', () => {
    const onOpenListingStep = vi.fn();
    render(
      <PartnerListingGuideCard
        data={draft}
        onOpenListingStep={onOpenListingStep}
        onOpenStep={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: /Seu anúncio/ })).toHaveTextContent('Rascunho');
    expect(screen.getByText('Pousada Brisa')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('button', { name: 'Nome e cidade, feito' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Fotos/ }));
    expect(onOpenListingStep).toHaveBeenCalledWith('photos', 'Fotos');
  });

  it('publicar fica bloqueado até os passos acima estarem completos', () => {
    render(
      <PartnerListingGuideCard data={draft} onOpenListingStep={vi.fn()} onOpenStep={vi.fn()} />
    );
    const publish = screen.getByRole('button', { name: /Publicar no guia/ });
    expect(publish).toBeDisabled();
    expect(publish).toHaveTextContent('Depois dos passos acima');
  });

  it('vitrine: o grupo de venda vira "Selo de verificado"', () => {
    render(
      <PartnerListingGuideCard data={draft} onOpenListingStep={vi.fn()} onOpenStep={vi.fn()} />
    );
    expect(screen.getByText('Selo de verificado')).toBeInTheDocument();
  });
});

describe('ListingStepPage', () => {
  beforeEach(() => {
    void i18n.changeLanguage('pt-BR');
    update.mockReset();
  });
  afterEach(() => vi.clearAllMocks());

  it('a barra salva só os campos do passo e volta ao Início', async () => {
    let save: (() => void) | null = null;
    const onSaved = vi.fn();
    update.mockResolvedValue(undefined);
    render(
      <ListingStepPage
        item={item}
        step="about"
        steps={draft.listing.steps}
        registerSave={(fn) => {
          save = fn;
        }}
        onSaved={onSaved}
      />
    );
    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: 'Pousada pé na areia' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Inglês' }));
    expect(screen.getByText(/Falta: a descrição e os idiomas/)).toBeInTheDocument();
    expect(screen.getByText('Passo 3 de 4')).toBeInTheDocument();
    (save as unknown as () => void)();
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(update).toHaveBeenCalledWith('item-1', {
      description: 'Pousada pé na areia',
      operationalInfo: { languages: ['Inglês'] },
    });
  });

  it('anúncio publicado: o servidor recusa e a página diz o que falta', async () => {
    let save: (() => void) | null = null;
    update.mockRejectedValue(new ListingIncompleteError([{ id: 'photos', missing: ['images'] }]));
    render(
      <ListingStepPage
        item={item}
        step="photos"
        steps={draft.listing.steps}
        registerSave={(fn) => {
          save = fn;
        }}
        onSaved={vi.fn()}
      />
    );
    (save as unknown as () => void)();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O anúncio está no guia: preencha uma foto antes de salvar.'
    );
  });
});
