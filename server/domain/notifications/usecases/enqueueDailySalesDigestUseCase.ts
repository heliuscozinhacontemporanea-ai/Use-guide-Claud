import { pushDispatchService } from '../factory';

export function enqueueDailySalesDigestUseCase(now = new Date()): Promise<number> {
  return pushDispatchService.enqueueDailySalesDigest(now);
}
