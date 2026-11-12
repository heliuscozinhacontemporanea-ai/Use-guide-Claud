/**
 * Link curto do divulgador (C6): `/e/<@>-<código>`. O servidor leva ao anúncio do evento e o app
 * guarda o código para a compra (D27). A atribuição usa só o código fixo; o @ na frente é para quem
 * recebe o link reconhecer de quem veio.
 */
export function buildPromoterLinkUrl(
  origin: string,
  username: string | null,
  code: string
): string {
  return `${origin}/e/${username ? `${username}-${code}` : code}`;
}
