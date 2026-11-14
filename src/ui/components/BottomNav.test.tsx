import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { BottomNav } from './BottomNav';

describe('BottomNav (P23)', () => {
  // O jsdom não implementa a rolagem de elementos, que a barra usa para centralizar a aba ativa.
  beforeAll(() => {
    Element.prototype.scrollTo = vi.fn();
  });

  it('a aba volta para a página que estava aberta nela', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <BottomNav searchFor={(path) => (path === '/' ? '' : '?item=x1&type=item')} />
      </MemoryRouter>
    );
    const events = screen.getByRole('link', { name: i18n.t('navigation.events') });
    expect(events.getAttribute('href')).toMatch(/\?item=x1&type=item$/);
  });

  it('tocar na aba ativa chama onReselect em vez de navegar', () => {
    const onReselect = vi.fn();
    render(
      <MemoryRouter initialEntries={['/']}>
        <BottomNav onReselect={onReselect} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('link', { name: i18n.t('navigation.explore') }));
    expect(onReselect).toHaveBeenCalledTimes(1);
  });
});
