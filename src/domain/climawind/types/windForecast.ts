/** Um dia da previsão, no dia do lugar (`day` = AAAA-MM-DD). Vento em nós. */
export interface ForecastDay {
  day: string;
  maxTemp: number;
  minTemp: number;
  maxWind: number;
  maxGusts: number;
  windDir: number;
  /** Código WMO do tempo; a tela traduz pela chave de `weatherConditionKey`. */
  weatherCode: number;
}
