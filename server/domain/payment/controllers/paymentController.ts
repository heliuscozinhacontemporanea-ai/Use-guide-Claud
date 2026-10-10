import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/ticketingPaymentOrchestrationUseCases';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { CreatePlanPaymentIntentSchema } from '../schemas/paymentSchema';
import { PaymentDomainError } from '../services/stripePaymentService';
import {
  createPartnerConnectAccountSessionUseCase,
  ensurePartnerConnectedAccountUseCase,
  getPartnerConnectAccountStatusUseCase,
} from '../usecases/marketplaceConnectUseCases';
import {
  constructStripeWebhookEventUseCase,
  createPlanPaymentIntentUseCase,
  markStripeWebhookEventProcessedUseCase,
} from '../usecases/paymentUseCases';

export class PaymentController {
  static async createPlanPaymentIntent(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'Não autenticado.' });
      }

      const parsed = CreatePlanPaymentIntentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados de pagamento inválidos.',
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const { planId, idempotencyKey } = parsed.data;
      const plan = await getPlanForPaymentApplicationUseCase(planId);
      if (!plan) {
        return res.status(400).json({ error: 'Plano inexistente.' });
      }
      if (plan.isActive === false) {
        return res.status(400).json({ error: 'Plano inativo.' });
      }

      const amountMinor = Math.round(Number(plan.price) * 100);
      if (amountMinor <= 0) {
        return res
          .status(400)
          .json({ error: 'Plano gratuito não requer pagamento via Stripe.' });
      }

      const result = await createPlanPaymentIntentUseCase({
        buyerId: req.user.uid,
        planId: plan.id,
        planName: plan.name,
        amountMinor,
        idempotencyKey: idempotencyKey || randomUUID(),
      });

      return res.status(200).json({
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
      });
    } catch (error: unknown) {
      if (error instanceof PaymentDomainError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }
      console.error('[PaymentController.createPlanPaymentIntent]', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res.status(503).json({
        error: 'Não foi possível iniciar o pagamento no momento.',
      });
    }
  }

  static async createConnectedAccount(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'Não autenticado.' });
      }

      const record = await ensurePartnerConnectedAccountUseCase({
        partnerId: req.user.uid,
        email: req.user.email || '',
      });

      return res.status(200).json({
        connected:
          record.chargesEnabled &&
          record.payoutsEnabled &&
          record.detailsSubmitted,
        accountId: record.stripeAccountId,
        chargesEnabled: record.chargesEnabled,
        payoutsEnabled: record.payoutsEnabled,
        detailsSubmitted: record.detailsSubmitted,
        status: record.status,
      });
    } catch (error: unknown) {
      console.error('[PaymentController.createConnectedAccount]', {
        partnerId: req.user?.uid,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res.status(503).json({
        error:
          'Não foi possível iniciar a configuração financeira no momento.',
      });
    }
  }

  static async createConnectAccountSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'Não autenticado.' });
      }

      const session = await createPartnerConnectAccountSessionUseCase({
        partnerId: req.user.uid,
        email: req.user.email || '',
      });

      return res.status(200).json({
        clientSecret: session.clientSecret,
      });
    } catch (error: unknown) {
      console.error('[PaymentController.createConnectAccountSession]', {
        partnerId: req.user?.uid,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res.status(503).json({
        error:
          'Não foi possível iniciar a configuração financeira no momento.',
      });
    }
  }

  static async getConnectStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'Não autenticado.' });
      }

      const targetPartnerId =
        req.user.admin === true && typeof req.query.partnerId === 'string'
          ? req.query.partnerId
          : req.user.uid;

      const status = await getPartnerConnectAccountStatusUseCase(targetPartnerId);
      return res.status(200).json(status);
    } catch (error: unknown) {
      console.error('[PaymentController.getConnectStatus]', {
        partnerId: req.user?.uid,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res.status(503).json({
        error:
          'Não foi possível consultar a configuração financeira no momento.',
      });
    }
  }

  static async stripeWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const signature = req.headers['stripe-signature'];
      if (!signature || typeof signature !== 'string') {
        return res.status(400).json({ error: 'Assinatura Stripe ausente.' });
      }

      const rawBody = req.body;
      if (!Buffer.isBuffer(rawBody) && typeof rawBody !== 'string') {
        return res.status(400).json({
          error: 'Corpo bruto obrigatório para validação de webhook Stripe.',
        });
      }

      let verifiedEvent;
      try {
        verifiedEvent = constructStripeWebhookEventUseCase(rawBody, signature);
      } catch {
        return res.status(400).json({
          error: 'Assinatura de webhook Stripe inválida.',
        });
      }

      console.info('[StripeWebhook]', {
        eventId: verifiedEvent.id,
        type: verifiedEvent.type,
      });

      const isFirstProcess = await markStripeWebhookEventProcessedUseCase({
        eventId: verifiedEvent.id,
        eventType: verifiedEvent.type,
      });

      if (!isFirstProcess) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      await reconcileStripeWebhookEventApplicationUseCase(verifiedEvent);

      return res.status(200).json({ received: true });
    } catch (error: unknown) {
      console.error('[PaymentController.stripeWebhook]', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res.status(400).json({
        error: 'Não foi possível processar o evento de webhook.',
      });
    }
  }
}
