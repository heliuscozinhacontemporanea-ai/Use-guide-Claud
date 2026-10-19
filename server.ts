import express from 'express';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import paymentRouter from './server/domain/payment/routes/paymentRoutes';
import { PaymentController } from './server/domain/payment/controllers/paymentController';
import climaWindRouter from './server/domain/climawind/routes/climaWindRoutes';
import notificationRouter from './server/domain/notifications/routes/notificationRoutes';
import userRouter from './server/domain/users/routes/userRoutes';
import partnerRouter from './server/domain/partners/routes/partnerRoutes';
import { itemRouter } from './server/domain/guide/routes/guideRoutes';
import { publicEventsRouter, adminEventsRouter } from './server/domain/events/routes/eventRoutes';
import ticketingRouter, {
  adminTicketingEventsRouter,
} from './server/domain/ticketing/routes/ticketingRoutes';
import { TicketingController } from './server/domain/ticketing/controllers/ticketingController';
import reviewRouter from './server/domain/reviews/routes/reviewRoutes';
import insightsRouter from './server/domain/insights/routes/insightsRoutes';
import adminRouter from './server/domain/admin/routes/adminRoutes';
import favoriteRouter from './server/domain/favorites/routes/favoriteRoutes';
import mediaRouter from './server/domain/media/routes/mediaRoutes';
import billingRouter from './server/interfaces/http/billing/billingRoutes';
import {
  bookingsRouter,
  partnerOffersRouter,
} from './server/interfaces/http/bookings/bookingsRoutes';
import { InternalBookingsController } from './server/interfaces/http/bookings/internalBookingsController';
import { InternalPartnersController } from './server/interfaces/http/partners/internalPartnersController';
import { verifyInternalJobKey } from './server/infrastructure/auth/internalJobAuth';
import { resolveTrustProxyHops } from './server/infrastructure/config/trustProxy';
import { renderSeoPageApplicationUseCase } from './server/application/usecases/renderSeoPageApplicationUseCase';
import { renderSitemapApplicationUseCase } from './server/application/usecases/renderSitemapApplicationUseCase';
import { verifyAppCheck } from './server/infrastructure/auth/appCheckMiddleware';

async function startServer() {
  const app = express();
  const rawPort = process.env.PORT ?? '3000';
  const PORT = Number(rawPort);
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error(`PORT inválida: ${rawPort}`);
  }
  app.set('trust proxy', resolveTrustProxyHops());
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://apis.google.com',
              'https://*.firebaseapp.com',
              'https://js.stripe.com',
              'https://connect-js.stripe.com',
              'https://www.google.com',
              'https://www.gstatic.com',
            ],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            imgSrc: [
              "'self'",
              'data:',
              'blob:',
              'https:',
              'https://*.googleusercontent.com',
              'https://firebasestorage.googleapis.com',
              'https://*.stripe.com',
            ],
            connectSrc: [
              "'self'",
              'https://*.googleapis.com',
              'https://*.firebaseio.com',
              'https://identitytoolkit.googleapis.com',
              'https://securetoken.googleapis.com',
              'https://api.stripe.com',
              'https://connect-js.stripe.com',
              'https://*.stripe.com',
              'https://api.open-meteo.com',
              'wss:',
            ],
            frameSrc: [
              "'self'",
              'https://*.firebaseapp.com',
              'https://*.google.com',
              'https://js.stripe.com',
              'https://hooks.stripe.com',
              'https://connect-js.stripe.com',
              'https://*.stripe.com',
            ],
            objectSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    );
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );
  }
  app.use(compression());

  // 1. Stripe Webhook com raw body ANTES do express.json() e fora do App Check
  app.post(
    '/api/payment/webhook/stripe',
    express.raw({
      type: 'application/json',
      limit: '256kb',
    }),
    PaymentController.stripeWebhook
  );

  // 2. Health, Version e Internal Job (autenticado via X-Internal-Job-Key com timingSafeEqual)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: process.env.npm_package_version || '0.0.0',
      revision: process.env.K_REVISION || 'local-dev',
    });
  });
  app.get('/api/version', (_req, res) => {
    res.json({
      version: process.env.npm_package_version || '0.0.0',
      revision: process.env.K_REVISION || 'local-dev',
      service: process.env.K_SERVICE || 'use-guide',
      configuration: process.env.K_CONFIGURATION || 'local',
      environment: process.env.NODE_ENV || 'development',
    });
  });
  // Rotas /internal nunca passam pelo rewrite do Hosting (AGENTS.md §7.9).
  app.post(
    '/internal/ticketing/expire-orders',
    verifyInternalJobKey,
    TicketingController.expireOrdersInternalJob
  );
  app.post('/internal/bookings/expire', verifyInternalJobKey, InternalBookingsController.expire);
  app.post(
    '/internal/bookings/complete',
    verifyInternalJobKey,
    InternalBookingsController.complete
  );
  app.post(
    '/internal/partners/check-expiring-plans',
    verifyInternalJobKey,
    InternalPartnersController.checkExpiringPlans
  );

  // 3. App Check para rotas /api/*
  app.use('/api', (req, res, next) => {
    if (
      req.path === '/health' ||
      req.path === '/version' ||
      req.path.startsWith('/payment/webhook')
    ) {
      return next();
    }
    return verifyAppCheck(req, res, next);
  });

  // 4. express.json()
  app.use((req, res, next) => {
    if (
      (req.path === '/api/users/me/photo' || req.path === '/api/media/images') &&
      req.method === 'POST'
    ) {
      return next();
    }
    return express.json({ limit: '256kb' })(req, res, next);
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/internal')) {
      return next();
    }
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;
    const isAiStudioDev =
      host.includes('ais-') || host.includes('localhost') || host.includes('127.0.0.1');
    if (!isAiStudioDev && host.endsWith('.run.app')) {
      return res.redirect(301, `https://useguide.com.br${req.originalUrl || '/'}`);
    }
    next();
  });

  // 5. Normal routes
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/payment/plans', billingRouter);
  app.use('/api/payment', paymentRouter);
  app.use('/api/weather', climaWindRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/users', userRouter);
  app.use('/api/partners/offers', partnerOffersRouter);
  app.use('/api/partners', partnerRouter);
  app.use('/api/items', itemRouter);
  app.use('/api/events', publicEventsRouter);
  app.use('/api/admin/events', adminEventsRouter);
  app.use('/api/admin/events', adminTicketingEventsRouter);
  app.use('/api/ticketing', ticketingRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/insights', insightsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/favorites', favoriteRouter);
  app.use('/api/media', mediaRouter);

  // Erros não tratados (inclusive do body-parser) nunca devolvem a mensagem interna (AGENTS.md §10.2).
  app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const details = (err ?? {}) as {
        name?: string;
        type?: string;
        status?: number;
        statusCode?: number;
      };
      const rawStatus = details.status ?? details.statusCode;
      const statusCode = rawStatus && rawStatus >= 400 && rawStatus < 500 ? rawStatus : 500;
      console.error('[Error Handler]', { name: details.name, type: details.type, statusCode });
      const error =
        statusCode === 413
          ? { code: 'PAYLOAD_TOO_LARGE', message: 'Requisição grande demais.' }
          : statusCode < 500
            ? { code: 'BAD_REQUEST', message: 'Requisição inválida.' }
            : { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' };
      res.status(statusCode).json({ error });
    }
  );

  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const xml = await renderSitemapApplicationUseCase();
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
      res.send(xml);
    } catch (error) {
      console.error('[sitemap]', error instanceof Error ? error.message : error);
      res.status(503).end();
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // index: false — o HTML sempre passa pelo SEO; o Hosting já entrega a home "/" estática.
    app.use(express.static(distPath, { index: false }));
    app.get('*all', async (req, res) => {
      try {
        const html = await renderSeoPageApplicationUseCase({
          path: req.path,
          query: req.query as Record<string, unknown>,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        // A CDN do Hosting guarda por 5 min; o navegador sempre revalida.
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
        res.send(html);
      } catch (error) {
        console.error('[SEO render]', error instanceof Error ? error.message : error);
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.info(`[App Control Plane] Servidor executando em http://localhost:${PORT}`);
  });
  const shutdown = (signal: string) => {
    console.info(`\n[Server] Recebido ${signal}. Encerrando o servidor de forma graciosa...`);
    server.close(() => {
      console.info('[Server] Servidor Express encerrado.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Server] Não foi possível fechar as conexões a tempo, forçando encerramento.');
      process.exit(1);
    }, 10000);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
startServer();
