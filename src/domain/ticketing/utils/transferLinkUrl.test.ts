import { describe, expect, it } from 'vitest';
import { buildTransferLinkUrl, parseTransferLinkHash } from './transferLinkUrl';

const TOKEN = 'abcDEF123_-abcDEF123_-abcDEF123_-abcDEF12';

describe('transferLinkUrl', () => {
  it('coloca o código depois do # e lê de volta', () => {
    const url = buildTransferLinkUrl('https://useguide.app', 'link1234', TOKEN);
    expect(url).toBe(`https://useguide.app/#receber-ingresso=link1234.${TOKEN}`);
    expect(parseTransferLinkHash(new URL(url).hash)).toEqual({ linkId: 'link1234', token: TOKEN });
  });

  it('recusa hash de outro formato', () => {
    expect(parseTransferLinkHash('')).toBeNull();
    expect(parseTransferLinkHash('#outra=link1234.abc')).toBeNull();
    expect(parseTransferLinkHash('#receber-ingresso=link1234.curto')).toBeNull();
    expect(parseTransferLinkHash(`#receber-ingresso=../x.${TOKEN}`)).toBeNull();
  });
});
