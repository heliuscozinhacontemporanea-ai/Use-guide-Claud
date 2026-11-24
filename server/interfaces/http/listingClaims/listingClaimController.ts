import type { Response } from 'express';
import { listListingClaimsApplicationUseCase } from '../../../application/usecases/listingClaims/listListingClaimsApplicationUseCase';
import { listMyListingClaimsApplicationUseCase } from '../../../application/usecases/listingClaims/listMyListingClaimsApplicationUseCase';
import { readListingClaimFileApplicationUseCase } from '../../../application/usecases/listingClaims/readListingClaimFileApplicationUseCase';
import { returnListingClaimApplicationUseCase } from '../../../application/usecases/listingClaims/returnListingClaimApplicationUseCase';
import { reviewListingClaimApplicationUseCase } from '../../../application/usecases/listingClaims/reviewListingClaimApplicationUseCase';
import { submitListingClaimApplicationUseCase } from '../../../application/usecases/listingClaims/submitListingClaimApplicationUseCase';
import { ListingClaimError, ListingVerificationError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { CryptoUnavailableError } from '../../../shared/kernel/fieldEncryption';
import {
  ListingClaimFileParamsSchema,
  ListingClaimItemParamsSchema,
  ListingClaimParamsSchema,
  ListListingClaimsQuerySchema,
  ReviewListingClaimSchema,
  SubmitListingClaimSchema,
} from './schemas/listingClaimSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  // A aprovação grava a verificação do estabelecimento, que tem os próprios códigos (D12).
  if (error instanceof ListingClaimError || error instanceof ListingVerificationError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  if (error instanceof CryptoUnavailableError) {
    return sendError(res, 503, error.code, error.message);
  }
  console.error(`[ListingClaimController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir o pedido.');
}

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin } : null;
}

/** "Sou o dono" (D35): pedido de quem é dono, fila e decisão do admin. */
export class ListingClaimController {
  static async submit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const user = req.user;
    if (!user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingClaimItemParamsSchema.safeParse(req.params);
    const body = SubmitListingClaimSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados do pedido inválidos.');
    }
    try {
      const view = await submitListingClaimApplicationUseCase(
        { uid: user.uid, emailVerified: user.emailVerified === true },
        params.data.itemId,
        body.data
      );
      return res.status(201).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'submit');
    }
  }

  static async mine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await listMyListingClaimsApplicationUseCase(actor.uid) });
    } catch (error) {
      return handleError(res, error, 'mine');
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const query = ListListingClaimsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Filtro inválido.');
    try {
      const page = await listListingClaimsApplicationUseCase(actor, {
        status: query.data.status,
        limit: query.data.limit,
        cursor: query.data.cursor ?? null,
      });
      return res.status(200).json(page);
    } catch (error) {
      return handleError(res, error, 'list');
    }
  }

  static async review(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingClaimParamsSchema.safeParse(req.params);
    const body = ReviewListingClaimSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Decisão inválida.');
    }
    try {
      const view = await reviewListingClaimApplicationUseCase(
        actor,
        params.data.claimId,
        body.data.decision,
        body.data.reason ?? null
      );
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'review');
    }
  }

  static async returnToUseGuide(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingClaimParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Pedido inválido.');
    try {
      const view = await returnListingClaimApplicationUseCase(actor, params.data.claimId);
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'returnToUseGuide');
    }
  }

  static async readFile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingClaimFileParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Arquivo inválido.');
    try {
      const file = await readListingClaimFileApplicationUseCase(
        actor,
        params.data.claimId,
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
