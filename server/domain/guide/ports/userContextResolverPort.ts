import { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';

export interface UserContextResolverPort {
  resolveContext(user: {
    uid: string;
    email?: string;
    admin?: boolean;
  }): Promise<AuthenticatedUserContext>;
}
