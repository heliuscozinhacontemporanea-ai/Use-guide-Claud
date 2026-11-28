import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { BottomNav } from './BottomNav';

describe('BottomNav (D37, P23)', () => {
  it('mostra as três abas com nome, e a categoria acende a aba dela', () => {
    render(
      <MemoryRouter initialEntries={['/passeios']}>
        <BottomNav />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      i18n.t('navigation.explore'),
      i18n.t('navigation.experiences'),
      i18n.t('navigation.services'),
    ]);
    const experiences = screen.getByRole('link', { name: i18n.t('navigation.experiences') });
    expect(experiences.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: i18n.t('navigation.explore') })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('a aba volta para a pílula e o anúncio que estavam abertos nela', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <BottomNav
          rememberedPlace={(tab) =>
            tab === 'services' ? { routeKey: 'stays', search: '?item=x1&type=item' } : null
          }
        />
      </MemoryRouter>
    );
    const services = screen.getByRole('link', { name: i18n.t('navigation.services') });
    expect(services.getAttribute('href')).toBe('/pousadas?item=x1&type=item');
    const experiences = screen.getByRole('link', { name: i18n.t('navigation.experiences') });
    expect(experiences.getAttribute('href')).toBe('/experiencias');
  });

  it('tocar na aba ativa chama onReselect em vez de navegar', () => {
    const onReselect = vi.fn();
    render(
      <MemoryRouter initialEntries={['/info']}>
        <BottomNav onReselect={onReselect} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('link', { name: i18n.t('navigation.explore') }));
    expect(onReselect).toHaveBeenCalledTimes(1);
  });

  it('segue o idioma da URL', () => {
    render(
      <MemoryRouter initialEntries={['/fr']}>
        <BottomNav />
      </MemoryRouter>
    );
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/fr',
      '/fr/experiences',
      '/fr/services',
    ]);
  });
});
