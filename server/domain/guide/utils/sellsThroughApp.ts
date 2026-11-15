/**
 * Anúncios que vendem pelo app (C2/B37, aprovado em 2026-11-09): o telefone fica num documento só do
 * servidor, sem Instagram, site nem link de reserva, e o texto não pode trazer contato. A vitrine
 * (hospedagem, restaurante, atração sem venda) continua com o contato no anúncio.
 */
const SELLING_CATEGORIES = ['tour', 'transfer', 'rental', 'producer'] as const;

/** Atração com entrada paga vende pelo app (entrada privada, D9); a gratuita é vitrine. */
export function sellsThroughApp(category: string | undefined, access?: string): boolean {
  return (
    SELLING_CATEGORIES.includes(category as never) || (category === 'sight' && access === 'pago')
  );
}
