import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LoginModal } from './LoginModal';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginModal Component', () => {
  const mockLogin = vi.fn();
  const mockSignUp = vi.fn();
  const mockLoginWithGoogle = vi.fn();
  const mockForgotPassword = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      signUp: mockSignUp,
      loginWithGoogle: mockLoginWithGoogle,
      forgotPassword: mockForgotPassword,
    });
  });

  const renderModal = () =>
    render(
      <MemoryRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

  it('renders login form by default with email and password fields', () => {
    renderModal();

    expect(screen.getByPlaceholderText('Seu e-mail cadastrado')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('shows accessible validation errors when submitting empty login form', async () => {
    renderModal();

    const submitButton = screen.getByRole('button', { name: /^login$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('handles successful login submission', async () => {
    mockLogin.mockResolvedValueOnce({ user: { uid: 'test-123', email: 'user@test.com' } });

    renderModal();

    const emailInput = screen.getByPlaceholderText('Seu e-mail cadastrado');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123');
    });
  });

  it('displays API error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: 'Senha incorreta',
    });

    renderModal();

    const emailInput = screen.getByPlaceholderText('Seu e-mail cadastrado');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha incorreta')).toBeInTheDocument();
    });
  });

  it('renders register button with text Cadastrar when switching to register tab', async () => {
    renderModal();

    const registerTab = screen.getByRole('tab', { name: /cadastro/i });
    fireEvent.click(registerTab);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^cadastrar$/i })).toBeInTheDocument();
    });
  });
});
