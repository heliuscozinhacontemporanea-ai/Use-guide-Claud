function charToDigit(char: string): number {
  return char.charCodeAt(0) - 48;
}

function calculateCnpjDigit(base: string, weights: number[]): number {
  const sum = base
    .split('')
    .reduce((acc, char, index) => acc + charToDigit(char) * (weights[index] ?? 0), 0);

  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

export function normalizeDocument(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidCPF(rawValue: string): boolean {
  const cleaned = rawValue.replace(/\D/g, '');
  if (cleaned.length !== 11) {
    return false;
  }
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }
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

export function isValidCNPJ(rawValue: string): boolean {
  const cleaned = normalizeDocument(rawValue);
  if (cleaned.length !== 14) {
    return false;
  }
  const base12 = cleaned.slice(0, 12);
  const providedDv = cleaned.slice(12, 14);
  if (!/^[A-Z0-9]{12}$/.test(base12)) {
    return false;
  }
  if (!/^\d{2}$/.test(providedDv)) {
    return false;
  }
  const weightsDv1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calculateCnpjDigit(base12, weightsDv1);
  const base13 = base12 + String(dv1);
  const weightsDv2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv2 = calculateCnpjDigit(base13, weightsDv2);
  return providedDv === `${dv1}${dv2}`;
}

export function isValidCpfCnpj(rawValue: string): boolean {
  const cleaned = normalizeDocument(rawValue);
  if (cleaned.length === 11) {
    return isValidCPF(cleaned);
  }
  if (cleaned.length === 14) {
    return isValidCNPJ(cleaned);
  }
  return false;
}
