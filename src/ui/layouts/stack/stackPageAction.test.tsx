import { render } from '@testing-library/react';
import { Bell } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { StackActionsContext, StackPageKeyContext, useStackPageAction } from './stackPageAction';
import type { StackAction } from './stackTypes';

function Screen({ onClick, report }: { onClick: () => void; report: (inStack: boolean) => void }) {
  report(useStackPageAction({ label: 'Atualizar', icon: Bell, onClick }));
  return null;
}

describe('useStackPageAction', () => {
  it('fora da folha não registra nada e avisa a tela para desenhar o próprio botão', () => {
    const report = vi.fn();
    render(<Screen onClick={vi.fn()} report={report} />);
    expect(report).toHaveBeenLastCalledWith(false);
  });

  it('na folha registra a ação da tela pela chave e a remove ao sair', () => {
    const setAction = vi.fn<(key: string, action: StackAction | null) => void>();
    const onClick = vi.fn();
    const report = vi.fn();
    const { unmount } = render(
      <StackActionsContext.Provider value={setAction}>
        <StackPageKeyContext.Provider value="tickets">
          <Screen onClick={onClick} report={report} />
        </StackPageKeyContext.Provider>
      </StackActionsContext.Provider>
    );
    expect(report).toHaveBeenLastCalledWith(true);
    const [key, action] = setAction.mock.calls[0] ?? [];
    expect(key).toBe('tickets');
    expect(action?.label).toBe('Atualizar');
    action?.onClick();
    expect(onClick).toHaveBeenCalledTimes(1);
    unmount();
    expect(setAction).toHaveBeenLastCalledWith('tickets', null);
  });
});
