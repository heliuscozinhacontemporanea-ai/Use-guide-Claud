import { Request } from 'express';
import { AuthenticatedUserContext } from '../../shared/kernel/authenticatedUserContext';
import { AuthenticatedUser } from './types/authenticatedUser';

export type { AuthenticatedUser };

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  guideUserContext?: AuthenticatedUserContext;
}
