import { FirebaseAuthTokenVerifier } from './firebaseAuthTokenVerifier';

const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
}));

describe('FirebaseAuthTokenVerifier', () => {
  let verifier: FirebaseAuthTokenVerifier;

  beforeEach(() => {
    vi.clearAllMocks();
    verifier = new FirebaseAuthTokenVerifier();
  });

  it('verifies token without checkRevoked by default', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'user-123',
      email: 'user@example.com',
      email_verified: true,
      admin: false,
      auth_time: 1600000000,
    });

    const user = await verifier.verifyToken('valid-token');

    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token', false);
    expect(user).toEqual({
      uid: 'user-123',
      email: 'user@example.com',
      emailVerified: true,
      admin: false,
      authTime: 1600000000,
    });
  });

  it('verifies token with checkRevoked true when specified', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'admin-123',
      email: 'admin@example.com',
      email_verified: true,
      admin: true,
      auth_time: 1600000500,
    });

    const user = await verifier.verifyToken('admin-token', { checkRevoked: true });

    expect(mockVerifyIdToken).toHaveBeenCalledWith('admin-token', true);
    expect(user.admin).toBe(true);
    expect(user.uid).toBe('admin-123');
  });

  it('handles missing optional claims gracefully', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'no-email-user',
      auth_time: 1600000000,
    });

    const user = await verifier.verifyToken('token');

    expect(user).toEqual({
      uid: 'no-email-user',
      emailVerified: false,
      admin: false,
      authTime: 1600000000,
    });
  });
});
