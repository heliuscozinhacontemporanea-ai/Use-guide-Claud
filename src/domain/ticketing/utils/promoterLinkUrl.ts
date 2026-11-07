/**
 * Link do divulgador (D27): a página do evento com `d=<@>-<código>`. A atribuição usa só o código
 * fixo; o @ na frente é para quem recebe o link reconhecer de quem veio.
 */
export function buildPromoterLinkUrl(
  origin: string,
  eventsPath: string,
  eventListingId: string,
  username: string | null,
  code: string
): string {
  const param = username ? `${username}-${code}` : code;
  const query = new URLSearchParams({ item: eventListingId, type: 'event', d: param });
  return `${origin}${eventsPath}?${query.toString()}`;
}
