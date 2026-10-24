import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
import { assertListingPlanPurchasableApplicationUseCase } from '../../../application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase';
import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ConfirmPlanPaymentSchema, CreatePlanPaymentIntentSchema } from '../schemas/paymentSchema';
import { PaymentDomainError } from '../services/stripePaymentService';
import { claimStripeWebhookEventUseCase } from '../usecases/claimStripeWebhookEventUseCase';
import { completeStripeWebhookEventUseCase } from '../usecases/completeStripeWebhookEventUseCase';
import { constructStripeWebhookEventUseCase } from '../usecases/constructStripeWebhookEventUseCase';
import { createPlanPaymentIntentUseCase } from '../usecases/createPlanPaymentIntentUseCase';
import { releaseStripeWebhookEventUseCase } from '../usecases/releaseStripeWebhookEventUseCase';
import { retrievePaymentIntentUseCase } from '../usecases/retrievePaymentIntentUseCase';

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

      const { itemId, planId, idempotencyKey } = parsed.data;
      const plan = await getPlanForPaymentApplicationUseCase(planId);
      if (!plan) {
        return res.status(400).json({ error: 'Plano inexistente.' });
      }
      if (plan.isActive === false) {
        return res.status(400).json({ error: 'Plano inativo.' });
      }

      const amountMinor = plan.priceMinor;
      if (amountMinor <= 0) {
        return res.status(400).json({ error: 'Plano gratuito não requer pagamento via Stripe.' });
      }

      // Plano é do estabelecimento verificado e do próprio comprador (D11).
      await assertListingPlanPurchasableApplicationUseCase({ uid: req.user.uid }, itemId);

      const result = await createPlanPaymentIntentUseCase({
        buyerId: req.user.uid,
        itemId,
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

  static async confirmPlanPayment(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Não autenticado.' } });
    }
    const parsed = ConfirmPlanPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.' } });
    }
    try {
      const intent = await retrievePaymentIntentUseCase(parsed.data.paymentIntentId);
      if (
        intent.metadata?.partnerId !== req.user.uid ||
        intent.metadata?.referenceType !== 'plan_payment'
      ) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Pagamento não encontrado.' } });
      }
      // Só informa o status: quem ativa o plano é o webhook (AGENTS.md §8.4).
      const status =
        intent.status === 'succeeded'
          ? 'succeeded'
          : intent.status === 'processing'
            ? 'processing'
            : intent.status === 'canceled'
              ? 'canceled'
              : intent.status === 'requires_payment_method'
                ? 'failed'
                : 'pending';
      return res.status(200).json({ status });
    } catch (error: unknown) {
      console.error('[PaymentController.confirmPlanPayment]', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res
        .status(503)
        .json({ error: { code: 'PAYMENT_PROVIDER_UNAVAILABLE', message: 'Tente novamente.' } });
    }
  }

  static async stripeWebhook(req: Request, res: Response): Promise<Response> {
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

    let verifiedEvent: ReturnType<typeof constructStripeWebhookEventUseCase>;
    try {
      verifiedEvent = constructStripeWebhookEventUseCase(rawBody, signature);
    } catch {
      return res.status(400).json({ error: 'Assinatura de webhook Stripe inválida.' });
    }

    try {
      const claim = await claimStripeWebhookEventUseCase({
        eventId: verifiedEvent.id,
        eventType: verifiedEvent.type,
      });
      if (claim === 'already_processed') {
        return res.status(200).json({ received: true, duplicate: true });
      }
      if (claim === 'in_progress') {
        // Não-2xx faz o Stripe reenviar depois, quando a reserva atual tiver expirado ou concluído.
        return res.status(409).json({ received: false, inProgress: true });
      }
    } catch (error: unknown) {
      console.error('[PaymentController.stripeWebhook] claim', {
        eventId: verifiedEvent.id,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res.status(500).json({ error: 'Falha temporária ao registrar o evento.' });
    }

    try {
      await reconcileStripeWebhookEventApplicationUseCase(verifiedEvent);
      await completeStripeWebhookEventUseCase(verifiedEvent.id);
      console.info('[StripeWebhook] processed', {
        eventId: verifiedEvent.id,
        type: verifiedEvent.type,
      });
      return res.status(200).json({ received: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('[PaymentController.stripeWebhook] process', {
        eventId: verifiedEvent.id,
        type: verifiedEvent.type,
        message,
      });
      await releaseStripeWebhookEventUseCase(verifiedEvent.id, message).catch(() => undefined);
      // 500 de propósito: o Stripe reenvia o evento por até 3 dias em live mode.
      return res.status(500).json({ error: 'Não foi possível processar o evento de webhook.' });
    }
  }
}
