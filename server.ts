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
import { serverSeoService } from './server/domain/seo/seoService';
import { verifyAppCheck } from './server/infrastructure/auth/appCheckMiddleware';

async function startServer() {
  const app = express();
  const rawPort = process.env.PORT ?? '3000';
  const PORT = Number(rawPort);
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error(`PORT inválida: ${rawPort}`);
  }
  app.set('trust proxy', true);
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
  app.post(
    '/internal/ticketing/expire-orders',
    express.json({ limit: '64kb' }),
    TicketingController.expireOrdersInternalJob
  );

  // 3. App Check para rotas /api/*
  app.use('/api', (req, res, next) => {
    if (
      req.path === '/health' ||
      req.path === '/version' ||
      req.path.startsWith('/payment/webhook') ||
      req.path === '/ticketing/internal/expire-orders'
    ) {
      return next();
    }
    return verifyAppCheck(req, res, next);
  });

  // 4. express.json()
  app.use((req, res, next) => {
    if (req.path === '/api/users/me/photo' && req.method === 'POST') {
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
  app.use('/api/payment', paymentRouter);
  app.use('/api/weather', climaWindRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/users', userRouter);
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

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Error Handler]', err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      error: {
        message: err.message || 'Erro interno do servidor',
        status: statusCode,
      },
    });
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
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      try {
        const hydratedHtml = serverSeoService.getHydratedHtml(
          req.path,
          req.query as Record<string, any>
        );
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(hydratedHtml);
      } catch {
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
