import { guideMutationPort } from '../../factory';
import type { GuideCreateItemInput } from '../../types/guide';

export function createGuideItemUseCase(
  data: GuideCreateItemInput
): Promise<string> {
  return guideMutationPort.createItem(data);
}
