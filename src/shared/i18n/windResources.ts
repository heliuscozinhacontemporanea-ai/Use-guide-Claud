// Previsão de 10 dias e mapa do vento (folhas abertas pelo painel de condições da Explorar).
export interface WindTranslation {
  forecast: {
    subtitle: string;
    loading: string;
    error: string;
    wind: string;
    gust: string;
    direction: string;
    temperature: string;
  };
  unit: { knots: string };
  conditions: { clear: string; partlyCloudy: string; fog: string; lightRain: string; rain: string };
  map: { title: string; error: string };
}

export const windPtBR: WindTranslation = {
  forecast: {
    subtitle: 'Previsão de 10 dias · dados de satélite e modelos',
    loading: 'Carregando a previsão',
    error: 'Não foi possível carregar a previsão.',
    wind: 'Vento',
    gust: 'Rajada',
    direction: 'Vento de {{degrees}}°',
    temperature: '{{max}}° / {{min}}°',
  },
  unit: { knots: 'nós' },
  conditions: {
    clear: 'Céu limpo',
    partlyCloudy: 'Parcialmente nublado',
    fog: 'Nevoeiro',
    lightRain: 'Chuva fraca',
    rain: 'Chuva',
  },
  map: { title: 'Mapa do vento', error: 'Não foi possível atualizar o vento no mapa.' },
};
