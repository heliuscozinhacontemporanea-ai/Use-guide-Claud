import { describe, expect, it } from 'vitest';
import { splitE164, toE164, whatsAppUrl } from './phone';

describe('telefone em E.164', () => {
  it('monta E.164 a partir do DDI e do número com máscara', () => {
    expect(toE164('+55', '(88) 99999-9999')).toBe('+5588999999999');
    expect(toE164('+351', '912 345 678')).toBe('+351912345678');
    expect(toE164('+55', '')).toBeUndefined();
    expect(toE164('+55', '123')).toBeUndefined();
  });

  it('separa DDI e número para a edição, preferindo o DDI mais longo conhecido', () => {
    expect(splitE164('+5588999999999')).toEqual({ ddi: '+55', nationalNumber: '88999999999' });
    expect(splitE164('+351912345678')).toEqual({ ddi: '+351', nationalNumber: '912345678' });
    expect(splitE164(undefined)).toEqual({ ddi: '+55', nationalNumber: '' });
  });

  it('link do WhatsApp só para telefone válido', () => {
    expect(whatsAppUrl('+5588999999999')).toBe('https://wa.me/5588999999999');
    expect(whatsAppUrl('+5588999999999', 'Olá!')).toBe(
      'https://wa.me/5588999999999?text=Ol%C3%A1!'
    );
    expect(whatsAppUrl('(88) 99999-9999')).toBeNull();
    expect(whatsAppUrl(undefined)).toBeNull();
  });
});
