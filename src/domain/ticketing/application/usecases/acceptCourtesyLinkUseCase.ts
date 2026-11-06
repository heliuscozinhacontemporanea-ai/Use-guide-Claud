import { courtesyAdapter } from '../../factory';

export function acceptCourtesyLinkUseCase(courtesyId: string, token: string) {
  return courtesyAdapter.acceptCourtesyLink(courtesyId, token);
}
