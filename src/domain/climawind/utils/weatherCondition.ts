/** Chave de tradução do tempo a partir do código WMO (as mesmas faixas do painel de condições). */
export function weatherConditionKey(code: number): string {
  if (code === 0) return 'wind.conditions.clear';
  if (code <= 3) return 'wind.conditions.partlyCloudy';
  if (code <= 48) return 'wind.conditions.fog';
  if (code <= 67) return 'wind.conditions.lightRain';
  return 'wind.conditions.rain';
}
