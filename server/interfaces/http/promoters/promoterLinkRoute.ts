import { type Request, type Response, Router } from 'express';
import { getPromoterLinkEventUseCase } from '../../../domain/ticketing';
import { rateLimitByIp } from '../../../infrastructure/http/rateLimitByIp';
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
import { localizedPath } from '../../../shared/kernel/localizedRoutes';

// O mesmo formato que o aparelho aceita guardar: @ opcional, hífen e o código de 6 caracteres.
const PARAM = /^[a-z0-9._]{0,30}-?[A-Za-z0-9]{6}$/;

function localeOf(req: Request): Locale {
  const wanted = req.acceptsLanguages(...SUPPORTED_LOCALES, 'pt');
  return SUPPORTED_LOCALES.find((locale) => locale === wanted) ?? DEFAULT_LOCALE;
}

/**
 * Link curto do divulgador (C6): `/e/<@>-<código>` leva ao anúncio do evento, no idioma do aparelho,
 * com o `d` que o app guarda para a compra (D27). O destino é sempre um caminho do próprio site,
 * montado aqui, nunca um endereço vindo de fora (sem redirecionamento aberto). Link que não vale
 * mais cai na lista de eventos.
 */
export const promoterLinkRouter = Router();
promoterLinkRouter.get(
  '/:param',
  rateLimitByIp('promoter-link', 60, 10 * 60_000),
  async (req: Request, res: Response) => {
    const events = localizedPath('events', localeOf(req));
    const param = String(req.params.param ?? '');
    res.setHeader('Cache-Control', 'no-store');
    if (!PARAM.test(param)) return res.redirect(302, events);
    const eventId = await getPromoterLinkEventUseCase(param).catch(() => null);
    if (!eventId) return res.redirect(302, events);
    const query = new URLSearchParams({ d: param, item: eventId, type: 'event' });
    return res.redirect(302, `${events}?${query.toString()}`);
  }
);
