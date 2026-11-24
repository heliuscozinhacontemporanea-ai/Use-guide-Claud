import type { Request, Response } from 'express';

/** Rota da API que não existe: erro no formato da API, nunca a página do app (B80, AGENTS.md §10.2). */
export function apiNotFound(_req: Request, res: Response): Response {
  return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } });
}
