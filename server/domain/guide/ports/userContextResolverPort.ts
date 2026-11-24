import { AuthenticatedUserContext } from '../../../shared/kernel/authenticatedUserContext';

export interface UserContextResolverPort {
  resolveContext(user: {
    uid: string;
    email?: string;
    admin?: boolean;
  }): Promise<AuthenticatedUserContext>;
}
