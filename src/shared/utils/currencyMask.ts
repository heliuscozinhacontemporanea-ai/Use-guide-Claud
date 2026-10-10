/**
 * Máscara de valor monetário em Real (BRL). Aceita apenas dígitos,
 * formata como moeda brasileira, sem permitir valores negativos.
 */
export function maskCurrency(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, '');
  if (!digitsOnly) return '';

  const numericValue = parseInt(digitsOnly, 10) / 100;
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Extrai o valor numérico puro (sem máscara) para gravação no banco.
 */
export function unmaskCurrency(maskedValue: string): number {
  const digitsOnly = maskedValue.replace(/\D/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) / 100 : 0;
}
