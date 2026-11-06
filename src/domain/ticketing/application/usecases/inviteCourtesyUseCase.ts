import { courtesyAdapter } from '../../factory';

export function inviteCourtesyUseCase(occurrenceId: string, username: string) {
  return courtesyAdapter.inviteCourtesy(occurrenceId, username.trim().replace(/^@/, ''));
}
