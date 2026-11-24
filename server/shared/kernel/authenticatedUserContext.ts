export type ApplicationUserRole = 'visitor' | 'user' | 'partner' | 'admin';

export interface AuthenticatedUserContext {
  uid: string;
  email?: string;
  admin: boolean;
  role: ApplicationUserRole;
}
