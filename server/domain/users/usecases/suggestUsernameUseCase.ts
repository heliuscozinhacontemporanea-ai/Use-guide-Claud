import { usernameService } from '../factory';

/** Sugestão de @ a partir do nome, já conferida como livre (D21). */
export function suggestUsernameUseCase(uid: string, name: string): Promise<string> {
  return usernameService.suggest(uid, name);
}
