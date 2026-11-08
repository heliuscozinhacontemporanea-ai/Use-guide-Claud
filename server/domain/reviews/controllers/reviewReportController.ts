import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ReviewReportError } from '../errors/reviewReportError';
import {
  DecideReviewReportSchema,
  ListReviewReportsQuerySchema,
  ReportReviewResponseSchema,
  ReviewReportParamsSchema,
} from '../schemas/reviewReportSchemas';
import { decideReviewReportUseCase } from '../usecases/decideReviewReportUseCase';
import { listMyReviewReportsUseCase } from '../usecases/listMyReviewReportsUseCase';
import { listOpenReviewReportsUseCase } from '../usecases/listOpenReviewReportsUseCase';
import { reportReviewResponseUseCase } from '../usecases/reportReviewResponseUseCase';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ReviewReportError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[ReviewReportController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a operação.');
}

export class ReviewReportController {
  static async report(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = ReportReviewResponseSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Denúncia inválida.');
    try {
      const report = await reportReviewResponseUseCase(req.user.uid, {
        ...body.data,
        details: body.data.details || undefined,
      });
      return res.status(201).json({ data: report });
    } catch (error) {
      return handleError(res, error, 'report');
    }
  }

  static async listMine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await listMyReviewReportsUseCase(req.user.uid) });
    } catch (error) {
      return handleError(res, error, 'listMine');
    }
  }

  static async listOpen(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const query = ListReviewReportsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    try {
      const reports = await listOpenReviewReportsUseCase(query.data.limit, query.data.cursor);
      const last = reports.at(-1);
      // Quem denunciou não sai nem para o admin: a fila não precisa saber (D19, AGENTS.md §7.9).
      const data = reports.map(
        ({ reporterUid: _reporter, decidedBy: _admin, ...report }) => report
      );
      return res.status(200).json({
        data,
        nextCursor: last && reports.length === query.data.limit ? last.id : null,
      });
    } catch (error) {
      return handleError(res, error, 'listOpen');
    }
  }

  static async decide(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = ReviewReportParamsSchema.safeParse(req.params);
    const body = DecideReviewReportSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Decisão inválida.');
    }
    try {
      const report = await decideReviewReportUseCase(
        req.user.uid,
        params.data.reportId,
        body.data.outcome
      );
      console.info('[audit] review_report_decided', {
        reportId: report.id,
        adminUid: req.user.uid,
        outcome: body.data.outcome,
        responseRemoved: report.responseRemoved === true,
      });
      return res.status(200).json({
        data: {
          id: report.id,
          status: report.status,
          responseRemoved: report.responseRemoved === true,
        },
      });
    } catch (error) {
      return handleError(res, error, 'decide');
    }
  }
}
