import { describe, expect, it } from 'vitest';
import { getAuthErrorMessage } from './authErrorMapper';

describe('getAuthErrorMessage', () => {
  it('traduz pelo código do Firebase, também quando ele vem só na mensagem', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe(
      'auth.errors.wrongCredentials'
    );
    expect(getAuthErrorMessage({ message: 'Firebase: Error (auth/email-already-in-use).' })).toBe(
      'auth.errors.emailInUse'
    );
  });

  it('janela do Google fechada não mostra nada; e-mail sem cadastro fica em branco', () => {
    expect(getAuthErrorMessage({ code: 'auth/popup-closed-by-user' })).toBeNull();
    expect(getAuthErrorMessage({ code: 'auth/user-not-found' })).toBe('');
  });

  it('mensagem desconhecida ou interna nunca chega à tela (§10.2)', () => {
    expect(getAuthErrorMessage(new Error('Internal: stack at foo'))).toBe('auth.errors.generic');
    expect(getAuthErrorMessage('qualquer texto')).toBe('auth.errors.generic');
  });
});
