import { guideMutationPort } from '../../factory';

export function deleteGuideItemUseCase(id: string): Promise<void> {
  return guideMutationPort.deleteItem(id);
}
