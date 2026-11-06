import { courtesyAdapter } from '../../factory';

export function cancelCourtesyUseCase(courtesyId: string) {
  return courtesyAdapter.cancelCourtesy(courtesyId);
}
