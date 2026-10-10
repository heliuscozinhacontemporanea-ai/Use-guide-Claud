/**
 * Validação de CPF (módulo 11 clássico) e CNPJ (formato alfanumérico
 * regulamentado pela Instrução Normativa RFB nº 2.229/2024, vigente a
 * partir de julho de 2026). CNPJs numéricos emitidos antes da mudança
 * continuam válidos e usam o mesmo algoritmo — a conversão ASCII não
 * altera o resultado para caracteres puramente numéricos.
 */

function charToDigit(char: string): number {
  // Dígitos 0-9 mantêm seu valor. Letras A-Z (maiúsculas) valem
  // valor ASCII - 48 (A=65-48=17, B=66-48=18, ..., Z=90-48=42).
  const code = char.charCodeAt(0);
  return code - 48;
}

function calculateCnpjDigit(base: string, weights: number[]): number {
  const sum = base
    .split('')
    .reduce((acc, char, i) => acc + charToDigit(char) * (weights[i] ?? 0), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCNPJ(rawValue: string): boolean {
  const cleaned = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleaned.length !== 14) return false;

  // Posições 1-12: alfanuméricas. Posições 13-14 (DV): apenas numéricas.
  const base12 = cleaned.slice(0, 12);
  const providedDv = cleaned.slice(12, 14);

  if (!/^[A-Z0-9]{12}$/.test(base12)) return false;
  if (!/^\d{2}$/.test(providedDv)) return false;

  const weightsDv1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calculateCnpjDigit(base12, weightsDv1);

  const base13 = base12 + String(dv1);
  const weightsDv2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv2 = calculateCnpjDigit(base13, weightsDv2);

  return providedDv === `${dv1}${dv2}`;
}

export function isValidCPF(rawValue: string): boolean {
  const cleaned = rawValue.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // Rejeita sequências repetidas (111.111.111-11 etc.)

  const calcDigit = (base: string, factor: number): number => {
    let total = 0;
    for (const char of base) {
      total += parseInt(char, 10) * factor;
      factor--;
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const dv1 = calcDigit(cleaned.slice(0, 9), 10);
  const dv2 = calcDigit(cleaned.slice(0, 9) + dv1, 11);

  return cleaned.slice(9, 11) === `${dv1}${dv2}`;
}

/**
 * Detecta automaticamente se o valor é CPF (11 dígitos) ou CNPJ (14 caracteres)
 * e aplica a validação correspondente.
 */
export function isValidCpfCnpj(rawValue: string): boolean {
  const cleaned = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleaned.length === 11) return isValidCPF(cleaned);
  if (cleaned.length === 14) return isValidCNPJ(cleaned);

  return false;
}

/**
 * Aplica máscara visual (00.000.000/0001-00 para CNPJ, 000.000.000-00 para CPF)
 * conforme o usuário digita.
 */
export function maskCpfCnpj(rawValue: string): string {
  const cleaned = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleaned.length <= 11) {
    // Máscara de CPF
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  // Máscara de CNPJ (aceita letras nas primeiras 12 posições)
  return cleaned
    .slice(0, 14)
    .replace(/([A-Z0-9]{2})([A-Z0-9])/, '$1.$2')
    .replace(/([A-Z0-9]{2})\.([A-Z0-9]{3})([A-Z0-9])/, '$1.$2.$3')
    .replace(/([A-Z0-9]{2})\.([A-Z0-9]{3})\.([A-Z0-9]{3})([A-Z0-9])/, '$1.$2.$3/$4')
    .replace(/([A-Z0-9]{2})\.([A-Z0-9]{3})\.([A-Z0-9]{3})\/([A-Z0-9]{4})(\d)/, '$1.$2.$3/$4-$5');
}
