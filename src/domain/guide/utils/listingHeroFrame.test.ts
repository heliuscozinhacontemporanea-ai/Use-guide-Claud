import { describe, expect, it } from 'vitest';
import { type HeroGeometry, heroFrame } from './listingHeroFrame';

// Cartão horizontal: foto quadrada à esquerda; capa 16:9 no topo da tela de 390 x 844.
const GEOMETRY: HeroGeometry = {
  cardPhoto: { left: 24, top: 300, width: 120, height: 120 },
  card: { left: 24, top: 300, width: 342, height: 120 },
  cardRadius: 20,
  hero: { left: 0, top: 0, width: 390, height: 220 },
  viewport: { left: 0, top: 0, width: 390, height: 844 },
};

describe('heroFrame', () => {
  it('no início, a foto cobre exatamente a foto do cartão, recortada como ela', () => {
    const { photo, contentY } = heroFrame(GEOMETRY, 0);
    // Cobre pela altura: 120 / 220.
    expect(photo.scale).toBeCloseTo(120 / 220);
    // Centro da foto escalada = centro da foto do cartão (84, 360).
    expect(photo.x + (photo.scale * 390) / 2).toBeCloseTo(84);
    expect(photo.y + (photo.scale * 220) / 2).toBeCloseTo(360);
    // Mostra só 120 px de largura (na escala): recorta 195 - 110 = 85 px de cada lado.
    expect(photo.clipPath).toBe('inset(0px 85px)');
    // O conteúdo começa embaixo da foto do cartão.
    expect(contentY).toBeCloseTo(420 - 220);
  });

  it('no fim, a foto é a capa sem recorte e o anúncio ocupa a tela', () => {
    const frame = heroFrame(GEOMETRY, 1);
    expect(frame.photo).toEqual({ x: 0, y: 0, scale: 1, clipPath: 'inset(0px 0px)' });
    expect(frame.contentY).toBe(0);
    expect(frame.pageClipPath).toBe('inset(0px 0px 0px 0px round 0px)');
  });

  it('os cantos do cartão vêm do recorte da página, que começa no contorno do cartão', () => {
    expect(heroFrame(GEOMETRY, 0).pageClipPath).toBe('inset(300px 24px 424px 24px round 20px)');
    expect(heroFrame(GEOMETRY, 0.5).pageClipPath).toBe('inset(150px 12px 212px 12px round 10px)');
  });

  it('no meio do caminho, a foto já cresce além do cartão e continua cobrindo', () => {
    const { photo } = heroFrame(GEOMETRY, 0.5);
    expect(photo.scale).toBeGreaterThan(120 / 220);
    expect(photo.scale).toBeLessThan(1);
  });
});
