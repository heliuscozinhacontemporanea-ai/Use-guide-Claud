/**
 * Anúncio que vende pelo app (C2/B37, mesma regra de `sellsThroughApp` no servidor): o telefone fica
 * só com a plataforma, sem Instagram, site nem link de reserva, e o texto não aceita contato.
 * Atração com entrada paga vende; a gratuita é vitrine, como hospedagem e restaurante.
 */
const SELLING = ['tour', 'transfer', 'rental', 'producer'];

export function listingSellsThroughApp(category: string, sightAccess?: string): boolean {
  return SELLING.includes(category) || (category === 'sight' && sightAccess === 'pago');
}
