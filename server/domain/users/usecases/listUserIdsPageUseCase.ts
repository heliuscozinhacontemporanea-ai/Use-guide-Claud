import { userService } from '../factory';

/** Uma página de IDs de contas, para avisos a todos (termos dos usuários mudaram). */
export function listUserIdsPageUseCase(
  cursor: string | null,
  limit: number
): Promise<{ ids: string[]; nextCursor: string | null }> {
  return userService.listUserIdsPage(cursor, limit);
}
