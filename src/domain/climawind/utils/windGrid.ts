import { WindPoint } from '../types/climaWind';

/**
 * Gera uma grade regular de coordenadas cobrindo a área ao redor de Jericoacoara.
 * Densidade suficiente para produzir interpolação com variação espacial real,
 * evitando o efeito de "vento uniforme" que ocorre com poucos pontos amostrais.
 */
export function generateWindGrid(
  centerLat: number,
  centerLon: number,
  gridSize: number = 7,
  spacingDegrees: number = 0.08
): WindPoint[] {
  const points: WindPoint[] = [];
  const half = Math.floor(gridSize / 2);

  for (let i = -half; i <= half; i++) {
    for (let j = -half; j <= half; j++) {
      const lat = centerLat + i * spacingDegrees;
      const lng = centerLon + j * spacingDegrees;
      points.push({
        id: `grid_${i}_${j}`,
        name: '', // pontos de grade não têm nome — não geram marcador visual
        lat,
        lng,
      });
    }
  }

  return points;
}
