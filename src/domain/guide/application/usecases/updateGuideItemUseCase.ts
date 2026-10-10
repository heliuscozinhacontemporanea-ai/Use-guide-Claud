import { guideMutationPort } from '../../factory';
import type { GuideUpdateItemInput } from '../../types/guide';

export function updateGuideItemUseCase(
  id: string,
  data: GuideUpdateItemInput
): Promise<void> {
  return guideMutationPort.updateItem(id, data);
}
