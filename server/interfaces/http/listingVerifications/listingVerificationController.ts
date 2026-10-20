import type { Response } from 'express';
import { getListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/getListingVerificationApplicationUseCase';
import { listListingVerificationsApplicationUseCase } from '../../../application/usecases/listingVerification/listListingVerificationsApplicationUseCase';
import { readListingVerificationFileApplicationUseCase } from '../../../application/usecases/listingVerification/readListingVerificationFileApplicationUseCase';
import { submitListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/submitListingVerificationApplicationUseCase';
import {
  ListingVerificationError,
  reviewListingVerificationUseCase,
} from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { CryptoUnavailableError } from '../../../shared/kernel/fieldEncryption';
import {
  ListingVerificationParamsSchema,
  ListListingVerificationsQuerySchema,
  ReviewListingVerificationSchema,
  SubmitListingVerificationSchema,
  VerificationFileParamsSchema,
} from './schemas/listingVerificationSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ListingVerificationError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  if (error instanceof CryptoUnavailableError) {
    return sendError(res, 503, error.code, error.message);
  }
  console.error(`[ListingVerificationController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a verificação.');
}

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin } : null;
}

export class ListingVerificationController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingVerificationParamsSchema.safeParse(req.params);
    if (!params.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    try {
      const view = await getListingVerificationApplicationUseCase(actor, params.data.itemId);
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'get');
    }
  }

  static async submit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingVerificationParamsSchema.safeParse(req.params);
    const body = SubmitListingVerificationSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da verificação inválidos.');
    }
    try {
      const view = await submitListingVerificationApplicationUseCase(
        actor,
        params.data.itemId,
        body.data
      );
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'submit');
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const query = ListListingVerificationsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Filtro inválido.');
    try {
      const page = await listListingVerificationsApplicationUseCase(
        actor,
        query.data.status,
        query.data.limit,
        query.data.cursor ?? null
      );
      return res.status(200).json(page);
    } catch (error) {
      return handleError(res, error, 'list');
    }
  }

  static async review(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingVerificationParamsSchema.safeParse(req.params);
    const body = ReviewListingVerificationSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Revisão inválida.');
    }
    try {
      const view = await reviewListingVerificationUseCase(
        actor,
        params.data.itemId,
        body.data.decision,
        body.data.reason ?? null
      );
      console.info('[audit] listing_verification_review', {
        adminUid: actor.uid,
        itemId: params.data.itemId,
        decision: body.data.decision,
      });
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'review');
    }
  }

  static async readFile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = VerificationFileParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Arquivo inválido.');
    try {
      const file = await readListingVerificationFileApplicationUseCase(
        actor,
        params.data.itemId,
        params.data.kind
      );
      if (!file) return sendError(res, 404, 'NOT_FOUND', 'Arquivo não encontrado.');
      // Documento pessoal: sem cache e sem o navegador adivinhar o tipo do conteúdo.
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
      return res.status(200).send(file.data);
    } catch (error) {
      return handleError(res, error, 'readFile');
    }
  }
}
