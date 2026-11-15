import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { CheckoutModal } from './CheckoutModal';

vi.mock('./subcomponents/SubscriptionPlanCheckout', () => ({
  SubscriptionPlanCheckout: () => <p>assinatura</p>,
}));
vi.mock('./subcomponents/OneTimePlanCheckout', () => ({
  OneTimePlanCheckout: () => <p>pagamento único</p>,
}));

describe('CheckoutModal (folha do plano, D33)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('abre como folha com o estabelecimento e o total; Continuar leva ao meio escolhido', () => {
    render(
      <CheckoutModal
        isOpen
        onClose={vi.fn()}
        itemId="i1"
        planId="annual"
        itemName="Buggy do Preá"
        amountMinor={47880}
      />
    );
    const dialog = screen.getByRole('dialog', { name: i18n.t('payment.checkout.title') });
    expect(dialog).toHaveTextContent('Buggy do Preá');
    expect(dialog).toHaveTextContent(/478,80/);
    fireEvent.click(screen.getByRole('button', { name: i18n.t('payment.checkout.continue') }));
    expect(screen.getByText('assinatura')).toBeInTheDocument();
  });

  it('fechada, não mostra nada', () => {
    render(
      <CheckoutModal
        isOpen={false}
        onClose={vi.fn()}
        itemId="i1"
        planId="annual"
        itemName="Buggy do Preá"
        amountMinor={47880}
      />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
