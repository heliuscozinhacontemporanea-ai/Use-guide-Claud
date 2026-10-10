import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  verifyAuthToken,
  verifyAdminToken,
  requireRecentAuthentication,
  extractBearerToken,
  setAuthTokenVerifier,
  resetAuthTokenVerifier,
} from './authMiddleware';
import { AuthenticatedRequest } from './authenticatedRequest';

describe('Auth Middleware Infrastructure', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: any;
  let next: any;

  beforeEach(() => {
    resetAuthTokenVerifier();
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('extractBearerToken', () => {
    it('returns null when header is missing', () => {
      expect(extractBearerToken(undefined)).toBeNull();
      expect(extractBearerToken('')).toBeNull();
    });

    it('returns null when scheme is not Bearer', () => {
      expect(extractBearerToken('Basic xyz123')).toBeNull();
      expect(extractBearerToken('Token xyz123')).toBeNull();
    });

    it('extracts token successfully with Bearer prefix (case-insensitive)', () => {
      expect(extractBearerToken('Bearer my-valid-jwt-token')).toBe('my-valid-jwt-token');
      expect(extractBearerToken('bearer my-valid-jwt-token')).toBe('my-valid-jwt-token');
    });

    it('handles multiple spaces or malformed tokens safely', () => {
      expect(extractBearerToken('Bearer  my-token ')).toBe('my-token');
      expect(extractBearerToken('Bearer')).toBeNull();
    });
  });

  describe('verifyAuthToken', () => {
    it('retorna 401 se cabeçalho Authorization estiver ausente', async () => {
      await verifyAuthToken(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Token ausente') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 se cabeçalho não começar com Bearer', async () => {
      req.headers = { authorization: 'Basic 123456' };
      await verifyAuthToken(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejeita token inválido com 401', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      const mockVerifier = {
        verifyToken: vi.fn().mockRejectedValue(new Error('Token expired')),
      };
      setAuthTokenVerifier(mockVerifier);

      await verifyAuthToken(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('inválido ou expirado') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('rejeita token revogado com 401', async () => {
      req.headers = { authorization: 'Bearer revoked-token' };
      const mockVerifier = {
        verifyToken: vi.fn().mockRejectedValue(new Error('auth/id-token-revoked')),
      };
      setAuthTokenVerifier(mockVerifier);

      await verifyAuthToken(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('valida token com sucesso e atribui req.user', async () => {
      req.headers = { authorization: 'Bearer valid-token' };
      const mockUser = {
        uid: 'user-123',
        email: 'user@test.com',
        emailVerified: true,
        admin: false,
        authTime: Math.floor(Date.now() / 1000),
      };
      const mockVerifier = {
        verifyToken: vi.fn().mockResolvedValue(mockUser),
      };
      setAuthTokenVerifier(mockVerifier);

      await verifyAuthToken(req as AuthenticatedRequest, res, next);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyAdminToken', () => {
    it('rejeita usuário sem claim de admin com 403, role do Firestore não concede admin', async () => {
      req.headers = { authorization: 'Bearer user-token' };
      const mockUser = {
        uid: 'user-123',
        emailVerified: true,
        admin: false,
        authTime: Math.floor(Date.now() / 1000),
      };
      const mockVerifier = { verifyToken: vi.fn().mockResolvedValue(mockUser) };
      setAuthTokenVerifier(mockVerifier);

      await verifyAdminToken(req as AuthenticatedRequest, res, next);
      expect(mockVerifier.verifyToken).toHaveBeenCalledWith('user-token', { checkRevoked: true });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('administrador') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('permite acesso para usuário com admin: true', async () => {
      req.headers = { authorization: 'Bearer admin-token' };
      const mockAdmin = {
        uid: 'admin-123',
        emailVerified: true,
        admin: true,
        authTime: Math.floor(Date.now() / 1000),
      };
      const mockVerifier = { verifyToken: vi.fn().mockResolvedValue(mockAdmin) };
      setAuthTokenVerifier(mockVerifier);

      await verifyAdminToken(req as AuthenticatedRequest, res, next);
      expect(mockVerifier.verifyToken).toHaveBeenCalledWith('admin-token', { checkRevoked: true });
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('requireRecentAuthentication', () => {
    it('rejeita se o header authorization estiver ausente', async () => {
      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'REAUTHENTICATION_REQUIRED' });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejeita se req.user for incompatível com o token verificado', async () => {
      req.headers = { authorization: 'Bearer token-123' };
      req.user = {
        uid: 'user-a',
        emailVerified: true,
        admin: false,
        authTime: Math.floor(Date.now() / 1000),
      };
      const mockVerifier = {
        verifyToken: vi.fn().mockResolvedValue({
          uid: 'user-b',
          emailVerified: true,
          admin: false,
          authTime: Math.floor(Date.now() / 1000),
        }),
      };
      setAuthTokenVerifier(mockVerifier);

      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'REAUTHENTICATION_REQUIRED' });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejeita se authTime estiver ausente no token verificado', async () => {
      req.headers = { authorization: 'Bearer token-123' };
      req.user = { uid: 'user-123', emailVerified: true, admin: false, authTime: 0 };
      const mockVerifier = {
        verifyToken: vi.fn().mockResolvedValue({
          uid: 'user-123',
          emailVerified: true,
          admin: false,
          authTime: undefined,
        }),
      };
      setAuthTokenVerifier(mockVerifier);

      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'REAUTHENTICATION_REQUIRED' });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejeita auth_time futuro', async () => {
      const futureAuthTime = Math.floor(Date.now() / 1000) + 120;
      req.headers = { authorization: 'Bearer token-123' };
      req.user = { uid: 'user-123', emailVerified: true, admin: false, authTime: futureAuthTime };
      const mockVerifier = {
        verifyToken: vi.fn().mockResolvedValue({
          uid: 'user-123',
          emailVerified: true,
          admin: false,
          authTime: futureAuthTime,
        }),
      };
      setAuthTokenVerifier(mockVerifier);

      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'REAUTHENTICATION_REQUIRED' });
      expect(next).not.toHaveBeenCalled();
    });

    it('aceita auth_time de exatamente 300 segundos', async () => {
      const exact300s = Math.floor(Date.now() / 1000) - 300;
      req.headers = { authorization: 'Bearer token-123' };
      req.user = { uid: 'user-123', emailVerified: true, admin: false, authTime: exact300s };
      const mockVerifier = {
        verifyToken: vi.fn().mockResolvedValue({
          uid: 'user-123',
          emailVerified: true,
          admin: false,
          authTime: exact300s,
        }),
      };
      setAuthTokenVerifier(mockVerifier);

      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);
      expect(mockVerifier.verifyToken).toHaveBeenCalledWith('token-123', { checkRevoked: true });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('rejeita auth_time de 301 segundos', async () => {
      const expired301s = Math.floor(Date.now() / 1000) - 301;
      req.headers = { authorization: 'Bearer token-123' };
      req.user = { uid: 'user-123', emailVerified: true, admin: false, authTime: expired301s };
      const mockVerifier = {
        verifyToken: vi.fn().mockResolvedValue({
          uid: 'user-123',
          emailVerified: true,
          admin: false,
          authTime: expired301s,
        }),
      };
      setAuthTokenVerifier(mockVerifier);

      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'REAUTHENTICATION_REQUIRED' });
      expect(next).not.toHaveBeenCalled();
    });

    it('aceita autenticação recente (dentro de 300 segundos)', async () => {
      const recentAuthTime = Math.floor(Date.now() / 1000) - 60;
      req.headers = { authorization: 'Bearer token-123' };
      req.user = { uid: 'user-123', emailVerified: true, admin: false, authTime: recentAuthTime };
      const mockVerifier = {
        verifyToken: vi.fn().mockResolvedValue({
          uid: 'user-123',
          emailVerified: true,
          admin: false,
          authTime: recentAuthTime,
        }),
      };
      setAuthTokenVerifier(mockVerifier);

      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);
      expect(mockVerifier.verifyToken).toHaveBeenCalledWith('token-123', { checkRevoked: true });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('rejeita token revogado com 401', async () => {
      req.headers = {
        authorization: 'Bearer token-revoked',
      };

      req.user = {
        uid: 'user-123',
        emailVerified: true,
        admin: false,
        authTime: Math.floor(Date.now() / 1000),
      };

      const mockVerifier = {
        verifyToken: vi.fn().mockRejectedValueOnce(new Error('auth/id-token-revoked')),
      };
      setAuthTokenVerifier(mockVerifier);

      await requireRecentAuthentication(req as AuthenticatedRequest, res, next);

      expect(mockVerifier.verifyToken).toHaveBeenCalledWith('token-revoked', {
        checkRevoked: true,
      });

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        error: 'REAUTHENTICATION_REQUIRED',
      });

      expect(next).not.toHaveBeenCalled();
    });
  });
});
