export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  admin: boolean;
  authTime: number;
}
