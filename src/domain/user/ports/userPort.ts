import { UserProfile, UserData } from '../types/user';

export interface UserPort {
  getCurrentUser(): Promise<UserProfile | null>;
  updateCurrentUser(data: UserData): Promise<UserProfile>;
  deleteCurrentUser(): Promise<void>;
}
