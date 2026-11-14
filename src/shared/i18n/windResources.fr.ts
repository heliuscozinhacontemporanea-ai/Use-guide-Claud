import type { WindTranslation } from './windResources';

export const windFr: WindTranslation = {
  forecast: {
    subtitle: 'Prévisions sur 10 jours · données satellite et modèles',
    loading: 'Chargement des prévisions',
    error: 'Impossible de charger les prévisions.',
    wind: 'Vent',
    gust: 'Rafale',
    direction: 'Vent de {{degrees}}°',
    temperature: '{{max}}° / {{min}}°',
  },
  unit: { knots: 'nœuds' },
  conditions: {
    clear: 'Ciel dégagé',
    partlyCloudy: 'Partiellement nuageux',
    fog: 'Brouillard',
    lightRain: 'Pluie faible',
    rain: 'Pluie',
  },
  map: { title: 'Carte du vent', error: 'Impossible de mettre à jour le vent sur la carte.' },
};
