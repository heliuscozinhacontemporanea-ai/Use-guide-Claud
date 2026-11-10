import { describe, expect, it } from 'vitest';
import { findContactsInText as frontend } from '../../../src/shared/utils/contactInText';
import { findContactsInText } from './contactInText';

const FOUND: Array<[string, string[]]> = [
  ['Reserve pelo (88) 99999-0000.', ['(88) 99999-0000']],
  ['Chame no +55 88 99999 0000', ['+55 88 99999 0000']],
  ['zap 88999990000', ['88999990000']],
  ['Pix buggy@preamail.com', ['buggy@preamail.com']],
  ['Pix 123.456.789-09', ['123.456.789-09']],
  ['CNPJ 12.345.678/0001-90 para Pix', ['12.345.678/0001-90']],
  ['chave 123e4567-e89b-12d3-a456-426614174000', ['123e4567-e89b-12d3-a456-426614174000']],
  ['Veja www.buggydoprea.com.br', ['www.buggydoprea.com.br']],
  ['Site buggydoprea.com.br/reservas', ['buggydoprea.com.br/reservas']],
  ['https://wa.me/5588999990000', ['https://wa.me/5588999990000']],
  ['Siga @buggydoprea no Instagram', ['@buggydoprea']],
];

const CLEAN = [
  'Saída às 08:00, volta às 12:30, de 10/11/2026 a 15/11/2026.',
  'Passeio de 4 h por R$ 1.230,00 para até 4 pessoas.',
  'Temporada 2025-2026 na Lagoa do Paraíso, km 12 da CE-085.',
  'Leve protetor solar, água e roupa de banho.',
];

describe('contato no texto (C2/B37)', () => {
  it.each(FOUND)('acha o contato em "%s"', (text, expected) => {
    expect(findContactsInText(text)).toEqual(expected);
  });

  it.each(CLEAN)('não acusa texto comum: "%s"', (text) => {
    expect(findContactsInText(text)).toEqual([]);
  });

  it('frontend e backend dão o mesmo resultado', () => {
    for (const text of [...FOUND.map(([value]) => value), ...CLEAN]) {
      expect(frontend(text)).toEqual(findContactsInText(text));
    }
  });
});
