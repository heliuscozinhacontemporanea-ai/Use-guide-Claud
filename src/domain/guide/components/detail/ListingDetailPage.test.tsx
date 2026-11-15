import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AnimatePresence } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BOTTOM_NAV_CLEARANCE } from '../../../../shared/constants/bottomNav';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { i18n } from '../../../../shared/i18n';
import { LISTING_CARD_ATTR, LISTING_PHOTO_ATTR } from '../../hooks/listingHeroOrigin';
import type { GuideItem } from '../../types/guide';
import { ListingDetailPage } from './ListingDetailPage';

vi.mock('../../../../ui/components/ShareButton', () => ({ ShareButton: () => null }));
vi.mock('../../../insights', () => ({ trackInteractionUseCase: vi.fn() }));

const ITEM = {
  id: 'buggy',
  name: 'Buggy do Preá',
  category: 'tour',
  location: 'prea',
  images: ['https://images.unsplash.com/a', 'https://images.unsplash.com/b'],
} as GuideItem;

const page = (coversTabBar?: boolean) =>
  render(
    <ListingDetailPage
      item={ITEM}
      onClose={vi.fn()}
      locationLabel="Preá, Ceará"
      coversTabBar={coversTabBar}
    >
      <p>conteúdo</p>
    </ListingDetailPage>
  );

describe('ListingDetailPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('é página da aba: abaixo da barra de abas, sem prender o leitor de tela, com espaço para a barra', async () => {
    page();
    const region = await screen.findByRole('region', { name: 'Buggy do Preá' });
    expect(region).not.toHaveAttribute('aria-modal');
    expect(region.parentElement).toHaveStyle({ zIndex: String(Z_INDEX.tabPage) });
    expect(Z_INDEX.tabPage).toBeLessThan(Z_INDEX.bottomNav);
    expect(Z_INDEX.tabPage).toBeGreaterThan(Z_INDEX.header);
    const content = screen.getByText('conteúdo').parentElement;
    expect(content?.style.paddingBottom).toBe(BOTTOM_NAV_CLEARANCE);
  });

  it('aberto pela busca fica por cima de tudo, como janela à parte', async () => {
    page(true);
    const dialog = await screen.findByRole('dialog', { name: 'Buggy do Preá' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.parentElement).toHaveStyle({ zIndex: String(Z_INDEX.modal) });
  });

  it('o foco vai para o anúncio ao abrir e não volta para ele quando quem abriu atualiza', async () => {
    const view = (onClose: () => void) => (
      <ListingDetailPage item={ITEM} onClose={onClose} locationLabel="Preá, Ceará">
        <input aria-label="participantes" />
      </ListingDetailPage>
    );
    const { rerender } = render(view(vi.fn()));
    const region = await screen.findByRole('region', { name: 'Buggy do Preá' });
    expect(region).toHaveFocus();
    const field = screen.getByRole('textbox', { name: 'participantes' });
    field.focus();
    // A lista atualiza (novo `onClose` a cada render): quem está digitando continua no campo.
    rerender(view(vi.fn()));
    expect(field).toHaveFocus();
  });

  it('o favoritar chega pelo encaixe do app e recebe a rolagem da página', async () => {
    const favorite = vi.fn(() => <span>favoritar</span>);
    render(
      <ListingDetailPage
        item={ITEM}
        onClose={vi.fn()}
        locationLabel="Preá, Ceará"
        favorite={favorite}
      >
        <p>conteúdo</p>
      </ListingDetailPage>
    );
    expect(await screen.findByText('favoritar')).toBeInTheDocument();
    expect(favorite).toHaveBeenCalledWith(expect.objectContaining({ get: expect.any(Function) }));
  });

  it('etiqueta da categoria e texto das fotos no idioma ativo', async () => {
    await i18n.changeLanguage('fr');
    page();
    expect(await screen.findByText('Excursions')).toBeInTheDocument();
    expect(screen.getByAltText('Buggy do Preá, photo 2 sur 2')).toBeInTheDocument();
  });

  describe('a foto sai do cartão e volta para ele', () => {
    // Lados do recorte `inset(...)`, como o CSS abrevia (1 a 4 valores, antes do `round`).
    const insets = (clip = '') => {
      const [t, r = t, b = t, l = r] = (
        (clip.split('round')[0] ?? '').match(/-?[\d.]+(?=px)/g) ?? []
      ).map(Number);
      return [t, r, b, l];
    };
    const isFull = (clip: string) =>
      clip.startsWith('inset(') && insets(clip).every((v) => v === 0);
    const CARD = { left: 16, top: 300, width: 280, height: 280 };
    const HERO = { left: 0, top: 0, width: 1024, height: 460 };
    let cardPhoto: HTMLElement;

    beforeEach(() => {
      const card = document.createElement('button');
      card.setAttribute(LISTING_CARD_ATTR, ITEM.id);
      cardPhoto = document.createElement('span');
      cardPhoto.setAttribute(LISTING_PHOTO_ATTR, '');
      card.append(cardPhoto);
      document.body.append(card);
      // O jsdom não tem layout: o cartão fica na tela e a capa no topo.
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: Element
      ) {
        const rect = this.closest(`[${LISTING_CARD_ATTR}]`) ? CARD : HERO;
        return {
          ...rect,
          x: rect.left,
          y: rect.top,
          right: rect.left + rect.width,
          bottom: rect.top + rect.height,
          toJSON: () => rect,
        };
      });
    });
    afterEach(() => {
      vi.restoreAllMocks();
      document.body.innerHTML = '';
    });

    const toggle = (open: boolean, growsFromCard = true, onClose = vi.fn()) => (
      <AnimatePresence>
        {open && (
          <ListingDetailPage
            item={ITEM}
            onClose={onClose}
            locationLabel="Preá, Ceará"
            growsFromCard={growsFromCard}
          >
            <p>conteúdo</p>
          </ListingDetailPage>
        )}
      </AnimatePresence>
    );

    it('ao abrir, a página começa recortada no cartão e a foto do cartão some; ao fechar, ela volta', async () => {
      const { rerender } = render(toggle(true));
      // Antes do primeiro quadro a página está invisível (sem nome acessível): busca pelo rótulo.
      const region = screen.getByLabelText(ITEM.name, { selector: '[tabindex="-1"]' });
      const clips: string[] = [];
      new MutationObserver(() => clips.push(region.style.clipPath)).observe(region, {
        attributeFilter: ['style'],
      });
      await waitFor(() => expect(cardPhoto.style.visibility).toBe('hidden'));
      // Aberto: a página ocupa a tela inteira, sem recorte.
      await waitFor(() => expect(isFull(region.style.clipPath)).toBe(true), { timeout: 3000 });
      // O primeiro quadro recorta a página no cartão (topo em 300 px, esquerda em 16 px).
      const [top, , , left] = insets(clips.find((clip) => clip.startsWith('inset(')));
      expect(top).toBeGreaterThan(250);
      expect(left).toBeGreaterThan(10);

      rerender(toggle(false));
      await waitFor(() => expect(region.isConnected).toBe(false), { timeout: 3000 });
      // Fechou recolhendo para o cartão, e só então a foto dele volta.
      const [lastTop] = insets(clips.at(-1));
      expect(lastTop).toBeGreaterThan(250);
      expect(cardPhoto.style.visibility).toBe('');
    });

    it('o X recolhe a foto para o cartão e só então fecha (troca o endereço) uma vez', async () => {
      const onClose = vi.fn();
      render(
        <ListingDetailPage item={ITEM} onClose={onClose} locationLabel="Preá, Ceará">
          <p>conteúdo</p>
        </ListingDetailPage>
      );
      const region = await screen.findByRole('region', { name: ITEM.name });
      await waitFor(() => expect(isFull(region.style.clipPath)).toBe(true), { timeout: 3000 });
      const closeButton = screen.getByRole('button', { name: i18n.t('common.close') });
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      expect(onClose).not.toHaveBeenCalled();
      // Os toques já passam para a lista enquanto a foto volta.
      await waitFor(() => expect(region.parentElement?.style.pointerEvents).toBe('none'));
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), { timeout: 3000 });
      // Pousou no cartão (topo em 300 px) e a foto dele já voltou.
      expect(insets(region.style.clipPath)[0]).toBeGreaterThan(290);
      expect(cardPhoto.style.visibility).toBe('');
    });

    it('se outro anúncio abre enquanto a foto volta, o fechar atrasado não fecha o novo', async () => {
      const onClose = vi.fn();
      const { rerender } = render(toggle(true, true, onClose));
      const region = await screen.findByRole('region', { name: ITEM.name });
      await waitFor(() => expect(isFull(region.style.clipPath)).toBe(true), { timeout: 3000 });
      fireEvent.click(screen.getByRole('button', { name: i18n.t('common.close') }));
      // Outro cartão tocado: a lista troca o anúncio aberto antes de a foto pousar.
      rerender(toggle(false, true, onClose));
      await waitFor(() => expect(region.isConnected).toBe(false), { timeout: 3000 });
      expect(onClose).not.toHaveBeenCalled();
      expect(cardPhoto.style.visibility).toBe('');
    });

    it('sem toque no cartão (link ou voltar), só esmaece e não mexe no cartão', async () => {
      render(toggle(true, false));
      const region = await screen.findByRole('region', { name: ITEM.name });
      expect(region.style.clipPath).toBe('none');
      await waitFor(() => expect(region.style.opacity).toBe('1'), { timeout: 3000 });
      expect(cardPhoto.style.visibility).toBe('');
    });
  });
});
