import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UsernameForm } from './UsernameForm';

const username = {
  current: null,
  changedAt: null,
  suggestion: 'ana',
  loading: false,
  save: vi.fn(),
} as unknown as Parameters<typeof UsernameForm>[0]['username'];

describe('campo do @ (D21, D35)', () => {
  it('troca o espaço digitado por sublinhado', () => {
    render(<UsernameForm username={username} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'conta teste' } });
    expect((input as HTMLInputElement).value).toBe('conta_teste');
  });
});
