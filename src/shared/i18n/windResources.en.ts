import type { WindTranslation } from './windResources';

export const windEn: WindTranslation = {
  forecast: {
    subtitle: '10-day forecast · satellite and model data',
    loading: 'Loading the forecast',
    error: "We couldn't load the forecast.",
    wind: 'Wind',
    gust: 'Gust',
    direction: 'Wind from {{degrees}}°',
    temperature: '{{max}}° / {{min}}°',
  },
  unit: { knots: 'kt' },
  conditions: {
    clear: 'Clear sky',
    partlyCloudy: 'Partly cloudy',
    fog: 'Fog',
    lightRain: 'Light rain',
    rain: 'Rain',
  },
  map: { title: 'Wind map', error: "We couldn't update the wind on the map." },
};
