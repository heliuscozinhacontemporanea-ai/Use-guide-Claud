import { describe, expect, it } from 'vitest';
import { isReservedUsername } from './reservedUsernames';

describe('nomes reservados no @ (D35, item 10)', () => {
  it('bloqueia o Use Guide em qualquer parte, mesmo disfarçado', () => {
    for (const name of [
      'useguide',
      'eusouuseguide',
      'us3_guide',
      'use.guide.oficial',
      'uuse_guidee',
    ]) {
      expect(isReservedUsername(name), name).toBe(true);
    }
  });

  it('bloqueia marcas longas em qualquer parte, com números, pontos e letras repetidas', () => {
    const names = [
      'instagram',
      '1nst4.gram',
      'instaaagram',
      'whatsapp_suporte',
      'bookingjeri',
      'mercado.pago',
      'icmbio_jeri',
      'prefeitura_jijoca',
      'receita.federal',
    ];
    for (const name of names) expect(isReservedUsername(name), name).toBe(true);
  });

  it('bloqueia nomes curtos sozinhos ou com palavras de autoridade', () => {
    const names = [
      'meta',
      'meta_oficial',
      'suporte_meta',
      'metasuporte',
      'pix_oficial',
      'nubank_br',
      'apple.help',
      'admin',
      'suporte_oficial',
      'atendimento',
      'adm1n',
    ];
    for (const name of names) expect(isReservedUsername(name), name).toBe(true);
  });

  it('não bloqueia nomes comuns que contêm uma palavra curta', () => {
    const names = [
      'metade_praia',
      'cometa',
      'tapioca_da_ana',
      'capivara',
      'badminton',
      'pineapple',
      'uberlandia',
      'amazonia',
      'itauna',
      'pixel.art',
      'receitas_da_vovo',
      'decolar_viagens',
      'internacional',
      'ana.souza',
      'pousada_do_mar',
    ];
    for (const name of names) expect(isReservedUsername(name), name).toBe(false);
  });
});
