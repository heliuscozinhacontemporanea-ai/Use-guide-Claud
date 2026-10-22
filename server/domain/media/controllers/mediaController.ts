import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { MediaDomainError } from '../errors/mediaDomainError';
import { UploadContentImageSchema, UploadVerificationFileSchema } from '../schemas/mediaSchema';
import { storeVerificationFileUseCase } from '../usecases/storeVerificationFileUseCase';
import { uploadContentImageUseCase } from '../usecases/uploadContentImageUseCase';

export class MediaController {
  static async uploadImage(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Não autenticado.' } });
    }
    const parsed = UploadContentImageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'Dados da imagem inválidos.' } });
    }
    try {
      const stored = await uploadContentImageUseCase({ uid, ...parsed.data });
      return res.status(201).json({ url: stored.url, path: stored.path });
    } catch (error: unknown) {
      if (error instanceof MediaDomainError) {
        return res
          .status(error.statusCode)
          .json({ error: { code: error.code, message: error.message } });
      }
      console.error('[MediaController.uploadImage]', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return res
        .status(500)
        .json({ error: { code: 'INTERNAL_ERROR', message: 'Não foi possível enviar a imagem.' } });
    }
  }

  static async uploadVerificationFile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Não autenticado.' } });
    }
    const parsed = UploadVerificationFileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'Arquivo inválido.' } });
    }
    try {
      const stored = await storeVerificationFileUseCase({
        uid,
        fileBase64: parsed.data.fileBase64,
      });
      // Sem URL: o arquivo é privado e só o admin o lê pelo backend.
      return res.status(201).json({ fileId: stored.path, contentType: stored.contentType });
    } catch (error: unknown) {
      if (error instanceof MediaDomainError) {
        return res
          .status(error.statusCode)
          .json({ error: { code: error.code, message: error.message } });
      }
      console.error('[MediaController.uploadVerificationFile]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return res
        .status(500)
        .json({ error: { code: 'INTERNAL_ERROR', message: 'Não foi possível enviar o arquivo.' } });
    }
  }
}
