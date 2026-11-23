import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';

const m = vi.hoisted(() => ({
  catalog: { items: [] as unknown[], events: [], isLoading: false, error: null, retry: () => {} },
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
}));

vi.mock('../../../domain/admin', () => ({ useAdminGuideCatalog: () => m.catalog }));
vi.mock('../../../domain/partners', () => ({
  createPartnerContentItemUseCase: m.create,
  updatePartnerContentItemUseCase: m.update,
  deletePartnerContentItemUseCase: m.remove,
  ListingPhotosField: ({ onChange }: { onChange: (images: string[]) => void }) => (
    <button type="button" onClick={() => onChange(['https://img.test/a.webp'])}>
      foto
    </button>
  ),
}));
vi.mock('./adminStack', () => ({ adminPages: { push: m.push, back: m.back } }));

import { AdminGuideTab } from './AdminGuideTab';
import { AdminTipPage } from './AdminTipPage';

const item = (id: string, name: string, ownerId: string, category = 'restaurant', extra = {}) => ({
  id,
  name,
  ownerId,
  category,
  description: '',
  image: '',
  location: 'Preá',
  publication: 'published',
  ...extra,
});

describe('Guia local do admin (F4)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    m.push.mockReset();
    m.catalog.items = [
      item('a', 'Cantinho do Preá', 'useguide'),
      item('b', 'Quadri Jeri', 'partner-1', 'rental'),
      item('c', 'Pôr do sol', 'useguide', 'tips'),
      item('d', 'Pousada Maresia', 'useguide', 'hotel', { publication: 'draft' }),
    ];
  });

  it('filtra por dono e por dica, e marca rascunho, Use Guide e parceiro', () => {
    render(<AdminGuideTab />);
    expect(screen.getByText('Rascunho')).toBeTruthy();
    expect(screen.getAllByText('Use Guide')).toHaveLength(1);
    expect(screen.getByText('Parceiro')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'De parceiros' }));
    expect(screen.queryByText('Cantinho do Preá')).toBeNull();
    expect(screen.getByText('Quadri Jeri')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Dicas' }));
    expect(screen.getByText('Pôr do sol')).toBeTruthy();
    expect(screen.queryByText('Quadri Jeri')).toBeNull();
  });

  it('abre o editor do anúncio, a dica e o novo anúncio', () => {
    render(<AdminGuideTab />);
    fireEvent.click(screen.getByRole('button', { name: /Quadri Jeri/ }));
    expect(m.push).toHaveBeenLastCalledWith({ view: 'listing-editor', itemId: 'b' });
    fireEvent.click(screen.getByRole('button', { name: /Pôr do sol/ }));
    expect(m.push).toHaveBeenLastCalledWith({ view: 'tip', itemId: 'c' });
    fireEvent.click(screen.getByRole('button', { name: /Novo anúncio/ }));
    expect(m.push).toHaveBeenLastCalledWith({ view: 'listing-new' });
  });
});

describe('Nova dica (F4)', () => {
  it('pede título, texto e foto; publica como dica', async () => {
    let save: (() => void) | null = null;
    render(<AdminTipPage registerSave={(next) => (save = next)} />);
    save?.();
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(m.create).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Pôr do sol na Duna' } });
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'Chegue cedo.' } });
    fireEvent.click(screen.getByRole('button', { name: 'foto' }));
    m.create.mockResolvedValue('tip-1');
    save?.();
    await waitFor(() =>
      expect(m.create).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'tips', name: 'Pôr do sol na Duna' })
      )
    );
  });
});
