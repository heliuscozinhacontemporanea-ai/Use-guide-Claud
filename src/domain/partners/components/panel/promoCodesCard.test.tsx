import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { PartnerHomeCards } from './PartnerHomeCards';

describe('cartão Cupons no Início', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra ativos, usos, o mais usado e o alerta; o toque abre a área Cupons', () => {
    const onOpenCoupons = vi.fn();
    const onOpenTab = vi.fn();
    render(
      <PartnerHomeCards
        cards={[
          {
            id: 'promo_codes',
            summary: {
              active: 2,
              weekUses: 15,
              top: { code: 'VERAO10', uses: 12 },
              alert: { code: 'AMIGOS', kind: 'running_out', used: 45, max: 50 },
            },
          },
        ]}
        manyEstablishments={false}
        labelFor={() => null}
        onOpenTab={onOpenTab}
        onOpenCoupons={onOpenCoupons}
        onCustomize={vi.fn()}
      />
    );
    expect(screen.getByText('2 ativos')).toBeTruthy();
    expect(screen.getByText('15 usos em 7 dias')).toBeTruthy();
    expect(screen.getByText('Mais usado: VERAO10 · 12')).toBeTruthy();
    expect(screen.getByText('AMIGOS esgotando (45 de 50)')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Cupons/ }));
    expect(onOpenCoupons).toHaveBeenCalled();
    expect(onOpenTab).not.toHaveBeenCalled();
  });
});
