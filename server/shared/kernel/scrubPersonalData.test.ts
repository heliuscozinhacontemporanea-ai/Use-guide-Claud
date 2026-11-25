import { describe, expect, it } from 'vitest';
import * as frontend from '../../../src/shared/utils/scrubPersonalData';
import { scrubStack, scrubText } from './scrubPersonalData';

describe('scrubPersonalData (erros do navegador, §7.5)', () => {
  it('tira e-mail, CPF, telefone, cartão e token da mensagem', () => {
    const text = scrubText(
      'Falha para ana.souza@exemplo.com, CPF 529.982.247-25, fone (85) 99999-9999, ' +
        'cartão 4242 4242 4242 4242, token eyJhbGciOi.eyJzdWIiOi.c2lnbmF0dXJl e ' +
        'chave sk_test_51HabcdefghijklmnopqrstuvwxyzABCD'
    );
    for (const leak of ['ana.souza', '529.982', '99999', '4242', 'eyJhbGci', 'sk_test_51']) {
      expect(text).not.toContain(leak);
    }
    expect(text).toContain('[email]');
    expect(text).toContain('[num]');
    expect(text).toContain('[token]');
  });

  it('tira parâmetros e âncora de URL, mantendo o endereço', () => {
    expect(scrubText('GET https://useguide.com.br/eventos?email=a@b.co&cpf=1#x falhou')).toBe(
      'GET https://useguide.com.br/eventos falhou'
    );
  });

  it('na pilha, mantém linha e coluna dos arquivos e limpa a mensagem', () => {
    const stack = [
      'TypeError: pedido 123456789 de ana@ex.com',
      '    at pay (https://useguide.com.br/assets/index-BSbYtDEN.js:1:234567)',
      '    at https://useguide.com.br/assets/index-BSbYtDEN.js?v=1:12:3456',
    ].join('\n');
    expect(scrubStack(stack)).toBe(
      [
        'TypeError: pedido [num] de [email]',
        '    at pay (https://useguide.com.br/assets/index-BSbYtDEN.js:1:234567)',
        '    at https://useguide.com.br/assets/index-BSbYtDEN.js:12:3456',
      ].join('\n')
    );
  });

  it('não mexe em texto sem dado pessoal', () => {
    expect(scrubText("Cannot read properties of undefined (reading 'map')")).toBe(
      "Cannot read properties of undefined (reading 'map')"
    );
  });

  it('app e servidor limpam do mesmo jeito', () => {
    for (const sample of [
      'Falha para ana@ex.com com CPF 52998224725',
      'https://x.com/a?b=c',
      'TypeError: x\n    at f (https://a.b/c.js?q=1:1:999999)',
      'eyJa.eyJb.c e 0123456789abcdef0123456789abcdef01',
    ]) {
      expect(frontend.scrubText(sample), sample).toBe(scrubText(sample));
      expect(frontend.scrubStack(sample), sample).toBe(scrubStack(sample));
    }
  });
});
