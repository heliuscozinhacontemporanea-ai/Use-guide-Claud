import { describe, expect, it } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { deleteAccountFeedbackKey } from './deleteAccountFeedback';

const blocked = (blockers: string[]) =>
  Object.assign(new Error('ACCOUNT_HAS_ACTIVE_SALES'), {
    code: 'ACCOUNT_HAS_ACTIVE_SALES',
    blockers,
  });

describe('deleteAccountFeedbackKey', () => {
  it('conta com vendas em andamento: mostra o primeiro motivo a resolver', () => {
    expect(deleteAccountFeedbackKey(blocked(['sessions', 'payouts']))).toBe(
      'account.feedback.closureSessions'
    );
    expect(deleteAccountFeedbackKey(blocked(['debts']))).toBe('account.feedback.closureDebts');
    expect(deleteAccountFeedbackKey(blocked(['payouts']))).toBe('account.feedback.closurePayouts');
    expect(deleteAccountFeedbackKey(blocked([]))).toBe('account.feedback.closureBookings');
  });

  it('login e Google seguem como antes; o resto é a falha genérica', () => {
    expect(deleteAccountFeedbackKey({ code: 'auth/wrong-password' })).toBe(
      'account.feedback.wrongPassword'
    );
    expect(deleteAccountFeedbackKey(new Error('REAUTHENTICATION_REQUIRED'))).toBe(
      'account.feedback.recentLogin'
    );
    expect(deleteAccountFeedbackKey({ code: 'auth/popup-closed-by-user' })).toBe(
      'account.feedback.googleCanceled'
    );
    expect(deleteAccountFeedbackKey(new Error('qualquer'))).toBe('account.feedback.deleteError');
    expect(deleteAccountFeedbackKey(undefined)).toBe('account.feedback.deleteError');
  });

  it('as mensagens existem nos 3 idiomas', async () => {
    for (const lng of ['pt-BR', 'en', 'fr']) {
      await i18n.changeLanguage(lng);
      for (const key of ['Bookings', 'Sessions', 'Debts', 'Payouts']) {
        expect(i18n.exists(`account.feedback.closure${key}`)).toBe(true);
      }
    }
    await i18n.changeLanguage('pt-BR');
  });
});
