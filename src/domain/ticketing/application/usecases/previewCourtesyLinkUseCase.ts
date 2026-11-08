import { courtesyAdapter } from '../../factory';

export function previewCourtesyLinkUseCase(courtesyId: string, token: string) {
  return courtesyAdapter.previewCourtesyLink(courtesyId, token);
}
