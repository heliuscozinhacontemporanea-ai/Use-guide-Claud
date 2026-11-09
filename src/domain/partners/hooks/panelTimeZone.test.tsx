import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { PanelTimeZoneProvider, usePanelItemTime } from './panelTimeZone';

const wrapper = ({ children }: { children: ReactNode }) => (
  <PanelTimeZoneProvider
    timeZone="America/Fortaleza"
    establishments={[
      { id: 'jeri', timeZone: 'America/Fortaleza' },
      { id: 'manaus', timeZone: 'America/Manaus' },
    ]}
  >
    {children}
  </PanelTimeZoneProvider>
);

describe('usePanelItemTime', () => {
  it('hora do lugar do item, com o fuso só quando é outro que o do painel', () => {
    const { result } = renderHook(() => usePanelItemTime('pt-BR'), { wrapper });
    const at = '2026-11-08T23:00:00.000Z';
    expect(result.current({ establishmentIds: ['jeri'] }, at)).toBe('20:00');
    expect(result.current({ establishmentIds: ['manaus'] }, at)).toBe('19:00 (UTC−4)');
    expect(result.current({ establishmentIds: [] }, at)).toBe('20:00');
  });
});
