import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResetPassword } from './ResetPassword';
import * as authFactory from '../factory';

vi.mock('../factory', () => ({
  verifyPasswordResetCodeUseCase: vi.fn(),
  confirmPasswordResetUseCase: vi.fn(),
}));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error state when oobCode is missing from URL', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/link de recuperação inválido ou expirado/i)).toBeInTheDocument();
    });
  });

  it('verifies oobCode successfully and renders new password form without phone field', async () => {
    vi.mocked(authFactory.verifyPasswordResetCodeUseCase).mockResolvedValue('user@example.com');

    render(
      <MemoryRouter initialEntries={['/reset-password?oobCode=valid-code-123']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nova senha *')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirmar nova senha *')).toBeInTheDocument();
    });

    // Ensure no phone fields exist
    expect(screen.queryByPlaceholderText(/telefone/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/celular/i)).not.toBeInTheDocument();
  });

  it('validates password requirements and confirms reset', async () => {
    vi.mocked(authFactory.verifyPasswordResetCodeUseCase).mockResolvedValue('user@example.com');
    vi.mocked(authFactory.confirmPasswordResetUseCase).mockResolvedValue();

    render(
      <MemoryRouter initialEntries={['/reset-password?oobCode=valid-code-123']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nova senha *')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('Nova senha *');
    const confirmInput = screen.getByPlaceholderText('Confirmar nova senha *');
    const submitBtn = screen.getByRole('button', { name: /salvar senha/i });

    fireEvent.change(passwordInput, { target: { value: 'StrongP@ss1' } });
    fireEvent.change(confirmInput, { target: { value: 'StrongP@ss1' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authFactory.confirmPasswordResetUseCase).toHaveBeenCalledWith(
        'valid-code-123',
        'StrongP@ss1'
      );
      expect(screen.getByText(/sucesso!/i)).toBeInTheDocument();
    });
  });
});
