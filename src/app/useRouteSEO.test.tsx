import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { GuideItem } from '../domain/guide';
import { i18n } from '../shared/i18n';
import { useRouteSEO } from './useRouteSEO';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/passeios']}>{children}</MemoryRouter>
);

describe('useRouteSEO', () => {
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('título do anúncio aberto e das camadas no idioma ativo', async () => {
    await i18n.changeLanguage('en');
    const item = { id: 'i1', name: 'Buggy do Preá', category: 'tour', location: '' } as GuideItem;
    const { rerender } = renderHook((props) => useRouteSEO(props), {
      wrapper,
      initialProps: {
        selectedItem: item as GuideItem | null,
        isAdminOpen: false,
        isPartnersOpen: false,
      },
    });
    expect(document.title).toContain('Buggy do Preá | Jericoacoara Guide');

    rerender({
      selectedItem: null,
      isAdminOpen: false,
      isPartnersOpen: true,
    });
    expect(document.title).toContain('Become a partner');
  });
});
