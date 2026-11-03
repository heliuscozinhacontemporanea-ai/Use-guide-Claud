import { pushDispatchService } from '../factory';
import type { DispatchResult } from '../services/pushDispatchService';

export function dispatchPushNotificationsUseCase(now = new Date()): Promise<DispatchResult> {
  return pushDispatchService.dispatch(now);
}
